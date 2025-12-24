import React, { useState } from 'react';
import { PenTool, Copy, Check, Briefcase } from 'lucide-react';
import { ResumeData } from '../types';
import { CoverLetter } from '../types';
import { generateCoverLetterAI } from '../services/coverletter_ai';

interface CoverLetterGeneratorProps {
  resumeData: ResumeData | null;
}

const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({ resumeData }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!resumeData || !jobDescription) return;
    setIsGenerating(true);
    try {
      const coverLetterInput: CoverLetter = {
        resume_data: resumeData,
        job_description: jobDescription
      };
      const response = await generateCoverLetterAI(coverLetterInput);
      setGeneratedLetter(response.cover_letter || response);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!resumeData) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
        <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
        <h3 className="text-lg font-medium text-slate-900">Resume Data Missing</h3>
        <p className="text-slate-500 mt-1">Please process your resume in the Resume Builder first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Cover Letter Generator</h2>
        <p className="text-slate-500 mt-1">Tailor your application to any job description instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Job Description</label>
          <textarea
            className="w-full h-[500px] p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm text-slate-700"
            placeholder="Paste the full job description here (Responsibilities, Requirements, About the company)..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !jobDescription.trim()}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isGenerating ? 'Drafting Letter...' : 'Generate Cover Letter'}
          </button>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 mb-4">Generated Letter</label>
          {generatedLetter ? (
            <div className="relative h-[500px]">
              <textarea
                className="w-full h-full p-6 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={generatedLetter}
                onChange={(e) => setGeneratedLetter(e.target.value)}
              />
              <button
                onClick={copyToClipboard}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                title="Copy to Clipboard"
              >
                {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
              </button>
            </div>
          ) : (
            <div className="h-[500px] bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
              <PenTool size={48} className="mb-4 opacity-20" />
              <p>AI will draft your letter here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
