import io

from fastapi import HTTPException
from pypdf import PdfReader


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {exc}") from exc

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="No extractable text found in this PDF (it may be a scanned image).",
        )

    return text
