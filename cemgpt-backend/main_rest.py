from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid

from services.stt_service import STTService
from services.chat_service import ChatService
from services.tts_service import TTSService
from services.log_service import LogService

# FastAPI uygulaması
app = FastAPI(title="CemGPT REST Backend")

# CORS (frontend başka porttan bağlanırsa)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev için açık
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Statik dosya servisi
if not os.path.exists("static"):
    os.makedirs("static")

app.mount("/static", StaticFiles(directory="static"), name="static")

# Servis nesneleri
stt_service = STTService()
chat_service = ChatService()
tts_service = TTSService()
log_service = LogService()

@app.get("/")
def root():
    return {"message": "CemGPT REST Backend Çalışıyor 🚀"}

@app.post("/conversation")
async def conversation_endpoint(file: UploadFile = File(...)):
    # Benzersiz id üret
    unique_id = str(uuid.uuid4())

    # 1. Kullanıcı sesini kaydet
    file_path = f"static/temp_{unique_id}.webm"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # 2. STT → metin
    user_text = stt_service.transcribe(file_path)

    # 3. Chat → bot cevabı
    bot_answer = chat_service.chat(user_text)

    # 4. TTS → mp3 üret
    audio_filename = f"bot_output_{unique_id}.mp3"
    audio_url = tts_service.synthesize(bot_answer, audio_filename)

    # 5. Log
    log_entry = log_service.save_conversation(user_text, bot_answer)

    # 6. JSON response
    return JSONResponse(content={
        "user_transcript": user_text,
        "bot_answer": bot_answer,
        "audio_file": audio_url,  # /static/bot_output_xxx.mp3
        "log_entry": log_entry
    })
