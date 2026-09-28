// ==========================================================================
// EXPENSEFLOW - Dashboard Controller (Vanilla JS)
// ==========================================================================

// Auto-detect base API URL (Works seamlessly with Express :5000 or Live Server :5500)
const API_BASE_URL =
  window.location.port === '5000'
    ? '/api/transactions'
    : 'http://localhost:5000/api/transactions';

// State Management
let transactions = [];
let spendingChart = null;
let currentEditingId = null;
let transactionToDeleteId = null;

// Category Metadata: Icons and Accent Colors
const CATEGORY_MAP = {
  Food: { icon: '🍔', bg: '#FFEAA7', color: '#D63031' },
  Transport: { icon: '🚕', bg: '#DFE6E9', color: '#0984E3' },
  Shopping: { icon: '🛍️', bg: '#E8DAEF', color: '#8E44AD' },
  Entertainment: { icon: '🎬', bg: '#FADBD8', color: '#E84393' },
  Bills: { icon: '💡', bg: '#FCF3CF', color: '#F39C12' },
  Education: { icon: '📚', bg: '#D1F2EB', color: '#16A085' },
  Healthcare: { icon: '🩺', bg: '#E8F8F5', color: '#27AE60' },
  Other: { icon: '💼', bg: '#EBEDEF', color: '#2C3E50' }
};

// ==========================================================================
// Lifecycle / DOM Loaded
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Set default date to today for quick add form
  const today = new Date().toISOString().split('T')[0];
  const quickDateInput = document.getElementById('quickDate');
  if (quickDateInput) quickDateInput.value = today;

  const modalDateInput = document.getElementById('modalDate');
  if (modalDateInput) modalDateInput.value = today;

  // Initial Data Fetch
  loadDashboardData();

  // Setup Event Listeners
  setupEventListeners();
});

// ==========================================================================
// Fetch & Compute Dashboard Data
// ==========================================================================
async function loadDashboardData() {
  try {
    const response = await fetch(API_BASE_URL);
    const result = await response.json();

    if (result.success) {
      transactions = result.data;
      updateSummaryCards(transactions);
      renderSpendingChart(transactions);
      renderRecentTransactions(transactions);
    } else {
      showToast(result.error || 'Failed to fetch transactions', 'error');
    }
  } catch (error) {
    console.error('API Error:', error);
    showToast('Cannot connect to server. Ensure backend is running.', 'error');
  }
}

// ==========================================================================
// Update Summary Cards
// ==========================================================================
function updateSummaryCards(data) {
  let totalIncome = 0;
  let totalExpense = 0;

  data.forEach((tx) => {
    if (tx.type === 'Income') {
      totalIncome += Number(tx.amount);
    } else if (tx.type === 'Expense') {
      totalExpense += Number(tx.amount);
    }
  });

  const totalBalance = totalIncome - totalExpense;

  // Format currency with Indian Rupee symbol
  document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);
  document.getElementById('totalIncome').textContent = `+${formatCurrency(totalIncome)}`;
  document.getElementById('totalExpenses').textContent = `-${formatCurrency(totalExpense)}`;
  document.getElementById('totalCount').textContent = data.length.toString();
}

// ==========================================================================
// Render Spending Overview Chart (Chart.js)
// ==========================================================================
function renderSpendingChart(data) {
  const chartCanvas = document.getElementById('spendingChart');
  const chartEmpty = document.getElementById('chartEmpty');
  if (!chartCanvas) return;

  // Aggregate expenses by category
  const expenseByCategory = {};
  let hasExpenses = false;

  data.forEach((tx) => {
    if (tx.type === 'Expense') {
      hasExpenses = true;
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + Number(tx.amount);
    }
  });

  if (!hasExpenses) {
    chartCanvas.style.display = 'none';
    if (chartEmpty) chartEmpty.style.display = 'block';
    if (spendingChart) {
      spendingChart.destroy();
      spendingChart = null;
    }
    return;
  }

  chartCanvas.style.display = 'block';
  if (chartEmpty) chartEmpty.style.display = 'none';

  const categories = Object.keys(expenseByCategory);
  const amounts = Object.values(expenseByCategory);

  const colors = [
    '#6C5CE7',
    '#E85D75',
    '#FFAE42',
    '#22A06B',
    '#00CEC9',
    '#E84393',
    '#FDCB6E',
    '#74B9FF'
  ];

  if (spendingChart) {
    spendingChart.destroy();
  }

  const ctx = chartCanvas.getContext('2d');
  spendingChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [
        {
          data: amounts,
          backgroundColor: colors.slice(0, categories.length),
          borderWidth: 3,
          borderColor: '#FFFFFF',
          hoverOffset: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            font: {
              family: "'Plus Jakarta Sans', sans-serif",
              size: 12,
              weight: '600'
            },
            color: '#252333',
            padding: 14
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              return ` ${label}: ₹${value.toLocaleString('en-IN')}`;
            }
          }
        }
      },
      cutout: '70%'
    }
  });
}

// ==========================================================================
// Render Recent Transactions (Latest 5)
// ==========================================================================
function renderRecentTransactions(data) {
  const container = document.getElementById('recentTransactionsTableBody');
  const emptyState = document.getElementById('recentEmptyState');
  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  // Take the 5 most recent
  const recentList = [...data]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  container.innerHTML = recentList
    .map((tx) => {
      const cat = CATEGORY_MAP[tx.category] || { icon: '💳', bg: '#ECEBFC', color: '#6C5CE7' };
      const isIncome = tx.type === 'Income';
      const formattedDate = formatDate(tx.date);
      const sign = isIncome ? '+' : '-';
      const amountClass = isIncome ? 'income' : 'expense';

      return `
        <tr>
          <td>
            <div class="tx-title-wrapper">
              <div class="tx-category-icon" style="background-color: ${cat.bg}; color: ${cat.color};">
                ${cat.icon}
              </div>
              <div class="tx-info">
                <span class="tx-title">${escapeHtml(tx.title)}</span>
                <span class="tx-desc">${tx.description ? escapeHtml(tx.description) : tx.category}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="badge badge-category">${tx.category}</span>
          </td>
          <td>
            <span class="text-secondary">${formattedDate}</span>
          </td>
          <td>
            <span class="amount-display ${amountClass}">${sign}${formatCurrency(tx.amount)}</span>
          </td>
          <td>
            <div class="tx-actions">
              <button class="btn-icon" title="Edit" onclick="openEditModal('${tx._id || tx.id}')">
                ✏️
              </button>
              <button class="btn-icon delete" title="Delete" onclick="openDeleteModal('${tx._id || tx.id}')">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

// ==========================================================================
// Quick Add Transaction Form Submit
// ==========================================================================
async function handleQuickAdd(e) {
  e.preventDefault();

  const title = document.getElementById('quickTitle').value.trim();
  const amount = parseFloat(document.getElementById('quickAmount').value);
  const type = document.getElementById('quickType').value;
  const category = document.getElementById('quickCategory').value;
  const date = document.getElementById('quickDate').value;
  const description = document.getElementById('quickDescription').value.trim();

  // Basic Validation
  if (!title || isNaN(amount) || amount <= 0 || !category || !date) {
    showToast('Please fill all required fields with valid values.', 'error');
    return;
  }

  const payload = { title, amount, type, category, date, description };

  try {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (result.success) {
      showToast('Transaction added successfully!', 'success');
      document.getElementById('quickAddForm').reset();
      document.getElementById('quickDate').value = new Date().toISOString().split('T')[0];
      setQuickType('Expense'); // Reset toggle
      loadDashboardData();
    } else {
      showToast(result.error || 'Failed to add transaction', 'error');
    }
  } catch (error) {
    showToast('Error connecting to backend server', 'error');
  }
}

// ==========================================================================
// Modal Operations (Add / Edit)
// ==========================================================================
function openAddModal() {
  currentEditingId = null;
  document.getElementById('modalTitle').textContent = 'Add Transaction';
  document.getElementById('modalSubmitBtn').textContent = 'Add Transaction';
  document.getElementById('transactionModalForm').reset();

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('modalDate').value = today;
  setModalType('Expense');

  document.getElementById('transactionModal').classList.add('show');
}

async function openEditModal(id) {
  currentEditingId = id;
  try {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    const result = await res.json();

    if (result.success && result.data) {
      const tx = result.data;
      document.getElementById('modalTitle').textContent = 'Edit Transaction';
      document.getElementById('modalSubmitBtn').textContent = 'Save Changes';

      document.getElementById('modalTxTitle').value = tx.title;
      document.getElementById('modalAmount').value = tx.amount;
      document.getElementById('modalCategory').value = tx.category;
      document.getElementById('modalDate').value = new Date(tx.date).toISOString().split('T')[0];
      document.getElementById('modalDescription').value = tx.description || '';

      setModalType(tx.type);
      document.getElementById('transactionModal').classList.add('show');
    } else {
      showToast('Transaction not found', 'error');
    }
  } catch (error) {
    showToast('Error fetching transaction details', 'error');
  }
}

function closeModal() {
  document.getElementById('transactionModal').classList.remove('show');
  currentEditingId = null;
}

async function handleModalSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('modalTxTitle').value.trim();
  const amount = parseFloat(document.getElementById('modalAmount').value);
  const type = document.getElementById('modalType').value;
  const category = document.getElementById('modalCategory').value;
  const date = document.getElementById('modalDate').value;
  const description = document.getElementById('modalDescription').value.trim();

  if (!title || isNaN(amount) || amount <= 0 || !category || !date) {
    showToast('Please fill all required fields with valid values.', 'error');
    return;
  }

  const payload = { title, amount, type, category, date, description };

  try {
    const isEdit = Boolean(currentEditingId);
    const url = isEdit ? `${API_BASE_URL}/${currentEditingId}` : API_BASE_URL;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (result.success) {
      showToast(
        isEdit ? 'Transaction updated successfully!' : 'Transaction added successfully!',
        'success'
      );
      closeModal();
      loadDashboardData();
    } else {
      showToast(result.error || 'Operation failed', 'error');
    }
  } catch (error) {
    showToast('Server communication error', 'error');
  }
}

// ==========================================================================
// Delete Confirmation Modal
// ==========================================================================
function openDeleteModal(id) {
  transactionToDeleteId = id;
  document.getElementById('deleteConfirmModal').classList.add('show');
}

function closeDeleteModal() {
  transactionToDeleteId = null;
  document.getElementById('deleteConfirmModal').classList.remove('show');
}

async function confirmDelete() {
  if (!transactionToDeleteId) return;

  try {
    const res = await fetch(`${API_BASE_URL}/${transactionToDeleteId}`, {
      method: 'DELETE'
    });
    const result = await res.json();

    if (result.success) {
      showToast('Transaction deleted successfully!', 'success');
      closeDeleteModal();
      loadDashboardData();
    } else {
      showToast(result.error || 'Failed to delete transaction', 'error');
    }
  } catch (error) {
    showToast('Failed to connect to backend to delete', 'error');
  }
}

// ==========================================================================
// Quick Type & Modal Type Toggles
// ==========================================================================
function setQuickType(type) {
  document.getElementById('quickType').value = type;
  const expBtn = document.getElementById('quickTypeExpenseBtn');
  const incBtn = document.getElementById('quickTypeIncomeBtn');

  if (type === 'Expense') {
    expBtn.classList.add('active', 'expense');
    incBtn.classList.remove('active', 'income');
  } else {
    incBtn.classList.add('active', 'income');
    expBtn.classList.remove('active', 'expense');
  }
}

function setModalType(type) {
  document.getElementById('modalType').value = type;
  const expBtn = document.getElementById('modalTypeExpenseBtn');
  const incBtn = document.getElementById('modalTypeIncomeBtn');

  if (type === 'Expense') {
    expBtn.classList.add('active', 'expense');
    incBtn.classList.remove('active', 'income');
  } else {
    incBtn.classList.add('active', 'income');
    expBtn.classList.remove('active', 'expense');
  }
}

// ==========================================================================
// Event Listeners Setup
// ==========================================================================
function setupEventListeners() {
  // Mobile Nav Toggle
  const mobileToggle = document.getElementById('mobileNavToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  // Quick Add Form
  const quickForm = document.getElementById('quickAddForm');
  if (quickForm) quickForm.addEventListener('submit', handleQuickAdd);

  // Modal Form
  const modalForm = document.getElementById('transactionModalForm');
  if (modalForm) modalForm.addEventListener('submit', handleModalSubmit);

  // Quick Type Toggles
  const quickExp = document.getElementById('quickTypeExpenseBtn');
  const quickInc = document.getElementById('quickTypeIncomeBtn');
  if (quickExp) quickExp.addEventListener('click', () => setQuickType('Expense'));
  if (quickInc) quickInc.addEventListener('click', () => setQuickType('Income'));

  // Modal Type Toggles
  const modalExp = document.getElementById('modalTypeExpenseBtn');
  const modalInc = document.getElementById('modalTypeIncomeBtn');
  if (modalExp) modalExp.addEventListener('click', () => setModalType('Expense'));
  if (modalInc) modalInc.addEventListener('click', () => setModalType('Income'));

  // Confirm Delete Button
  const confirmDelBtn = document.getElementById('confirmDeleteBtn');
  if (confirmDelBtn) confirmDelBtn.addEventListener('click', confirmDelete);
}

// ==========================================================================
// Helper Utilities
// ==========================================================================
function formatCurrency(num) {
  const val = Number(num) || 0;
  return '₹' + Math.abs(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 4000);
}
