import React, { useState } from 'react';
import Layout from './components/Layout';
import ResumeBuilder from './components/ResumeBuilder';
import PortfolioGenerator from './components/PortfolioGenerator';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import EmailAutomation from './components/EmailAutomation';
import { AppRoute, ResumeData } from './types';
import { LayoutDashboard, CheckCircle, AlertCircle } from 'lucide-react';

const Dashboard: React.FC<{ onNavigate: (route: AppRoute) => void; hasResume: boolean }> = ({ onNavigate, hasResume }) => (
  <div className="space-y-8">
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
        <p className="text-indigo-100 max-w-xl">Your career OS is ready. Start by analyzing your resume to unlock the full potential of our AI tools.</p>
        {!hasResume && (
            <button 
                onClick={() => onNavigate(AppRoute.RESUME)}
                className="mt-6 bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            >
                Upload Resume
            </button>
        )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
            { 
                route: AppRoute.RESUME, 
                title: 'Resume Intelligence', 
                desc: 'Parse, analyze, and optimize your resume with RAG technology.',
                color: 'bg-blue-50 text-blue-700',
                ready: true
            },
            { 
                route: AppRoute.PORTFOLIO, 
                title: 'Portfolio Generator', 
                desc: 'Create a stunning Next.js portfolio website based on your experience.',
                color: 'bg-purple-50 text-purple-700',
                ready: hasResume
            },
            { 
                route: AppRoute.COVER_LETTER, 
                title: 'Cover Letter AI', 
                desc: 'Generate tailored cover letters for any job description instantly.',
                color: 'bg-pink-50 text-pink-700',
                ready: hasResume
            },
            { 
                route: AppRoute.EMAIL, 
                title: 'Cold Email Automation', 
                desc: 'Find leads and send hyper-personalized outreach at scale.',
                color: 'bg-orange-50 text-orange-700',
                ready: hasResume
            }
        ].map((card) => (
            <button 
                key={card.route}
                onClick={() => onNavigate(card.route)}
                className="text-left bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
                <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <LayoutDashboard size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{card.title}</h3>
                <p className="text-slate-500 text-sm">{card.desc}</p>
                {!card.ready && (
                     <div className="absolute top-4 right-4 text-slate-300">
                        <AlertCircle size={20} />
                     </div>
                )}
                 {card.ready && (
                     <div className="absolute top-4 right-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CheckCircle size={20} />
                     </div>
                )}
            </button>
        ))}
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [rawResumeText, setRawResumeText] = useState<string>('');

  const handleResumeUpdate = (data: ResumeData, text: string) => {
    setResumeData(data);
    setRawResumeText(text);
  };

  const renderContent = () => {
    switch (currentRoute) {
      case AppRoute.RESUME:
        return <ResumeBuilder onResumeUpdate={handleResumeUpdate} existingData={resumeData} />;
      case AppRoute.PORTFOLIO:
        return <PortfolioGenerator resumeData={resumeData} />;
      case AppRoute.COVER_LETTER:
        return <CoverLetterGenerator resumeData={resumeData} />;
      case AppRoute.EMAIL:
        return <EmailAutomation resumeData={resumeData} />;
      case AppRoute.DASHBOARD:
      default:
        return <Dashboard onNavigate={setCurrentRoute} hasResume={!!resumeData} />;
    }
  };

  return (
    <Layout currentRoute={currentRoute} onNavigate={setCurrentRoute}>
      {renderContent()}
    </Layout>
  );
};

export default App;
