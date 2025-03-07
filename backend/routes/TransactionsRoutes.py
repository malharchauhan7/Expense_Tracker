from fastapi import APIRouter,HTTPException
from models.TransactionsModel import Transaction
from controllers.TransactionController import GetALlTransactions,GetTransactionById,CreateTransaction,UpdateTransactionById,DeleteTransactionById,GetAllTransactionsByUserId,GetAnalyticsByUserId
from bson import ObjectId
router = APIRouter()

# Get All Transactions
@router.get('/transactions')
async def get_all_transactions():
    return await GetALlTransactions()

# Get Transaction By Id
@router.get("/transactions/{transaction_id}")
async def get_transaction_by_id(transaction_id:str):
    transaction = await GetTransactionById(transaction_id)
    if not transaction:
        raise HTTPException(status_code=404,detail="No Transaction found")
    
    return transaction

@router.post('/transactions')
async def create_transaction(transaction:Transaction):
    return await CreateTransaction(transaction)

@router.put('/transactions/{transaction_id}')
async def update_transaction_by_id(transaction_id:str,transaction:Transaction):
    return await UpdateTransactionById(transaction_id,transaction)

@router.delete('/transactions/{transaction_id}')
async def delete_transaction_by_id(transaction_id:str):
    return await DeleteTransactionById(transaction_id)

@router.get('/transactions/user/{user_id}')
async def get_all_transactions_by_user_id(user_id:str):
    return await GetAllTransactionsByUserId(user_id)

