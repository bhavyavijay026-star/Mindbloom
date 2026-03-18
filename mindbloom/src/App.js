import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, Shield, BarChart3, Moon, 
  Monitor, Users, Heart, ArrowRight, CheckCircle2, Star, X, Info
} from 'lucide-react';

// --- UPDATED DATASET (25 Questions / 6 Categories) ---
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
  { id: 'q14', cat: 'Screen Dependency', text: 'I pick up my phone automatically even when I don’t have any specific reason.' },
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

const REVIEWS = [
  { name: "Aarav M.", role: "Student", text: "The screen dependency score was a wake-up call. I've cut my usage by 2 hours." },
  { name: "Dr. Elena", role: "Psychologist", text: "A clean, evidence-based approach to early intervention in student wellness." },
  { name: "Sophia K.", role: "Junior", text: "I love the anonymity. It feels like a safe space to be honest with myself." }
];

export default function App() {
  const [view, setView] = useState('home'); 
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  
  const { scrollYProgress } = useScroll();

  // SCROLL ANIMATIONS
  const brainMoveLeft = useTransform(scrollYProgress, [0, 0.15], [0, -250]);
  const brainMoveRight = useTransform(scrollYProgress, [0, 0.15], [0, 250]);
  const brainOpacity = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1.2]);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);

  // LOGIC
  const handleAnswer = (val) => {
    const newAnswers = { ...answers, [QUESTIONS[currentStep].id]: val };
    setAnswers(newAnswers);
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate scores for all 6 categories
      const categories = [...new Set(QUESTIONS.map(q => q.cat))];
      const scores = {};
      categories.forEach(c => {
        const qList = QUESTIONS.filter(q => q.cat === c);
        scores[c] = qList.reduce((acc, q) => acc + newAnswers[q.id], 0) / qList.length;
      });
      setResults(scores);
      setView('results');
      window.scrollTo(0, 0);
    }
  };

  const reset = () => {
    setView('home');
    setCurrentStep(0);
    setAnswers({});
    setResults(null);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-teal-100">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-50 px-6 md:px-20 py-5 flex justify-between items-center">
        <div className="text-2xl font-black text-teal-600 cursor-pointer" onClick={reset}>
          MindBloom
        </div>
        <button 
          onClick={() => setView('assessment')}
          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-teal-100/50 text-sm"
        >
          Start Assessment
        </button>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* BRAIN SECTION */}
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
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-10 text-slate-300 flex flex-col items-center gap-2">
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Scroll to Explore</span>
                <div className="w-[1px] h-8 bg-slate-200"></div>
              </motion.div>
            </section>

            {/* WHY SECTION */}
            <section className="py-24 max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-900">Why students <br/><span className="text-teal-600">choose us.</span></h2>
                <p className="text-xl text-slate-500 leading-relaxed font-medium">MindBloom transforms internal struggles into measurable data, providing a roadmap for emotional and behavioral growth.</p>
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
                    <p className="text-sm text-slate-500">Industry leading tools to support your mental journey.</p>
                  </div>
                ))}
              </div>
            </section>

            {/* REVIEWS */}
            <section className="bg-slate-900 py-24 text-white">
              <div className="max-w-6xl mx-auto px-6 text-center">
                <h2 className="text-4xl font-black mb-16">Trusted by the community</h2>
                <div className="grid md:grid-cols-3 gap-8 text-left">
                  {REVIEWS.map((r, i) => (
                    <div key={i} className="bg-slate-800 p-8 rounded-3xl border border-slate-700">
                      <div className="flex text-teal-400 mb-4 font-bold tracking-tighter italic">"Best in Class"</div>
                      <p className="text-slate-300 mb-6 italic">"{r.text}"</p>
                      <p className="font-bold underline decoration-teal-500 underline-offset-4">{r.name}</p>
                      <p className="text-xs text-slate-500 uppercase mt-1 font-bold">{r.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {/* --- UPDATED ASSESSMENT VIEW (1-10 Scale) --- */}
        {view === 'assessment' && (
          <motion.div key="assess" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto px-6 py-20">
            <div className="mb-12 text-center">
              <div className="flex justify-between text-[10px] font-black text-teal-600 uppercase mb-3 tracking-[0.2em]">
                <span>{QUESTIONS[currentStep].cat}</span>
                <span>Question {currentStep + 1} / 25</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-teal-500" 
                  initial={{ width: 0 }} 
                  animate={{ width: `${((currentStep + 1) / 25) * 100}%` }} 
                />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tighter text-slate-800 text-center leading-tight">
              {QUESTIONS[currentStep].text}
            </h2>
            <p className="text-center text-slate-400 font-medium mb-12 uppercase text-[10px] tracking-widest">Select intensity from 1 (Low) to 10 (High)</p>

            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                <button 
                  key={v} 
                  onClick={() => handleAnswer(v)} 
                  className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-slate-100 font-black text-lg
                             transition-all hover:border-teal-500 hover:bg-teal-50 hover:scale-110 active:scale-95
                             flex items-center justify-center text-slate-400 hover:text-teal-600"
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-8 px-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
          </motion.div>
        )}

        {/* --- UPDATED RESULTS VIEW (6 Categories) --- */}
        {view === 'results' && results && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
              <div className="bg-teal-50 text-teal-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
              <h1 className="text-5xl font-black tracking-tighter mb-4">Your Wellness Report</h1>
              <p className="text-slate-500 font-bold italic">Analysis of your 25 behavioral data points.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {Object.entries(results).map(([cat, score], i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat}</span>
                    <span className={`h-2 w-2 rounded-full ${score > 7 ? 'bg-rose-500' : score > 4 ? 'bg-amber-500' : 'bg-teal-500'}`}></span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xl font-black text-slate-800">{score > 7 ? 'High' : score > 4 ? 'Mid' : 'Low'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Intensity Level</p>
                    </div>
                    <span className="text-2xl font-black text-teal-600 italic">{(score * 10).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <h3 className="text-3xl font-black mb-6 underline decoration-teal-500 underline-offset-8 italic">AI Guidance</h3>
                <p className="text-slate-400 mb-8 font-medium italic leading-relaxed text-lg">
                  "Based on your Academic and Home Environment scores, your current patterns suggest a need for boundary setting between study and family time. Prioritize 15 minutes of quiet decompression before bed."
                </p>
                <button onClick={reset} className="bg-teal-500 text-white px-12 py-4 rounded-full font-black hover:scale-105 transition-transform active:scale-95 shadow-xl">Retake Assessment</button>
              </div>
              <div className="w-full md:w-1/3 bg-slate-800 p-8 rounded-[2rem] border border-slate-700">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-teal-400"><Info size={18} /> Quick Tip</h4>
                <p className="text-sm text-slate-300 leading-relaxed">Try the '4-7-8' breathing technique for 2 minutes before your next study session. It helps reset your nervous system when academic pressure feels high.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}