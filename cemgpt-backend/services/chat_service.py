from config import settings

class ChatService:
    def __init__(self, memory=True):
        self.client = settings.client
        self.memory = memory
        self.reset()

    def reset(self):
        """Sohbet geçmişini sıfırla."""
        self.messages = [
            {"role": "system", "content": "Sen dostça konuşan bir yapay zekasın."}
        ]

    def chat(self, user_text: str) -> str:
        """Kullanıcıdan gelen metni alır, GPT'den cevap üretir."""
        if not self.memory:
            # Hafızasız mod → sadece sistem + bu soru
            messages = [
                {"role": "system", "content": "Sen dostça konuşan bir yapay zekasın."},
                {"role": "user", "content": user_text}
            ]
        else:
            # Hafızalı mod → geçmişi kullan
            self.messages.append({"role": "user", "content": user_text})
            messages = self.messages

        # GPT çağrısı
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        answer = response.choices[0].message.content

        # Hafızalı moddaysak cevabı geçmişe ekle
        if self.memory:
            self.messages.append({"role": "assistant", "content": answer})

        return answer
