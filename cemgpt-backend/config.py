import os
from dotenv import load_dotenv
from openai import OpenAI

# .env dosyasını yükle
load_dotenv()

class Settings:
    _instance = None  # Singleton instance

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Settings, cls).__new__(cls)
            cls._instance._init()
        return cls._instance

    def _init(self):
        # Ortam değişkeninden API anahtarını al
        self.api_key = os.getenv("OPENAI_API_KEY")

        if not self.api_key:
            raise ValueError("❌ OPENAI_API_KEY bulunamadı. Lütfen .env dosyasına ekleyin.")

        # OpenAI client oluştur
        self._client = OpenAI(api_key=self.api_key)

    @property
    def client(self) -> OpenAI:
        """Projede kullanılacak OpenAI client"""
        return self._client

# Global ayar nesnesi
settings = Settings()
