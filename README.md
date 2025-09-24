\# CemGPT - AI Call Center Prototype


CemGPT, **FastAPI (backend)** ve **HTML/CSS/JS (frontend)** ile geliştirilmiş bir yapay zekâ asistanıdır.  
Mikrofonla konuşarak soru sorabilir, yapay zekadan hem **yazılı cevap** hem de **sesli cevap** alabilirsiniz.  

---

## ⚙️ Kurulum ve Çalıştırma

### 1. Repoyu klonla
```bash
git clone https://github.com/cemdurakk/cemgpt.git
cd cemgpt

---

2. Backend kurulumu

cd cemgpt-backend
python -m venv venv
.\venv\Scripts\activate      # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt

---

3. Ortam değişkenlerini ayarla

cemgpt-backend/.env dosyası oluştur ve içine OpenAI API Key’ini yaz:
OPENAI_API_KEY=sk-xxxxxxx

---

4. Backend’i çalıştır

uvicorn main_rest:app --reload

---

5. Frontend kurulumu

index.html dosyasını çalıştır.


🎯 Kullanım

- Arayüzde mikrofon ikonuna tıkla.
- Konuşmanı yap, sonra tekrar tıkla.
- Sağ panelde konuşmalar canlı transkript olarak görünür.
- Orta panelde WhatsApp tarzı mesaj baloncukları çıkar.
- Bot hem yazılı hem de sesli cevap verir.
- Sol panelde sohbet geçmişin tutulur. Yeni sohbet başlatabilir, eski sohbetlere dönebilirsin.