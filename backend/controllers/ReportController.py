from fastapi.responses import StreamingResponse
from config.db import transaction_collection
from bson import ObjectId
from fastapi import HTTPException
from controllers.ChartController import GetCategoryWiseTransactions,GetMonthlyTransactionAnalytics,GetFinancialSuggestions
import pandas as pd
from io import BytesIO
from datetime import datetime
import os
import json  
from fastapi.responses import StreamingResponse

async def ExportTransactionsToExcel(user_id: str):
    try:
        # Fetch transactions
        transactions = await transaction_collection.aggregate([
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
            {"$unwind": "$category"}
        ]).to_list(length=None)

        # Convert to DataFrame
        df = pd.DataFrame([{
            'Date': t['date'],
            'Category': t['category']['name'],
            'Type': t['transaction_type'],
            'Amount': t['amount'],
            'Description': t['description']
        } for t in transactions])

        # Create Excel file
        output = BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, sheet_name='Transactions', index=False)
            
            # Auto-adjust columns' width
            worksheet = writer.sheets['Transactions']
            for idx, col in enumerate(df.columns):
                series = df[col]
                max_len = max(
                    series.astype(str).map(len).max(),
                    len(str(series.name))
                ) + 1
                worksheet.set_column(idx, idx, max_len)

        output.seek(0)
        
        filename = f"transactions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        
        # Use StreamingResponse instead of FileResponse
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"'
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def ExportDashboardToExcel(user_id: str):
    try:
        monthly_response = await GetMonthlyTransactionAnalytics(user_id)
        monthly_data = monthly_response.body.decode()  
        monthly_data = json.loads(monthly_data)  

        category_response = await GetCategoryWiseTransactions(user_id)
        category_data = category_response.body.decode()
        category_data = json.loads(category_data)

        suggestions_response = await GetFinancialSuggestions(user_id)
        suggestions_data = suggestions_response.body.decode()
        suggestions_data = json.loads(suggestions_data)

        output = BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            workbook = writer.book

          
            monthly_df = pd.DataFrame({
                'Month': monthly_data['labels'],
                'Income': monthly_data['datasets'][0]['data'],
                'Expenses': monthly_data['datasets'][1]['data']
            })
            monthly_df.to_excel(writer, sheet_name='Monthly Analysis', index=False)

        
            monthly_sheet = writer.sheets['Monthly Analysis']
            monthly_chart = workbook.add_chart({'type': 'line'})

         
            for i, name in enumerate(['Income', 'Expenses']):
                monthly_chart.add_series({
                    'name': name,
                    'categories': ['Monthly Analysis', 1, 0, len(monthly_data['labels']), 0],
                    'values': ['Monthly Analysis', 1, i+1, len(monthly_data['labels']), i+1],
                    'line': {'width': 2.25},
                })

            monthly_chart.set_title({'name': 'Monthly Income vs Expenses'})
            monthly_chart.set_size({'width': 720, 'height': 400})
            monthly_sheet.insert_chart('E2', monthly_chart)

     
            income_df = pd.DataFrame({
                'Category': category_data['income']['labels'],
                'Amount': category_data['income']['datasets'][0]['data'],
                'Transactions': category_data['income']['datasets'][0]['transactionCounts']
            })
            income_df.to_excel(writer, sheet_name='Income Categories', index=False)

            income_sheet = writer.sheets['Income Categories']
            income_chart = workbook.add_chart({'type': 'pie'})
            income_chart.add_series({
                'name': 'Income Distribution',
                'categories': ['Income Categories', 1, 0, len(category_data['income']['labels']), 0],
                'values': ['Income Categories', 1, 1, len(category_data['income']['labels']), 1],
                'data_labels': {'percentage': True},
            })
            income_chart.set_title({'name': 'Income Distribution by Category'})
            income_chart.set_size({'width': 720, 'height': 400})
            income_sheet.insert_chart('E2', income_chart)

    
            expense_df = pd.DataFrame({
                'Category': category_data['expense']['labels'],
                'Amount': category_data['expense']['datasets'][0]['data'],
                'Transactions': category_data['expense']['datasets'][0]['transactionCounts']
            })
            expense_df.to_excel(writer, sheet_name='Expense Categories', index=False)

            expense_sheet = writer.sheets['Expense Categories']
            expense_chart = workbook.add_chart({'type': 'pie'})
            expense_chart.add_series({
                'name': 'Expense Distribution',
                'categories': ['Expense Categories', 1, 0, len(category_data['expense']['labels']), 0],
                'values': ['Expense Categories', 1, 1, len(category_data['expense']['labels']), 1],
                'data_labels': {'percentage': True},
            })
            expense_chart.set_title({'name': 'Expense Distribution by Category'})
            expense_chart.set_size({'width': 720, 'height': 400})
            expense_sheet.insert_chart('E2', expense_chart)

            counts_chart = workbook.add_chart({'type': 'column'})
            counts_chart.add_series({
                'name': 'Transaction Counts',
                'categories': ['Income Categories', 1, 0, len(category_data['income']['labels']), 0],
                'values': ['Income Categories', 1, 2, len(category_data['income']['labels']), 2],
            })
            counts_chart.set_title({'name': 'Transactions per Category'})
            counts_chart.set_size({'width': 720, 'height': 400})
            income_sheet.insert_chart('E25', counts_chart)

    
            for sheet_name in writer.sheets:
                worksheet = writer.sheets[sheet_name]
                df = None
                if sheet_name == 'Monthly Analysis':
                    df = monthly_df
                elif sheet_name == 'Income Categories':
                    df = income_df
                elif sheet_name == 'Expense Categories':
                    df = expense_df

                for idx, col in enumerate(df.columns):
                    series = df[col]
                    max_len = max(
                        series.astype(str).map(len).max(),
                        len(str(series.name))
                    ) + 1
                    worksheet.set_column(idx, idx, max_len)

        output.seek(0)
        filename = f"financial_dashboard_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"'
            }
        )

    except Exception as e:
        print(f"Export Error: {str(e)}")  
        raise HTTPException(status_code=500, detail=str(e))