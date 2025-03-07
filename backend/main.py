from fastapi import FastAPI
# Routes
from routes.UserRoutes import router as user_router
from routes.LoginRoutes import router as login_router
from routes.CategoryRoutes import router as category_router
from routes.TransactionsRoutes import router as transactions_router
from routes.AnalyticsRoutes import router as analytics_router
# Middlewares
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(user_router,prefix='/api',tags=["Users"])
app.include_router(login_router,prefix='/api',tags=["Login/Signup"])
app.include_router(category_router,prefix='/api',tags=["Category"])
app.include_router(transactions_router,prefix='/api',tags=["Transactions"])
app.include_router(analytics_router,prefix='/api',tags=["Analytics"])

@app.get("/")
async def root():
    return {"message": "Expense Tracker"}