# Dev-mode image: source comes from a bind mount in docker-compose.yml.
# Playwright and Whisper aren't optional/stale dependencies here -- scraper.py
# and opportunity/sources/*.py drive a real headless Chromium, and
# interview/transcription.py runs real Whisper transcription -- so the
# browser binary and its system libs have to actually be present in the
# image, not just the Python packages.
FROM python:3.14-slim

WORKDIR /app

RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen

# Installs Chromium plus the Debian system libraries it needs to run
# headless (apt access requires running as root, which this image does by
# default).
RUN uv run playwright install --with-deps chromium

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
