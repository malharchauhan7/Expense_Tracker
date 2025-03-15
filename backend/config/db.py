from motor.motor_asyncio import AsyncIOMotorClient

uri = "mongodb://localhost:27017"
client = AsyncIOMotorClient(uri)

db = client["expense-tracker-db"]

users_collection = db["users"]
category_collection = db["category"]
transaction_collection = db["transactions"]
budget_collection = db["budgets"]