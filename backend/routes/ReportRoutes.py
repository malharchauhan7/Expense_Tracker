from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from controllers.ReportController import ExportDashboardToExcel,ExportTransactionsToExcel


router = APIRouter()

@router.get("/export/transactions/{user_id}")
async def export_transactions(user_id: str):
    try:
        return await ExportTransactionsToExcel(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/dashboard/{user_id}")
async def export_dashboard(user_id: str):
    try:
        return await ExportDashboardToExcel(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))