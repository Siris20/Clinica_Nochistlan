from pydantic import BaseModel, Field

class LoginRequest(BaseModel):
    credential: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

    class Config:
        from_attributes = True