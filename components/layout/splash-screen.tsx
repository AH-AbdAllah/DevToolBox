"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check session storage to prevent showing splash on every page reload/click
    const shown = sessionStorage.getItem("splash_screen_shown");
    if (shown) {
      return;
    }

    setVisible(true);
    document.body.style.overflow = "hidden";

    // Dynamic boot logs matching progress percentage
    const logTimeline = [
      { prg: 5, msg: "[ info ] loading devtoolbox intelligence engine..." },
      { prg: 25, msg: "[  ok  ] sandbox terminal modules synchronized" },
      { prg: 50, msg: "[  ok  ] secure client-side database bindings ready" },
      { prg: 75, msg: "[  ok  ] local gemini AI model pipeline initialized" },
      { prg: 95, msg: "[ ready ] system ready. launching command palette workspace..." },
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 4) + 1;
        const currentPrg = Math.min(next, 100);

        // Check and append logs matching this progress milestone
        logTimeline.forEach((item) => {
          if (currentPrg >= item.prg && !logs.includes(item.msg)) {
            setLogs((prevLogs) => {
              if (prevLogs.includes(item.msg)) return prevLogs;
              return [...prevLogs, item.msg];
            });
          }
        });

        if (currentPrg >= 100) {
          clearInterval(interval);
          // Trigger fade out transition after 100% complete
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
              setVisible(false);
              document.body.style.overflow = "unset";
              sessionStorage.setItem("splash_screen_shown", "true");
            }, 300); // match CSS transition duration
          }, 350);
          return 100;
        }
        return currentPrg;
      });
    }, 35);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = "unset";
    };
  }, [logs]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060a0f] text-foreground select-none transition-opacity duration-300 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Mesh Glow Background */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#00f0ff]/10 blur-[100px] animate-pulse pointer-events-none" />
      
      <div className="relative flex flex-col items-center max-w-sm w-full px-6 space-y-8 text-center">
        {/* Core Code Block SVG Logo with neon pulse */}
        <div className="relative">
          {/* Inner pulsing neon border */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#00f0ff] to-indigo-500 blur-md opacity-50 animate-pulse" />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-xl bg-[#0d1520] border border-[#142235] shadow-lg animate-bounce">
            <svg
              className="w-9 h-9 text-[#00f0ff]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
              <line x1="14" y1="4" x2="10" y2="20" className="text-indigo-400" />
            </svg>
          </div>
        </div>

        {/* Shimmering Text Brand */}
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Dev<span className="text-[#00f0ff]">ToolBox</span>
          </h2>
          <p className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase">
            Universal Intelligence Center
          </p>
        </div>

        {/* Progress neon bar container */}
        <div className="w-full space-y-2">
          <div className="w-full h-1.5 bg-[#0d1520] rounded-full overflow-hidden border border-[#142235] p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#00f0ff] to-[#0891b2] rounded-full shadow-[0_0_8px_#00f0ff] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 font-bold">
            <span>SYS_INIT</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Terminal Boot Log Screen */}
        <div className="w-full h-32 p-3 bg-black/60 rounded-lg border border-[#142235] text-left font-mono text-[9px] text-[#00f0ff]/80 overflow-y-auto space-y-1 scrollbar-none shadow-inner">
          {logs.map((log, idx) => (
            <div key={idx} className="whitespace-pre truncate animate-[fadeIn_0.15s_ease-out]">
              {log}
            </div>
          ))}
          {progress < 100 && (
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-3 bg-[#00f0ff] animate-[pulse_0.8s_infinite]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
