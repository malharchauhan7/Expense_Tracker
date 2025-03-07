from fastapi import APIRouter,HTTPException
from models.TransactionsModel import Transaction
from controllers.TransactionController import GetAnalyticsByUserId
from bson import ObjectId

router = APIRouter()
@router.get('/transactions/analytics/user/{user_id}')
async def get_analytics_by_user_id(user_id:str):
    return await GetAnalyticsByUserId(user_id)