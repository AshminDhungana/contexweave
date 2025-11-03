from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from typing import Optional
from datetime import datetime


# ==================== DECISION SCHEMAS ====================

class DecisionCreate(BaseModel):
    """Schema for creating a decision."""
    model_config = ConfigDict(str_strip_whitespace=True)
    
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    context: Optional[str] = Field(None, max_length=2000)


class DecisionUpdate(BaseModel):
    """Schema for updating a decision."""
    model_config = ConfigDict(str_strip_whitespace=True)
    
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    context: Optional[str] = Field(None, max_length=2000)
    is_active: Optional[bool] = Field(None)
    
    @model_validator(mode='after')
    def check_at_least_one_field(self):
        """Ensure at least one field is being updated."""
        if not any([self.title is not None, self.description is not None, self.context is not None, self.is_active is not None]):
            raise ValueError('At least one field must be provided for update')
        return self


class DecisionResponse(BaseModel):
    """Schema for returning a decision."""
    id: int
    title: str
    description: Optional[str] = None
    context: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True


# ==================== EVENT SCHEMAS ====================

class EventCreate(BaseModel):
    """Schema for creating an event."""
    model_config = ConfigDict(str_strip_whitespace=True)
    
    decision_id: int = Field(..., gt=0)
    event_type: str = Field(...)
    source: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    
    @field_validator('event_type')
    @classmethod
    def event_type_create_validate(cls, v: str) -> str:
        """Validate event_type for creation."""
        if not v or v.strip() == "":
            raise ValueError('Event type cannot be empty or whitespace only')
        v = v.strip().lower()
        if len(v) > 50:
            raise ValueError(f'Event type must be 50 characters or less, got {len(v)}')
        return v
    
    @field_validator('source')
    @classmethod
    def source_create_validate(cls, v: Optional[str]) -> Optional[str]:
        """Validate source for creation."""
        if v is not None:
            if v.strip() == "":
                raise ValueError('Source cannot be whitespace only')
            v = v.strip()
            if len(v) > 255:
                raise ValueError(f'Source must be 255 characters or less, got {len(v)}')
        return v
    
    @field_validator('description')
    @classmethod
    def description_event_validate(cls, v: Optional[str]) -> Optional[str]:
        """Validate description for event."""
        if v is not None:
            if v.strip() == "":
                raise ValueError('Description cannot be whitespace only')
            v = v.strip()
            if len(v) > 2000:
                raise ValueError(f'Description must be 2000 characters or less, got {len(v)}')
        return v
    
    @field_validator('decision_id')
    @classmethod
    def decision_id_validate(cls, v: int) -> int:
        """Ensure decision_id is positive."""
        if v <= 0:
            raise ValueError('Decision ID must be a positive integer')
        return v


class EventResponse(BaseModel):
    """Schema for returning an event."""
    id: int
    decision_id: int
    event_type: str
    source: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
