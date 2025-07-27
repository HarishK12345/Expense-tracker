// Simple Expense Tracker - INR Version
// All amounts are handled in Indian Rupees (₹)

// Initialize application data
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};

// Predefined categories
const defaultCategories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Utilities', 'Healthcare', 'Groceries', 'Education', 'Travel',
    'Rent', 'Salary', 'Investment', 'Other'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    populateCategoryDropdowns();
    setTodayDate();
    updateDashboard();
    renderTransactions();
    renderBudgets();
    setupEventListeners();
});

// Format number as Indian Rupee currency
function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
}

// Populate category dropdowns
function populateCategoryDropdowns() {
    const categorySelects = [
        document.getElementById('category'),
        document.getElementById('budget-category'),
        document.getElementById('filter-category')
    ];

    categorySelects.forEach(select => {
        if (select) {
            const defaultOption = select.id === 'filter-category' ? 'All Categories' : 'Select Category';
            select.innerHTML = `<option value="">${defaultOption}</option>`;

            defaultCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            });
        }
    });
}

// Set today's date as default
function setTodayDate() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Transaction form
    const transactionForm = document.getElementById('transaction-form');
    if (transactionForm) {
        transactionForm.addEventListener('submit', addTransaction);
    }

    // Budget form
    const budgetForm = document.getElementById('budget-form');
    if (budgetForm) {
        budgetForm.addEventListener('submit', setBudget);
    }
}

// Tab switching functionality
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName('tab-content');
    const tablinks = document.getElementsByClassName('tab-button');

    // Hide all tab content
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove('active');
    }

    // Remove active class from all tab buttons
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove('active');
    }

    // Show selected tab and mark button as active
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');

    // Load analytics when analytics tab is opened
    if (tabName === 'analytics-tab') {
        loadAnalytics();
    }
}

// Add new transaction
function addTransaction(e) {
    e.preventDefault();

    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    if (!description || !amount || !type || !category || !date) {
        alert('Please fill in all fields');
        return;
    }

    if (amount <= 0) {
        alert('Amount must be greater than 0');
        return;
    }

    const transaction = {
        id: Date.now(),
        description,
        amount,
        type,
        category,
        date,
        timestamp: new Date().toISOString()
    };

    transactions.push(transaction);
    saveData();
    updateDashboard();
    renderTransactions();

    // Reset form
    document.getElementById('transaction-form').reset();
    setTodayDate();

    alert('Transaction added successfully!');
}

// Delete transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveData();
        updateDashboard();
        renderTransactions();
        renderBudgets();
    }
}

// Edit transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    document.getElementById('description').value = transaction.description;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('type').value = transaction.type;
    document.getElementById('category').value = transaction.category;
    document.getElementById('date').value = transaction.date;

    // Remove the old transaction
    deleteTransaction(id);

    // Scroll to form
    document.getElementById('transaction-form').scrollIntoView({ behavior: 'smooth' });
}

// Update dashboard totals
function updateDashboard() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpenses;

    const incomeElement = document.getElementById('total-income');
    const expensesElement = document.getElementById('total-expenses');
    const balanceElement = document.getElementById('net-balance');

    if (incomeElement) incomeElement.textContent = formatINR(totalIncome);
    if (expensesElement) expensesElement.textContent = formatINR(totalExpenses);
    if (balanceElement) balanceElement.textContent = formatINR(netBalance);
}

// Render transactions list
function renderTransactions() {
    const list = document.getElementById('transactions-list');
    if (!list) return;

    if (transactions.length === 0) {
        list.innerHTML = '<p>No transactions yet. Add your first transaction above.</p>';
        return;
    }

    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    list.innerHTML = sortedTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-details">
                    ${transaction.category} • ${formatDate(transaction.date)}
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${formatINR(transaction.amount)}
            </div>
            <div class="transaction-actions">
                <button class="btn-small btn-edit" onclick="editTransaction(${transaction.id})">Edit</button>
                <button class="btn-small btn-delete" onclick="deleteTransaction(${transaction.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Apply filters to transactions
function applyFilters() {
    const typeFilter = document.getElementById('filter-type').value;
    const categoryFilter = document.getElementById('filter-category').value;
    const searchText = document.getElementById('search-description').value.toLowerCase();

    let filteredTransactions = transactions;

    if (typeFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
    }

    if (categoryFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
    }

    if (searchText) {
        filteredTransactions = filteredTransactions.filter(t => 
            t.description.toLowerCase().includes(searchText)
        );
    }

    renderFilteredTransactions(filteredTransactions);
}

// Render filtered transactions
function renderFilteredTransactions(filteredTransactions) {
    const list = document.getElementById('transactions-list');
    if (!list) return;

    if (filteredTransactions.length === 0) {
        list.innerHTML = '<p>No transactions match your filters.</p>';
        return;
    }

    const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    list.innerHTML = sortedTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-details">
                    ${transaction.category} • ${formatDate(transaction.date)}
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${formatINR(transaction.amount)}
            </div>
            <div class="transaction-actions">
                <button class="btn-small btn-edit" onclick="editTransaction(${transaction.id})">Edit</button>
                <button class="btn-small btn-delete" onclick="deleteTransaction(${transaction.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Set budget for category
function setBudget(e) {
    e.preventDefault();

    const category = document.getElementById('budget-category').value;
    const amount = parseFloat(document.getElementById('budget-amount').value);

    if (!category || !amount) {
        alert('Please fill in all fields');
        return;
    }

    if (amount <= 0) {
        alert('Budget amount must be greater than 0');
        return;
    }

    budgets[category] = amount;
    saveData();
    renderBudgets();

    // Reset form
    document.getElementById('budget-form').reset();

    alert('Budget set successfully!');
}

// Render budgets list
function renderBudgets() {
    const list = document.getElementById('budgets-list');
    if (!list) return;

    const budgetCategories = Object.keys(budgets);

    if (budgetCategories.length === 0) {
        list.innerHTML = '<p>No budgets set yet. Set your first budget above.</p>';
        return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    list.innerHTML = budgetCategories.map(category => {
        const budgetAmount = budgets[category];
        const spent = transactions
            .filter(t => t.type === 'expense' && 
                        t.category === category && 
                        t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);

        const percentage = (spent / budgetAmount) * 100;
        const remaining = budgetAmount - spent;

        let progressClass = 'safe';
        if (percentage >= 100) progressClass = 'danger';
        else if (percentage >= 80) progressClass = 'warning';

        return `
            <div class="budget-item">
                <div class="transaction-info">
                    <div class="transaction-description">${category}</div>
                    <div class="budget-progress">
                        <div class="budget-progress-bar ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <div class="transaction-details">
                        Spent: ${formatINR(spent)} of ${formatINR(budgetAmount)} 
                        (${percentage.toFixed(1)}%)
                    </div>
                </div>
                <div class="transaction-amount ${remaining >= 0 ? 'income' : 'expense'}">
                    Remaining: ${formatINR(remaining)}
                </div>
                <div class="transaction-actions">
                    <button class="btn-small btn-delete" onclick="deleteBudget('${category}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Delete budget
function deleteBudget(category) {
    if (confirm(`Are you sure you want to delete the budget for ${category}?`)) {
        delete budgets[category];
        saveData();
        renderBudgets();
    }
}

// Load analytics
function loadAnalytics() {
    generateSummaryStats();
    // Note: Chart functionality would require Chart.js library
    // For now, we'll show a message about charts
    showChartPlaceholders();
}

// Generate summary statistics
function generateSummaryStats() {
    const statsContainer = document.getElementById('summary-stats');
    if (!statsContainer) return;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));

    const monthlyIncome = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const avgTransaction = transactions.length > 0 
        ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length 
        : 0;

    const topCategory = getTopSpendingCategory();

    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${formatINR(monthlyIncome)}</div>
            <div class="stat-label">This Month Income</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${formatINR(monthlyExpenses)}</div>
            <div class="stat-label">This Month Expenses</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${formatINR(avgTransaction)}</div>
            <div class="stat-label">Average Transaction</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${topCategory}</div>
            <div class="stat-label">Top Spending Category</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${transactions.length}</div>
            <div class="stat-label">Total Transactions</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${Object.keys(budgets).length}</div>
            <div class="stat-label">Active Budgets</div>
        </div>
    `;
}

// Get top spending category
function getTopSpendingCategory() {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return 'No expenses yet';

    const categoryTotals = {};
    expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
        categoryTotals[a] > categoryTotals[b] ? a : b
    );

    return topCategory || 'No expenses yet';
}

// Show chart placeholders
function showChartPlaceholders() {
    const expenseChart = document.getElementById('expenseChart');
    const trendsChart = document.getElementById('trendsChart');

    if (expenseChart) {
        const ctx = expenseChart.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, expenseChart.width, expenseChart.height);
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Expense Breakdown Chart', expenseChart.width/2, expenseChart.height/2 - 10);
        ctx.fillText('(Chart.js integration needed)', expenseChart.width/2, expenseChart.height/2 + 10);
    }

    if (trendsChart) {
        const ctx = trendsChart.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, trendsChart.width, trendsChart.height);
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Monthly Trends Chart', trendsChart.width/2, trendsChart.height/2 - 10);
        ctx.fillText('(Chart.js integration needed)', trendsChart.width/2, trendsChart.height/2 + 10);
    }
}

// Export transactions to CSV
function exportToCSV() {
    if (transactions.length === 0) {
        alert('No transactions to export');
        return;
    }

    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount (₹)'];
    const csvContent = [
        headers.join(','),
        ...transactions.map(t => [
            t.date,
            `"${t.description}"`,
            t.category,
            t.type,
            t.amount
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, 'expense-tracker-data.csv');
    } else {
        link.href = URL.createObjectURL(blob);
        link.download = 'expense-tracker-data.csv';
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('budgets', JSON.stringify(budgets));
}

// Utility function to clear all data (for testing/reset)
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
        localStorage.removeItem('transactions');
        localStorage.removeItem('budgets');
        transactions = [];
        budgets = {};
        updateDashboard();
        renderTransactions();
        renderBudgets();
        alert('All data cleared successfully!');
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N to focus on add transaction
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        const descInput = document.getElementById('description');
        if (descInput) descInput.focus();
    }

    // Ctrl/Cmd + E to export CSV
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportToCSV();
    }
});