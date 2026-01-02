from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg2://aegis:aegis@localhost:5433/aegis"

    storage_backend: str = "local"
    storage_local_dir: str = "./data/evidences"

    s3_endpoint_url: str | None = None
    s3_access_key_id: str | None = None
    s3_secret_access_key: str | None = None
    s3_bucket: str = "aegis-evidences"
    s3_region: str = "us-east-1"
    
    emergent_llm_key: str = os.getenv("EMERGENT_LLM_KEY", "")

settings = Settings()
