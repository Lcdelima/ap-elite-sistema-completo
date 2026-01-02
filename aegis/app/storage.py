"""Storage Backend - Aegis System"""
from __future__ import annotations

import os
import uuid
from dataclasses import dataclass

from app.config import settings

@dataclass(frozen=True)
class StoredObject:
    uri: str
    size_bytes: int

class StorageBackend:
    def put_bytes(self, *, key: str, content: bytes, content_type: str) -> StoredObject:
        raise NotImplementedError

class LocalFileStorage(StorageBackend):
    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def put_bytes(self, *, key: str, content: bytes, content_type: str) -> StoredObject:
        safe_key = key.replace("..", "_").replace("\\", "/")
        full_path = os.path.join(self.base_dir, safe_key)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        with open(full_path, "wb") as f:
            f.write(content)

        return StoredObject(uri=f"file://{os.path.abspath(full_path)}", size_bytes=len(content))

def get_storage() -> StorageBackend:
    if settings.storage_backend.lower() == "s3":
        raise NotImplementedError("S3 storage not implemented yet")
    return LocalFileStorage(settings.storage_local_dir)

def build_evidence_key(*, case_id: uuid.UUID, evidence_id: uuid.UUID, filename: str) -> str:
    clean = filename.replace("/", "").replace("\\", "")
    return f"cases/{case_id}/evidences/{evidence_id}/{clean}"

def build_order_key(*, case_id: uuid.UUID, order_id: uuid.UUID, filename: str) -> str:
    clean = filename.replace("/", "").replace("\\", "")
    return f"cases/{case_id}/judicial_orders/{order_id}/{clean}"
