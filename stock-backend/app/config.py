from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    vnstock_api_key: str = ""
    api_key: str = "secret123"

    class Config:
        env_file = ".env"


settings = Settings()
