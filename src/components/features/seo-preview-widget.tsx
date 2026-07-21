"use client";

import { useState } from "react";
import { Monitor, Smartphone, Sparkles } from "lucide-react";

export function SeoPreviewWidget() {
  const [title, setTitle] = useState("Expert Web Development Services | BrandName");
  const [desc, setDesc] = useState("Looking for professional web development? We build modern, responsive, and SEO-optimized web applications designed to scale your business.");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const titleLength = title.length;
  const descLength = desc.length;

  const isTitleOptimal = titleLength >= 30 && titleLength <= 65;
  const isDescOptimal = descLength >= 110 && descLength <= 160;

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Interactive SERP Preview Widget
        </h4>
        <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
          <button
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              device === "desktop" ? "bg-white text-gray-900 shadow-xs" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              device === "mobile" ? "bg-white text-gray-900 shadow-xs" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Editor Inputs */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 flex justify-between">
              <span>Title Tag ({titleLength} chars)</span>
              <span className={isTitleOptimal ? "text-green-600" : "text-yellow-600"}>
                {isTitleOptimal ? "Optimal (30-65)" : "Suboptimal"}
              </span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-gray-200 outline-none focus:border-purple-500 transition-colors font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 flex justify-between">
              <span>Meta Description ({descLength} chars)</span>
              <span className={isDescOptimal ? "text-green-600" : "text-yellow-600"}>
                {isDescOptimal ? "Optimal (110-160)" : "Suboptimal"}
              </span>
            </label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-gray-200 outline-none focus:border-purple-500 transition-colors font-sans resize-none"
            />
          </div>
        </div>

        {/* Real-time preview */}
        <div className="flex flex-col justify-center bg-gray-50 p-4 rounded-xl border border-gray-150">
          <div className={`w-full bg-white p-4 rounded-lg border border-gray-200 shadow-2xs font-sans mx-auto ${
            device === "mobile" ? "max-w-[300px]" : "max-w-[100%]"
          }`}>
            <div className="text-[10px] text-gray-600 mb-0.5 truncate">
              example.com › services
            </div>
            <h5 className="text-[#1a0dab] hover:underline font-medium text-base leading-tight mb-1 font-sans cursor-pointer truncate">
              {title}
            </h5>
            <p className="text-[#4d5156] text-xs leading-normal font-sans line-clamp-3">
              {desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
