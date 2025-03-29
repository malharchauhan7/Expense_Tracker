from config.db import transaction_collection,users_collection,category_collection
from bson import ObjectId
# from controllers.UserController import GetUserById
# from controllers.CategoryController import GetCategoryById
from models.TransactionsModel import Transaction
from datetime import datetime,UTC
from fastapi import HTTPException
from fastapi.responses import JSONResponse

def Transaction_Out(transaction):
    return {
        "_id": str(transaction["_id"]),
        "user_id": transaction["user_id"] if isinstance(transaction["user_id"], dict) else str(transaction["user_id"]),
        "category_id": transaction["category_id"] if isinstance(transaction["category_id"], dict) else {
            "_id":str(transaction["category_id"]),
            "name":"Uncategorized"
            },
        "transaction_type": transaction["transaction_type"],
        "amount": transaction["amount"],
        "description": transaction["description"],
        "date": transaction["date"].isoformat() if transaction["date"] else None,
        "status": transaction["status"],
        "updated_at": transaction["updated_at"].isoformat() if transaction["updated_at"] else None,
        "created_at": transaction["created_at"].isoformat() if transaction["created_at"] else None,
    }
    
    
# Get ALl Transactions
async def GetALlTransactions()->list[dict]:
    try:
        transactions = await transaction_collection.find().to_list(length=None)
        
        for transaction in transactions:
            if "category_id" in transaction and isinstance(transaction["category_id"], ObjectId):
                category = await category_collection.find_one({"_id": transaction["category_id"]})
                if category:
                    category["_id"] = str(category["_id"])
                    
                    transaction["category_id"] = {
                        "_id": str(category["_id"]),  
                        "name": category["name"],
                        "status": category.get("status", True),
                        "created_at": category.get("created_at"),
                        "updated_at": category.get("updated_at")
                    }
            
        if not transactions:
            raise HTTPException(status_code=404,detail="No Transactions Found")
        
        return [Transaction_Out(transaction) for transaction in transactions]
    
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"error:{str(e)}")
    
    
# Get Transaction By Id
async def GetTransactionById(transaction_id: str):
    try:
        transaction = await transaction_collection.find_one({"_id": ObjectId(transaction_id)})

        if not transaction:
            raise HTTPException(status_code=404, detail="No Transaction found")

        
        # if "user_id" in transaction and isinstance(transaction["user_id"], ObjectId):
        #     transaction["user_id"] = str(transaction["user_id"])
        # if "category_id" in transaction and isinstance(transaction["category_id"], ObjectId):
        #     transaction["category_id"] = str(transaction["category_id"])
        

                
        if "category_id" in transaction and isinstance(transaction["category_id"], ObjectId):
            category = await category_collection.find_one({"_id": transaction["category_id"]})
            if category:
                category["_id"] = str(category["_id"])
                
                transaction["category_id"] = {
                    "_id": str(category["_id"]),
                    "name": category["name"],
                    "status": category.get("status", True),
                    "created_at": category.get("created_at"),
                    "updated_at": category.get("updated_at")
                }
        
        

       
        # user = await users_collection.find_one({"_id": ObjectId(transaction["user_id"])})
        # category = await category_collection.find_one({"_id": ObjectId(transaction["category_id"])})
        # transaction["user"] = {"_id": str(user["_id"]), "name": user["name"]} if user else None
        # transaction["category"] = {"_id": str(category["_id"]), "name": category["name"]} if category else None

        return Transaction_Out(transaction)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")

    
# Create Transaction
async def CreateTransaction(transaction:Transaction):
    try:
        current_time = datetime.now(UTC)
        
        transaction.user_id = ObjectId(transaction.user_id)
        transaction.category_id = ObjectId(transaction.category_id)
        
        user = await users_collection.find_one({"_id": transaction.user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        category = await category_collection.find_one({"_id": transaction.category_id})
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        
        new_transaction = transaction.model_dump(exclude={"id"})
        new_transaction.update({
            "date": transaction.date if hasattr(transaction, 'date') else current_time,
            "created_at": current_time,
            "updated_at": current_time
        })
        
        inserted_transaction = await transaction_collection.insert_one(new_transaction)
        
        if not inserted_transaction.inserted_id:
            raise HTTPException(status_code=400,detail="Failed to create transaction")
        
        return await GetTransactionById(str(inserted_transaction.inserted_id))
    
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"error: {str(e)}")
    
    
# Update Transaction By Id
async def UpdateTransactionById(transaction_id:str,transaction:Transaction):
    try:
        existing_transaction = await GetTransactionById(transaction_id)
        if not existing_transaction:
            raise HTTPException(status_code=404,detail="No Transaction Found")
        
        update_data = {
            key: value for key, value in transaction.model_dump(
                exclude={"id"}, 
                exclude_unset=True
            ).items()
        }
        
        if not update_data:
            return existing_transaction
        
        update_data["updated_at"] = datetime.now(UTC)
        result = await transaction_collection.update_one({"_id":ObjectId(transaction_id)},{"$set":update_data})
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400,detail="Update Operation Failed")
        
        return await GetTransactionById(transaction_id)
    
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")


# Delete Transaction By Id
async def DeleteTransactionById(transaction_id:str):
    try:
        existing_transaction = await GetTransactionById(transaction_id)
        if not existing_transaction:
            raise HTTPException(status_code=404,detail="Transaction Not Found")
        
        await transaction_collection.delete_one({"_id":ObjectId(transaction_id)})
        
        return {"message":"Transaction Deleted Successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")
    
# ------------- Get ALL Transactions By User_id --------------
async def GetAllTransactionsByUserId(user_id: str):
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid User ID format")
            
     
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not Found")
            
     
        transactions = await transaction_collection.find(
            {"user_id": ObjectId(user_id)}
        ).to_list(length=None)
        
        if not transactions:
            raise HTTPException(status_code=404, detail="No Transactions Found for this User")
            
  
        for transaction in transactions:
            if "user_id" in transaction and isinstance(transaction["user_id"], ObjectId):
                user["_id"] = str(user["_id"])
                transaction["user_id"] = user
                
            if "category_id" in transaction and isinstance(transaction["category_id"], ObjectId):
                category = await category_collection.find_one({"_id": transaction["category_id"]})
                if category:
                    category["_id"] = str(category["_id"])
                    
                    transaction["category_id"] = {
                        "_id": str(category["_id"]),
                        "name": category["name"],
                        "status": category.get("status", True),
                        "created_at": category.get("created_at"),
                        "updated_at": category.get("updated_at")
                    }
        
        return [Transaction_Out(transaction) for transaction in transactions]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")
    

# ------------- Get Analytics of Transactions By User_id ---------------
async def GetAnalyticsByUserId(user_id: str):
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid User ID format")

        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        pipeline = [
            {
                "$match": {
                    "user_id": ObjectId(user_id),
                    "status": True
                }
            },
            {
                "$group": {
                    "_id": "$transaction_type",
                    "total": {"$sum": "$amount"}
                }
            }
        ]

        results = await transaction_collection.aggregate(pipeline).to_list(length=None)

        analytics = {
            "total_income": 0,
            "total_expense": 0,
            "total_balance": 0,
            "total_savings": 0
        }
        
        for result in results:
            if result["_id"] == "Income":
                analytics["total_income"] = result["total"]
            elif result["_id"] == "Expense":
                analytics["total_expense"] = result["total"]

        analytics["total_balance"] = analytics["total_income"] - analytics["total_expense"]
        analytics["total_savings"] = analytics["total_balance"]

        return JSONResponse(
            status_code=200,
            content=analytics
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")
    
# ------------ Get Analytics of All Transactions for Admin -------------
async def GetAllTransactionsAnalytics():
    try:
        Activetransactions = await transaction_collection.find({"status":True}).to_list(length=None)
        InActivetransactions = await transaction_collection.find({"status":False}).to_list(length=None)
        
        for transaction in Activetransactions:  
            if "category_id" in transaction and isinstance(transaction["category_id"], ObjectId):
                category = await category_collection.find_one({"_id": transaction["category_id"]})
                if category:
                    transaction["category_id"] = {
                        "_id": str(category["_id"]),
                        "name": category.get("name", "Uncategorized"),
                    }
            if "user_id" in transaction and isinstance(transaction["user_id"],ObjectId):
                user = await users_collection.find_one({"_id":transaction["user_id"]})
                if user:
                    transaction["user_id"] = {
                        "_id": str(user["_id"]),
                        "name": user["name"]
                    }
        
        
        
        NoOfActiveTransactions = len(Activetransactions)
        NoOfInActiveTransactions = len(InActivetransactions)
        
        TotalTransactions = NoOfActiveTransactions+NoOfInActiveTransactions
        
        analytics_data = {
            "TotalTransactions":TotalTransactions,
            "NoOfActiveTransactions":NoOfActiveTransactions,
            "NoOfInActiveTransactions":NoOfInActiveTransactions,
            "Activetransactions":[Transaction_Out(item) for item in Activetransactions],
            "InActivetransactions":[Transaction_Out(item) for item in InActivetransactions]
        }
        
        return JSONResponse(status_code=200,content=analytics_data)
        
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"error {str(e)}")