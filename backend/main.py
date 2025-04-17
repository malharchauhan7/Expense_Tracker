from fastapi import FastAPI
# Routes
from routes.UserRoutes import router as user_router
from routes.LoginRoutes import router as login_router
from routes.CategoryRoutes import router as category_router
from routes.TransactionsRoutes import router as transactions_router
from routes.AnalyticsRoutes import router as analytics_router
from routes.BudgetRoutes import router as budgets_router
from routes.AdminRoutes import router as admin_router
from routes.ReportRoutes import router as report_router
from routes.chatbot import router as chatbot_router
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
app.include_router(admin_router,prefix='/api',tags=["Admin"])
app.include_router(login_router,prefix='/api',tags=["Login/Signup"])
app.include_router(category_router,prefix='/api',tags=["Category"])
app.include_router(transactions_router,prefix='/api',tags=["Transactions"])
app.include_router(analytics_router,prefix='/api',tags=["Analytics"])
app.include_router(budgets_router,prefix='/api',tags=["Budgets"])
app.include_router(report_router,prefix='/api',tags=["Reports"])
app.include_router(chatbot_router,prefix='/api/chatbot',tags=["Chatbot"])

@app.get("/")
async def root():
    return {"message": "Expense Tracker"}