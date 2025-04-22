from fastapi import APIRouter, HTTPException
import json
from pydantic import BaseModel
from typing import Optional, List, Tuple
from datetime import datetime, timedelta
import re
import dateparser
from controllers.CategoryController import CreateCategory, GetALLCategoriesByUserId
from controllers.TransactionController import CreateTransaction,GetAnalyticsByUserId
from controllers.BudgetController import CreateBudget
from models.CategoryModel import Category
from models.TransactionsModel import Transaction
from models.BudgetModel import Budget
from bson import ObjectId, Decimal128
from decimal import Decimal
import logging
from dateutil.relativedelta import relativedelta
import calendar

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    userId: str

def extract_id_from_response(response_obj):
    """Helper function to extract ID from various response formats."""
    try:
        # Handle JSONResponse object
        if hasattr(response_obj, 'body'):
            try:
                content = response_obj.body.decode()
                import json
                data_json = json.loads(content)
                return data_json.get('_id')
            except Exception as json_error:
                logger.error(f"Error parsing JSONResponse: {str(json_error)}")
                return None
        # Handle dictionary
        elif isinstance(response_obj, dict):
            return response_obj.get('_id')
        # Handle object with id attribute
        elif hasattr(response_obj, 'id'):
            return response_obj.id
        # Unknown format
        else:
            logger.error(f"Unknown response format: {type(response_obj)}")
            return None
    except Exception as e:
        logger.error(f"Error extracting ID from response: {str(e)}")
        return None

def extract_amount(message: str) -> Optional[float]:
    # Match patterns like $200, 200$, 200 dollars, etc.
    amount_pattern = r'\$?\s*(\d+(?:\.\d{1,2})?)\s*(?:dollars?|\$)?'
    match = re.search(amount_pattern, message, re.IGNORECASE)
    if match:
        return float(match.group(1))
    return None

def extract_category(message: str) -> Optional[str]:
    # Look for words after "in", "for", "on"
    category_pattern = r'(?:in|for|on)\s+([a-zA-Z]+)'
    match = re.search(category_pattern, message, re.IGNORECASE)
    if match:
        return match.group(1).capitalize()
    return None

def extract_transaction_type(message: str) -> str:
    """Determine if the transaction is an income or expense based on the message."""
    income_keywords = ['earned', 'received', 'income', 'salary', 'payment', 'got', 'deposit']
    
    for keyword in income_keywords:
        if keyword in message.lower():
            return "Income"
    
    return "Expense"  # Default to expense

def extract_date(message: str) -> datetime:
    """Extract a specific date from the message if mentioned, otherwise return today's date."""
    logger.info(f"Extracting date from: '{message}'")
    
    # Try to find date patterns like "on March 15" or "on 15th" or "yesterday"
    date_pattern = r'(?:on|at|for)\s+((?:\d{1,2}(?:st|nd|rd|th)?\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)|yesterday|today|tomorrow|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|[a-z]+day))'
    match = re.search(date_pattern, message, re.IGNORECASE)
    
    if match:
        date_str = match.group(1)
        logger.info(f"Preposition date pattern found: '{date_str}'")
        parsed_date = dateparser.parse(date_str)
        if parsed_date:
            logger.info(f"Date extracted using preposition pattern: {parsed_date}")
            return parsed_date
    
    # Try to find date patterns without prepositions (e.g., "January 10", "Feb 15")
    standalone_date_pattern = r'((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?)'
    match = re.search(standalone_date_pattern, message, re.IGNORECASE)
    
    if match:
        date_str = match.group(1)
        logger.info(f"Standalone date pattern found: '{date_str}'")
        parsed_date = dateparser.parse(date_str)
        if parsed_date:
            logger.info(f"Date extracted using standalone pattern: {parsed_date}")
            return parsed_date
    
    # Try to find just month and year (e.g., "January 2023")
    month_year_pattern = r'((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4})'
    match = re.search(month_year_pattern, message, re.IGNORECASE)
    
    if match:
        date_str = match.group(1)
        logger.info(f"Month-year pattern found: '{date_str}'")
        parsed_date = dateparser.parse(date_str)
        if parsed_date:
            logger.info(f"Date extracted using month-year pattern: {parsed_date}")
            return parsed_date
    
    # Try to find dates in format MM/DD/YYYY or MM-DD-YYYY
    numeric_date_pattern = r'(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)'
    match = re.search(numeric_date_pattern, message)
    
    if match:
        date_str = match.group(1)
        logger.info(f"Numeric date pattern found: '{date_str}'")
        parsed_date = dateparser.parse(date_str)
        if parsed_date:
            logger.info(f"Date extracted using numeric pattern: {parsed_date}")
            return parsed_date
    
    # Try direct dateparser on chunks of the message that might contain dates
    # This is a fallback for uncommon formats
    words = message.split()
    for i in range(len(words)):
        for j in range(1, min(5, len(words) - i + 1)):  # Try chunks of 1-4 words
            chunk = " ".join(words[i:i+j])
            try:
                parsed_date = dateparser.parse(chunk, settings={'STRICT_PARSING': True})
                if parsed_date:
                    logger.info(f"Date extracted from chunk '{chunk}': {parsed_date}")
                    return parsed_date
            except:
                pass  # Ignore parsing errors
    
    # If no specific date found, return today's date
    logger.info("No date pattern found, using current date")
    return datetime.now()

def extract_budget_data(message: str):
    """Extract budget information from the message, including title, amount, and date range."""
    logger.info(f"Extracting budget data from: {message}")
    
    # Extract the budget amount
    amount = extract_amount(message)
    if not amount:
        return None
    
    # Default budget title
    title = "Monthly Budget"
    
    # Try to extract custom title if specified
    title_pattern = r'(?:budget|budgeting)\s+for\s+([a-zA-Z\s]+?)(?:\s+in|\s+from|\s+of|\s+for|\s+\$|\s*$)'
    title_match = re.search(title_pattern, message, re.IGNORECASE)
    if title_match:
        title = title_match.group(1).strip().title()
    
    # Initialize date variables
    start_date = None
    end_date = None
    
    # Check for month-based budget (e.g., "in April" or "for May 2023")
    month_pattern = r'(?:in|for)\s+((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?))(?:\s+(\d{4}))?'
    month_match = re.search(month_pattern, message, re.IGNORECASE)
    
    if month_match:
        month_name = month_match.group(1)
        year_str = month_match.group(2) if month_match.group(2) else str(datetime.now().year)
        
        # Parse month and year
        try:
            date_str = f"1 {month_name} {year_str}"
            parsed_date = dateparser.parse(date_str)
            if parsed_date:
                start_date = parsed_date.replace(day=1)
                # Last day of the month
                last_day = calendar.monthrange(start_date.year, start_date.month)[1]
                end_date = start_date.replace(day=last_day)
                
                # If not explicitly named, set the title to include the month
                if title == "Monthly Budget":
                    title = f"{parsed_date.strftime('%B %Y')} Budget"
        except Exception as e:
            logger.error(f"Error parsing month-based budget: {str(e)}")
    
    # Check for specific date range (e.g., "from April 1 to April 15")
    date_range_pattern = r'(?:from|between)\s+(.*?)\s+(?:to|through|until|and)\s+(.*?)(?:\s|$)'
    date_range_match = re.search(date_range_pattern, message, re.IGNORECASE)
    
    if date_range_match and not (start_date and end_date):
        start_str = date_range_match.group(1)
        end_str = date_range_match.group(2)
        
        parsed_start = dateparser.parse(start_str)
        parsed_end = dateparser.parse(end_str)
        
        if parsed_start and parsed_end:
            start_date = parsed_start
            end_date = parsed_end
            
            # If not explicitly named, set the title to include the date range
            if title == "Monthly Budget":
                title = f"Budget {start_date.strftime('%b %d')} to {end_date.strftime('%b %d, %Y')}"
    
    # If no specific dates found but it's a budget request, default to current month
    if not (start_date and end_date) and "budget" in message.lower():
        today = datetime.now()
        start_date = today.replace(day=1)
        last_day = calendar.monthrange(today.year, today.month)[1]
        end_date = today.replace(day=last_day)
        
        # Set title to current month if not specified
        if title == "Monthly Budget":
            title = f"{today.strftime('%B %Y')} Budget"
    
    # Check if we have all the required data
    if amount and start_date and end_date:
        budget_data = {
            "title": title,
            "amount": amount,
            "start_date": start_date,
            "end_date": end_date,
            "description": f"Created via chatbot: {message}"
        }
        logger.info(f"Extracted budget data: {budget_data}")
        return budget_data
    
    logger.info("Could not extract complete budget data")
    return None

async def find_existing_category(user_id: str, category_name: str, transaction_type: str):
    """Find an existing category by name, user_id, and transaction type."""
    try:
        # Get categories for the specific user instead of all categories
        user_categories = await GetALLCategoriesByUserId(user_id)
        
        logger.info(f"Checking for existing category '{category_name}' with type '{transaction_type}' for user '{user_id}'")
        logger.info(f"User has {len(user_categories)} categories")
        
        # Find category with matching name (case insensitive) and transaction type
        for category in user_categories:
            logger.debug(f"Checking category: {category}")
            if isinstance(category, dict):
                category_name_match = category.get('name', '').lower() == category_name.lower()
                category_type_match = category.get('category_type') == transaction_type
                if category_name_match and category_type_match:
                    logger.info(f"Found matching category: {category.get('name')} with id {category.get('_id')}")
                    return category
            elif hasattr(category, 'name') and hasattr(category, 'category_type'):
                category_name_match = category.name.lower() == category_name.lower()
                category_type_match = category.category_type == transaction_type
                if category_name_match and category_type_match:
                    logger.info(f"Found matching category: {category.name} with id {category.id}")
                    return category
        
        logger.info(f"No existing category found for '{category_name}' with type '{transaction_type}'")
        return None
    except Exception as e:
        logger.error(f"Error finding existing category: {str(e)}")
        return None

def is_budget_request(message: str) -> bool:
    """Determine if the message is a budget creation request."""
    budget_keywords = [
        'set budget', 'create budget', 'make budget', 'new budget', 
        'budget of', 'budget for', 'add budget'
    ]
    
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in budget_keywords)

async def get_user_balance(user_id: str) -> float:
    """Calculate user's total balance from all transactions."""
    try:
        
        analytics_response = await GetAnalyticsByUserId(user_id)
        analytics = json.loads(analytics_response.body.decode('utf-8'))
        
        total_balance = analytics['total_balance']
        
        return float(total_balance)
    except Exception as e:
        logger.error(f"Error calculating user balance: {str(e)}")
        return 0.0

@router.post("/process")
async def process_message(chat_message: ChatMessage):
    try:
        logger.info(f"Processing message: {chat_message.message}")
        logger.info(f"User ID: {chat_message.userId}")
        
        message = chat_message.message.lower()

        # Check if this is a budget creation request
        if is_budget_request(message):
            budget_data = extract_budget_data(message)
            
            if not budget_data:
                return {
                    "message": "I couldn't understand the budget details. Please try saying something like 'Set budget of $1000 for April' or 'Create budget of $500 from April 1 to April 15'.",
                    "budgetCreated": False
                }
            
            try:
                # Create budget object
                budget = Budget(
                    user_id=chat_message.userId,
                    title=budget_data["title"],
                    amount=budget_data["amount"],
                    description=budget_data["description"],
                    start_date=budget_data["start_date"],
                    end_date=budget_data["end_date"]
                )
                
                # Create the budget
                budget_result = await CreateBudget(budget)
                
                # Get budget ID - handle JSONResponse object
                budget_id = extract_id_from_response(budget_result)
                
                # Check if we successfully got a budget ID
                if not budget_id:
                    logger.error("Failed to extract budget ID from response")
                    return {
                        "message": "Budget was created but there was an issue retrieving its ID.",
                        "budgetCreated": True
                    }
                
                # Format dates for display
                start_formatted = budget_data["start_date"].strftime('%B %d, %Y')
                end_formatted = budget_data["end_date"].strftime('%B %d, %Y')
                
                return {
                    "message": f"Successfully created budget '{budget_data['title']}' of ${budget_data['amount']} from {start_formatted} to {end_formatted}.",
                    "budgetCreated": True,
                    "budgetDetails": {
                        "title": budget_data["title"],
                        "amount": budget_data["amount"],
                        "start_date": budget_data["start_date"].isoformat(),
                        "end_date": budget_data["end_date"].isoformat()
                    }
                }
            except Exception as inner_error:
                logger.error(f"Error creating budget: {str(inner_error)}")
                return {
                    "message": f"Error creating budget: {str(inner_error)}",
                    "budgetCreated": False
                }
        
        # Handle regular transaction request
        amount = extract_amount(message)
        category_name = extract_category(message)
        transaction_type = extract_transaction_type(message)
        transaction_date = extract_date(message)
        
        logger.info(f"Extracted amount: {amount}, category: {category_name}, type: {transaction_type}, date: {transaction_date}")

        if not amount or not category_name:
            return {
                "message": "I couldn't understand the amount or category. Please try saying something like 'I spent $200 on Travel' or 'I earned $500 in Salary'.",
                "transactionCreated": False
            }

        try:
            # Check if category already exists
            existing_category = await find_existing_category(chat_message.userId, category_name, transaction_type)
            
            if existing_category:
                logger.info(f"Found existing {transaction_type} category: {category_name}")
                # Get category ID based on response format
                category_id = extract_id_from_response(existing_category)
                
                if not category_id:
                    logger.error(f"Failed to extract ID from existing category {category_name}")
                    return {
                        "message": f"Found the {category_name} category but couldn't retrieve its ID. Please try again.",
                        "transactionCreated": False
                    }
                
                category_creation_status = "existing"
            else:
                # Create new category
                logger.info(f"Creating new {transaction_type} category: {category_name}")
                category_result = await CreateCategory(Category(
                    user_id=chat_message.userId,
                    name=category_name,
                    category_type=transaction_type,
                    created_at=datetime.now()
                ))
                
                # Handle the category result, which could be a JSONResponse, dict or an object
                category_id = extract_id_from_response(category_result)
                
                if not category_id:
                    logger.error(f"Failed to extract ID from newly created category {category_name}")
                    return {
                        "message": f"Created the {category_name} category but couldn't retrieve its ID. Please try again.",
                        "transactionCreated": False
                    }
                
                category_creation_status = "new"
            
            logger.info(f"Using category with ID: {category_id}")
            
            # Create transaction
            logger.info(f"Creating {transaction_type} transaction with amount: {amount}, date: {transaction_date}")
            transaction_result = await CreateTransaction(Transaction(
                user_id=chat_message.userId,
                category_id=category_id,
                transaction_type=transaction_type,
                amount=amount,
                description=f"Added via chatbot: {message}",
                date=transaction_date,
                created_at=datetime.now()
            ))
            
            # Handle JSONResponse object the same way as we do for budget
            transaction_id = extract_id_from_response(transaction_result)
            
            logger.info(f"Transaction created with ID: {transaction_id}")
            
            # Check if we successfully got a transaction ID
            if not transaction_id:
                logger.error("Failed to extract transaction ID from response")
                return {
                    "message": "Transaction was created but there was an issue retrieving its ID.",
                    "transactionCreated": True
                }
            
            # Format date for display
            formatted_date = transaction_date.strftime('%B %d, %Y')
            
            # Customize message based on transaction details
            action_verb = "received" if transaction_type == "Income" else "spent"
            
            success_message = f"Successfully {action_verb} ${amount} in {category_name} on {formatted_date}."
            if category_creation_status == "new":
                success_message += f" Created new '{category_name}' category."
            
            current_balance = await get_user_balance(chat_message.userId)
            success_message += f"\nYour current balance is: ${current_balance:.2f}"

            return {
                "message": success_message,
                "transactionCreated": True,
                "transactionDetails": {
                    "amount": amount,
                    "category": category_name,
                    "type": transaction_type,
                    "date": transaction_date.isoformat(),
                    "balance": current_balance
                }
            }
        except Exception as inner_error:
            logger.error(f"Error during database operations: {str(inner_error)}")
            # Return a more specific error message
            return {
                "message": f"Error: {str(inner_error)}",
                "transactionCreated": False
            }

    except Exception as e:
        logger.error(f"Unexpected error in process_message: {str(e)}")
        # Instead of raising an HTTP exception, return a user-friendly error response
        return {
            "message": f"Sorry, I encountered an error: {str(e)}",
            "transactionCreated": False,
            "error": str(e)
        }