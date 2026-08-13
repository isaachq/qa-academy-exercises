import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


def required(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"{name} is required. Copy .env.example to .env.")
    return value


@dataclass(frozen=True)
class Environment:
    base_url: str = os.getenv("BASE_URL", "https://qaacademyabc.xyz").rstrip("/")

    @property
    def api_key(self) -> str:
        return required("API_KEY")

    @property
    def ui_email(self) -> str:
        return required("UI_EMAIL")

    @property
    def ui_password(self) -> str:
        return required("UI_PASSWORD")

    @property
    def device_profile(self) -> str:
        """Default browser profile for the UI catalog: `desktop` or `mobile`."""
        return os.getenv("DEVICE_PROFILE", "desktop").strip().lower() or "desktop"

    @property
    def auth_headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.api_key}"}


environment = Environment()

