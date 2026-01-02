from fastapi import Header, HTTPException

def get_actor_id(x_actor_id: str | None = Header(default=None)) -> str:
    if not x_actor_id:
        raise HTTPException(status_code=401, detail="Cabeçalho X-Actor-Id é obrigatório.")
    return x_actor_id
