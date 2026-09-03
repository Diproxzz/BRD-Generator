import React from 'react';
import { Check, Sparkles, Bot, FileText, UploadCloud } from 'lucide-react';

export default function StepTracker({ activeStep, onStepClick, stepStatus = {} }) {
  const steps = [
    {
      id: 1,
      label: "Upload Input",
      icon: UploadCloud,
    },
    {
      id: 2,
      label: "Smart Context & Prompt",
      icon: Sparkles,
    },
    {
      id: 3,
      label: "Dynamic & Action Agent",
      icon: Bot,
    },
    {
      id: 4,
      label: "Final Report",
      icon: FileText,
    },
  ];

  return (
    <div className="mx-6 my-3 bg-[#E8E8E6]/80 rounded-2xl p-5 border border-gray-300/70 shadow-sm">
      <p className="text-center text-xs font-medium text-gray-600 mb-6 tracking-wide">
        Follow the steps below to complete your data pipeline workflow
      </p>

      <div className="relative max-w-4xl mx-auto px-8">
        {/* Continuous background line */}
        <div className="absolute top-5 left-16 right-16 h-[2px] bg-gray-300 -translate-y-1/2 z-0" />

        {/* Dynamic active line */}
        <div 
          className="absolute top-5 left-16 h-[2px] bg-[#E65100] -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
          style={{
            width: `${((activeStep - 1) / (steps.length - 1)) * 100}%`
          }}
        />

        {/* Step circles */}
        <div className="relative z-10 flex justify-between items-start">
          {steps.map((step) => {
            const isCompleted = activeStep > step.id;
            const isActive = activeStep === step.id;
            const Icon = step.icon;

            return (
              <div 
                key={step.id} 
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => onStepClick && onStepClick(step.id)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                    isCompleted
                      ? 'bg-[#E65100] text-white'
                      : isActive
                      ? 'bg-[#E65100] text-white ring-4 ring-[#E65100]/20'
                      : 'bg-white text-gray-400 border border-gray-300 group-hover:border-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-5 h-5 stroke-[2]" />
                  )}
                </div>

                <span
                  className={`mt-2.5 text-xs text-center font-medium max-w-[110px] transition-colors leading-tight ${
                    isActive
                      ? 'text-gray-900 font-semibold'
                      : isCompleted
                      ? 'text-gray-700'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
