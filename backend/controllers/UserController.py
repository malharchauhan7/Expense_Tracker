from bson import ObjectId
from config.db import users_collection,category_collection,transaction_collection,budget_collection
from models.UserModel import User,ResetPasswordReq
from datetime import datetime,UTC,timedelta
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from controllers.CategoryController import CreateCategory
from models.CategoryModel import Category
from utils.SendMail import send_mail
import random
from jose import jwt,JWTError
import bcrypt

SECRET_KEY = "ExpenseMate$69"

def User_Out(user):
    return {
        "_id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "isAdmin": user["isAdmin"],
        "status": user["status"],
        "transactions": user.get("transactions", 0),
        "updated_at": user["updated_at"].isoformat() if user["updated_at"] else None,
        "created_at": user["created_at"].isoformat() if user["created_at"] else None,
    }

# Get all users
async def GetAllUser():
    try:
        users = await users_collection.find().to_list(length=None)
        if not users:
            raise HTTPException(status_code=404, detail="No users found")
        for user in users:
            transactions = await transaction_collection.find({"user_id":user.get("_id")}).to_list(length=None)
            
            user["transactions"] = len(transactions) if transactions else 0
        
        return [User_Out(user) for user in users]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")


# Get user by ID
async def GetUserById(user_id: str):
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return User_Out(user)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")
    


# Create a User
async def CreateUser(user: User):
    try:

        existing_user = await users_collection.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

            
        current_time = datetime.now(UTC)
        random_otp = random.randrange(1000,10000)
        new_user = user.model_dump(exclude={"id"})
        new_user.update({
            "created_at": current_time,
            "updated_at": current_time,
            "verifyOTP":random_otp
        })
        
        inserted_user = await users_collection.insert_one(new_user)
        
        default_categories = [
            {"name": "Bills", "category_type": "Expense"},
            {"name": "Salary", "category_type": "Income"},
            {"name": "Entertainment", "category_type": "Expense"}
        ]
        
        if not new_user["isAdmin"]:
            for category in default_categories:
                category = Category(
                    name=category["name"],
                    category_type=category["category_type"],  
                    user_id=str(inserted_user.inserted_id),
                    status=True
                )
                await CreateCategory(category)
        
        
        if not inserted_user.inserted_id:
            raise HTTPException(status_code=400, detail="Failed to create user")
        

        return await GetUserById(str(inserted_user.inserted_id))
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")
   
   
    
# Update User by Id 
async def UpdateUserById(user_id: str, user: User):
    try:
        existing_user = await GetUserById(user_id)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User Not Found")
        
        
        update_data = {
            key: value for key, value in user.model_dump(exclude={"id"}).items()
            if value is not None
        }
        
        if not update_data:  
            return existing_user
        

        update_data["updated_at"] = datetime.now(UTC)

     
        result = await users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})

        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Update operation failed")

        return await GetUserById(user_id)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")
   
   
    
# Delete User by Id
async def DeleteUserById(user_id:str):
    try:
        existing_user = await GetUserById(user_id)
        if not existing_user:
            raise HTTPException(status_code=404,detail="User Not Found")
        
        await users_collection.delete_one({"_id":ObjectId(user_id)})
        return {"message":"User Deleted"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")
   
  
    
# Login User 
async def LoginUser(email: str, password: str):
    try:

        user = await users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")


        stored_password = user.get("password")
        

        if not User.verify_password(password, stored_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        

        user_data = User_Out(user)
        return user_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")



# Get All users Analytics
async def GetAllUsersAnalytics():
    try:
        ActiveUsers = await users_collection.find({"status":True, "isAdmin":False}).to_list(length=None)
        if not ActiveUsers:
            raise HTTPException(status_code=404, detail="No users found")
        
        InActiveUsers = await users_collection.find({"status":False, "isAdmin":False}).to_list(length=None)
           
        NoActiveUsers = len(ActiveUsers)
        NoOfInActiveUsers = len(InActiveUsers)
        # ActiveUsers = [User_Out(user) for user in ActiveUsers]
        TotalUsers = NoActiveUsers + NoOfInActiveUsers
       
        AnalyticsData = {
            "TotalUsers":TotalUsers,
            "NoOfActiveUsers":NoActiveUsers,
            "NoOfInActiveUsers":NoOfInActiveUsers,
            "ActiveUsers": [User_Out(user) for user in ActiveUsers],
            "InActiveUsers":[User_Out(user) for user in InActiveUsers]
        }
        
        return JSONResponse(status_code=200,content=AnalyticsData) 
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")
    


# Send OTP Mail
async def SendOTPMail(user_email:str):
    try:
        user = await users_collection.find_one({"email":user_email})
        if not user:
            return JSONResponse(status_code=404,content={"success":False,"message":"User Not Found! Please Verify Email"})
        
        new_otp = random.randrange(1000, 10000)
        current_time = datetime.now(UTC)
        
        await users_collection.update_one({"email": user_email}, {"$set": {"verifyOTP": new_otp, "updated_at": current_time}})
        
        to_email = user["email"]
        subject = "OTP Verification - ExpanseMate"
        text = f'''
        Dear {user['name']},
        
        Welcome to ExpanseMate!
        
        Your OTP Verification code is : {new_otp}
        '''
        send_mail(to_email,subject,text)
        return JSONResponse(status_code=200,content={"success":True,"messaege":"OTP Mail sent successfully"})
    except Exception as e:
        return HTTPException(status_code=404,detail=f"error {str(e)}")
    
# Verify OTP 
async def VerifyOTPCode(user_email:str,verifyOTP:int):
    try:
        user = await users_collection.find_one({"email":user_email})
        if not user:
            raise HTTPException(status_code=404,detail="User not found!")
        
        if user.get('verifyOTP') != verifyOTP:
            return JSONResponse(status_code=404,content={"success":False,"messaege":"Invalid OTP!"})

        return JSONResponse(status_code=200,content={"success":True,"messaege":"OTP Verified!"})
    except Exception as e:
        return HTTPException(status_code=404,detail=f"error {str(e)}")
    
# --------------------- RESET PASSWORD ----------------------
def generate_token(email: str):
    expiration = datetime.utcnow() + timedelta(hours=1)
    payload = {
        "sub": email,
        "exp": expiration
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

async def ForgotPassword(email:str):
    try:
        user = await users_collection.find_one({"email":email})
        if not user:
            raise HTTPException(status_code=404,detail="User not found!")
        
        token = generate_token(email)
        resetLink = f"http://localhost:5173/resetpassword/{token}"
        body = f"""
            HELLO, 
            This is Reset Password Link Expires in 1 Hour.
            RESET PASSWORD
            {resetLink}
        """
        subject = "Reset Password"
        send_mail(email,subject,body)
        return {"success":"true","message":"Reset link sent successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=404,detail=f"Error {str(e)}")

async def ResetPassword(data:ResetPasswordReq):
    try:
        payload = jwt.decode(data.token,SECRET_KEY,algorithms=["HS256"])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=404,detail="Token Invalid")
        
        hashed_password = User.hash_password(data.password)
        updated_at = datetime.now(UTC)
        
        await users_collection.update_one({"email": email},{"$set": {"password": hashed_password,"updated_at": updated_at}})
        
        return {"success":"true","message":"Passoword reset successfully!"}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=500,detail="jwt is expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=500,detail="jwt is invalid")    
    
    
# --------------- Users Management for Admin -----------------

# Get All Users Details 
async def GetAllUsersByAdmin():
    try:
        
        users = await users_collection.find({"isAdmin": False}).to_list(length=None)
        if not users:
            raise HTTPException(status_code=404, detail="No users found")
        
        for user in users:
            transactions = await transaction_collection.find({"user_id":user.get("_id")}).to_list(length=None)
            
            user["transactions"] = len(transactions) if transactions else 0
                
            
       
       
        return JSONResponse(
            status_code=200,
            content=[User_Out(user) for user in users]
        )
        
        
        
    except Exception as e:
        return HTTPException(status_code=404,detail=f"error {str(e)}")


# GetUserDetailsByAdmin
async def GetUserDetailsByAdmin(user_id: str):
    try:


        user = await users_collection.find_one({"_id":  ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")


        transactions = await transaction_collection.find(
            {"user_id": ObjectId(user_id)}
        ).to_list(length=None)


        categories = await category_collection.find(
            {"user_id": ObjectId(user_id)}
        ).to_list(length=None)


        total_income = sum(t["amount"] for t in transactions if t["transaction_type"] == "Income")
        total_expense = sum(t["amount"] for t in transactions if t["transaction_type"] == "Expense")
        total_balance = total_income - total_expense


        budgets = await budget_collection.find(
            {"user_id": ObjectId(user_id)}
        ).to_list(length=None)


        income_categories = [cat for cat in categories if cat["category_type"] == "Income"]
        expense_categories = [cat for cat in categories if cat["category_type"] == "Expense"]


        return {
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "created_at": user["created_at"],
                "status": user["status"]
            },
            "stats": {
                "total_transactions": len(transactions),
                "total_income": round(total_income,2),
                "total_expense": round(total_expense,2),
                "total_balance": round(total_balance,2),
                "total_budgets": len(budgets),
                "total_categories": len(categories)
            },
            "categories": {
                "income": [{
                    "id": str(cat["_id"]),
                    "name": cat["name"],
                    "status": cat["status"]
                } for cat in income_categories],
                "expense": [{
                    "id": str(cat["_id"]),
                    "name": cat["name"],
                    "status": cat["status"]
                } for cat in expense_categories]
            },
            "transactions": [{
                "id": str(t["_id"]),
                "description": t["description"],
                "amount": t["amount"],
                "date": t["date"],
                "transaction_type": t["transaction_type"],
                "category_id": str(t["category_id"]) if isinstance(t["category_id"], ObjectId) else t["category_id"]
            } for t in transactions],
            "budgets": [{
                "id": str(b["_id"]),
                "title": b["title"],
                "amount": b["amount"],
                "start_date": b["start_date"],
                "end_date": b["end_date"],
                "description": b.get("description", "")
            } for b in budgets]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))