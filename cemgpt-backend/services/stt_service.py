from faster_whisper import WhisperModel

class STTService:
    def __init__(self, model_size="medium"):
        """
        STT servisi (faster-whisper tabanlı).
        model_size: "tiny", "base", "small", "medium", "large" olabilir.
        """
        self.model = WhisperModel(model_size, device="cpu", compute_type="int8")

    def transcribe(self, file_path: str) -> str:
        """
        Dosya tabanlı transcript (REST endpointi için).
        """
        try:
            segments, _ = self.model.transcribe(file_path, beam_size=5, language="tr")
            return " ".join([segment.text for segment in segments])
        except Exception as e:
            return f"[STT Error: {str(e)}]"

    def stream_transcribe(self, audio_chunk: bytes) -> str:
        """
        Gelecekte WebSocket için chunk bazlı transcript.
        Şimdilik placeholder.
        """
        raise NotImplementedError("Streaming transcription henüz eklenmedi.")
