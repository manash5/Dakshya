from fastapi import FastAPI
import whisper

from app.core.config import AI_SERVICE_PORT
# Import directly from the router submodule (not the package's __init__.py
# re-export). The submodule is named `router.py` and also defines a
# module-level variable called `router` -- re-exporting it through
# __init__.py creates a name collision between the submodule object and the
# APIRouter instance that, depending on import order (e.g. under --reload),
# can resolve to the wrong one. Importing straight from the submodule avoids
# the ambiguity entirely.
from app.services.course_generator.router import router as course_generator_router

app = FastAPI(title="Dakshya")
origins = ["http://localhost:500"]

# Register each AI service's router here as you add more, e.g.:
# from app.services.transcript_summarizer.router import router as transcript_summarizer_router
# app.include_router(transcript_summarizer_router)
app.include_router(course_generator_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=AI_SERVICE_PORT, reload=True)