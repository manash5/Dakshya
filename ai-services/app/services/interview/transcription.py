import os
import shutil
import sys
import tempfile

import imageio_ffmpeg
from fastapi import HTTPException

from app.core.config import get_logger

logger = get_logger("interview.transcription")


def _ensure_ffmpeg_on_path() -> None:
    """
    Whisper's own audio loader (whisper/audio.py) shells out to a bare
    "ffmpeg" subprocess (hardcoded, not configurable) to decode audio, so it
    already accepts whatever container format ffmpeg understands (webm,
    mp4/m4a, mp3, wav, ...) directly from a file path -- there's no need to
    pre-decode/re-encode with pydub first.

    Rather than requiring a system-wide ffmpeg install, imageio-ffmpeg's
    bundled static binary is used -- but it ships as a version-suffixed
    filename (e.g. ffmpeg-win-x86_64-v7.1.exe on Windows), so simply putting
    its directory on PATH doesn't help: PATH/PATHEXT resolution only matches
    the literal name a program asks for ("ffmpeg"/"ffmpeg.exe"), not an
    arbitrarily-named binary sitting in a PATH directory. A stable-named
    copy is materialized once in this package's own bin/ dir instead, which
    is then what gets prepended to PATH.
    """
    bin_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", ".bin")
    bin_dir = os.path.abspath(bin_dir)
    os.makedirs(bin_dir, exist_ok=True)

    exe_name = "ffmpeg.exe" if sys.platform == "win32" else "ffmpeg"
    stable_path = os.path.join(bin_dir, exe_name)

    if not os.path.exists(stable_path):
        shutil.copy2(imageio_ffmpeg.get_ffmpeg_exe(), stable_path)

    os.environ["PATH"] = bin_dir + os.pathsep + os.environ.get("PATH", "")


_ensure_ffmpeg_on_path()

# Loaded lazily on first /transcribe call, not at import time: whisper.load_model
# downloads model weights on first use (a network call) and the model itself
# takes a moment to load into memory -- doing that at server startup would
# slow down (or risk crashing) every boot even for people not exercising this
# specific feature yet. Cached in this module-level global after that.
_whisper_model = None


def _get_model():
    global _whisper_model
    if _whisper_model is None:
        import whisper

        logger.info("Loading Whisper model (base.en)...")
        _whisper_model = whisper.load_model("base.en")
        logger.info("Whisper model loaded")
    return _whisper_model


# ffmpeg identifies containers by content, not extension, but it still wants
# *a* plausible suffix on the temp file -- browsers vary (Chrome: webm,
# Safari: mp4/m4a), so this maps the upload's declared content-type to one.
_EXTENSION_BY_MIME = {
    "audio/webm": ".webm",
    "audio/ogg": ".ogg",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/mp4": ".m4a",
    "audio/m4a": ".m4a",
}


def transcribe_audio(audio_bytes: bytes, content_type: str = "") -> str:
    model = _get_model()
    suffix = _EXTENSION_BY_MIME.get(content_type, ".webm")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp_path = tmp.name
            tmp.write(audio_bytes)

        try:
            result = model.transcribe(tmp_path)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Could not read audio file: {exc}") from exc

        return result["text"].strip()
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
