from datetime import datetime, date
from typing import List
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class CategoryResponse(BaseModel):
    id: int
    name: str
    icon: str
    color: str
    
    class Config:
        from_attributes = True

class ExpenseCreate(BaseModel):
    amount: Decimal = Field(gt=0)
    description: str = Field(min_length=1, max_length=500)
    date: date
    category_id: int

class ExpenseResponse(BaseModel):
    id: str
    amount: Decimal
    description: str
    date: date
    category: CategoryResponse
    created_at: datetime
    
    class Config:
        from_attributes = True

class ExpenseListResponse(BaseModel):
    items: List[ExpenseResponse]
    total: int

class CategoryBreakdownItem(BaseModel):
    category_name: str
    total: Decimal
    count: int
    percentage: float
    color: str

class AnalyticsSummary(BaseModel):
    total_expenses: Decimal
    total_transactions: int
    average_transaction: Decimal
    categories: List[CategoryBreakdownItem]