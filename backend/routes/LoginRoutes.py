from fastapi import APIRouter, HTTPException
from models.UserModel import User
from typing import Dict
from pydantic import BaseModel
from controllers.UserController import LoginUser,CreateUser

router = APIRouter()

class LoginData(BaseModel):
    email: str
    password: str

class SignupData(BaseModel):
    name: str
    email: str
    password: str
    status: bool = True
    isAdmin: bool = False

@router.post("/login", response_model=Dict)
async def login(login_data: LoginData):
    return await LoginUser(login_data.email, login_data.password)

@router.post("/signup", response_model=Dict)
async def signup(signup_data: SignupData):

    user = User(**signup_data.model_dump())
    return await CreateUser(user)