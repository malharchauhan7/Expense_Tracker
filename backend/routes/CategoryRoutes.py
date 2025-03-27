from fastapi import APIRouter, HTTPException
from controllers.CategoryController import GetAllCategories,GetCategoryById,CreateCategory,UpdateCategoryById,DeleteCategoryById,GetALLCategoriesByUserId,GetCategoriesByTypeAndUserId
from models.CategoryModel import Category

router = APIRouter()

# Get All categories
@router.get('/category')
async def get_all_category():
    return await GetAllCategories()


# Get Category by Id
@router.get('/category/{category_id}')
async def get_category_by_id(category_id:str):
    category = await GetCategoryById(category_id)
    if not category:
        raise HTTPException(status_code=404,detail="Category not found")
    return category


# Create Category
@router.post("/category")
async def createcategory(category:Category):
    return await CreateCategory(category)


# Update Category by Id
@router.put("/category/{category_id}")
async def update_category_by_id(category_id:str,category:Category):
    return await UpdateCategoryById(category_id,category)


# Delete Category by Id
@router.delete("/category/{category_id}")
async def delete_category_by_id(category_id:str):
    return await DeleteCategoryById(category_id)


# Get Categories by user_id
@router.get('/category/user/{user_id}')
async def get_all_categories_by_user_id(user_id:str):
    return await GetALLCategoriesByUserId(user_id) 


@router.get("/categories/{user_id}/{category_type}")
async def get_categories_by_type_and_user(user_id: str, category_type: str):
    return await GetCategoriesByTypeAndUserId(user_id, category_type)