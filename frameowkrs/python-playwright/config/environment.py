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


environment = Environment()
