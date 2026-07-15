// Глобальные переменные
let currentUser = null;
let categories = [];
let categoryChart = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Проверка авторизации
async function checkAuth() {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        showPage('auth');
        return;
    }
    
    try {
        currentUser = await api.auth.me();
        showPage('dashboard');
        initDashboard();
    } catch (error) {
        showPage('auth');
    }
}

// Показать нужную страницу
function showPage(page) {
    const authPage = document.getElementById('authPage');
    const dashboardPage = document.getElementById('dashboardPage');
    
    if (page === 'auth') {
        authPage.style.display = 'flex';
        dashboardPage.style.display = 'none';
    } else {
        authPage.style.display = 'none';
        dashboardPage.style.display = 'block';
    }
}

// Переключение табов авторизации
function showAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
        tabs[0].classList.add('active');
        document.getElementById('loginError').textContent = '';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
        tabs[1].classList.add('active');
        document.getElementById('registerError').textContent = '';
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Форма входа
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Форма регистрации
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Форма добавления расхода
    document.getElementById('addExpenseForm').addEventListener('submit', handleAddExpense);
}

// Обработка входа
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await api.auth.login({ email, password });
        localStorage.setItem('access_token', response.access_token);
        currentUser = response.user;
        showPage('dashboard');
        initDashboard();
        errorDiv.textContent = '';
    } catch (error) {
        errorDiv.textContent = error.message || 'Ошибка входа';
    }
}

// Обработка регистрации
async function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const errorDiv = document.getElementById('registerError');
    
    try {
        await api.auth.register({ email, username, password });
        showAuthTab('login');
        document.getElementById('loginEmail').value = email;
        alert('Регистрация успешна! Теперь войдите в систему.');
    } catch (error) {
        errorDiv.textContent = error.message || 'Ошибка регистрации';
    }
}

// Выход
function logout() {
    localStorage.removeItem('access_token');
    currentUser = null;
    showPage('auth');
}

// Инициализация дашборда
async function initDashboard() {
    document.getElementById('userName').textContent = currentUser.username;
    
    // Установить сегодняшнюю дату по умолчанию
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expenseDate').value = today;
    
    // Загрузить данные
    await loadCategories();
    await loadSummary();
    await loadExpenses();
}

// Загрузка категорий
async function loadCategories() {
    try {
        categories = await api.categories.list();
        
        // Заполнить select в форме
        const select = document.getElementById('expenseCategory');
        select.innerHTML = '<option value="">Выберите категорию</option>';
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = `${cat.icon} ${cat.name}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
    }
}

// Загрузка сводки
async function loadSummary() {
    try {
        const summary = await api.analytics.summary();
        
        document.getElementById('totalExpenses').textContent = 
            `${parseFloat(summary.total_expenses).toLocaleString('ru-RU')} ₽`;
        
        document.getElementById('totalTransactions').textContent = 
            summary.total_transactions;
        
        document.getElementById('avgTransaction').textContent = 
            `${parseFloat(summary.average_transaction).toLocaleString('ru-RU')} ₽`;
        
        // Обновить график и топ категории
        updateChart(summary.categories);
        updateTopCategories(summary.categories);
    } catch (error) {
        console.error('Ошибка загрузки сводки:', error);
    }
}

// Обновление графика
function updateChart(categoriesData) {
    const canvas = document.getElementById('categoryChart');
    const ctx = canvas.getContext('2d');
    
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    if (categoriesData.length === 0) {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#757575';
        ctx.textAlign = 'center';
        ctx.fillText('Нет данных для отображения', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoriesData.map(c => c.category_name),
            datasets: [{
                data: categoriesData.map(c => parseFloat(c.total)),
                backgroundColor: categoriesData.map(c => c.color),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = parseFloat(context.parsed).toLocaleString('ru-RU');
                            return `${label}: ${value} ₽`;
                        }
                    }
                }
            }
        }
    });
}

// Обновление топ категорий
function updateTopCategories(categoriesData) {
    const container = document.getElementById('topCategories');
    
    if (categoriesData.length === 0) {
        container.innerHTML = '<p class="no-data">Нет данных для отображения</p>';
        return;
    }
    
    // Сортировка по сумме
    const sorted = [...categoriesData].sort((a, b) => parseFloat(b.total) - parseFloat(a.total));
    
    container.innerHTML = sorted.slice(0, 5).map(cat => {
        const category = categories.find(c => c.name === cat.category_name);
        return `
            <div class="category-item">
                <div class="category-info">
                    <div class="category-icon" style="background-color: ${cat.color}">
                        ${category ? category.icon : '💰'}
                    </div>
                    <div>
                        <div class="category-name">${cat.category_name}</div>
                        <div style="color: #757575; font-size: 14px;">${cat.count} транзакций</div>
                    </div>
                </div>
                <div class="category-amount">${parseFloat(cat.total).toLocaleString('ru-RU')} ₽</div>
            </div>
        `;
    }).join('');
}

// Загрузка расходов
async function loadExpenses() {
    try {
        const response = await api.expenses.list({ limit: 20 });
        const container = document.getElementById('expensesList');
        
        if (response.items.length === 0) {
            container.innerHTML = '<p class="no-data">Расходов пока нет. Добавьте первый!</p>';
            return;
        }
        
        container.innerHTML = response.items.map(expense => {
            const date = new Date(expense.date).toLocaleDateString('ru-RU');
            return `
                <div class="expense-item">
                    <div class="expense-date">${date}</div>
                    <div class="expense-description">${expense.description}</div>
                    <div class="expense-category">
                        <span class="expense-category-icon">${expense.category.icon}</span>
                        <span>${expense.category.name}</span>
                    </div>
                    <div class="expense-amount">${parseFloat(expense.amount).toLocaleString('ru-RU')} ₽</div>
                    <div class="expense-actions">
                        <button class="btn-delete" onclick="deleteExpense('${expense.id}')">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Ошибка загрузки расходов:', error);
    }
}

// Добавление расхода
async function handleAddExpense(e) {
    e.preventDefault();
    
    const amount = document.getElementById('expenseAmount').value;
    const date = document.getElementById('expenseDate').value;
    const category_id = parseInt(document.getElementById('expenseCategory').value);
    const description = document.getElementById('expenseDescription').value;
    
    try {
        await api.expenses.create({ amount, date, category_id, description });
        
        // Очистить форму
        e.target.reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expenseDate').value = today;
        
        // Обновить данные
        await loadSummary();
        await loadExpenses();
        
        alert('Расход успешно добавлен!');
    } catch (error) {
        alert('Ошибка при добавлении расхода: ' + error.message);
    }
}

// Удаление расхода
async function deleteExpense(id) {
    if (!confirm('Вы уверены, что хотите удалить этот расход?')) {
        return;
    }
    
    try {
        await api.expenses.delete(id);
        await loadSummary();
        await loadExpenses();
    } catch (error) {
        alert('Ошибка при удалении расхода: ' + error.message);
    }
}
