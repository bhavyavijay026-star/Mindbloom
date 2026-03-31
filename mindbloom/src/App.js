import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Shield, BarChart3, Heart, Monitor, CheckCircle2, Calendar, 
  ChevronRight, Loader2, Info, User, Lock, Mail, History, LogOut, X, ArrowLeft
} from 'lucide-react';

// --- CONFIGURATION ---
const BASE_URL = "http://127.0.0.1:5000";

const QUESTIONS = [
  { id: 'q1', cat: 'Emotional Instability', text: 'I often feel physical tension, like a tight chest or stomach ache, when I am stressed.' },
  { id: 'q2', cat: 'Emotional Instability', text: 'I feel like I’m pretending to be okay.' },
  { id: 'q3', cat: 'Emotional Instability', text: 'It takes me a long time to calm down after I get upset.' },
  { id: 'q4', cat: 'Emotional Instability', text: 'I feel stuck and don’t know how to move forward.' },
  { id: 'q5', cat: 'Emotional Instability', text: 'I get irritated more easily than before.' },
  { id: 'q6', cat: 'Home Environment', text: 'I feel guilty when I relax because my family is sacrificing for me.' },
  { id: 'q7', cat: 'Home Environment', text: 'Financial situations at home make me feel extra pressure.' },
  { id: 'q8', cat: 'Home Environment', text: 'I am scared to tell them if I fail.' },
  { id: 'q9', cat: 'Home Environment', text: 'I hide my stress from my family.' },
  { id: 'q10', cat: 'Academic', text: 'I avoid asking doubts because I don’t want to look dumb.' },
  { id: 'q11', cat: 'Academic', text: 'Before exams, my mind goes blank.' },
  { id: 'q12', cat: 'Academic', text: 'I study out of fear, not interest.' },
  { id: 'q13', cat: 'Academic', text: 'The medium of instruction (like English) makes subjects harder for me.' },
  { id: 'q14', cat: 'Screen Dependency', text: 'I pick up my phone automatically even when I don’t have any reason.' },
  { id: 'q15', cat: 'Screen Dependency', text: 'I use my phone to avoid thinking about stressful situations.' },
  { id: 'q16', cat: 'Screen Dependency', text: 'I delay important tasks because I get distracted by social media.' },
  { id: 'q17', cat: 'Screen Dependency', text: 'I use my phone right before sleeping, even when I’m tired.' },
  { id: 'q18', cat: 'Sleep Debt', text: 'I sacrifice sleep to finish assignments.' },
  { id: 'q19', cat: 'Sleep Debt', text: 'I rely on caffeine (tea/coffee) to stay awake.' },
  { id: 'q20', cat: 'Sleep Debt', text: 'I go to bed tired but still struggle to fall asleep.' },
  { id: 'q21', cat: 'Sleep Debt', text: 'I feel mentally foggy in the morning.' },
  { id: 'q22', cat: 'Social Isolation', text: 'I feel disconnected even in group settings.' },
  { id: 'q23', cat: 'Social Isolation', text: 'I rarely share my problems with others.' },
  { id: 'q24', cat: 'Social Isolation', text: 'I scroll social media instead of meeting people in person.' },
  { id: 'q25', cat: 'Social Isolation', text: 'I hesitate to join group activities.' },
];

const LoginCSS = `
    .login-container { background-color: #fff; border-radius: 50px; box-shadow: 0 20px 50px rgba(0,0,0,0.1); position: relative; overflow: hidden; width: 850px; max-width: 100%; min-height: 550px; }
    .form-container { position: absolute; top: 0; height: 100%; transition: all 0.6s ease-in-out; }
    .sign-in-container { left: 0; width: 50%; z-index: 2; }
    .login-container.active .sign-in-container { transform: translateX(100%); opacity: 0; }
    .register-container { left: 0; width: 50%; opacity: 0; z-index: 1; }
    .login-container.active .register-container { transform: translateX(100%); opacity: 1; z-index: 5; animation: move 0.6s; }
    @keyframes move { 0%, 49.99% { opacity: 0; z-index: 1; } 50%, 100% { opacity: 1; z-index: 5; } }
    .toggle-container { position: absolute; top: 0; left: 50%; width: 50%; height: 100%; overflow: hidden; transition: all 0.6s ease-in-out; z-index: 1000; }
    .login-container.active .toggle-container { transform: translateX(-100%); border-radius: 0 100px 100px 0; }
    .toggle { background: linear-gradient(to right, #134e4a, #0f172a); color: #fff; position: relative; left: -100%; height: 100%; width: 200%; transform: translateX(0); transition: all 0.6s ease-in-out; }
    .login-container.active .toggle { transform: translateX(50%); }
    .toggle-panel { position: absolute; width: 50%; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 0 30px; text-align: center; top: 0; transition: all 0.6s ease-in-out; }
    .toggle-left { transform: translateX(-200%); }
    .login-container.active .toggle-left { transform: translateX(0); }
    .toggle-right { right: 0; transform: translateX(0); }
    .login-container.active .toggle-right { transform: translateX(200%); }
`;

export default function App() {
  const [view, setView] = useState('home'); 
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]); 
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({ name: '', username: '', password: '', age: '', gender: '' });
  const [serverData, setServerData] = useState({ priority_1: '...', priority_2: '...', stress_level: '', seven_day_plan: [] });

  const { scrollYProgress } = useScroll();
  const brainMoveLeft = useTransform(scrollYProgress, [0, 0.15], [0, -250]);
  const brainMoveRight = useTransform(scrollYProgress, [0, 0.15], [0, 250]);
  const brainOpacity = useTransform(scrollYProgress, [0, 0.12, 0.2], [1, 1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1.2]);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);

  const handleInputChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'register' ? '/register' : '/login';
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUser(data.user);
        setShowAuth(false);
      } else { alert(data.message); }
    } catch (err) { alert("Server Connection Failed"); }
    finally { setIsSubmitting(false); }
  };

  const fetchHistory = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/history/${user.username}`);
      const data = await res.json();
      setHistory(data);
      setView('history');
    } catch (err) { alert("Could not load history"); }
    finally { setIsSubmitting(false); }
  };

  const handleAnswer = async (val) => {
    const updatedAnswers = [...answers, val];
    if (currentStep < QUESTIONS.length - 1) {
      setAnswers(updatedAnswers);
      setCurrentStep(currentStep + 1);
    } else {
      setIsSubmitting(true);
      try {
        const res = await fetch(`${BASE_URL}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: updatedAnswers, username: user.username })
        });
        const data = await res.json();
        setResults(data.category_percentages);
        setServerData(data);
        setView('results');
      } catch (err) { alert("Analysis failed"); }
      finally { setIsSubmitting(false); }
    }
  };

  const reset = () => { setView('home'); setCurrentStep(0); setAnswers([]); setResults(null); };
  const logout = () => { setUser(null); setView('home'); setAnswers([]); setForm({ name: '', username: '', password: '', age: '', gender: '' }); };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-teal-100 font-sans">
      <style>{LoginCSS}</style>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b px-6 md:px-20 py-5 flex justify-between items-center">
        <div className="flex flex-col">
          <div className="text-2xl font-black text-teal-600 cursor-pointer leading-tight" onClick={reset}>MindBloom</div>
          {user && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Hi, {user.name.split(' ')[0]} 👋
            </motion.div>
          )}
        </div>

        <div className="flex gap-4 items-center">
          {!user ? (
            <button onClick={() => {setAuthMode('login'); setShowAuth(true);}} className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-transform active:scale-95">
              Login / Register
            </button>
          ) : (
            <div className="flex gap-6 items-center">
              <button onClick={fetchHistory} className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase hover:text-teal-600 transition-colors">
                <History size={16}/> Previous Results
              </button>
              <button onClick={logout} className="text-rose-500 hover:bg-rose-50 p-2 rounded-full transition-colors"><LogOut size={20}/></button>
            </div>
          )}
        </div>
      </nav>

      {/* AUTH OVERLAY (Popup with Animation) */}
      <AnimatePresence>
        {showAuth && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className={`login-container ${authMode === 'register' ? 'active' : ''}`}>
              <button className="absolute top-6 right-6 z-[1001] text-slate-400 hover:text-slate-900" onClick={() => setShowAuth(false)}><X/></button>
              
              <div className="form-container register-container">
                <form className="bg-white flex flex-col items-center justify-center h-full px-10 text-center" onSubmit={handleAuthSubmit}>
                  <h1 className="font-black text-3xl mb-4">Create Account</h1>
                  <input name="name" onChange={handleInputChange} placeholder="Name" required className="w-full bg-slate-100 border-none my-2 p-3 rounded-xl outline-none" />
                  <input name="username" onChange={handleInputChange} placeholder="Username" required className="w-full bg-slate-100 border-none my-2 p-3 rounded-xl outline-none" />
                  <input name="password" onChange={handleInputChange} type="password" placeholder="Password" required className="w-full bg-slate-100 border-none my-2 p-3 rounded-xl outline-none" />
                  <div className="flex gap-2 w-full">
                    <input name="age" onChange={handleInputChange} type="number" placeholder="Age" className="w-1/2 bg-slate-100 border-none my-2 p-3 rounded-xl outline-none" />
                    <select name="gender" onChange={handleInputChange} className="w-1/2 bg-slate-100 border-none my-2 p-3 rounded-xl outline-none">
                      <option value="">Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <button className="bg-teal-600 text-white px-10 py-3 rounded-xl font-bold mt-4 uppercase text-xs tracking-widest">Sign Up</button>
                </form>
              </div>

              <div className="form-container sign-in-container">
                <form className="bg-white flex flex-col items-center justify-center h-full px-10 text-center" onSubmit={handleAuthSubmit}>
                  <h1 className="font-black text-3xl mb-4">Sign In</h1>
                  <input name="username" onChange={handleInputChange} placeholder="Username" required className="w-full bg-slate-100 border-none my-2 p-3 rounded-xl outline-none" />
                  <input name="password" onChange={handleInputChange} type="password" placeholder="Password" required className="w-full bg-slate-100 border-none my-2 p-3 rounded-xl outline-none" />
                  <button className="bg-teal-600 text-white px-10 py-3 rounded-xl font-bold mt-4 uppercase text-xs tracking-widest">Log In</button>
                </form>
              </div>

              <div className="toggle-container">
                <div className="toggle">
                  <div className="toggle-panel toggle-left">
                    <h1 className="text-white font-black text-3xl mb-4">Welcome Back!</h1>
                    <p className="text-white/80 text-sm mb-6">Log in to track your history.</p>
                    <button className="border-2 border-white bg-transparent text-white px-10 py-2 rounded-xl text-xs font-bold uppercase" onClick={() => setAuthMode('login')}>Sign In</button>
                  </div>
                  <div className="toggle-panel toggle-right">
                    <h1 className="text-white font-black text-3xl mb-4">Hello, Friend!</h1>
                    <p className="text-white/80 text-sm mb-6">Ready to untangle your mind?</p>
                    <button className="border-2 border-white bg-transparent text-white px-10 py-2 rounded-xl text-xs font-bold uppercase" onClick={() => setAuthMode('register')}>Register</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* STRICT ORIGINAL BRAIN ANIMATION SECTION */}
            <section className="h-[90vh] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="relative flex items-center justify-center scale-90 md:scale-110">
                <motion.div style={{ x: brainMoveLeft, opacity: brainOpacity }} className="z-20">
                  <img src="/left_brain.png" alt="Left" className="w-52 h-auto object-contain" />
                </motion.div>
                <motion.div style={{ scale: textScale, opacity: textOpacity }} className="absolute z-10 text-center">
                  <h1 className="text-7xl md:text-8xl font-black text-teal-600 tracking-tighter italic">MindBloom</h1>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs">Untangle your mind</p>
                </motion.div>
                <motion.div style={{ x: brainMoveRight, opacity: brainOpacity }} className="z-20">
                  <img src="/right_brain.png" alt="Right" className="w-52 h-auto object-contain" />
                </motion.div>
              </div>
              <button 
                onClick={() => user ? setView('assessment') : setShowAuth(true)}
                className="mt-12 bg-slate-900 text-white px-14 py-4 rounded-full font-black shadow-2xl z-30 flex items-center gap-2 hover:scale-105 transition-transform"
              >
                {user ? "Start Assessment" : "Login to Start"} <ChevronRight size={20}/>
              </button>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-10 text-slate-300 flex flex-col items-center gap-2">
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Scroll to Explore</span>
                <div className="w-[1px] h-8 bg-slate-200"></div>
              </motion.div>
            </section>

            {/* WHY SECTION */}
            <section className="py-24 max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-900">Why students <br/><span className="text-teal-600">choose us.</span></h2>
                <p className="text-xl text-slate-500 leading-relaxed font-medium">MindBloom transforms internal struggles into measurable data via AI-driven predictive wellness.</p>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { title: "Anonymous", icon: Shield, bg: "bg-teal-50" },
                  { title: "Scalable", icon: BarChart3, bg: "bg-blue-50" },
                  { title: "Safe", icon: Heart, bg: "bg-rose-50" },
                  { title: "Insightful", icon: Monitor, bg: "bg-amber-50" }
                ].map((item, i) => (
                  <div key={i} className={`${item.bg} p-8 rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl transition-all group`}>
                    <item.icon size={32} className="mb-6 text-slate-800" />
                    <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                    <p className="text-sm text-slate-500">Evidence-based AI tools to support your mental journey.</p>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* --- ASSESSMENT VIEW --- */}
        {view === 'assessment' && (
           <motion.div key="assess" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto py-20 px-6">
              {isSubmitting ? <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-teal-600 mb-4" size={48}/><h3 className="text-2xl font-bold italic">AI Processing...</h3></div> : (
                <>
                  <div className="mb-10 text-center uppercase text-[10px] font-black text-teal-600 tracking-widest">
                    {QUESTIONS[currentStep].cat} | {currentStep + 1}/25
                  </div>
                  <h2 className="text-4xl font-black mb-12 text-center leading-tight">{QUESTIONS[currentStep].text}</h2>
                  <div className="flex justify-center gap-4">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button key={v} onClick={() => handleAnswer(v)} className="w-20 h-20 rounded-3xl border-2 font-black text-2xl hover:bg-teal-50 hover:border-teal-500 transition-all shadow-sm">{v}</button>
                    ))}
                  </div>
                </>
              )}
           </motion.div>
        )}

        {/* --- HISTORY DASHBOARD --- */}
        {view === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto py-20 px-6">
            <button onClick={() => setView('home')} className="flex items-center gap-2 text-teal-600 font-bold mb-8 hover:-translate-x-2 transition-transform">
               <ArrowLeft size={20}/> Back to Home
            </button>
            <h1 className="text-5xl font-black tracking-tighter mb-12 italic">Previous Insights</h1>
            <div className="grid gap-6">
              {history.length > 0 ? history.map((item, idx) => (
                <div key={idx} className="bg-white border rounded-[2.5rem] p-8 shadow-sm flex items-center justify-between hover:border-teal-400 transition-all">
                  <div className="flex items-center gap-8">
                    <div className="text-center pr-8 border-r">
                      <p className="text-3xl font-black text-slate-800">{new Date(item.created_at).getDate()}</p>
                      <p className="text-xs font-bold uppercase text-slate-400">{new Date(item.created_at).toLocaleString('default', { month: 'short' })}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-teal-600 uppercase tracking-widest mb-2">Analysis Results</p>
                      <div className="flex gap-2">
                         <span className="bg-slate-50 px-4 py-1 rounded-full text-[10px] font-black border uppercase">#1 {item.priority_1}</span>
                         <span className="bg-slate-50 px-4 py-1 rounded-full text-[10px] font-black border uppercase">#2 {item.priority_2}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 h-10 items-end">
                    {Object.values(item.cat_scores).map((score, i) => (
                      <div key={i} className="w-1.5 bg-slate-100 h-full relative"><div className="absolute bottom-0 w-full bg-teal-400 rounded-full" style={{ height: `${score}%` }}></div></div>
                    ))}
                  </div>
                </div>
              )) : <div className="p-20 text-center bg-slate-50 rounded-[3rem] border border-dashed text-slate-400 font-bold uppercase text-xs tracking-widest">No history available yet.</div>}
            </div>
          </motion.div>
        )}

        {/* --- RESULTS VIEW --- */}
        {view === 'results' && results && (
           <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto py-20 px-6">
              <div className="text-center mb-16">
                 <h1 className="text-6xl font-black mb-4 tracking-tighter italic">Wellness Report</h1>
                 <span className="bg-teal-600 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest">Stress Index: {serverData.stress_level}</span>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                 {Object.entries(results).map(([cat, val], i) => (
                   <div key={i} className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col justify-between">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat}</span>
                     <div className="flex items-end justify-between mt-4">
                       <span className="text-xl font-black text-slate-800">{val >= 70 ? 'High' : val > 40 ? 'Mid' : 'Low'}</span>
                       <span className="text-4xl font-black text-teal-600 italic">{val}%</span>
                     </div>
                   </div>
                 ))}
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                 <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-xl flex flex-col justify-center">
                   <h3 className="text-2xl font-black mb-6 text-teal-400 italic underline">Primary Priorities</h3>
                   <div className="flex gap-4 mb-6">
                      <span className="bg-slate-800 px-5 py-2 rounded-full border border-teal-500/30 text-teal-300 font-bold text-xs uppercase">#1 {serverData.priority_1}</span>
                      <span className="bg-slate-800 px-5 py-2 rounded-full border border-slate-700 text-slate-400 font-bold text-xs uppercase">#2 {serverData.priority_2}</span>
                   </div>
                   <p className="text-slate-400 italic">"The AI identified {serverData.priority_1} as your primary driver of stress."</p>
                 </div>
                 <div className="bg-white border rounded-[3rem] p-10 shadow-sm">
                   <h3 className="text-2xl font-black mb-6 flex items-center gap-2 tracking-tight font-black uppercase text-xs"><Calendar className="text-teal-600" size={18}/> AI Reset Plan</h3>
                   <div className="space-y-3">{serverData.seven_day_plan.map((s, i) => (
                     <div key={i} className="flex gap-4 items-start"><span className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex-shrink-0 text-[10px] font-black flex items-center justify-center">{i+1}</span><p className="text-slate-600 font-bold text-xs">{s}</p></div>
                   ))}</div>
                 </div>
              </div>
              <div className="mt-12 text-center">
                <button onClick={reset} className="bg-slate-900 text-white px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest">Return Home</button>
              </div>
           </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}