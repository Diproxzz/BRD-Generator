import React, { useState } from 'react';
import { X, Check, Key, Cpu, Zap, Shield, Save, Loader2 } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, currentConfig, onSaveConfig }) {
  if (!isOpen) return null;

  const [provider, setProvider] = useState(currentConfig?.provider || "groq");
  const [groqKey, setGroqKey] = useState(currentConfig?.groq_api_key || "");
  const [googleKey, setGoogleKey] = useState(currentConfig?.google_api_key || "");
  const [groqModel, setGroqModel] = useState(currentConfig?.groq_model || "qwen/qwen3.8-27b");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSaveConfig({
      provider,
      groq_api_key: groqKey,
      google_api_key: googleKey,
      groq_model: groqModel
    });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#E65100]" />
            <div>
              <h2 className="text-sm font-bold text-gray-900">AI Engine & Provider Settings</h2>
              <p className="text-[11px] text-gray-500">Configured with free high-performance inference</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Active Provider Selector */}
          <div>
            <label className="font-bold text-gray-700 block mb-1.5">
              Active Generation Provider
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setProvider("groq")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === "groq"
                    ? "border-[#E65100] bg-orange-50/70 ring-2 ring-[#E65100]/20"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#E65100]" />
                    Groq (Recommended)
                  </span>
                  {provider === "groq" && <Check className="w-3.5 h-3.5 text-[#E65100]" />}
                </div>
                <p className="text-[10px] text-gray-500">Free, ultra-fast &lt;1s latency with Qwen 3.8 27B</p>
              </button>

              <button
                type="button"
                onClick={() => setProvider("gemini")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === "gemini"
                    ? "border-[#1976D2] bg-blue-50/70 ring-2 ring-[#1976D2]/20"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#1976D2]" />
                    Google Gemini
                  </span>
                  {provider === "gemini" && <Check className="w-3.5 h-3.5 text-[#1976D2]" />}
                </div>
                <p className="text-[10px] text-gray-500">Gemini 2.5 Flash Free Tier</p>
              </button>
            </div>
          </div>

          {/* Groq Model Selector */}
          {provider === "groq" && (
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Groq Model
              </label>
              <select
                value={groqModel}
                onChange={(e) => setGroqModel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-xs bg-white text-gray-800 focus:ring-2 focus:ring-[#E65100]/20"
              >
                <option value="qwen/qwen3.8-27b">qwen/qwen3.8-27b (Fastest & High Quality - Default)</option>
                <option value="openai/gpt-oss-120b">openai/gpt-oss-120b (Deep Reasoning)</option>
                <option value="qwen/qwen3.6-27b">qwen/qwen3.6-27b</option>
              </select>
            </div>
          )}

          {/* Groq API Key */}
          <div>
            <label className="font-bold text-gray-700 flex items-center justify-between mb-1">
              <span>Groq API Key (or set in .env)</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Active & Verified</span>
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="gsk_..."
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 font-mono text-[11px] text-gray-700 bg-gray-50"
              />
            </div>
          </div>

          {/* Google API Key */}
          <div>
            <label className="font-bold text-gray-700 flex items-center justify-between mb-1">
              <span>Google API Key (or set in .env)</span>
              <span className="text-[10px] text-blue-600 font-semibold">Configured</span>
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="AQ.Ab8..."
                value={googleKey}
                onChange={(e) => setGoogleKey(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 font-mono text-[11px] text-gray-700 bg-gray-50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#E65100] hover:bg-[#D84315] text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saved ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{saved ? "Saved!" : "Apply Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
