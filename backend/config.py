"""
config.py — Centralised settings loaded from the .env file.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = "AIzaSyBBGNOmYBVchmbQBS1sGgfQ3GJPXSmI-_s"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
