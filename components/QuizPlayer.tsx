
import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizSession } from '../types';

interface QuizPlayerProps {
  questions: QuizQuestion[];
  onFinish: (session: QuizSession) => void;
  sources: { title: string; uri: string }[];
  timeLimit?: number;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ questions, onFinish, sources, timeLimit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [timeLeft, setTimeLeft] = useState(timeLimit ? timeLimit * 60 : 0);
  const [showCalc, setShowCalc] = useState(false);
  const [calcInput, setCalcInput] = useState('');
  
  useEffect(() => {
    if (!timeLimit || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLimit, timeLeft]);

  const finishQuiz = () => {
    const score = selectedAnswers.reduce((acc, curr, idx) => curr === questions[idx].correctIndex ? acc + 1 : acc, 0);
    onFinish({
      questions,
      userAnswers: selectedAnswers,
      score,
      isComplete: true,
      timeSpent: timeLimit ? (timeLimit * 60 - timeLeft) : 0,
      groundingSources: sources
    });
  };

  const handleSelect = (idx: number) => {
    const newAns = [...selectedAnswers];
    newAns[currentIndex] = idx;
    setSelectedAnswers(newAns);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6 relative">
      {/* Timer Display */}
      {timeLimit && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-2 rounded-full font-black text-xl shadow-xl border-2 transition-colors ${timeLeft < 60 ? 'bg-red-600 text-white border-red-400 animate-pulse' : 'bg-white text-slate-800 border-indigo-100'}`}>
          {formatTime(timeLeft)}
        </div>
      )}

      {/* Math Calculator Tool */}
      <button onClick={() => setShowCalc(!showCalc)} className="fixed bottom-24 right-4 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
      </button>

      {showCalc && (
        <div className="fixed bottom-40 right-4 z-50 bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-700 w-64">
          <div className="flex justify-between mb-2"><span className="text-white font-bold text-xs uppercase">Calculator</span><button onClick={() => setShowCalc(false)} className="text-slate-400 hover:text-white">×</button></div>
          <input type="text" value={calcInput} onChange={(e) => setCalcInput(e.target.value)} className="w-full bg-slate-900 text-green-400 p-2 rounded border border-slate-600 text-right font-mono mb-2" placeholder="2+2" />
          <div className="grid grid-cols-4 gap-2">
            {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','C','+'].map(btn => (
              <button key={btn} onClick={() => btn === 'C' ? setCalcInput('') : setCalcInput(prev => prev + btn)} className="p-2 bg-slate-700 text-white rounded hover:bg-slate-600 text-sm">{btn}</button>
            ))}
            <button onClick={() => { try { setCalcInput(eval(calcInput).toString()) } catch { setCalcInput('Error') } }} className="col-span-4 p-2 bg-indigo-600 text-white rounded font-bold">=</button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col min-h-[450px]">
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-10 leading-snug">{currentQuestion.question}</h3>
        <div className="space-y-4 flex-grow">
          {currentQuestion.options.map((opt, idx) => (
            <button key={idx} onClick={() => handleSelect(idx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${selectedAnswers[currentIndex] === idx ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-50 hover:border-slate-200 text-slate-600'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 font-bold ${selectedAnswers[currentIndex] === idx ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 text-slate-400'}`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="font-medium">{opt}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-12">
          <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0}
            className="px-6 py-3 font-bold text-slate-400 disabled:opacity-20">Back</button>
          <button onClick={() => currentIndex === questions.length - 1 ? finishQuiz() : setCurrentIndex(prev => prev + 1)}
            disabled={selectedAnswers[currentIndex] === -1}
            className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50">
            {currentIndex === questions.length - 1 ? 'Complete Quiz' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
