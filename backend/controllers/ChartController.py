from config.db import users_collection,transaction_collection,category_collection,budget_collection
from controllers.CategoryController import GetALLCategoriesByUserId
from bson import ObjectId
from datetime import datetime,UTC
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from utils.RandomColorGenerator import generate_random_color


async def GetMonthlyTransactionAnalytics(user_id: str):
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID format")

        monthly_data = await transaction_collection.aggregate([
            {
                "$match": {
                    "user_id": ObjectId(user_id),
                    "status": True
                }
            },
            {
                "$project": {
                    "month": {"$month": "$date"},
                    "year": {"$year": "$date"},
                    "amount": "$amount",
                    "type": "$transaction_type"  
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": "$year",
                        "month": "$month",
                        "type": "$type"
                    },
                    "total": {"$sum": "$amount"}
                }
            },
            {
                "$sort": {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]).to_list(length=None)

   
        current_date = datetime.now(UTC)
        formatted_data = {
            f"{current_date.year}-{current_date.month:02d}": {
                "Income": 0,
                "Expense": 0
            }
        }

        for entry in monthly_data:
            year_month = f"{entry['_id']['year']}-{entry['_id']['month']:02d}"
            if year_month not in formatted_data:
                formatted_data[year_month] = {
                    "Income": 0,
                    "Expense": 0
                }
            formatted_data[year_month][entry['_id']['type']] = entry['total']


        sorted_months = sorted(formatted_data.keys())

        return JSONResponse(
            status_code=200,
            content={
                "labels": sorted_months,
                "datasets": [
                    {
                        "label": "Income",
                        "data": [formatted_data[month]["Income"] for month in sorted_months]
                    },
                    {
                        "label": "Expense",
                        "data": [formatted_data[month]["Expense"] for month in sorted_months]
                    }
                ]
            }
        )

    except Exception as e:
        print(f"Monthly Analytics Error: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")
    

async def GetCategoryWiseTransactions(user_id: str):
    try:
        user_categories = await GetALLCategoriesByUserId(user_id)
        if isinstance(user_categories, HTTPException):
            raise user_categories

        pipeline = [
            {
                "$match": {
                    "user_id": ObjectId(user_id),
                    "status": True
                }
            },
            {
                "$group": {
                    "_id": "$category_id",
                    "total_amount": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }
            }
        ]

        transaction_data = await transaction_collection.aggregate(pipeline).to_list(length=None)
        
        transaction_map = {str(item["_id"]): {
            "total_amount": item["total_amount"],
            "count": item["count"]
        } for item in transaction_data}

        income_categories = []
        expense_categories = []

        for category in user_categories:
            category_id = str(category["_id"])
            transaction_info = transaction_map.get(category_id, {"total_amount": 0, "count": 0})
            
            category_data = {
                "category_name": category["name"],
                "total_amount": transaction_info["total_amount"],
                "count": transaction_info["count"]
            }

            if category["category_type"] == "Income":
                income_categories.append(category_data)
            else:
                expense_categories.append(category_data)

        income_colors = [generate_random_color() for _ in range(len(income_categories))]
        expense_colors = [generate_random_color() for _ in range(len(expense_categories))]

        return JSONResponse(
            status_code=200,
            content={
                "income": {
                    "labels": [item["category_name"] for item in income_categories],
                    "datasets": [{
                        "data": [item["total_amount"] for item in income_categories],
                        "backgroundColor": income_colors,
                        "transactionCounts": [item["count"] for item in income_categories]
                    }]
                },
                "expense": {
                    "labels": [item["category_name"] for item in expense_categories],
                    "datasets": [{
                        "data": [item["total_amount"] for item in expense_categories],
                        "backgroundColor": expense_colors,
                        "transactionCounts": [item["count"] for item in expense_categories]
                    }]
                }
            }
        )

    except Exception as e:
        print(f"Error: {str(e)}")  
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")
    

async def GetFinancialSuggestions(user_id: str):
    try:
        # Get user's transactions and budgets
        pipeline = [
            {
                "$match": {
                    "user_id": ObjectId(user_id),
                    "status": True
                }
            },
            {
                "$lookup": {
                    "from": "category",
                    "localField": "category_id",
                    "foreignField": "_id",
                    "as": "category"
                }
            },
            {
                "$unwind": "$category"
            },
            {
                "$group": {
                    "_id": {
                        "category_id": "$category_id",
                        "category_name": "$category.name",
                        "category_type": "$category.category_type"
                    },
                    "total_spent": {"$sum": "$amount"},
                    "transaction_count": {"$sum": 1}
                }
            }
        ]

        category_spending = await transaction_collection.aggregate(pipeline).to_list(length=None)
        budgets = await budget_collection.find({"user_id": ObjectId(user_id), "status": True}).to_list(length=None)

        # Initialize suggestions
        suggestions = {
            "summary": {},
            "budget_alerts": [],
            "spending_patterns": [],
            "savings_suggestions": [],
            "general_advice": []
        }

        total_income = 0
        total_expense = 0
        budget_map = {}

        # Create budget mapping
        for budget in budgets:
            budget_map[str(budget["category_id"])] = budget["amount"]

        # Analyze spending patterns and generate suggestions
        for category in category_spending:
            cat_id = str(category["_id"]["category_id"])
            cat_name = category["_id"]["category_name"]
            cat_type = category["_id"]["category_type"]
            spent = category["total_spent"]

            if cat_type == "Income":
                total_income += spent
            else:
                total_expense += spent
                # Check budget overages
                if cat_id in budget_map:
                    budget_amount = budget_map[cat_id]
                    if spent > budget_amount:
                        overspend_percentage = ((spent - budget_amount) / budget_amount) * 100
                        suggestions["budget_alerts"].append({
                            "category": cat_name,
                            "budget": budget_amount,
                            "spent": spent,
                            "overspend_percentage": round(overspend_percentage, 2),
                            "message": f"⚠️ You've exceeded your {cat_name} budget by {round(overspend_percentage, 2)}%"
                        })
                    elif spent > (budget_amount * 0.8):
                        suggestions["budget_alerts"].append({
                            "category": cat_name,
                            "budget": budget_amount,
                            "spent": spent,
                            "usage_percentage": round((spent/budget_amount) * 100, 2),
                            "message": f"⚠️ You're close to exceeding your {cat_name} budget"
                        })

        # Generate summary
        suggestions["summary"] = {
            "total_income": total_income,
            "total_expense": total_expense,
            "savings_rate": round(((total_income - total_expense) / total_income) * 100, 2) if total_income > 0 else 0
        }

        # Generate savings suggestions
        if total_income > 0:
            savings_rate = ((total_income - total_expense) / total_income) * 100
            if savings_rate < 20:
                suggestions["savings_suggestions"].append({
                    "type": "warning",
                    "message": "Your savings rate is below recommended 20%. Consider reducing non-essential expenses."
                })
            elif savings_rate > 30:
                suggestions["savings_suggestions"].append({
                    "type": "positive",
                    "message": "Great job! You're maintaining a healthy savings rate."
                })

        # Add general financial advice
        if len(suggestions["budget_alerts"]) > 2:
            suggestions["general_advice"].append({
                "type": "warning",
                "message": "Multiple budget overages detected. Consider reviewing your spending habits or adjusting budgets."
            })

        if total_expense > total_income:
            suggestions["general_advice"].append({
                "type": "critical",
                "message": "⚠️ Your expenses exceed your income. This is unsustainable long-term."
            })

        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "suggestions": suggestions
            }
        )

    except Exception as e:
        print(f"Error in GetFinancialSuggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")