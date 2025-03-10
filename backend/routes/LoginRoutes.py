from fastapi import APIRouter, HTTPException
from models.UserModel import User
from typing import Dict
from pydantic import BaseModel
from controllers.UserController import LoginUser,CreateUser,SendOTPMail,VerifyOTPCode
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

@router.get('/send-otp/{user_email}')
async def send_otp_mail(user_email:str):
    return await SendOTPMail(user_email)

@router.get('/verify-otp/{user_email}')
async def verify_otp(user_email:str,verifyOTP:int):
    return await VerifyOTPCode(user_email,verifyOTP)