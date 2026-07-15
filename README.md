# Smart Expense Tracker

Веб-приложение для учёта личных финансов с аналитикой и визуализацией данных.

![Python](https://img.shields.io/badge/Python-3.11+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)

## Описание

Smart Expense Tracker - полнофункциональное веб-приложение для управления личными финансами. Позволяет отслеживать расходы, анализировать траты по категориям и визуализировать финансовую статистику.

### Основные возможности

- **Регистрация и авторизация** с JWT токенами
- **Управление расходами** - добавление, просмотр, удаление
- **Аналитика и статистика** - общие траты, средний чек, транзакции
- **Визуализация данных** - графики расходов по категориям (Chart.js)
- **8 предустановленных категорий** с иконками
- **Адаптивный дизайн** - работает на всех устройствах
- ⚡ **Быстрый и современный UI**

## Технологии

### Backend
- **FastAPI** 0.115.0 - современный веб-фреймворк
- **SQLAlchemy** 2.0.35 - ORM для работы с БД
- **SQLite** - легковесная база данных
- **Pydantic** 2.10.0 - валидация данных
- **JWT** - аутентификация через токены
- **Python 3.11+**

### Frontend
- **HTML5** - разметка
- **CSS3** - стили (Flexbox, Grid)
- **Vanilla JavaScript** - логика приложения
- **Chart.js** 4.4.0 - графики и визуализация
- **Fetch API** - HTTP запросы

## Установка и запуск

### Требования
- Python 3.11 или выше
- pip (менеджер пакетов Python)

### 1. Клонируйте репозиторий

bash
git clone https://github.com/slimGT-ui/smart-expense-tracker.git
cd smart-expense-tracker
📄
text


### 2. Настройка Backend

bash
cd backend
python -m venv venv
source venv/bin/activate # Для Windows: venv\Scripts\activate
pip install -r requirements.txt
📄
text


Создайте файл `.env` в папке `backend`:

env
DATABASE_URL=sqlite:///./expense_tracker.db
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
📄
text


### 3. Запустите Backend

bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
📄
text


Backend будет доступен:
- API: http://localhost:8000
- Документация: http://localhost:8000/docs

### 4. Запустите Frontend (в новом терминале)

bash
cd frontend
python -m http.server 8080
📄
text


Frontend будет доступен: http://localhost:8080

## 🚀 Использование

1. Откройте http://localhost:8080 в браузере
2. Зарегистрируйтесь (создайте аккаунт)
3. Войдите в систему
4. Добавляйте расходы через форму
5. Просматривайте статистику и графики
6. Управляйте своими финансами!

## Структура проекта


smart-expense-tracker/
├── backend/
│ ├── app/
│ │ ├── main.py # Главный файл FastAPI
│ │ ├── models.py # Модели базы данных
│ │ ├── schemas.py # Pydantic схемы
│ │ ├── security.py # JWT и хеширование
│ │ ├── config.py # Конфигурация
│ │ └── database.py # Настройки БД
│ └── requirements.txt # Python зависимости
│
├── frontend/
│ ├── index.html # Главная страница
│ ├── css/
│ │ └── style.css # Стили
│ └── js/
│ ├── config.js # Конфигурация API
│ ├── api.js # HTTP запросы
│ └── app.js # Основная логика
│
├── .gitignore
├── LICENSE
└── README.md
📄
text


## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/me` - Получить текущего пользователя

### Категории
- `GET /api/categories` - Список всех категорий

### Расходы
- `GET /api/expenses` - Список расходов (с фильтрами)
- `POST /api/expenses` - Создать новый расход
- `DELETE /api/expenses/{id}` - Удалить расход

### Аналитика
- `GET /api/analytics/summary` - Сводная статистика

**Полная документация API:** http://localhost:8000/docs

## Планы развития

- [ ] ML категоризация расходов по описанию
- [ ] Бюджеты и лимиты по категориям
- [ ] Экспорт данных в CSV/Excel
- [ ] Прогнозирование расходов
- [ ] Графики трендов за разные периоды
- [ ] Тёмная тема оформления
- [ ] Мобильное приложение
- [ ] Поддержка множественных валют

## Вклад в проект

Буду рад любым предложениям и улучшениям!

1. Fork репозитория
2. Создайте ветку (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add AmazingFeature'`)
4. Push в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## Лицензия

Этот проект распространяется под лицензией MIT. Подробности в файле [LICENSE](LICENSE).

## Автор

**slimGT-ui**

- GitHub: [@slimGT-ui](https://github.com/slimGT-ui)
- Репозиторий: [smart-expense-tracker](https://github.com/slimGT-ui/smart-expense-tracker)

## 🙏 Благодарности

- [FastAPI](https://fastapi.tiangolo.com/) - за отличный фреймворк
- [Chart.js](https://www.chartjs.org/) - за красивые графики
- [SQLAlchemy](https://www.sqlalchemy.org/) - за удобную работу с БД

---

⭐
