from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://tributometro:tributometro@db:5432/tributometro"
    redis_url: str = "redis://redis:6379"
    groq_api_key: str = ""
    ibpt_default_uf: str = "SC"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
