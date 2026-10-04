"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Phone, MessageCircle, Check } from "lucide-react";
import { quickUpdateQuestionAction } from "./actions";

export function MeetingMode({
  isOpen,
  onClose,
  questions,
  vendorName,
  vendorPhone,
  vendorWhatsapp,
}: {
  isOpen: boolean;
  onClose: () => void;
  questions: any[];
  vendorName?: string;
  vendorPhone?: string | null;
  vendorWhatsapp?: string | null;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savingId, setSavingId] = useState<string | null>(null);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  const handleQuickStatus = async (status: string) => {
    setSavingId(currentQ.id);
    await quickUpdateQuestionAction(currentQ.id, { status });
    setSavingId(null);
  };

  const handleSaveAnswer = async (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const newAnswer = e.target.value;
    if (newAnswer !== currentQ.answer) {
      setSavingId(currentQ.id);
      await quickUpdateQuestionAction(currentQ.id, { answer: newAnswer });
      setSavingId(null);
    }
  };

  const handleToggleFollowUp = async () => {
    setSavingId(currentQ.id);
    const newStatus = !currentQ.followUpRequired;
    await quickUpdateQuestionAction(currentQ.id, { 
      followUpRequired: newStatus,
      status: newStatus ? "FOLLOW_UP" : currentQ.status
    });
    setSavingId(null);
  };

  const answeredCount = questions.filter(q => q.status === "ANSWERED").length;
  const followUpCount = questions.filter(q => q.status === "FOLLOW_UP" || q.followUpRequired).length;

  return (
    <div className="fixed inset-0 z-50 bg-[#11141d] flex flex-col md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-[#161d2d] md:rounded-t-3xl">
        <div>
          <h2 className="font-semibold text-white">Meeting Mode</h2>
          {vendorName && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-emerald-400">{vendorName}</span>
              <div className="flex items-center gap-1">
                {vendorPhone && (
                  <a href={`tel:${vendorPhone}`} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
                {vendorWhatsapp && (
                  <a href={`https://wa.me/${vendorWhatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress */}
      <div className="bg-[#1e2333] p-3 text-xs flex justify-between items-center text-white/60 shrink-0 border-b border-white/5">
        <span>{currentIndex + 1} of {questions.length} Questions</span>
        <div className="flex gap-4">
          <span>Answered: <strong className="text-emerald-400">{answeredCount}</strong></span>
          <span>Follow-up: <strong className="text-orange-400">{followUpCount}</strong></span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center custom-scrollbar">
        <div className="w-full max-w-2xl bg-white/[0.02] border border-white/10 rounded-2xl p-5 md:p-8 relative mt-4 shadow-xl">
          {savingId === currentQ.id && (
            <div className="absolute top-4 right-4 text-xs text-emerald-400 flex items-center gap-1 animate-pulse">
              <Check className="w-3 h-3" /> Saving...
            </div>
          )}

          <div className="text-xs font-semibold text-emerald-400/80 tracking-wider uppercase mb-3 border border-emerald-500/20 bg-emerald-500/10 inline-block px-2 py-1 rounded">
            {currentQ.category}
          </div>

          <h3 className="text-xl md:text-2xl font-serif text-white mb-6 leading-relaxed">
            {currentQ.question}
          </h3>

          {currentQ.internalNote && (
            <div className="mb-6 p-3 rounded-lg bg-white/5 text-sm text-white/60 italic border-l-2 border-white/20">
              Note: {currentQ.internalNote}
            </div>
          )}

          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium text-white/70 uppercase">Answer</label>
            <textarea
              key={currentQ.id} // force re-render with new default value when moving next/prev
              defaultValue={currentQ.answer || ""}
              onBlur={handleSaveAnswer}
              placeholder="Type answer here..."
              rows={4}
              className="w-full bg-[#161d2d] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500/50 resize-none shadow-inner"
            />
          </div>

          <div className="flex flex-wrap gap-2 md:gap-4 mt-6 pt-6 border-t border-white/10">
            <button 
              onClick={() => handleQuickStatus("ASKED")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors border ${currentQ.status === 'ASKED' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-white/5 text-white/70 hover:bg-white/10 border-transparent'}`}
            >
              Mark Asked
            </button>
            <button 
              onClick={() => handleQuickStatus("ANSWERED")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors border ${currentQ.status === 'ANSWERED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-white/70 hover:bg-white/10 border-transparent'}`}
            >
              Mark Answered
            </button>
            <button 
              onClick={handleToggleFollowUp}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors border ${(currentQ.followUpRequired || currentQ.status === 'FOLLOW_UP') ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-white/5 text-white/70 hover:bg-white/10 border-transparent'}`}
            >
              Follow-up
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-4 md:p-6 bg-[#161d2d] border-t border-white/10 flex justify-between items-center shrink-0 md:rounded-b-3xl">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">Previous</span>
        </button>
        
        <button
          onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
          disabled={currentIndex === questions.length - 1}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-30 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <span className="hidden sm:inline font-medium">Next Question</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
