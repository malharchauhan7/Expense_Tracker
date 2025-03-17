from pydantic import BaseModel,Field
from datetime import datetime
from typing import Optional

class Budget(BaseModel):
    id: Optional[str] = Field(default=None,alias="_id") 
    title:str
    user_id: str
    amount: float
    description: Optional[str] = None
    start_date: datetime = None
    end_date: datetime = None
    updated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None