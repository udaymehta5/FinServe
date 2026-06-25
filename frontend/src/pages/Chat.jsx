import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ProgressRing from '../components/ProgressRing';
import { MessageSquare, Send, Sparkles, AlertCircle, RefreshCw, ShoppingCart, HelpCircle } from 'lucide-react';

const SUGGESTIONS = [
  "Where did I spend most?",
  "Can I afford a ₹80,000 laptop?",
  "How much can I save by December?",
  "Give me a monthly report."
];

const Chat = () => {
  const { showToast } = useAuth();
  
  // Chat state
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your FinServe AI CFO. Ask me anything about your current budget, expenditures, or how to reach your saving goals. (Note: I can analyze your financial records, but I do not offer direct stock or investment tips!)" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Affordability Checker state
  const [itemName, setItemName] = useState('');
  const [itemCost, setItemCost] = useState('');
  const [checkingAffordability, setCheckingAffordability] = useState(false);
  const [affordabilityResult, setAffordabilityResult] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  // Send message to backend
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    // Add user message to state
    const updatedMessages = [...messages, { role: 'user', content: text }];
    setMessages(updatedMessages);
    setInputValue('');
    setChatLoading(true);

    try {
      const res = await api.post('/chat', { messages: updatedMessages.slice(1) }); // exclude welcome msg
      if (res.data.success) {
        setMessages([...updatedMessages, { role: 'assistant', content: res.data.reply }]);
      }
    } catch (error) {
      console.error(error);
      showToast('CFO Chat unavailable. Check Groq API Key configuration.', 'error');
    } finally {
      setChatLoading(false);
    }
  };

  // Affordability check submit
  const handleCheckAffordability = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || !itemCost || isNaN(Number(itemCost)) || Number(itemCost) <= 0) {
      showToast('Please enter a valid item name and purchase cost', 'error');
      return;
    }

    setCheckingAffordability(true);
    try {
      const res = await api.post('/chat/affordability', { 
        itemName, 
        itemCost: Number(itemCost) 
      });
      if (res.data.success) {
        setAffordabilityResult(res.data.data);
        showToast('Affordability analysis updated');
      }
    } catch (error) {
      console.error(error);
      showToast('Error calculating affordability metrics', 'error');
    } finally {
      setCheckingAffordability(false);
    }
  };

  // Get color for recommendation badge
  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'text-finGreen bg-finGreen/10 border-finGreen/30';
    if (score >= 60) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    if (score >= 40) return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    return 'text-red-500 bg-red-500/10 border-red-500/30';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      
      {/* LEFT COLUMN: CFO ChatBot */}
      <div className="lg:col-span-2 glass-panel rounded-xl border border-finBorder/60 flex flex-col justify-between overflow-hidden h-full">
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-finBorder flex items-center justify-between bg-finCard/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-finGreen" />
            <div>
              <span className="text-sm font-bold text-finText block">FinServe AI CFO</span>
              <span className="text-[10px] text-finMuted">Powered by Llama 3.3 70B</span>
            </div>
          </div>
          <button 
            onClick={() => setMessages([{ role: 'assistant', content: "Hello! I'm your FinServe AI CFO. Ask me anything about your current budget, expenditures, or how to reach your saving goals." }])}
            className="p-1.5 rounded hover:bg-finBorder text-finMuted hover:text-finText transition text-[10px] font-bold flex items-center gap-1 uppercase"
          >
            <RefreshCw className="h-3 w-3" /> Reset
          </button>
        </div>

        {/* Messages list Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={idx} 
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                    isUser 
                      ? 'bg-finGreen text-black font-semibold shadow-lg shadow-finGreen/10' 
                      : 'glass-panel text-finText border border-finBorder/60'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            );
          })}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="glass-panel text-finText border border-finBorder/60 rounded-xl px-4 py-3 text-xs flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-finGreen animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-finGreen animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-finGreen animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips & Message Input */}
        <div className="p-4 border-t border-finBorder bg-finCard/20 space-y-3">
          {/* Suggestion Chips */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="px-3 py-1.5 rounded-full border border-finBorder hover:border-finGreen/50 text-[10px] text-finMuted hover:text-finGreen bg-finCard hover:bg-finGreen/5 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask about spending breakdown, savings forecasts, or budget options..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-4 py-3 bg-finBackground border border-finBorder rounded-lg text-xs text-finText focus:outline-none focus:border-finGreen focus:ring-1 focus:ring-finGreen"
            />
            <button
              type="submit"
              disabled={chatLoading || !inputValue.trim()}
              className="px-4 py-3 rounded-lg bg-finGreen hover:bg-finGreenHover text-black disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center shadow-lg shadow-finGreen/10"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Affordability Checker */}
      <div className="glass-panel rounded-xl border border-finBorder/60 p-5 flex flex-col justify-between h-full overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-finBorder pb-2">
            <ShoppingCart className="h-5 w-5 text-finGreen" />
            <span className="text-sm font-bold text-finText uppercase tracking-wider">Affordability Checker</span>
          </div>

          <p className="text-[10px] text-finMuted leading-relaxed">
            Planning a major purchase? Input the specifications below to evaluate your financial capacity and recovery time.
          </p>

          <form onSubmit={handleCheckAffordability} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-finMuted uppercase tracking-wider mb-1">
                Item Name
              </label>
              <input
                type="text"
                placeholder="e.g. MacBook Pro M3"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3 py-2 bg-finBackground border border-finBorder rounded-lg text-xs text-finText focus:outline-none focus:border-finGreen"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-finMuted uppercase tracking-wider mb-1">
                Item Cost (INR)
              </label>
              <input
                type="number"
                placeholder="e.g. 150000"
                value={itemCost}
                onChange={(e) => setItemCost(e.target.value)}
                className="w-full px-3 py-2 bg-finBackground border border-finBorder rounded-lg text-xs text-finText focus:outline-none focus:border-finGreen"
              />
            </div>
            <button
              type="submit"
              disabled={checkingAffordability}
              className="w-full py-2.5 rounded-lg bg-finGreen hover:bg-finGreenHover text-black font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
            >
              {checkingAffordability ? 'Analyzing...' : 'Evaluate Capability'}
            </button>
          </form>
        </div>

        {/* Results Screen */}
        <div className="mt-6 flex-1 flex flex-col justify-center border-t border-finBorder/40 pt-4">
          {affordabilityResult ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-center my-2">
                <ProgressRing progress={affordabilityResult.affordabilityScore} radius={65} stroke={8} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-finCard/50 border border-finBorder rounded-lg p-2.5">
                  <span className="text-[9px] font-bold text-finMuted uppercase block">Recovery Months</span>
                  <span className="text-sm font-black text-finText mt-1 block">
                    {affordabilityResult.recoveryMonths}
                  </span>
                </div>
                <div className={`border rounded-lg p-2.5 flex flex-col justify-center items-center ${getScoreBadgeColor(affordabilityResult.affordabilityScore)}`}>
                  <span className="text-[9px] font-bold uppercase">Verdict</span>
                  <span className="text-[10px] font-bold mt-1 text-center">
                    {affordabilityResult.affordabilityScore >= 80 ? 'Safe' : affordabilityResult.affordabilityScore >= 60 ? 'Moderate' : affordabilityResult.affordabilityScore >= 40 ? 'Risk Warning' : 'Critical'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold text-finMuted uppercase block">Impact Assessment</span>
                <p className="text-finText leading-relaxed bg-finBackground/40 p-2.5 rounded border border-finBorder/30">
                  {affordabilityResult.impactAnalysis}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-finMuted uppercase block">CFO Advice</span>
                <p className="text-[11px] font-medium text-finGreen leading-relaxed">
                  {affordabilityResult.recommendation}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-finMuted py-8">
              <HelpCircle className="h-8 w-8 text-finBorder mb-2" />
              <p className="text-xs font-bold">No Analysis Generated</p>
              <p className="text-[9px] mt-0.5 max-w-[180px]">Submit an item name and cost above to evaluate your financial capacity.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Chat;
