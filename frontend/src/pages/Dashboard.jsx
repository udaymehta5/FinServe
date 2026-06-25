import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ScoreMeter from '../components/ScoreMeter';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Flame, 
  Activity,
  AlertCircle,
  TrendingUp as SavingsRateIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#00FF88', '#00D973', '#34D399', '#059669', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6'];

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [forecastData, setForecastData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashRes = await api.get('/user/dashboard');
        
        // Try fetching savings forecast for the default goal if available, or fall back to user target
        let forecastRes = null;
        try {
          forecastRes = await api.post('/forecast', {
            targetAmount: user.financialGoal || 100000,
            targetDate: new Date(new Date().getFullYear(), 11, 31).toISOString(), // December 31st of current year
            currentSaved: Math.max(0, dashRes.data.stats.currentSavings)
          });
        } catch (err) {
          console.warn('Could not load savings forecast:', err.message);
        }

        setDashboardData(dashRes.data);
        if (forecastRes) {
          setForecastData(forecastRes.data.data);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-finBorder border-t-finGreen"></div>
          <p className="text-sm text-finMuted">Assembling CFO Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center min-h-[80vh]">
        <div className="glass-panel p-6 rounded-xl flex flex-col items-center gap-3 border border-red-500/20 max-w-md text-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-sm font-semibold text-finText">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 mt-2 bg-finGreen hover:bg-finGreenHover text-black font-bold text-xs uppercase tracking-wider rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, charts } = dashboardData;

  const kpis = [
    {
      title: 'Total Income',
      value: `INR ${stats.totalIncome.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-finGreen bg-finGreen/5 border-finGreen/10',
    },
    {
      title: 'Total Expenses',
      value: `INR ${stats.totalExpense.toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-red-400 bg-red-400/5 border-red-400/10',
    },
    {
      title: 'Current Savings',
      value: `INR ${stats.currentSavings.toLocaleString()}`,
      icon: PiggyBank,
      color: stats.currentSavings >= 0 ? 'text-emerald-400 bg-emerald-400/5 border-emerald-400/10' : 'text-red-500 bg-red-500/5 border-red-500/10',
    },
    {
      title: 'Savings Rate',
      value: `${stats.savingsRate.toFixed(1)}%`,
      icon: SavingsRateIcon,
      color: 'text-cyan-400 bg-cyan-400/5 border-cyan-400/10',
    },
    {
      title: 'Current Month Burn',
      value: `INR ${stats.burnRate.toLocaleString()}`,
      icon: Flame,
      color: 'text-orange-400 bg-orange-400/5 border-orange-400/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-black text-finText">
          Welcome back, <span className="text-finGreen">{user.name}</span>
        </h1>
        <p className="text-xs text-finMuted mt-1">Here is your real-time financial health snapshot.</p>
      </div>

      {/* Grid of KPIs & Health Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI Cards columns */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div key={idx} className="glass-panel p-5 rounded-xl border flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-[3px] h-full bg-finGreen/30" />
                <div className="space-y-2">
                  <span className="text-xs font-bold text-finMuted uppercase tracking-wider block">{kpi.title}</span>
                  <span className="text-xl font-extrabold text-finText tracking-tight block">{kpi.value}</span>
                </div>
                <div className={`p-3 rounded-lg border ${kpi.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Financial Health Score Meter */}
        <div className="glass-panel p-6 rounded-xl border border-finBorder/60 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-finMuted uppercase tracking-wider block">Financial Health</span>
            <p className="text-[10px] text-finMuted">Calculated based on savings velocity, spending-to-income ratios, and active budget adherence.</p>
          </div>
          <div className="my-4">
            <ScoreMeter 
              score={stats.healthScore.score} 
              label={stats.healthScore.label} 
            />
          </div>
          <p className="text-xs text-finText bg-finBackground/40 p-2.5 rounded-lg border border-finBorder/30">
            {stats.healthScore.explanation}
          </p>
        </div>

      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Line Chart: Expense Trend */}
        <div className="glass-panel p-5 rounded-xl border border-finBorder/60 space-y-4">
          <span className="text-sm font-bold text-finText block">Expense Trend (Daily Velocity)</span>
          <div className="h-64">
            {charts.expenseTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-finMuted">
                No expense entries found. Log an expense to populate.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.expenseTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1B1B1B" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
                  <YAxis stroke="#9CA3AF" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F0F0F', borderColor: '#1B1B1B', color: '#FFFFFF' }}
                    labelStyle={{ color: '#00FF88' }}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#00FF88" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ strokeWidth: 1 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar Chart: Income vs Expense */}
        <div className="glass-panel p-5 rounded-xl border border-finBorder/60 space-y-4">
          <span className="text-sm font-bold text-finText block">Income vs Expense (Monthly Overview)</span>
          <div className="h-64">
            {charts.incomeVsExpense.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-finMuted">
                No monthly transactions mapped yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.incomeVsExpense} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1B1B1B" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} />
                  <YAxis stroke="#9CA3AF" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F0F0F', borderColor: '#1B1B1B', color: '#FFFFFF' }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="income" name="Income" fill="#00FF88" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart: Spending Categories */}
        <div className="glass-panel p-5 rounded-xl border border-finBorder/60 space-y-4">
          <span className="text-sm font-bold text-finText block">Spending Categories</span>
          <div className="h-64 flex flex-col sm:flex-row items-center justify-center">
            {charts.spendingCategories.length === 0 ? (
              <div className="text-xs text-finMuted">
                No expense categorization found.
              </div>
            ) : (
              <>
                <div className="w-full sm:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.spendingCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {charts.spendingCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0F0F0F', borderColor: '#1B1B1B', color: '#FFFFFF' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 flex flex-col gap-1.5 overflow-y-auto max-h-48 pl-2">
                  {charts.spendingCategories.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-finMuted">{item.name}</span>
                      </div>
                      <span className="font-bold text-finText">INR {item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Area Chart: Savings Forecast */}
        <div className="glass-panel p-5 rounded-xl border border-finBorder/60 space-y-4">
          <span className="text-sm font-bold text-finText block">Savings Forecast Projection</span>
          <div className="h-64">
            {!forecastData || forecastData.forecastGraph.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-finMuted text-center p-6">
                Unable to forecast savings. Please add income entries and configure a financial savings target in Settings.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData.forecastGraph} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00FF88" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1B1B1B" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} />
                  <YAxis stroke="#9CA3AF" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F0F0F', borderColor: '#1B1B1B', color: '#FFFFFF' }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" name="Your Project Growth" dataKey="projectedSavings" stroke="#00FF88" strokeWidth={2} fillOpacity={1} fill="url(#colorProjected)" />
                  <Area type="monotone" name="Target Trajectory" dataKey="targetRequired" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorTarget)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
