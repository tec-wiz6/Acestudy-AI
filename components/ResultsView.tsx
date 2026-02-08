
import React from 'react';
import { QuizSession } from '../types';

interface ResultsViewProps {
  session: QuizSession;
  onReset: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ session, onReset }) => {
  const percentage = Math.round((session.score / session.questions.length) * 100);

  const downloadQuestions = () => {
    const content = session.questions.map((q, i) => {
      return `Q${i + 1}: ${q.question}\nOptions:\nA) ${q.options[0]}\nB) ${q.options[1]}\nC) ${q.options[2]}\nD) ${q.options[3]}\nCorrect Answer: ${q.options[q.correctIndex]}\nExplanation: ${q.explanation}\n\n`;
    }).join('---\n');
    
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "AceStudy_Practice_Materials.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10 pb-20">
      <div className="bg-white rounded-3xl shadow-2xl p-10 border border-slate-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
        <div className="inline-flex items-center justify-center w-36 h-36 rounded-full bg-indigo-50 border-4 border-white shadow-inner mb-6">
          <span className="text-5xl font-black text-indigo-600">{percentage}%</span>
        </div>
        <h2 className="text-4xl font-black text-slate-800">Mission Accomplished!</h2>
        <p className="text-lg text-slate-500 mt-2">
          You mastered <span className="text-indigo-600 font-bold">{session.score}</span> of <span className="font-bold">{session.questions.length}</span> objectives.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <button onClick={downloadQuestions} className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Save Questions
          </button>
          <button onClick={onReset} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200">
            Start New Prep
          </button>
        </div>
      </div>

      {/* Recommended Study Materials */}
      {session.recommendations && session.recommendations.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            Tailored Study Materials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.recommendations.map((mat, i) => (
              <a key={i} href={mat.link.startsWith('http') ? mat.link : `https://www.google.com/search?q=${encodeURIComponent(mat.link)}`} target="_blank" rel="noreferrer"
                className="block p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-300 transition-all hover:shadow-lg group">
                <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{mat.title}</h4>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{mat.description}</p>
                <div className="mt-3 text-xs font-bold text-indigo-600 flex items-center gap-1">
                  View Resource <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-2xl font-black text-slate-800">Answer Review</h3>
        {session.questions.map((q, idx) => {
          const isCorrect = session.userAnswers[idx] === q.correctIndex;
          return (
            <div key={idx} className={`bg-white rounded-2xl p-6 shadow-sm border-l-8 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
              <div className="flex justify-between items-start gap-4 mb-4">
                <p className="font-bold text-lg text-slate-800">{idx + 1}. {q.question}</p>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isCorrect ? 'Success' : 'Failed'}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className={`p-3 rounded-lg text-sm border-2 ${oIdx === q.correctIndex ? 'bg-green-50 border-green-200 text-green-800 font-bold' : oIdx === session.userAnswers[idx] ? 'bg-red-50 border-red-200 text-red-800' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                    {opt}
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Key Concept</span>
                <p className="text-slate-700 text-sm">{q.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
