from fastapi import APIRouter, UploadFile, File  # type: ignore[import]

from report_parser.pdf_parser import extract_text_from_pdf

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.post("/upload")
async def upload_report(file: UploadFile = File(...)):

    text = extract_text_from_pdf(file.file)

    return {
        "filename": file.filename,
        "content": text[:3000]
    }