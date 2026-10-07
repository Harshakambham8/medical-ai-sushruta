from fastapi import APIRouter

from database.schemas import ChatRequest

from services.gemini_service import ask_gemini

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.post("/")
def chat(request: ChatRequest):

    response = ask_gemini(
        request.message
    )

    return {
        "response": response
    }