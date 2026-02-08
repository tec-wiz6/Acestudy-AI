
import React, { useState } from 'react';
import { StudentLevel, ExamType, UserContext } from '../types';

interface SetupFormProps {
  onSubmit: (context: UserContext) => void;
  isLoading: boolean;
}

export const SetupForm: React.FC<SetupFormProps> = ({ onSubmit, isLoading }) => {
  const [level, setLevel] = useState<StudentLevel>(StudentLevel.SECONDARY);
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30); 
  
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState<ExamType>('WAEC');
  const [topic, setTopic] = useState('');
  
  const [uniName, setUniName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [uniLevel, setUniLevel] = useState('100L');
  const [faculty, setFaculty] = useState('');
  
  const [showNovelInput, setShowNovelInput] = useState(false);
  const [novelTitle, setNovelTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const context: UserContext = {
      level,
      questionCount,
      timeLimit: timeLimit > 0 ? timeLimit : undefined,
      novelTitle: showNovelInput ? novelTitle : undefined,
      secondaryDetails: level === StudentLevel.SECONDARY ? { subject, examType, topic } : undefined,
      universityDetails: level === StudentLevel.UNIVERSITY ? {
        universityName: uniName,
        courseCode,
        courseName,
        level: uniLevel,
        faculty
      } : undefined
    };
    onSubmit(context);
  };

  // Enhanced classes for white text and white cursor on dark background
  const inputClasses = "w-full p-2.5 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder-slate-400 caret-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-slate-100">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-indigo-900">Configure Study Session</h2>
        <p className="text-slate-500 mt-1 font-semibold italic">Study Smarter, Not Longer. AI-Driven Prep & Real-Time Focus.</p>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button type="button" onClick={() => setLevel(StudentLevel.SECONDARY)}
          className={`flex-1 py-2 rounded-lg font-medium transition-all ${level === StudentLevel.SECONDARY ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Secondary</button>
        <button type="button" onClick={() => setLevel(StudentLevel.UNIVERSITY)}
          className={`flex-1 py-2 rounded-lg font-medium transition-all ${level === StudentLevel.UNIVERSITY ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>University</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <label className="block text-xs font-black text-indigo-400 mb-2 uppercase tracking-widest">Total Questions: <span className="text-white text-sm">{questionCount}</span></label>
          <input type="range" min="1" max="60" step="1" value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="w-full h-1.5 bg-indigo-900/50 rounded-lg appearance-none cursor-pointer accent-white" />
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <label className="block text-xs font-black text-indigo-400 mb-2 uppercase tracking-widest">Timer (Mins): <span className="text-white text-sm">{timeLimit === 0 ? 'Disabled' : timeLimit}</span></label>
          <input type="range" min="0" max="180" step="1" value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value))}
            className="w-full h-1.5 bg-indigo-900/50 rounded-lg appearance-none cursor-pointer accent-white" />
        </div>
      </div>

      <div className="space-y-4">
        {level === StudentLevel.SECONDARY ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-tighter">Exam Type</label>
              <select value={examType} onChange={(e) => setExamType(e.target.value as ExamType)}
                className={inputClasses}>
                <option value="WAEC">WAEC</option><option value="NECO">NECO</option><option value="JAMB">JAMB</option><option value="School Exam">School Exam</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-tighter">Subject</label>
              <input type="text" required placeholder="e.g. Mathematics" value={subject} onChange={(e) => setSubject(e.target.value)}
                className={inputClasses} />
            </div>
            <div className="col-span-full">
              <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-tighter">Specific Topic (Optional)</label>
              <input type="text" placeholder="e.g. Calculus" value={topic} onChange={(e) => setTopic(e.target.value)}
                className={inputClasses} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-tighter">University Name</label>
              <input type="text" required placeholder="University Name (e.g. UI, UNILAG)" value={uniName} onChange={(e) => setUniName(e.target.value)}
                className={inputClasses} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-tighter">Course Code</label>
                <input type="text" required placeholder="e.g. MTH101" value={courseCode} onChange={(e) => setCourseCode(e.target.value)}
                  className={inputClasses} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-tighter">Course Name</label>
                <input type="text" required placeholder="Elementary Maths" value={courseName} onChange={(e) => setCourseName(e.target.value)}
                  className={inputClasses} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-tighter">Level</label>
                <input type="text" placeholder="100L" value={uniLevel} onChange={(e) => setUniLevel(e.target.value)}
                  className={inputClasses} />
               </div>
               <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-tighter">Faculty/Dept</label>
                <input type="text" placeholder="Engineering" value={faculty} onChange={(e) => setFaculty(e.target.value)}
                  className={inputClasses} />
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        {!showNovelInput ? (
          <button 
            type="button" 
            onClick={() => setShowNovelInput(true)}
            className="w-full py-3 flex items-center justify-center gap-2 text-indigo-700 font-bold hover:bg-indigo-100 rounded-lg transition-colors border-2 border-dashed border-indigo-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            Study Literature/Novel Title
          </button>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-indigo-900">Literature Selection</h4>
              <button type="button" onClick={() => {setShowNovelInput(false); setNovelTitle('');}} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
            </div>
            <input 
              type="text" 
              required={showNovelInput}
              placeholder="Enter Title (e.g. Faceless)" 
              value={novelTitle} 
              onChange={(e) => setNovelTitle(e.target.value)}
              className={inputClasses} 
            />
            <p className="text-[10px] text-indigo-600 font-medium italic">Gemini will pull specific analysis and past questions for this book.</p>
          </div>
        )}
      </div>

      <button type="submit" disabled={isLoading}
        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 text-lg">
        {isLoading ? 'Fetching Past Questions...' : 'Start My Prep'}
      </button>

      <p className="text-center text-[10px] text-slate-400 uppercase font-black tracking-widest">
        Customized based on your university and level
      </p>
    </form>
  );
};
