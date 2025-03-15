from pydantic import BaseModel,Field
from datetime import datetime
from typing import Optional

class Budget(BaseModel):
    id: Optional[str] = Field(default=None,alias="_id") 
    user_id: str
    amount: float
    start_date: datetime = None
    end_date: datetime = None
    updated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None