import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  AlertTriangle, 
  Activity, 
  Calculator, 
  ChevronRight,
  ShieldCheck,
  Percent
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const Analytics = () => {
  const { user, showToast } = useAuth();
  
  // Predictive Budgeting states
  const [predictLoading, setPredictLoading] = useState(true);
  const [predictData, setPredictData] = useState(null);

  // Savings Forecast states
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastResult, setForecastResult] = useState(null);
  
  // Report download loading
  const [downloadingReport, setDownloadingReport] = useState(false);

  // Fetch predictions on load
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setPredictLoading(true);
        const res = await api.get('/predict-budget');
        setPredictData(res.data.data);
      } catch (err) {
        console.error(err);
        showToast('Error loading financial predictions', 'error');
      } finally {
        setPredictLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  const handleForecastSubmit = async (e) => {
    e.preventDefault();
    if (!targetAmount || !targetDate) {
      showToast('Please fill in both target amount and date', 'error');
      return;
    }

    setForecastLoading(true);
    try {
      const res = await api.post('/forecast', {
        targetAmount: Number(targetAmount),
        targetDate,
        currentSaved: predictData ? Math.max(0, predictData.monthlyIncomeVal - predictData.predictedSpending) : 0
      });
      if (res.data.success) {
        setForecastResult(res.data.data);
        showToast('Forecast calculated successfully');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error generating savings forecast', 'error');
    } finally {
      setForecastLoading(false);
    }
  };

  const downloadPDFReport = async () => {
    setDownloadingReport(true);
    try {
      const res = await api.get('/report', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FinServe_CFO_Report_${user.name.replace(/\s+/g, '_')}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      showToast('PDF CFO report downloaded successfully');
    } catch (err) {
      console.error(err);
      showToast('Failed to download report document', 'error');
    } finally {
      setDownloadingReport(false);
    }
  };

  const getRiskColor = (level) => {
    if (level === 'Low') return 'text-finGreen bg-finGreen/10 border-finGreen/25';
    if (level === 'Medium') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25';
    return 'text-red-500 bg-red-500/10 border-red-500/25';
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-finText">Financial Analytics & AI CFO Forecasts</h1>
          <p className="text-xs text-finMuted mt-1">Harness linear regression models and statistical projections to map future wealth stability.</p>
        </div>
        <button
          onClick={downloadPDFReport}
          disabled={downloadingReport}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-finGreen hover:bg-finGreenHover text-black font-bold text-sm tracking-wider uppercase transition shadow-lg shadow-finGreen/10 disabled:opacity-50"
        >
          {downloadingReport ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>Download CFO Report</span>
        </button>
      </div>

      {/* Grid of Predictive Budgeting & Forecast inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT/MID: Predictive Budgeting results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-5 rounded-xl border border-finBorder/60 space-y-4">
            <div className="flex items-center gap-2 border-b border-finBorder pb-2">
              <Activity className="h-5 w-5 text-finGreen animate-pulse" />
              <span className="text-xs font-bold text-finText uppercase tracking-wider">Predictive Budget Model (Next Month)</span>
            </div>

            {predictLoading ? (
              <div className="py-12 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-finBorder border-t-finGreen mx-auto mb-3"></div>
                <p className="text-xs text-finMuted">Running regression predictions...</p>
              </div>
            ) : predictData ? (
              <div className="space-y-6">
                
                {/* Predictions results summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-finCard/50 border border-finBorder rounded-lg p-4 relative overflow-hidden">
                    <span className="text-[10px] font-bold text-finMuted uppercase block">Projected Spending</span>
                    <span className="text-xl font-extrabold text-finText mt-1 block">
                      INR {predictData.predictedSpending.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-finCard/50 border border-finBorder rounded-lg p-4 relative overflow-hidden">
                    <span className="text-[10px] font-bold text-finMuted uppercase block">Expected Savings</span>
                    <span className="text-xl font-extrabold text-finText mt-1 block">
                      INR {predictData.expectedSavings.toLocaleString()}
                    </span>
                  </div>
                  <div className={`border rounded-lg p-4 flex flex-col justify-between ${getRiskColor(predictData.riskLevel)}`}>
                    <span className="text-[10px] font-bold uppercase block">Risk Threat Assessment</span>
                    <div className="flex items-center gap-2 mt-1">
                      {predictData.riskLevel === 'Low' ? (
                        <ShieldCheck className="h-5 w-5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5" />
                      )}
                      <span className="text-sm font-black uppercase tracking-wider">{predictData.riskLevel} Risk</span>
                    </div>
                  </div>
                </div>

                {/* Sub-Methods stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-finBorder rounded-lg p-4 bg-finBackground/40">
                    <span className="text-[10px] font-bold text-finGreen uppercase tracking-wider block">Linear Regression Projection</span>
                    <p className="text-[10.5px] text-finMuted mt-1 leading-relaxed">
                      Models spending velocity changes chronologically ($y = mx + c$) to project future expenditures.
                    </p>
                    <span className="text-md font-bold text-finText mt-2 block">
                      INR {predictData.regressionProjection.toLocaleString()}
                    </span>
                  </div>
                  <div className="border border-finBorder rounded-lg p-4 bg-finBackground/40">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Moving Average (3-Month velocity)</span>
                    <p className="text-[10.5px] text-finMuted mt-1 leading-relaxed">
                      Smooths out short-term spikes by averaging the past 3 months of transaction totals.
                    </p>
                    <span className="text-md font-bold text-finText mt-2 block">
                      INR {predictData.movingAverageProjection.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-finMuted leading-relaxed flex items-start gap-2 bg-finCard/30 p-3 rounded border border-finBorder/30">
                  <AlertTriangle className="h-4 w-4 text-finGreen shrink-0 mt-0.5" />
                  <p>
                    Predictions are computed using pure server-side mathematics based on your logged history ({predictData.monthsAnalysed} months analyzed). Adding more historical transaction rows improves mathematical stability and forecasting precision.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-finMuted">No data available for predictions.</div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Savings Forecast configuration inputs */}
        <div className="lg:col-span-1 glass-panel p-5 rounded-xl border border-finBorder/60 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-finBorder pb-2">
              <Calculator className="h-5 w-5 text-finGreen" />
              <span className="text-xs font-bold text-finText uppercase tracking-wider">Savings Forecast Calculator</span>
            </div>

            <p className="text-[10px] text-finMuted leading-relaxed">
              Calculate the target saving velocity required to achieve future major goals.
            </p>

            <form onSubmit={handleForecastSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-finMuted uppercase tracking-wider mb-1">
                  Target Amount (INR)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 500000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-finBackground border border-finBorder rounded-lg text-xs text-finText focus:outline-none focus:border-finGreen"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-finMuted uppercase tracking-wider mb-1">
                  Target Deadline Date
                </label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-finBackground border border-finBorder rounded-lg text-xs text-finText focus:outline-none focus:border-finGreen"
                />
              </div>

              <button
                type="submit"
                disabled={forecastLoading}
                className="w-full py-2.5 rounded-lg bg-finGreen hover:bg-finGreenHover text-black font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
              >
                {forecastLoading ? 'Calculating...' : 'Run Forecast'}
              </button>
            </form>
          </div>

          {/* Probability outcome results if calculated */}
          <div className="mt-6 flex-1 flex flex-col justify-center border-t border-finBorder/40 pt-4">
            {forecastResult ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-finCard/50 border border-finBorder p-3 rounded-lg">
                  <div>
                    <span className="text-[9px] font-bold text-finMuted uppercase block">Monthly Saving Goal</span>
                    <span className="text-sm font-black text-finGreen mt-0.5 block">
                      INR {forecastResult.monthlyRequired.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-finMuted uppercase block">Time Remaining</span>
                    <span className="text-xs font-semibold text-finText mt-0.5 block">
                      {forecastResult.monthsRemaining} month(s)
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold text-finMuted uppercase">Goal Probability Rate</span>
                    <span className={`font-bold ${
                      forecastResult.probability >= 80 ? 'text-finGreen' : forecastResult.probability >= 50 ? 'text-yellow-400' : 'text-red-500'
                    }`}>
                      {forecastResult.probability}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-finBorder rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        forecastResult.probability >= 80 ? 'bg-finGreen' : forecastResult.probability >= 50 ? 'bg-yellow-400' : 'bg-red-500'
                      }`}
                      style={{ width: `${forecastResult.probability}%` }}
                    />
                  </div>
                </div>

                <p className="text-[10.5px] text-finMuted leading-relaxed bg-finBackground/40 p-2.5 rounded border border-finBorder/30">
                  Your historical net savings capability is approximately <strong>INR {forecastResult.avgMonthlySavings.toLocaleString()}/month</strong>. 
                  {forecastResult.probability >= 80 
                    ? " Your current trends strongly support hitting this goal successfully." 
                    : " Consider decreasing discretionary spending to raise your savings buffer and probability of achievement."
                  }
                </p>
              </div>
            ) : (
              <div className="text-center text-finMuted py-8">
                <p className="text-xs font-bold">No Goal Forecast Loaded</p>
                <p className="text-[9px] mt-0.5 max-w-[180px] mx-auto">Fill in the targets above to compute monthly goals and timeline probability thresholds.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Forecast Graph Panel */}
      {forecastResult && forecastResult.forecastGraph.length > 0 && (
        <div className="glass-panel p-5 rounded-xl border border-finBorder/60 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-finGreen" />
            <span className="text-sm font-bold text-finText block">Goal Asset Accumulation Trajectory</span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastResult.forecastGraph} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00FF88" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B1B1B" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0F0F0F', borderColor: '#1B1B1B', color: '#FFFFFF' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" name="Projected Grow Path" dataKey="projectedSavings" stroke="#00FF88" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProj)" />
                <Area type="monotone" name="Linear Target Path" dataKey="targetRequired" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorTar)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
};

export default Analytics;
