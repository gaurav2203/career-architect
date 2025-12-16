import React from 'react';
import { MessageSquare } from 'lucide-react';

const InterviewPrep: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 text-center">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4">
        <MessageSquare size={32} />
      </div>
      <h3 className="text-xl font-medium text-slate-900">Portfolio Generator</h3>
      <p className="text-slate-500 mt-2">
        AI-driven Portfolio Generator are coming soon.
      </p>
    </div>
  );
};

export default InterviewPrep;
