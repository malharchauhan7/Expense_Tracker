from pydantic import BaseModel,Field
from datetime import datetime
from typing import Optional
from bson import ObjectId

class Category(BaseModel):
    id: Optional[str] = Field(default=None,alias="_id") 
    user_id: str
    name:str
    status:Optional[bool]=True
    updated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

