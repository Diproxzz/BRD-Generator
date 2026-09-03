import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, Bot, Lightbulb, FileSpreadsheet, FileCode, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

export default function Step1Upload({ 
  files = [], 
  onUploadFiles, 
  onDeleteFile, 
  onLoadSample, 
  onStartWorkflow, 
  onOpenAgents,
  isLoading = false 
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles(Array.from(e.target.files));
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    }
    if (['png', 'jpg', 'jpeg'].includes(ext)) {
      return <FileCode className="w-4 h-4 text-purple-600" />;
    }
    return <FileText className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="mx-6 my-4">
      {/* Main Upload Files Card */}
      <div className="bg-[#E8E8E6]/80 rounded-2xl p-6 border border-gray-300/70 shadow-sm relative">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900">Upload Files</h2>
            <span title="Supported formats: DOCX, PDF, XLSX, CSV, TXT, PNG, JPG (OCR)">
              <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400 cursor-pointer" />
            </span>
          </div>

          {/* Agents Pill Button (Matches screenshot top right inside card) */}
          <button
            onClick={onOpenAgents}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1976D2] hover:bg-[#1565C0] text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Agents</span>
          </button>
        </div>

        {/* Large Dashed Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl py-16 px-6 flex flex-col items-center justify-center transition-all cursor-pointer ${
            isDragging
              ? 'border-[#E65100] bg-[#E65100]/5 scale-[0.99]'
              : 'border-gray-400/60 hover:border-gray-500 bg-transparent'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".docx,.pdf,.xlsx,.xls,.csv,.txt,.md,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center text-gray-500 mb-3">
            <UploadCloud className="w-8 h-8 stroke-[1.5]" />
          </div>

          <p className="text-xs text-gray-700 font-medium">
            Drag & drop files here, or{' '}
            <span className="text-[#E65100] font-semibold hover:underline">
              browse
            </span>
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            Accepts .docx, .pdf, .xlsx, .csv, .txt, .png, .jpg (Multi-file enabled)
          </p>
        </div>

        {/* 1-Click Sample Data Quick-Loader */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-white/70 border border-gray-200 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E65100]" />
            <span className="text-xs font-medium text-gray-700">
              Need realistic BA files to test immediately?
            </span>
          </div>
          <button
            onClick={onLoadSample}
            disabled={isLoading}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-100/70 hover:bg-orange-100 text-[#E65100] border border-orange-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>Load Sample Project (Payment Pipeline)</span>
          </button>
        </div>

        {/* Uploaded Files Chips List */}
        {files.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Source Materials ({files.length})
              </span>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ready for AI Extraction
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {files.map((file) => (
                <div
                  key={file.id || file.name}
                  className="flex items-center justify-between bg-white border border-gray-200/90 rounded-lg p-2.5 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {getFileIcon(file.name)}
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-gray-800 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[10px] text-gray-600">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile(file.id);
                    }}
                    className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom-Right Start Workflow Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={onStartWorkflow}
          disabled={files.length === 0 || isLoading}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
            files.length > 0 && !isLoading
              ? 'bg-[#E65100] hover:bg-[#D84315] text-white cursor-pointer active:scale-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Start Workflow</span>
        </button>
      </div>
    </div>
  );
}
