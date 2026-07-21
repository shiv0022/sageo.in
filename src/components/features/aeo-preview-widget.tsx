"use client";

import { useState } from "react";
import { Sparkles, Volume2, Copy, Check, Code } from "lucide-react";

export function AeoPreviewWidget() {
  const [question, setQuestion] = useState("What is Answer Engine Optimization?");
  const [answer, setAnswer] = useState("AEO is the practice of optimizing web content for voice assistants and large language models so they can easily retrieve, speak, and cite your answers.");
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const schemaMarkup = `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [{\n    "@type": "Question",\n    "name": "${question}",\n    "acceptedAnswer": {\n      "@type": "Answer",\n      "text": "${answer}"\n    }\n  }]\n}\n</script>`;

  const handleSpeak = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(answer);
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(schemaMarkup);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-600" />
          AEO Speakable & FAQ Schema Simulator
        </h4>
        <span className="text-[10px] bg-purple-50 text-purple-600 font-semibold px-2 py-0.5 rounded-full">
          Voice Search Audit Preview
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Question Heading (H2/H3)</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-gray-200 outline-none focus:border-purple-500 transition-colors font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Answer Paragraph (Conversational)</label>
            <textarea
              rows={3}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-gray-200 outline-none focus:border-purple-500 transition-colors font-sans resize-none"
            />
          </div>

          <button
            onClick={handleSpeak}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              speaking 
                ? "bg-purple-50 text-purple-700 border-purple-250 animate-pulse" 
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Volume2 className="w-4 h-4 text-purple-500" />
            {speaking ? "Speaking Answer..." : "Trigger Voice Assistant TTS"}
          </button>
        </div>

        {/* Output Code Panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Code className="w-3.5 h-3.5" />
              FAQPage Schema Output
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-semibold cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy JSON-LD
                </>
              )}
            </button>
          </div>
          <pre className="text-[10px] bg-gray-950 p-4 rounded-xl font-mono overflow-x-auto max-h-[170px] text-white/90 leading-normal">
            {schemaMarkup}
          </pre>
        </div>
      </div>
    </div>
  );
}
