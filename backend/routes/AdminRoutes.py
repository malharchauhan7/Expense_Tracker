from fastapi import APIRouter,HTTPException
from controllers.UserController import GetAllUsersByAdmin
from config.db import users_collection
from bson import ObjectId
from fastapi.responses import JSONResponse
router = APIRouter()

@router.get('/admin/users/{admin_id}')
async def get_all_users_by_admin(admin_id:str):
    try:
        admin = await users_collection.find_one({"_id":ObjectId(admin_id), "isAdmin":True})
        if not admin:
            return JSONResponse(status_code=401,content={"success":False,"message":"UnAthorized Access"})
        
        return await GetAllUsersByAdmin()
    except Exception as e:
        raise HTTPException(status_code=404,detail=f"error {str(e)}")