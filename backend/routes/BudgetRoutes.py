from fastapi import APIRouter,HTTPException
from controllers.BudgetController import GetAllBudgets,GetBudgetById,CreateBudget,GetBudgetByUserId,DeleteBudgetById
from controllers.UserController import GetUserById
from bson import ObjectId
from models.BudgetModel import Budget
from fastapi.responses import JSONResponse


router = APIRouter()


@router.get('/budgets')
async def get_all_budgets():
    return await GetAllBudgets()

@router.get('/budgets/{budget_id}')
async def get_budget_by_id(budget_id:str):
    return await GetBudgetById(budget_id)

@router.post('/budgets')
async def create_budget(budget:Budget):
    return await CreateBudget(budget)

@router.get('/budgets/user/{user_id}')
async def get_budgets_by_userid(user_id:str):
    user = await GetUserById(user_id)
    if not user:
        raise HTTPException(status_code=400,detail="User not found")
    return await GetBudgetByUserId(user_id)

@router.delete('/budgets/{budget_id}')
async def delete_budget_by_id(budget_id:str):
    return await DeleteBudgetById(budget_id)