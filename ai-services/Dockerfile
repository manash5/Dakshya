# Dual-purpose image: locally, docker-compose.yml bind-mounts the live
# ./ai-services folder over the COPY below and overrides CMD with --reload
# for live reload. Standalone (e.g. deployed directly on Render, no bind
# mount available), this image needs to be self-sufficient -- hence COPY . .
# and a plain, non-reloading CMD as the production-safe default.
#
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

# Copied last (after the slow dependency/browser install steps above) so
# source-only changes don't invalidate those expensive cached layers.
COPY . .

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
