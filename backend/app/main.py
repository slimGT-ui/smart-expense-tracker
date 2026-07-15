from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from typing import Optional, List
from decimal import Decimal

from app.database import engine, get_db, Base
from app.models import User, Category, Expense
from app.schemas import (
    UserCreate, UserLogin, Token, UserResponse,
    ExpenseCreate, ExpenseResponse, ExpenseListResponse,
    CategoryResponse, AnalyticsSummary, CategoryBreakdownItem
)
from app.security import get_password_hash, verify_password, create_access_token, verify_token

# Создание таблиц
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Expense Tracker API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    try:
        user_id = verify_token(credentials.credentials)
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="Пользователь не найден")
        return user
    except:
        raise HTTPException(status_code=401, detail="Невалидный токен")

@app.on_event("startup")
def init_categories():
    db = next(get_db())
    if db.query(Category).count() == 0:
        categories = [
            Category(name="Еда и продукты", icon="🍔", color="#4CAF50"),
            Category(name="Транспорт", icon="🚗", color="#2196F3"),
            Category(name="Жильё", icon="🏠", color="#FF9800"),
            Category(name="Развлечения", icon="🎮", color="#9C27B0"),
            Category(name="Одежда", icon="👕", color="#E91E63"),
            Category(name="Здоровье", icon="💊", color="#F44336"),
            Category(name="Образование", icon="📚", color="#00BCD4"),
            Category(name="Другое", icon="💰", color="#607D8B"),
        ]
        db.add_all(categories)
        db.commit()

# AUTH
@app.post("/api/auth/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
    
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username уже занят")
    
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/api/auth/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    
    access_token = create_access_token(user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# CATEGORIES
@app.get("/api/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Category).all()

# EXPENSES
@app.get("/api/expenses", response_model=ExpenseListResponse)
def get_expenses(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Expense).filter(Expense.user_id == current_user.id)
    
    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date <= end_date)
    if category_id:
        query = query.filter(Expense.category_id == category_id)
    
    total = query.count()
    expenses = query.order_by(Expense.date.desc()).offset(offset).limit(limit).all()
    
    return {"items": expenses, "total": total}

@app.post("/api/expenses", response_model=ExpenseResponse, status_code=201)
def create_expense(
    expense_data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = Expense(
        user_id=current_user.id,
        amount=expense_data.amount,
        description=expense_data.description,
        date=expense_data.date,
        category_id=expense_data.category_id
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@app.delete("/api/expenses/{expense_id}", status_code=204)
def delete_expense(
    expense_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Расход не найден")
    
    db.delete(expense)
    db.commit()
    return None

# ANALYTICS
@app.get("/api/analytics/summary", response_model=AnalyticsSummary)
def get_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not start_date:
        start_date = date.today().replace(day=1)
    if not end_date:
        end_date = date.today()
    
    total = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        Expense.date >= start_date,
        Expense.date <= end_date
    ).scalar() or Decimal(0)
    
    count = db.query(func.count(Expense.id)).filter(
        Expense.user_id == current_user.id,
        Expense.date >= start_date,
        Expense.date <= end_date
    ).scalar() or 0
    
    avg = total / count if count > 0 else Decimal(0)
    
    category_data = db.query(
        Category.name,
        Category.color,
        func.sum(Expense.amount).label('total'),
        func.count(Expense.id).label('count')
    ).join(Expense).filter(
        Expense.user_id == current_user.id,
        Expense.date >= start_date,
        Expense.date <= end_date
    ).group_by(Category.id).all()
    
    categories = [
        CategoryBreakdownItem(
            category_name=cat.name,
            total=cat.total,
            count=cat.count,
            percentage=float(cat.total / total * 100) if total > 0 else 0,
            color=cat.color
        )
        for cat in category_data
    ]
    
    return AnalyticsSummary(
        total_expenses=total,
        total_transactions=count,
        average_transaction=avg,
        categories=categories
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
