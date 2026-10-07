import os

from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)


def ask_gemini(user_message: str):

    prompt = f"""
You are Medical AI Sushruta, an educational healthcare assistant.

Rules:
- Give short and clear answers.
- Use simple language.
- Maximum 150 words.
- Use bullet points where appropriate.
- Do not provide a final medical diagnosis.
- Do not prescribe medication.
- End every response with:

Disclaimer: This information is for educational purposes only. Consult a qualified healthcare professional for medical advice.

User Question:
{user_message}
"""

    response = model.generate_content(prompt)

    return response.text