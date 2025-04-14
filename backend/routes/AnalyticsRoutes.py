from fastapi import APIRouter,HTTPException
from models.TransactionsModel import Transaction
from controllers.TransactionController import GetAnalyticsByUserId,GetAllTransactionsAnalytics
from controllers.BudgetController import GetBudgetAnalytics
from controllers.UserController import GetAllUsersAnalytics,GetUserDetailsByAdmin
from controllers.ChartController import GetMonthlyTransactionAnalytics,GetCategoryWiseTransactions,GetFinancialSuggestions
from bson import ObjectId

router = APIRouter()
@router.get('/analytics/transactions/user/{user_id}')
async def get_analytics_by_user_id(user_id:str):
    return await GetAnalyticsByUserId(user_id)

@router.get('/analytics/users/')
async def get_all_users_analytics():
    return await GetAllUsersAnalytics()

@router.get("/admin/user-details/{user_id}")
async def get_user_details(user_id: str):
    return await GetUserDetailsByAdmin(user_id)

@router.get("/analytics/transactions/")
async def get_all_transactions_analytics():
    return await GetAllTransactionsAnalytics()

@router.get('/budgets/analytics/{user_id}')
async def get_budget_analytics(user_id: str):
    return await GetBudgetAnalytics(user_id)

@router.get('/analytics/monthly-transactions/{user_id}')
async def get_monthly_transaction_analytics(user_id:str):
    return await GetMonthlyTransactionAnalytics(user_id)

@router.get('/analytics/categorywise-transactions/{user_id}')
async def get_categorywise_transactions(user_id:str):
    return await GetCategoryWiseTransactions(user_id)

@router.get('/financial-suggestions/{user_id}')
async def get_financial_suggestions(user_id:str):
    return await GetFinancialSuggestions(user_id)