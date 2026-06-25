import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit3, X, Coins } from 'lucide-react';

const Income = () => {
  const { showToast } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  // Form State
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/income');
      setIncomes(res.data.data);
    } catch (error) {
      console.error(error);
      showToast('Error loading income records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const openAddModal = () => {
    setEditingIncome(null);
    setAmount('');
    setSource('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (income) => {
    setEditingIncome(income);
    setAmount(income.amount.toString());
    setSource(income.source);
    setDate(new Date(income.date).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    if (!source.trim()) {
      showToast('Please enter a source name', 'error');
      return;
    }

    try {
      const payload = {
        amount: Number(amount),
        source,
        date
      };

      if (editingIncome) {
        const res = await api.put(`/income/${editingIncome._id}`, payload);
        if (res.data.success) {
          showToast('Income record updated successfully');
          fetchIncomes();
        }
      } else {
        const res = await api.post('/income', payload);
        if (res.data.success) {
          showToast('Income record added successfully');
          fetchIncomes();
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Error saving income record', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income record?')) return;
    try {
      const res = await api.delete(`/income/${id}`);
      if (res.data.success) {
        showToast('Income record deleted successfully');
        fetchIncomes();
      }
    } catch (error) {
      console.error(error);
      showToast('Error deleting income record', 'error');
    }
  };

  const totalInflow = incomes.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-finText">Income Management</h1>
          <p className="text-xs text-finMuted mt-1">Log, monitor, and audit your salary, payouts, and revenue inflows.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-finGreen hover:bg-finGreenHover text-black font-bold text-sm tracking-wider uppercase transition shadow-lg shadow-finGreen/10"
        >
          <Plus className="h-4 w-4" />
          <span>Add Income</span>
        </button>
      </div>

      {/* Overview Analytics Card */}
      <div className="glass-panel p-5 rounded-xl border border-finBorder/60 flex items-center gap-4 max-w-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[3px] h-full bg-finGreen" />
        <div className="p-3 rounded-lg bg-finGreen/5 border border-finGreen/15 text-finGreen">
          <Coins className="h-6 w-6" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-finMuted uppercase tracking-wider block">Total Inflow Aggregated</span>
          <span className="text-xl font-extrabold text-finText mt-1 block">INR {totalInflow.toLocaleString()}</span>
        </div>
      </div>

      {/* Table list */}
      <div className="glass-panel rounded-xl border border-finBorder/60 overflow-hidden">
        {loading && incomes.length === 0 ? (
          <div className="py-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-finBorder border-t-finGreen mx-auto mb-3"></div>
            <p className="text-xs text-finMuted">Retrieving payouts...</p>
          </div>
        ) : incomes.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Coins className="h-10 w-10 text-finBorder mb-3" />
            <p className="text-xs text-finMuted font-bold">No income records saved.</p>
            <p className="text-[10px] text-finMuted mt-1">Start by clicking "Add Income" to log your first transaction.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-finCard/50 border-b border-finBorder text-xs text-finMuted font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Source / Payer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-finBorder/40 text-xs text-finText">
                {incomes.map((inc) => (
                  <tr key={inc._id} className="hover:bg-finCard/40 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-finMuted">
                      {new Date(inc.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate font-semibold">
                      {inc.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-black text-finGreen">
                      + INR {inc.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => openEditModal(inc)}
                        className="p-1.5 rounded hover:bg-finBorder/60 text-finMuted hover:text-finGreen transition inline-flex items-center"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(inc._id)}
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
              {editingIncome ? 'Modify Income' : 'Log Earnings'}
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
                  Source / Payer
                </label>
                <input
                  type="text"
                  required
                  placeholder="Salary, Freelance, Dividends etc."
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2.5 bg-finBackground border border-finBorder rounded-lg text-sm text-finText focus:outline-none focus:border-finGreen focus:ring-1 focus:ring-finGreen"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-finMuted uppercase tracking-wider mb-1.5">
                  Deposit Date
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
                  {editingIncome ? 'Save Changes' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;
