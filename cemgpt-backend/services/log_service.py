import os
import json
from datetime import datetime


class LogService:
    def __init__(self, log_dir="logs"):
        """Log dosyalarının kaydedileceği klasör."""
        self.log_dir = log_dir
        os.makedirs(self.log_dir, exist_ok=True)

        self.start_new_session()

    def start_new_session(self):
        """Yeni bir konuşma session dosyası başlatır."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.session_file = os.path.join(self.log_dir, f"conversation_{timestamp}.json")
        self._init_log_file()

    def _init_log_file(self):
        """Eğer session dosyası yoksa boş JSON oluşturur."""
        if not os.path.exists(self.session_file):
            with open(self.session_file, "w", encoding="utf-8") as f:
                json.dump({"messages": []}, f, ensure_ascii=False, indent=2)

    def save(self, message: dict):
        """
        Mesajı JSON log dosyasına kaydeder.
        message = {"role": "user"/"bot", "text": "..."}
        """
        if not isinstance(message, dict) or "role" not in message or "text" not in message:
            raise ValueError("Log kaydı için 'role' ve 'text' alanları gereklidir.")

        self._init_log_file()

        with open(self.session_file, "r+", encoding="utf-8") as f:
            data = json.load(f)
            data["messages"].append({
                "role": message["role"],
                "text": message["text"],
                "timestamp": datetime.now().isoformat()
            })
            f.seek(0)
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.truncate()

    def get_logs(self):
        """Session loglarını döner."""
        self._init_log_file()
        with open(self.session_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def save_conversation(self, user_text: str, bot_text: str):
        """Kullanıcı ve bot mesajını art arda kaydeder ve özet döner."""
        self.save({"role": "user", "text": user_text})
        self.save({"role": "bot", "text": bot_text})
        return {
            "saved": 2,
            "session_file": os.path.basename(self.session_file),
            "total_messages": len(self.get_logs()["messages"])
        }
