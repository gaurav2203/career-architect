import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, CheckCircle, Loader2, Copy, Plus, Trash2, User, Phone, Mail, Globe, Linkedin, Github, Calendar, Link as LinkIcon, FileJson, X, Award } from 'lucide-react';
import { parseResumeAI } from '../services/resume_parser';
import { ResumeData } from '../types';

interface ResumeBuilderProps {
    onResumeUpdate: (data: ResumeData, text: string) => void;
    existingData: ResumeData | null;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ onResumeUpdate, existingData }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [formData, setFormData] = useState<ResumeData | null>(existingData);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showJsonImport, setShowJsonImport] = useState(false);
    const [jsonImportText, setJsonImportText] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const reUploadInputRef = useRef<HTMLInputElement>(null);

    // Sync prop changes to local state
    useEffect(() => {
        if (existingData) {
            setFormData(existingData);
        }
    }, [existingData]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset the input value so the same file can be selected again if needed
        e.target.value = '';

        // Validation
        const MAX_SIZE_MB = 10;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
            return;
        }

        // MimeType Detection fallback
        let mimeType = file.type;
        const ext = file.name.split('.').pop()?.toLowerCase();

        if (!mimeType) {
            if (ext === 'pdf') mimeType = 'application/pdf';
            else if (ext === 'txt') mimeType = 'text/plain';
        }

        // Allowed types: PDF, Plain Text.
        const allowedMimeTypes = ['application/pdf', 'text/plain'];
        const allowedExts = ['pdf', 'txt'];

        if (!allowedMimeTypes.includes(mimeType) && !allowedExts.includes(ext || '')) {
            setError("Invalid file type. Please upload a PDF or TXT file.");
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            // Send raw file to Gemini service
            const parsedData = await parseResumeAI(file, "application/pdf");
            setFormData(parsedData);

            // Notify parent app
            onResumeUpdate(parsedData, "Uploaded File Content");
        } catch (err: any) {
            console.error("Resume analysis error:", err);
            setError(err.message || "Failed to analyze resume. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCopyJson = () => {
        if (!formData) return;
        navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleJsonImport = () => {
        try {
            const parsed = JSON.parse(jsonImportText);
            // Basic validation checking for personalInfo to ensure it's somewhat valid
            if (!parsed.personalInfo) {
                throw new Error("Invalid Resume Data format");
            }
            setFormData(parsed);
            onResumeUpdate(parsed, "Imported JSON");
            setShowJsonImport(false);
            setJsonImportText('');
            setError(null);
        } catch (e) {
            setError("Invalid JSON format. Please check your input.");
        }
    };

    // Generic change handler for top-level fields
    const updateField = (field: keyof ResumeData, value: any) => {
        if (!formData) return;
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        onResumeUpdate(newData, "Form Updated");
    };

    const updatePersonalInfo = (field: string, value: string) => {
        if (!formData) return;
        const newData = {
            ...formData,
            personalInfo: {
                ...formData.personalInfo,
                [field]: value
            }
        };
        setFormData(newData);
        onResumeUpdate(newData, "Form Updated");
    };

    // Add Item Handler
    const addItem = (section: 'experience' | 'education' | 'projects' | 'certificates') => {
        if (!formData) return;

        let newItem: any;
        if (section === 'experience') {
            newItem = { role: '', company: '', startMonth: '', startYear: '', endMonth: '', endYear: '', details: [] };
        } else if (section === 'education') {
            newItem = { degree: '', school: '', startMonth: '', startYear: '', endMonth: '', endYear: '' };
        } else if (section === 'projects') {
            newItem = { name: '', description: '', tech: [], link: '' };
        } else {
            newItem = { name: '', issuer: '', validTill: '', link: '' };
        }

        const newData = {
            ...formData,
            [section]: [...(formData[section] || []), newItem]
        };
        setFormData(newData);
        onResumeUpdate(newData, "Item Added");
    };

    // Remove Item Handler
    const removeItem = (section: 'experience' | 'education' | 'projects' | 'certificates', index: number) => {
        if (!formData) return;
        const list = [...(formData[section] as any[])];
        list.splice(index, 1);

        const newData = {
            ...formData,
            [section]: list
        };
        setFormData(newData);
        onResumeUpdate(newData, "Item Removed");
    };

    // Specific handlers for array updates
    const updateExperience = (index: number, field: string, value: any) => {
        if (!formData) return;
        const newExp = [...formData.experience];
        newExp[index] = { ...newExp[index], [field]: value };
        updateField('experience', newExp);
    };

    const updateEducation = (index: number, field: string, value: any) => {
        if (!formData) return;
        const newEdu = [...formData.education];
        newEdu[index] = { ...newEdu[index], [field]: value };
        updateField('education', newEdu);
    };

    const updateProject = (index: number, field: string, value: any) => {
        if (!formData) return;
        const newProj = [...formData.projects];
        newProj[index] = { ...newProj[index], [field]: value };
        updateField('projects', newProj);
    };

    const updateCertificate = (index: number, field: string, value: any) => {
        if (!formData) return;
        const newCert = [...(formData.certificates || [])];
        newCert[index] = { ...newCert[index], [field]: value };
        updateField('certificates', newCert);
    };

    // Helper for modal
    const ImportJsonModal = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center">
                        <FileJson className="mr-2 text-indigo-600" size={20} />
                        Import Resume JSON
                    </h3>
                    <button onClick={() => setShowJsonImport(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 flex-1 overflow-hidden flex flex-col">
                    <p className="text-sm text-slate-500 mb-4">
                        Paste your resume JSON data below. This is useful for restoring previous sessions or importing data from other tools.
                    </p>
                    <textarea
                        className="w-full flex-1 p-4 border border-slate-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none bg-slate-50"
                        value={jsonImportText}
                        onChange={(e) => setJsonImportText(e.target.value)}
                        placeholder={`{
  "personalInfo": {
    "name": "John Doe",
    ...
  },
  ...
}`}
                    />
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50 rounded-b-xl">
                    <button
                        onClick={() => setShowJsonImport(false)}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleJsonImport}
                        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                    >
                        Import Data
                    </button>
                </div>
            </div>
        </div>
    );

    // Render Logic
    if (!formData && !isAnalyzing) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Resume Intelligence</h2>
                    <p className="text-slate-500 mt-1">Upload your resume (PDF) to extract structured data using Gemini AI.</p>
                </div>

                <div className="flex flex-col gap-4">
                    <div
                        className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:bg-slate-50 transition-all cursor-pointer relative"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                            <Upload size={32} />
                        </div>
                        <h3 className="text-xl font-medium text-slate-900">Upload Resume</h3>
                        <p className="text-slate-500 mt-2 mb-6 max-w-sm">Drag and drop your PDF here, or click to browse. Files are processed securely by Gemini.</p>

                        <button className="relative z-10 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                            Select PDF File
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.txt"
                            onChange={handleFileUpload}
                        />
                        {error && (
                            <div className="mt-6 text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm" onClick={(e) => e.stopPropagation()}>{error}</div>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={() => setShowJsonImport(true)}
                            className="text-indigo-600 text-sm font-medium hover:text-indigo-800 hover:underline flex items-center"
                        >
                            <FileJson size={16} className="mr-2" />
                            Already have the data? Import JSON directly
                        </button>
                    </div>
                </div>

                {showJsonImport && <ImportJsonModal />}
            </div>
        );
    }

    if (isAnalyzing) {
        return (
            <div className="h-[600px] flex flex-col items-center justify-center space-y-6 bg-white rounded-xl border border-slate-200">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
                <div className="text-center">
                    <h3 className="text-lg font-medium text-slate-900">Analyzing Document...</h3>
                    <p className="text-slate-500 mt-1">Extracting data with Gemini Vision...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Edit Resume Data</h2>
                    <p className="text-slate-500 mt-1">Refine the extracted information below.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowJsonImport(true)}
                        className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center transition-colors"
                    >
                        <FileJson size={16} className="mr-2" />
                        <span>Import JSON</span>
                    </button>
                    <label className="cursor-pointer bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center transition-colors">
                        <Upload size={16} className="mr-2" />
                        <span>Re-upload</span>
                        <input
                            ref={reUploadInputRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.txt"
                            onChange={handleFileUpload}
                        />
                    </label>
                    <button
                        onClick={handleCopyJson}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center shadow-sm transition-colors"
                    >
                        {copied ? <CheckCircle size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                        {copied ? 'Copied!' : 'Copy JSON'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm mb-4 border border-red-200">
                    {error}
                </div>
            )}

            <div className="space-y-8">

                {/* Personal Information */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                        <User size={18} className="mr-2 text-indigo-600" /> Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-slate-400" size={14} />
                                <input
                                    className="w-full pl-9 p-2 border border-slate-200 rounded text-sm bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={formData?.personalInfo?.name || ''}
                                    onChange={(e) => updatePersonalInfo('name', e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 text-slate-400" size={14} />
                                <input
                                    className="w-full pl-9 p-2 border border-slate-200 rounded text-sm bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={formData?.personalInfo?.email || ''}
                                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 text-slate-400" size={14} />
                                <input
                                    className="w-full pl-9 p-2 border border-slate-200 rounded text-sm bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={formData?.personalInfo?.phone || ''}
                                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                                    placeholder="+1 555-0123"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Website</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 text-slate-400" size={14} />
                                <input
                                    className="w-full pl-9 p-2 border border-slate-200 rounded text-sm bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={formData?.personalInfo?.website || ''}
                                    onChange={(e) => updatePersonalInfo('website', e.target.value)}
                                    placeholder="portfolio.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">LinkedIn</label>
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-2.5 text-slate-400" size={14} />
                                <input
                                    className="w-full pl-9 p-2 border border-slate-200 rounded text-sm bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={formData?.personalInfo?.linkedin || ''}
                                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                                    placeholder="linkedin.com/in/john"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">GitHub</label>
                            <div className="relative">
                                <Github className="absolute left-3 top-2.5 text-slate-400" size={14} />
                                <input
                                    className="w-full pl-9 p-2 border border-slate-200 rounded text-sm bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={formData?.personalInfo?.github || ''}
                                    onChange={(e) => updatePersonalInfo('github', e.target.value)}
                                    placeholder="github.com/john"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                        <FileText size={18} className="mr-2 text-indigo-600" /> Summary
                    </h3>
                    <textarea
                        value={formData?.summary}
                        onChange={(e) => updateField('summary', e.target.value)}
                        className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
                        placeholder="Professional summary..."
                    />
                </div>

                {/* Experience */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-900 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> Experience
                        </h3>
                        <button
                            onClick={() => addItem('experience')}
                            className="text-xs text-indigo-600 font-medium hover:underline flex items-center"
                        >
                            <Plus size={14} className="mr-1" /> Add Role
                        </button>
                    </div>
                    <div className="space-y-6">
                        {formData?.experience?.map((exp, i) => (
                            <div key={i} className="relative p-4 bg-slate-50 rounded-lg border border-slate-100 group">
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <input
                                        className="p-2 border border-slate-200 rounded text-sm font-medium bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                        value={exp.role}
                                        onChange={(e) => updateExperience(i, 'role', e.target.value)}
                                        placeholder="Job Title"
                                    />
                                    <input
                                        className="p-2 border border-slate-200 rounded text-sm bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                        value={exp.company}
                                        onChange={(e) => updateExperience(i, 'company', e.target.value)}
                                        placeholder="Company"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div className="flex space-x-2">
                                        <input
                                            className="w-full p-2 border border-slate-200 rounded text-xs text-slate-500 bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                            value={exp.startMonth}
                                            onChange={(e) => updateExperience(i, 'startMonth', e.target.value)}
                                            placeholder="Start Month"
                                        />
                                        <input
                                            className="w-full p-2 border border-slate-200 rounded text-xs text-slate-500 bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                            value={exp.startYear}
                                            onChange={(e) => updateExperience(i, 'startYear', e.target.value)}
                                            placeholder="Start Year"
                                        />
                                    </div>
                                    <div className="flex space-x-2">
                                        <input
                                            className="w-full p-2 border border-slate-200 rounded text-xs text-slate-500 bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                            value={exp.endMonth}
                                            onChange={(e) => updateExperience(i, 'endMonth', e.target.value)}
                                            placeholder="End Month"
                                        />
                                        <input
                                            className="w-full p-2 border border-slate-200 rounded text-xs text-slate-500 bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                            value={exp.endYear}
                                            onChange={(e) => updateExperience(i, 'endYear', e.target.value)}
                                            placeholder="End Year"
                                        />
                                    </div>
                                </div>

                                <textarea
                                    className="w-full h-24 p-2 border border-slate-200 rounded text-sm text-slate-600 resize-none bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={exp.details?.join('\n')}
                                    onChange={(e) => updateExperience(i, 'details', e.target.value.split('\n'))}
                                    placeholder="Bullet points (one per line)"
                                />
                                <button
                                    onClick={() => removeItem('experience', i)}
                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Projects */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-900 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span> Projects
                        </h3>
                        <button
                            onClick={() => addItem('projects')}
                            className="text-xs text-indigo-600 font-medium hover:underline flex items-center"
                        >
                            <Plus size={14} className="mr-1" /> Add Project
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData?.projects?.map((proj, i) => (
                            <div key={i} className="relative p-4 bg-slate-50 rounded-lg border border-slate-100 group">
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <input
                                        className="p-2 border border-slate-200 rounded text-sm font-medium bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                        value={proj.name}
                                        onChange={(e) => updateProject(i, 'name', e.target.value)}
                                        placeholder="Project Name"
                                    />
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-2.5 text-slate-400" size={14} />
                                        <input
                                            className="w-full pl-9 p-2 border border-slate-200 rounded text-sm bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                            value={proj.link || ''}
                                            onChange={(e) => updateProject(i, 'link', e.target.value)}
                                            placeholder="Project URL (e.g. github.com/demo)"
                                        />
                                    </div>
                                </div>
                                <textarea
                                    className="w-full h-20 p-2 border border-slate-200 rounded text-sm text-slate-600 mb-2 resize-none bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={proj.description}
                                    onChange={(e) => updateProject(i, 'description', e.target.value)}
                                    placeholder="Project description..."
                                />
                                <input
                                    className="w-full p-2 border border-slate-200 rounded text-xs text-slate-500 bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={proj.tech?.join(', ')}
                                    onChange={(e) => updateProject(i, 'tech', e.target.value.split(', '))}
                                    placeholder="Tech Stack (comma separated)"
                                />
                                <button
                                    onClick={() => removeItem('projects', i)}
                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Certificates */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-900 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span> Certificates
                        </h3>
                        <button
                            onClick={() => addItem('certificates')}
                            className="text-xs text-indigo-600 font-medium hover:underline flex items-center"
                        >
                            <Plus size={14} className="mr-1" /> Add Certificate
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData?.certificates?.map((cert, i) => (
                            <div key={i} className="relative p-4 bg-slate-50 rounded-lg border border-slate-100 group">
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <div className="relative">
                                        <Award className="absolute left-3 top-2.5 text-slate-400" size={14} />
                                        <input
                                            className="w-full pl-9 p-2 border border-slate-200 rounded text-sm font-medium bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                            value={cert.name}
                                            onChange={(e) => updateCertificate(i, 'name', e.target.value)}
                                            placeholder="Certificate Name"
                                        />
                                    </div>
                                    <input
                                        className="p-2 border border-slate-200 rounded text-sm bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                        value={cert.issuer}
                                        onChange={(e) => updateCertificate(i, 'issuer', e.target.value)}
                                        placeholder="Issuer (e.g. AWS, Coursera)"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        className="p-2 border border-slate-200 rounded text-xs text-slate-500 bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                        value={cert.validTill}
                                        onChange={(e) => updateCertificate(i, 'validTill', e.target.value)}
                                        placeholder="Valid Till / Date"
                                    />
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-2.5 text-slate-400" size={14} />
                                        <input
                                            className="w-full pl-9 p-2 border border-slate-200 rounded text-xs bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                            value={cert.link || ''}
                                            onChange={(e) => updateCertificate(i, 'link', e.target.value)}
                                            placeholder="Certificate URL (optional)"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeItem('certificates', i)}
                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Skills
                    </h3>
                    <textarea
                        value={formData?.skills?.join(', ')}
                        onChange={(e) => updateField('skills', e.target.value.split(', '))}
                        className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
                        placeholder="Python, React, TypeScript..."
                    />
                    <p className="text-xs text-slate-400 mt-2">Separate skills with commas</p>
                </div>

                {/* Education */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-900 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span> Education
                        </h3>
                        <button
                            onClick={() => addItem('education')}
                            className="text-xs text-indigo-600 font-medium hover:underline flex items-center"
                        >
                            <Plus size={14} className="mr-1" /> Add Education
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData?.education?.map((edu, i) => (
                            <div key={i} className="relative p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                                <input
                                    className="w-full p-2 border border-slate-200 rounded text-sm font-medium mb-2 bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={edu.school}
                                    onChange={(e) => updateEducation(i, 'school', e.target.value)}
                                    placeholder="School"
                                />
                                <input
                                    className="w-full p-2 border border-slate-200 rounded text-xs bg-white focus:ring-1 focus:ring-indigo-500 outline-none mb-2"
                                    value={edu.degree}
                                    onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                                    placeholder="Degree"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex space-x-2">
                                        <input
                                            className="w-full p-2 border border-slate-200 rounded text-xs bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                            value={edu.startMonth}
                                            onChange={(e) => updateEducation(i, 'startMonth', e.target.value)}
                                            placeholder="Start Month"
                                        />
                                        <input
                                            className="w-full p-2 border border-slate-200 rounded text-xs bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                            value={edu.startYear}
                                            onChange={(e) => updateEducation(i, 'startYear', e.target.value)}
                                            placeholder="Start Year"
                                        />
                                    </div>
                                    <div className="flex space-x-2">
                                        <input
                                            className="w-full p-2 border border-slate-200 rounded text-xs bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                            value={edu.endMonth}
                                            onChange={(e) => updateEducation(i, 'endMonth', e.target.value)}
                                            placeholder="End Month"
                                        />
                                        <input
                                            className="w-full p-2 border border-slate-200 rounded text-xs bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                            value={edu.endYear}
                                            onChange={(e) => updateEducation(i, 'endYear', e.target.value)}
                                            placeholder="End Year"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeItem('education', i)}
                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showJsonImport && <ImportJsonModal />}
        </div>
    );
};

export default ResumeBuilder;