
import React, { useState } from 'react';
import { SetupForm } from './components/SetupForm';
import { QuizPlayer } from './components/QuizPlayer';
import { ResultsView } from './components/ResultsView';
import { UserContext, QuizQuestion, QuizSession, StudyMaterial } from './types';
import { generateQuiz } from './services/quizService';


const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [sources, setSources] = useState<{ title: string; uri: string }[]>([]);
  const [recommendations, setRecommendations] = useState<StudyMaterial[]>([]);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [activeContext, setActiveContext] = useState<UserContext | null>(null);

  const handleSetupSubmit = async (context: UserContext) => {
    setLoading(true);
    setError(null);
    setActiveContext(context);
    try {
      const result = await generateQuiz(context);
      if (result.questions.length === 0) {
        throw new Error("No questions were generated. Please refine your inputs.");
      }
      setQuestions(result.questions);
      setSources(result.sources);
      setRecommendations(result.recommendations);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishQuiz = (finishedSession: QuizSession) => {
    setSession({ ...finishedSession, recommendations });
    setQuestions(null);
  };

  const handleReset = () => {
    setSession(null);
    setQuestions(null);
    setSources([]);
    setRecommendations([]);
    setError(null);
    setActiveContext(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100">
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl group-hover:scale-110 transition-transform">A</div>
          <h1 className="text-xl font-black text-slate-800 tracking-tighter hidden sm:block">AceStudy AI</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-tighter">Pro Prep Engine</span>
        </div>
      </header>

      <main className="flex-grow py-8 px-4">
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm flex items-center gap-3 shadow-sm">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {!questions && !session && <SetupForm onSubmit={handleSetupSubmit} isLoading={loading} />}
        {questions && !session && <QuizPlayer questions={questions} sources={sources} timeLimit={activeContext?.timeLimit} onFinish={handleFinishQuiz} />}
        {session && <ResultsView session={session} onReset={handleReset} />}
      </main>

      <footer className="py-8 text-center text-slate-500 text-xs border-t border-slate-100 bg-white">
        <p className="font-medium">
          ©2026AceStudy AI. Crafted By{''}
          <a 
            href="https://wa.me/2348169936326?text=i%20am%20intrested%20in%20you%20website%20and%20want%20know%20more" 
            target="_blank" 
            rel="noreferrer"
            className="text-indigo-600 font-black hover:bg-indigo-50 px-1 rounded transition-colors"
          >
            A.A.A
          </a>
          . Use responsibly for revision.
        </p>
      </footer>
    </div>
  );
};

export default App;
