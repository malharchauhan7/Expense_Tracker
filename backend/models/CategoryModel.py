from pydantic import BaseModel,Field
from datetime import datetime
from typing import Optional,Literal
from bson import ObjectId

class Category(BaseModel):
    id: Optional[str] = Field(default=None,alias="_id") 
    user_id: str
    name:str
    category_type:Literal["Expense", "Income"]
    status:Optional[bool]=True
    updated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

