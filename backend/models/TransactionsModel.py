from pydantic import BaseModel, Field, validator
from typing import Optional,Dict,Any
from datetime import datetime
from bson import ObjectId

class Transaction(BaseModel):
    id: Optional[str] = Field(default=None,alias="_id") 
    user_id: str
    category_id: str
    transaction_type: str
    amount: float
    description: Optional[str] = None
    date: Optional[datetime] = None
    status: Optional[bool] = True
    updated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


    
