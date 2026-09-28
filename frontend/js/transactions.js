// ==========================================================================
// EXPENSEFLOW - Transactions View Controller (Vanilla JS)
// ==========================================================================

const API_BASE_URL =
  window.location.port === '5000'
    ? '/api/transactions'
    : 'http://localhost:5000/api/transactions';

// State
let allTransactions = [];
let filteredTransactions = [];
let currentEditingId = null;
let transactionToDeleteId = null;

// Category Metadata
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

document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  const modalDate = document.getElementById('modalDate');
  if (modalDate) modalDate.value = today;

  setupEventListeners();
  loadAllTransactions();
});

// ==========================================================================
// Fetch All Transactions
// ==========================================================================
async function loadAllTransactions() {
  try {
    const res = await fetch(API_BASE_URL);
    const result = await res.json();

    if (result.success) {
      allTransactions = result.data;
      applyFilters();
    } else {
      showToast(result.error || 'Failed to load transactions', 'error');
    }
  } catch (error) {
    console.error('API Error:', error);
    showToast('Cannot connect to server. Ensure backend is running.', 'error');
  }
}

// ==========================================================================
// Filter, Search, and Sort
// ==========================================================================
function applyFilters() {
  const search = document.getElementById('searchInput').value.trim().toLowerCase();
  const typeFilter = document.getElementById('typeFilter').value;
  const categoryFilter = document.getElementById('categoryFilter').value;
  const monthFilter = document.getElementById('monthFilter').value; // Format: YYYY-MM
  const sortBy = document.getElementById('sortFilter').value;

  filteredTransactions = allTransactions.filter((tx) => {
    // Search match
    const titleMatch = tx.title.toLowerCase().includes(search);
    const catMatch = tx.category.toLowerCase().includes(search);
    const descMatch = tx.description ? tx.description.toLowerCase().includes(search) : false;
    const matchesSearch = !search || titleMatch || catMatch || descMatch;

    // Type match
    const matchesType = typeFilter === 'All' || tx.type === typeFilter;

    // Category match
    const matchesCategory = categoryFilter === 'All' || tx.category === categoryFilter;

    // Month match
    let matchesMonth = true;
    if (monthFilter) {
      const txMonth = new Date(tx.date).toISOString().slice(0, 7);
      matchesMonth = txMonth === monthFilter;
    }

    return matchesSearch && matchesType && matchesCategory && matchesMonth;
  });

  // Sort
  filteredTransactions.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'oldest') {
      return new Date(a.date) - new Date(b.date);
    } else if (sortBy === 'amount-high') {
      return b.amount - a.amount;
    } else if (sortBy === 'amount-low') {
      return a.amount - b.amount;
    }
    return 0;
  });

  renderTable(filteredTransactions);
  updateFilterMeta(filteredTransactions);
}

function updateFilterMeta(data) {
  const metaCount = document.getElementById('filteredCount');
  const metaIncome = document.getElementById('filteredIncome');
  const metaExpense = document.getElementById('filteredExpense');

  let inc = 0;
  let exp = 0;

  data.forEach((tx) => {
    if (tx.type === 'Income') inc += Number(tx.amount);
    if (tx.type === 'Expense') exp += Number(tx.amount);
  });

  if (metaCount) metaCount.textContent = `${data.length} transaction${data.length === 1 ? '' : 's'}`;
  if (metaIncome) metaIncome.textContent = `+${formatCurrency(inc)}`;
  if (metaExpense) metaExpense.textContent = `-${formatCurrency(exp)}`;
}

// ==========================================================================
// Render Transactions Table
// ==========================================================================
function renderTable(data) {
  const tbody = document.getElementById('transactionsTableBody');
  const emptyState = document.getElementById('tableEmptyState');
  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = data
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
                <span class="tx-desc">${tx.description ? escapeHtml(tx.description) : 'No description'}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="badge badge-category">${tx.category}</span>
          </td>
          <td>
            <span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}">${tx.type}</span>
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
// Reset All Filters
// ==========================================================================
function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('typeFilter').value = 'All';
  document.getElementById('categoryFilter').value = 'All';
  document.getElementById('monthFilter').value = '';
  document.getElementById('sortFilter').value = 'newest';
  applyFilters();
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
      loadAllTransactions();
    } else {
      showToast(result.error || 'Operation failed', 'error');
    }
  } catch (error) {
    showToast('Server communication error', 'error');
  }
}

// ==========================================================================
// Delete Modal
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
      loadAllTransactions();
    } else {
      showToast(result.error || 'Failed to delete transaction', 'error');
    }
  } catch (error) {
    showToast('Failed to connect to backend to delete', 'error');
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
// Event Listeners
// ==========================================================================
function setupEventListeners() {
  const mobileToggle = document.getElementById('mobileNavToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  // Filter Listeners
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('typeFilter').addEventListener('change', applyFilters);
  document.getElementById('categoryFilter').addEventListener('change', applyFilters);
  document.getElementById('monthFilter').addEventListener('change', applyFilters);
  document.getElementById('sortFilter').addEventListener('change', applyFilters);
  document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);

  // Modal Form
  const modalForm = document.getElementById('transactionModalForm');
  if (modalForm) modalForm.addEventListener('submit', handleModalSubmit);

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
// Helpers
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
