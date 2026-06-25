import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  UploadCloud, 
  Trash2, 
  Edit3, 
  Calendar,
  Filter,
  X,
  FileSpreadsheet
} from 'lucide-react';

const CATEGORIES = [
  'Food',
  'Shopping',
  'Travel',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Investment',
  'Other'
];

const Expenses = () => {
  const { showToast } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // CSV Drag and Drop
  const [dragActive, setDragActive] = useState(false);
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const fileInputRef = useRef(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/expenses', { params });
      setExpenses(res.data.data);
    } catch (error) {
      console.error(error);
      showToast('Error loading expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchExpenses();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, startDate, endDate]);

  const openAddModal = () => {
    setEditingExpense(null);
    setAmount('');
    setCategory('Food');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDescription(expense.description || '');
    setDate(new Date(expense.date).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    try {
      const payload = {
        amount: Number(amount),
        category,
        description,
        date
      };

      if (editingExpense) {
        const res = await api.put(`/expenses/${editingExpense._id}`, payload);
        if (res.data.success) {
          showToast('Expense updated successfully');
          fetchExpenses();
        }
      } else {
        const res = await api.post('/expenses', payload);
        if (res.data.success) {
          showToast('Expense added successfully');
          fetchExpenses();
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Error saving expense', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const res = await api.delete(`/expenses/${id}`);
      if (res.data.success) {
        showToast('Expense deleted successfully');
        fetchExpenses();
      }
    } catch (error) {
      console.error(error);
      showToast('Error deleting expense', 'error');
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  // CSV Drag and Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadCSVFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadCSVFile(e.target.files[0]);
    }
  };

  const uploadCSVFile = async (file) => {
    if (!file.name.endsWith('.csv')) {
      showToast('Please upload a standard .csv spreadsheet file', 'error');
      return;
    }

    setUploadingCSV(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        showToast(res.data.message);
        fetchExpenses();
      }
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'CSV parse failed. Ensure columns are: Date,Description,Amount', 'error');
    } finally {
      setUploadingCSV(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-finText">Expense Management</h1>
          <p className="text-xs text-finMuted mt-1">Add, update, and manage your discretionary expenditure history.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-finGreen hover:bg-finGreenHover text-black font-bold text-sm tracking-wider uppercase transition shadow-lg shadow-finGreen/10"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* CSV Drag and Drop and Filter Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CSV Import */}
        <div 
          onDragEnter={handleDrag}
          className="lg:col-span-1 glass-panel p-5 rounded-xl border border-finBorder/60 flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          {uploadingCSV ? (
            <div className="py-6 flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-finBorder border-t-finGreen"></div>
              <p className="text-xs font-semibold text-finMuted">Categorizing expenses...</p>
            </div>
          ) : (
            <div 
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center cursor-pointer transition ${
                dragActive ? 'border-finGreen bg-finGreen/5' : 'border-finBorder hover:border-finGreen/50'
              }`}
            >
              <UploadCloud className="h-10 w-10 text-finGreen mb-3" />
              <h3 className="text-xs font-bold text-finText uppercase tracking-wider mb-1">Import Statement</h3>
              <p className="text-[10px] text-finMuted max-w-xs leading-relaxed">
                Drag and drop your bank CSV statement here, or click to browse.
              </p>
              <span className="text-[9px] text-finGreen font-bold bg-finGreen/10 border border-finGreen/25 rounded px-2 py-0.5 mt-2">
                Date, Description, Amount
              </span>
              <input 
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Filters Panel */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-finBorder/60 space-y-4">
          <div className="flex items-center gap-2 border-b border-finBorder pb-2">
            <Filter className="h-4 w-4 text-finGreen" />
            <span className="text-xs font-bold text-finText uppercase tracking-wider">Search & Filters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-finMuted" />
              <input
                type="text"
                placeholder="Search description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-finBackground border border-finBorder rounded-lg text-xs text-finText focus:outline-none focus:border-finGreen focus:ring-1 focus:ring-finGreen"
              />
            </div>

            {/* Category selection */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-finBackground border border-finBorder rounded-lg text-xs text-finText focus:outline-none focus:border-finGreen focus:ring-1 focus:ring-finGreen"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Clear filters Button */}
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 rounded-lg border border-finBorder hover:bg-finBorder/30 text-xs font-bold text-finMuted hover:text-finText transition"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-finMuted uppercase">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-finBackground border border-finBorder rounded-lg text-xs text-finText focus:outline-none focus:border-finGreen"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-finMuted uppercase">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-finBackground border border-finBorder rounded-lg text-xs text-finText focus:outline-none focus:border-finGreen"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Expenses Table list */}
      <div className="glass-panel rounded-xl border border-finBorder/60 overflow-hidden">
        {loading && expenses.length === 0 ? (
          <div className="py-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-finBorder border-t-finGreen mx-auto mb-3"></div>
            <p className="text-xs text-finMuted">Retrieving transactions...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <FileSpreadsheet className="h-10 w-10 text-finBorder mb-3" />
            <p className="text-xs text-finMuted font-bold">No expenses matched your filter query.</p>
            <p className="text-[10px] text-finMuted mt-1">Try resetting filters or log a new transaction.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-finCard/50 border-b border-finBorder text-xs text-finMuted font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-finBorder/40 text-xs text-finText">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-finCard/40 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-finMuted">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate font-semibold">
                      {exp.description || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full border border-finBorder text-[10px] font-medium bg-finCard">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-black text-red-400">
                      - INR {exp.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => openEditModal(exp)}
                        className="p-1.5 rounded hover:bg-finBorder/60 text-finMuted hover:text-finGreen transition inline-flex items-center"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp._id)}
                        className="p-1.5 rounded hover:bg-finBorder/60 text-finMuted hover:text-red-400 transition inline-flex items-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-finBorder text-finMuted hover:text-finText transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-finText mb-1 border-b border-finBorder pb-2">
              {editingExpense ? 'Modify Expense' : 'Log Expense'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-[10px] font-bold text-finMuted uppercase tracking-wider mb-1.5">
                  Amount (INR)
                </label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-finBackground border border-finBorder rounded-lg text-sm text-finText focus:outline-none focus:border-finGreen focus:ring-1 focus:ring-finGreen"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-finMuted uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-finBackground border border-finBorder rounded-lg text-sm text-finText focus:outline-none focus:border-finGreen focus:ring-1 focus:ring-finGreen"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-finMuted uppercase tracking-wider mb-1.5">
                  Description / Vendor
                </label>
                <input
                  type="text"
                  placeholder="Netflix, Swiggy, Uber, Rent etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 bg-finBackground border border-finBorder rounded-lg text-sm text-finText focus:outline-none focus:border-finGreen focus:ring-1 focus:ring-finGreen"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-finMuted uppercase tracking-wider mb-1.5">
                  Transaction Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-finBackground border border-finBorder rounded-lg text-sm text-finText focus:outline-none focus:border-finGreen"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-finBorder rounded-lg text-xs font-semibold text-finMuted hover:bg-finBorder/30 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-finGreen hover:bg-finGreenHover rounded-lg text-xs font-bold text-black uppercase tracking-wider transition"
                >
                  {editingExpense ? 'Save Changes' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
