from bson import ObjectId
from config.db import users_collection,category_collection
from models.UserModel import User
from datetime import datetime,UTC
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from controllers.CategoryController import CreateCategory
from models.CategoryModel import Category
def User_Out(user):
    return {
        "_id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "isAdmin": user["isAdmin"],
        "status": user["status"],
        "updated_at": user["updated_at"].isoformat() if user["updated_at"] else None,
        "created_at": user["created_at"].isoformat() if user["created_at"] else None,
    }

# Get all users
async def GetAllUser():
    try:
        users = await users_collection.find().to_list(length=None)
        if not users:
            raise HTTPException(status_code=404, detail="No users found")
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
        new_user = user.model_dump(exclude={"id"})
        new_user.update({
            "created_at": current_time,
            "updated_at": current_time
        })
        
        inserted_user = await users_collection.insert_one(new_user)
        
        default_categories = [
            {"name":"Bills"},
            {"name":"Salary"},
            {"name":"Entertainment"}
        ]
        
        for category in default_categories:
            category = Category(
                name=category["name"],
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
        
        
        NoActiveUsers = len(ActiveUsers)
        InActiveUsers = 0
        # ActiveUsers = [User_Out(user) for user in ActiveUsers]
    
       
        AnalyticsData = {
            "NoActiveUsers":NoActiveUsers,
            "InActiveUsers":InActiveUsers,
            "ActiveUsers": [User_Out(user) for user in ActiveUsers],
        }
        
        return JSONResponse(status_code=200,content=AnalyticsData) 
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")
    
