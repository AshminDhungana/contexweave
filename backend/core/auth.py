from datetime import datetime, timedelta
from typing import Optional
import bcrypt
import jwt
from pydantic import BaseModel
from enum import Enum
from dotenv import load_dotenv  
import os

load_dotenv()

# Load from .env file
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


# ==================== SCHEMAS ====================

class UserStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class TokenData(BaseModel):
    """JWT Token payload"""
    user_id: int
    email: str


class Token(BaseModel):
    """Token response"""
    access_token: str
    token_type: str


class UserRegister(BaseModel):
    """User registration request"""
    email: str
    username: str
    password: str


class UserLogin(BaseModel):
    """User login request"""
    email: str
    password: str


class UserResponse(BaseModel):
    """User response (no password)"""
    id: int
    email: str
    username: str
    created_at: datetime
    is_active: bool
    role: str  
    status: str

    class Config:
        from_attributes = True



# ==================== PASSWORD HASHING ====================

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Example:
        hashed = hash_password("mypassword123")
    """
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify a password against its hash.
    
    Example:
        is_correct = verify_password("mypassword123", hashed)
    """
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


# ==================== JWT TOKENS ====================

def create_access_token(user_id: int, email: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Example:
        token = create_access_token(user_id=1, email="user@example.com")
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    expire = datetime.utcnow() + expires_delta
    
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[TokenData]:
    """
    Decode and validate a JWT access token.
    
    Returns:
        TokenData if valid, None if invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        email = payload.get("email")
        
        if user_id is None or email is None:
            return None
        
        return TokenData(user_id=user_id, email=email)
    except jwt.ExpiredSignatureError:
        return None  # Token expired
    except jwt.InvalidTokenError:
        return None  # Invalid token


# ==================== HELPER FUNCTIONS ====================

def extract_token_from_header(authorization: str) -> Optional[str]:
    """
    Extract JWT token from Authorization header.
    
    Format: "Bearer <token>"
    
    Example:
        token = extract_token_from_header("Bearer eyJ0eXAiOiJKV1QiLCJhbGc...")
    """
    if not authorization:
        return None
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    
    return parts[1]
