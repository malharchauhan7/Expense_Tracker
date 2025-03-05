from fastapi import APIRouter, HTTPException
from controllers.UserController import GetAllUser,GetUserById,CreateUser,UpdateUserById,DeleteUserById
from models.UserModel import User

router = APIRouter()

@router.get("/users")
async def get_all_users():
    return await GetAllUser()

@router.get("/users/{user_id}")
async def get_user_by_id(user_id: str):
    user = await GetUserById(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/users")
async def create_user(user: User):
    return await CreateUser(user)

@router.put('/users/{user_id}')
async def update_user_by_id(user_id:str,user:User):
    return await UpdateUserById(user_id,user)

@router.delete("/users/{user_id}")
async def delete_user_by_id(user_id:str):
    return await DeleteUserById(user_id)