import { useState, useRef, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Send, Sparkles, AlertCircle, Bot, User } from 'lucide-react';

const AiAssistant = () => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { type: 'bot', text: "Hello! I am the Dhandare Lab AI. \nI can help with medical queries, test recommendations, normal ranges, or project details." }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // --- ULTIMATE KNOWLEDGE BASE ---
  const knowledgeBase = [
    // ==========================================
    // 1. SYMPTOM CHECKER (Intelligent Suggestions)
    // ==========================================
    {
      keywords: ["fever", "temperature", "chills", "hot"],
      answer: "🤒 **Fever Profile:**\nIf fever persists for >2 days, doctors usually suggest:\n- **CBC** (Check infection)\n- **Widal** (Typhoid)\n- **Malaria/Dengue** (If mosquito bite suspected).\n*Consult a doctor for exact advice.*"
    },
    {
      keywords: ["hair fall", "baldness", "losing hair"],
      answer: "💇‍♀️ **Hair Fall Issues:**\nCommon causes are Vitamin deficiencies or Thyroid issues.\n**Suggested Tests:**\n- Thyroid Profile (T3, T4, TSH)\n- Vitamin B12 & D3\n- Iron Studies (Ferritin)"
    },
    {
      keywords: ["tired", "weak", "fatigue", "low energy", "exhausted"],
      answer: "🔋 **Chronic Fatigue:**\nFeeling tired often? It could be Anemia or Vitamin deficiency.\n**Suggested Tests:**\n- CBC (Hemoglobin)\n- Vitamin B12 & D3\n- Thyroid Profile"
    },
    {
      keywords: ["weight gain", "obesity", "fat"],
      answer: "⚖️ **Unexplained Weight Gain:**\nOften linked to hormonal changes.\n**Suggested Tests:**\n- Thyroid Profile (TSH)\n- Lipid Profile\n- Blood Sugar (Fasting & PP)"
    },
    {
      keywords: ["joint pain", "knee pain", "arthritis"],
      answer: "🦴 **Joint Pain:**\nCould be due to Uric Acid or Calcium deficiency.\n**Suggested Tests:**\n- Uric Acid\n- Calcium & Vitamin D3\n- RA Factor (Arthritis)"
    },

    // ==========================================
    // 2. NORMAL HEALTH RANGES
    // ==========================================
    {
      keywords: ["bp", "blood pressure", "120"],
      answer: "💓 **Normal Blood Pressure:**\n- **Ideal:** 120/80 mmHg\n- **High:** Above 140/90 mmHg\n*Monitor regularly if you have hypertension.*"
    },
    {
      keywords: ["sugar", "glucose", "diabetes", "bsl"],
      answer: "🍬 **Normal Sugar:**\n- **Fasting:** 70-100 mg/dL\n- **Post-Meal:** <140 mg/dL\n- **HbA1c:** <5.7% is normal."
    },
    {
      keywords: ["hemoglobin", "hb", "anemia"],
      answer: "🩸 **Normal Hemoglobin:**\n- **Men:** 13.5-17.5 g/dL\n- **Women:** 12.0-15.5 g/dL\nLow Hb causes weakness and dizziness."
    },
    {
      keywords: ["platelet", "dengue count"],
      answer: "🦟 **Platelet Count:**\n- **Normal:** 1.5 - 4.5 Lakhs/µL.\n- In Dengue, watch for drops below 1 Lakh."
    },
    {
      keywords: ["oxygen", "spo2"],
      answer: "💨 **Oxygen (SpO2):**\n- **Normal:** 95% - 100%\n- **Alert:** Below 92% requires medical attention."
    },

    // ==========================================
    // 3. LAB PROCESS & SAFETY (For Parents/Safety)
    // ==========================================
    {
      keywords: ["safe", "hygiene", "sterile", "needle"],
      answer: "🛡️ **Safety First:**\nWe use **Vacuumtainers** (Single-use, sterile needles) that are opened in front of you. No risk of infection."
    },
    {
      keywords: ["child", "kid", "baby", "infant"],
      answer: "👶 **For Children:**\nOur technicians are trained to handle pediatric samples gently. We use extra-thin 'Butterfly Needles' for babies to minimize pain."
    },
    {
      keywords: ["time taken", "how long", "duration"],
      answer: "⏱️ **Duration:**\nBlood collection takes only 2-5 minutes. You can leave immediately after."
    },
    {
      keywords: ["privacy", "confidential"],
      answer: "🔒 **Privacy:**\nYour medical reports are strictly confidential. Only you and your doctor can access them via the secure portal."
    },
    
    // ==========================================
    // 5. STANDARD INFO (Logistics & Tests)
    // ==========================================
    {
      keywords: ["time", "open", "schedule"],
      answer: "🕒 **Timings:**\nMon-Sat: 7AM - 9PM\nSun: 8AM - 2PM"
    },
    {
      keywords: ["location", "address"],
      answer: "📍 **Address:** Shop 10, MG Road, Pune."
    },
    {
      keywords: ["price", "cost", "rates"],
      answer: "💰 **Rates:**\nCBC: ₹300 | Sugar: ₹100 | Thyroid: ₹500 | Lipid: ₹600"
    },
    {
      keywords: ["fasting", "food"],
      answer: "🩸 **Fasting:** Required for Sugar (F) and Lipid Profile (10-12 hrs)."
    }
  ];

  // --- LOGIC ENGINE ---
  const getBotResponse = (userQuery) => {
    const lowerQuery = userQuery.toLowerCase();

    // 1. EMERGENCY GUARDRAIL
    if (lowerQuery.includes("chest pain") || lowerQuery.includes("unconscious") || lowerQuery.includes("bleeding") || lowerQuery.includes("emergency")) {
      return "🚨 **EMERGENCY ALERT:**\nPlease rush to a Hospital Emergency Room. We cannot treat medical emergencies.";
    }

    // 2. SEARCH KNOWLEDGE BASE
    for (let item of knowledgeBase) {
      const match = item.keywords.some(keyword => lowerQuery.includes(keyword));
      if (match) {
        return item.answer;
      }
    }

    // 3. FALLBACK
    return "I am trained on Dhandare Lab's specific data. 🧠\nTry asking:\n- 'I have hair fall'\n- 'Is it safe for kids?'\n- 'Why use MERN stack?'\n- 'Normal Sugar level'";
  };

  const handleSend = async (queryOverride) => {
    const query = queryOverride || input;
    if (!query.trim()) return;

    const newHistory = [...chatHistory, { type: 'user', text: query }];
    setChatHistory(newHistory);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const botReply = getBotResponse(query);
      setChatHistory(prev => [...prev, { type: 'bot', text: botReply }]);
      setLoading(false);
    }, 700);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 flex flex-col h-[calc(100vh-80px)]">
        
        {/* Header */}
        <div className="flex items-center gap-3 bg-white p-4 rounded-t-2xl border-b shadow-sm">
          <div className="bg-blue-100 p-2 rounded-full">
            <Sparkles className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Dhandare Lab AI</h1>
            <p className="text-xs text-green-500 flex items-center gap-1">● Online | Medical & Tech Support</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white border-x shadow-sm overflow-hidden flex flex-col relative">
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                {msg.type === 'bot' && (
                   <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2 mt-1 shadow-sm">
                     <Bot size={16} className="text-white"/>
                   </div>
                )}
                <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-line ${
                  msg.type === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
                {msg.type === 'user' && (
                   <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-2 mt-1">
                     <User size={16} className="text-gray-600"/>
                   </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start ml-10">
                <div className="bg-gray-200 px-4 py-2 rounded-full flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask: 'I have fever', 'Normal Sugar'..."
                className="flex-1 p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={() => handleSend()} disabled={loading} className="p-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md disabled:opacity-50">
                <Send size={20} />
              </button>
            </div>
            <div className="mt-2 text-center">
                <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                    <AlertCircle size={10} /> Consult a doctor for diagnosis.
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;