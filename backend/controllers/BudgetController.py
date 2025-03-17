from config.db import transaction_collection,users_collection,category_collection,budget_collection
from controllers.UserController import GetUserById
from bson import ObjectId
from models.BudgetModel import Budget
from datetime import datetime,UTC
from fastapi import HTTPException
from fastapi.responses import JSONResponse



def Budget_Out(budget):
    return {
        "_id" : str(budget["_id"]),
        "title": budget["title"],
        "description": budget["description"],
        "amount" : budget['amount'],
        "user_id": budget["user_id"] if isinstance(budget["user_id"], dict) else str(budget["user_id"]),
        "start_date": budget["start_date"].isoformat() if budget.get("start_date") else None,
        "end_date": budget["end_date"].isoformat() if budget.get("end_date") else None,
        "updated_at": budget["updated_at"].isoformat() if budget.get("updated_at") else None,
        "created_at": budget["created_at"].isoformat() if budget.get("created_at") else None,
    }
    
# Get All Budgets
async def GetAllBudgets()->list[dict]:
    try:
        budgets = await budget_collection.find().to_list(length=None)
        if not budgets:
            return JSONResponse(status_code=404,content={"message":"No Budgets Found!"})
        
        
        budget_list = []
        for budget in budgets:
            if "user_id" in budget and isinstance(budget["user_id"],ObjectId):
                user = await GetUserById(str(budget["user_id"]))
                if user:
                    budget["user_id"] = user
            budget_list.append(Budget_Out(budget))
        
        return JSONResponse(
            status_code=200,
            content=budget_list
        )
        
    except Exception as e:
        raise HTTPException(status_code=404,detail=f"error {str(e)}")


# Get Budget By Id
async def GetBudgetById(budget_id:str):
    try:
        budget = await budget_collection.find_one({"_id":ObjectId(budget_id)})
        
        if not budget:
            raise HTTPException(status_code=404,detail=f"error {str(e)}")
        
        if "user_id" in budget and isinstance(budget["user_id"],ObjectId):
                user = await GetUserById(str(budget["user_id"]))
                if user:
                    budget["user_id"] = user
                    
        
        return JSONResponse(
            status_code=200,
            content=Budget_Out(budget)
        )
        
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")
    


# Create Budget 
async def CreateBudget(budget:Budget):
    try:
        current_time = datetime.now(UTC)

        budget.user_id = ObjectId(budget.user_id)
        
        user = await users_collection.find_one({"_id": budget.user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        
        new_budget = budget.model_dump(exclude={"id"})
        new_budget.update({
            "created_at": current_time,
            "updated_at": current_time
        })
        
        inserted_budget = await budget_collection.insert_one(new_budget)
        
        if not inserted_budget.inserted_id:
            raise HTTPException(status_code=400,detail="Failed to create budget")
        
        
        return  await GetBudgetById(str(inserted_budget.inserted_id))
        
        
    except Exception as e:
        raise HTTPException(status_code=404,detail=f"error {str(e)}")
    
# -------------- Get Budget By User_id --------------------------
async def GetBudgetByUserId(user_id:str):
    try:
        
        
        budgets = await budget_collection.find({"user_id":ObjectId(user_id)}).to_list(length=None)
        
        if not budgets:
            raise HTTPException(status_code=400,detail="No Budgets Found!")
        
        budget_list = []
        for budget in budgets:
            if "user_id" in budget and isinstance(budget["user_id"],ObjectId):
                user = await GetUserById(user_id)
                if user:
                    budget["user_id"] = user
            budget_list.append(Budget_Out(budget))
        
        return JSONResponse(
            status_code=200,
            content=budget_list
        )
    
    except Exception as e:
        raise HTTPException(status_code=404,detail=f"error {str(e)}")
    
# Delete Budgets by Id
async def DeleteBudgetById(budget_id:str):
    try:
        await budget_collection.delete_one({"_id":ObjectId(budget_id)})
        
        return {"message":"Budget Deleted Successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"error: {str(e)}") 



# -------------- Budget Analytics -------------------
async def GetBudgetAnalytics(user_id: str):
    try:
        
        current_date = datetime.now(UTC)
        budgets = await budget_collection.find({
            "user_id": ObjectId(user_id),
            "start_date": {"$lte": current_date},
            "end_date": {"$gte": current_date}
        }).to_list(length=None)

        if not budgets:
            return JSONResponse(
                status_code=200,
                content={"message": "No active budgets found"}
            )

        budget_analytics = []
        
        for budget in budgets:
            
            transactions = await transaction_collection.find({
                "user_id": ObjectId(user_id),
                "date": {
                    "$gte": budget["start_date"],
                    "$lte": budget["end_date"]
                },
                "transaction_type": "Expense",
                "status": True
            }).to_list(length=None)

            total_spent = sum(t["amount"] for t in transactions)
            budget_limit = budget["amount"]
            remaining = budget_limit - total_spent
            percentage_used = (total_spent / budget_limit) * 100 if budget_limit > 0 else 0

            status = "normal"
            message = "Budget is on track"

            if percentage_used >= 90:
                status = "danger"
                message = "Budget limit almost reached!"
            elif percentage_used >= 75:
                status = "warning"
                message = "Approaching budget limit"
            
            budget_analytics.append({
                "budget_id": str(budget["_id"]),
                "title": budget["title"],
                "budget_limit": budget_limit,
                "total_spent": total_spent,
                "remaining": remaining,
                "percentage_used": round(percentage_used, 2),
                "status": status,
                "message": message,
                "period": {
                    "start": budget["start_date"].isoformat(),
                    "end": budget["end_date"].isoformat()
                }
            })

        return JSONResponse(
            status_code=200,
            content=budget_analytics
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing budgets: {str(e)}"
        )