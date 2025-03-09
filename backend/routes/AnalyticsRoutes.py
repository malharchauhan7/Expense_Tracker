from fastapi import APIRouter,HTTPException
from models.TransactionsModel import Transaction
from controllers.TransactionController import GetAnalyticsByUserId,GetAllTransactionsAnalytics
from controllers.UserController import GetAllUsersAnalytics
from bson import ObjectId

router = APIRouter()
@router.get('/analytics/transactions/user/{user_id}')
async def get_analytics_by_user_id(user_id:str):
    return await GetAnalyticsByUserId(user_id)

@router.get('/analytics/users/')
async def get_all_users_analytics():
    return await GetAllUsersAnalytics()

@router.get("/analytics/transactions/")
async def get_all_transactions_analytics():
    return await GetAllTransactionsAnalytics()