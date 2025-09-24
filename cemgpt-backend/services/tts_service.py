import os
import uuid
from config import settings

class TTSService:
    def __init__(self):
        self.client = settings.client

    def synthesize(self, text: str, filename: str = None) -> str:
        """
        Metni sese çevirir ve statik klasöre kaydeder.
        Frontend'e URL döner.
        """
        # Eğer filename verilmezse benzersiz üret
        if not filename:
            filename = f"bot_output_{uuid.uuid4()}.mp3"

        output_path = os.path.join("static", filename)

        # OpenAI TTS çağrısı
        speech = self.client.audio.speech.create(
            model="gpt-4o-mini-tts",
            voice="alloy",
            input=text
        )
        speech.stream_to_file(output_path)

        # Frontend'in kullanacağı URL
        return f"/static/{filename}"
