"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

interface Evaluation {
  question: string;
  answer: string;
  score: number;
  feedback: string;
}

interface InterviewResult {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  studyGuide: string;
}

const ROLES = [
  "Frontend Engineer (React / Next.js)",
  "Backend Engineer (Go / Node.js / Python)",
  "Fullstack Developer",
  "DevOps / SRE Specialist",
  "Mobile App Developer (React Native / Flutter)",
  "QA / Test Automation Engineer",
];

const LEVELS = ["Junior", "Mid-level", "Senior"];

export function InterviewSimulatorClient() {
  const [role, setRole] = useState(ROLES[0]);
  const [level, setLevel] = useState(LEVELS[1]);
  const [stage, setStage] = useState<"setup" | "interview" | "result">("setup");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [round, setRound] = useState(1);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  // Sync API Key status
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    setHasKey(!!savedKey);

    const handleKeyUpdate = () => {
      const updatedKey = localStorage.getItem("gemini_api_key");
      setHasKey(!!updatedKey);
    };

    window.addEventListener("api-key-updated", handleKeyUpdate);
    return () => window.removeEventListener("api-key-updated", handleKeyUpdate);
  }, []);

  const handleStart = async () => {
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) {
      window.dispatchEvent(new Event("open-api-key-modal"));
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setEvaluations([]);
    setResult(null);
    setRound(1);

    const promptText = `You are a technical interviewer at a high-end tech firm. You are interviewing a candidate for a ${level} ${role} role.
    Please ask the first conceptual technical question. Keep it challenging for a ${level} level.
    Return ONLY the question in plain text. No greetings, no intro. Just the question.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { temperature: 0.3 },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to call API.");

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response received.");

      setCurrentQuestion(text.trim());
      setStage("interview");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to start interview.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) return;

    if (!userAnswer.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    const isLastRound = round === 4;

    let promptText = "";

    if (!isLastRound) {
      // Evaluate and get next question
      promptText = `Evaluate the candidate's answer to the technical question.
      Role: ${level} ${role}
      Question: ${currentQuestion}
      Candidate Answer: ${userAnswer}

      Provide your evaluation and grade (out of 10), and ask the NEXT technical question.
      Return the response in this exact JSON structure:
      {
        "score": 8,
        "feedback": "A concise explanation of what they did well and what was missing in their answer.",
        "nextQuestion": "The next technical question to ask."
      }

      Return ONLY raw JSON. Do not include markdown code block formats.`;
    } else {
      // Last round, evaluate final answer and compile global report
      promptText = `Evaluate the candidate's last answer to the technical question.
      Role: ${level} ${role}
      Question: ${currentQuestion}
      Candidate Answer: ${userAnswer}

      This is the final question. Compile the overall feedback.
      Return the response in this exact JSON structure:
      {
        "score": 7,
        "feedback": "Final question feedback.",
        "overallScore": 7.5,
        "strengths": ["Strength 1", "Strength 2"],
        "weaknesses": ["Area of improvement 1", "Area of improvement 2"],
        "studyGuide": "A short study plan to help them improve."
      }

      Return ONLY raw JSON. Do not include markdown code block formats.`;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to submit answer.");

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response received.");

      // Parse Gemini JSON
      const parsed = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());

      // Append current round to evaluations
      const newEval: Evaluation = {
        question: currentQuestion,
        answer: userAnswer,
        score: parsed.score || 0,
        feedback: parsed.feedback || "",
      };

      setEvaluations((prev) => [...prev, newEval]);
      setUserAnswer("");

      if (!isLastRound) {
        setCurrentQuestion(parsed.nextQuestion || "Can you explain clean code practices?");
        setRound((prev) => prev + 1);
      } else {
        // Compile global stats
        setResult({
          overallScore: parsed.overallScore || 7,
          strengths: parsed.strengths || ["Technical articulation"],
          weaknesses: parsed.weaknesses || ["Deep design nuances"],
          studyGuide: parsed.studyGuide || "Practice advanced system designs.",
        });
        setStage("result");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to process answer evaluation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStage("setup");
    handleClear();
  };

  const handleClear = () => {
    setUserAnswer("");
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      {/* Key Warning */}
      {!hasKey && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-500 gap-4 animate-fade-in">
          <div className="flex items-start space-x-3">
            <Icon name="AlertCircle" className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold uppercase tracking-wider">Gemini API Key Needed</h4>
              <p className="text-xs text-muted-foreground">
                To run AI tools, set your Gemini API key. Keys are free to get, stored locally, and never leave your browser.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.dispatchEvent(new Event("open-api-key-modal"))}
            className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 shrink-0 cursor-pointer"
          >
            Setup Key
          </Button>
        </div>
      )}

      {/* Setup Stage */}
      {stage === "setup" && (
        <Card className="border-border max-w-xl mx-auto">
          <div className="px-4 py-3 border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider flex items-center">
            <Icon name="Settings" className="w-4 h-4 mr-2 text-primary" />
            <span>Interview Configurations</span>
          </div>
          <CardContent className="p-6 space-y-5 text-xs">
            {/* Target Role */}
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground">Target Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 px-3 border border-input rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all text-foreground font-medium"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Level */}
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground">Seniority / Level</label>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      level === l
                        ? "bg-primary border-primary text-primary-foreground shadow"
                        : "border-input bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleStart} disabled={loading} className="w-full mt-4">
              {loading ? (
                <>
                  <Icon name="Compass" className="w-4 h-4 mr-2 animate-spin" />
                  <span>Loading Interviewer...</span>
                </>
              ) : (
                <>
                  <Icon name="Sparkles" className="w-4 h-4 mr-2" />
                  <span>Start Interview</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Interview Stage */}
      {stage === "interview" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Interview Frame */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-border">
              <div className="px-4 py-3 border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center">
                  <Icon name="Cpu" className="w-4 h-4 mr-2 text-primary" />
                  <span>AI Recruiter Chat</span>
                </span>
                <span className="text-[10px] text-muted-foreground bg-muted border border-border rounded px-2 py-0.5 font-mono">
                  Question {round} of 4
                </span>
              </div>
              <CardContent className="p-5 space-y-4">
                {/* Question bubble */}
                <div className="flex items-start space-x-3 bg-secondary/10 p-4 rounded-xl border border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon name="Cpu" className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Interviewer</div>
                    <p className="text-xs text-foreground font-medium leading-relaxed select-text">
                      {currentQuestion}
                    </p>
                  </div>
                </div>

                {/* Answer input */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="answer-input">
                    Your Response
                  </label>
                  <Textarea
                    id="answer-input"
                    placeholder="Type your detailed explanation or draft code examples here..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="h-44 text-xs"
                    disabled={loading}
                  />
                </div>
              </CardContent>
              <div className="flex justify-between items-center p-4 border-t border-border bg-muted/10">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Quit Session
                </Button>
                <Button onClick={handleSubmitAnswer} disabled={!userAnswer.trim() || loading} size="sm">
                  {loading ? (
                    <span className="flex items-center space-x-1.5">
                      <Icon name="Compass" className="w-4 h-4 animate-spin" />
                      <span>Grading answer...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1.5">
                      <Icon name="ArrowRight" className="w-4 h-4" />
                      <span>{round === 4 ? "Finish Interview" : "Submit Answer"}</span>
                    </span>
                  )}
                </Button>
              </div>
            </Card>
            {errorMsg && (
              <div className="p-4 border border-destructive/20 bg-destructive/5 text-destructive rounded-lg text-xs leading-relaxed font-mono">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Evaluations sidebar (Live grades) */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-border h-full flex flex-col min-h-[400px]">
              <div className="px-4 py-3 border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider">
                Session History & Grades
              </div>
              <CardContent className="p-4 space-y-4 overflow-auto flex-1">
                {evaluations.length > 0 ? (
                  evaluations.map((item, index) => (
                    <div key={index} className="p-3.5 rounded-lg border border-border/60 bg-card space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">Question {index + 1}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                          Score: {item.score}/10
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground/80 font-mono truncate">Q: {item.question}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed bg-muted/20 p-2 rounded border border-border/40">
                        {item.feedback}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-xs text-muted-foreground/60 min-h-[300px]">
                    <Icon name="History" className="w-6 h-6 mb-2 text-muted-foreground/40" />
                    <p>Evaluations will populate here as you submit answers.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {stage === "result" && result && (
        <Card className="border-border max-w-2xl mx-auto animate-fade-in">
          <div className="px-4 py-3 border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Interview Diagnostic Report</span>
            <span className="text-xs text-muted-foreground">{role}</span>
          </div>
          <CardContent className="p-6 space-y-6 text-xs">
            {/* Total score ring/badge */}
            <div className="text-center space-y-2">
              <div className="inline-flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 border-primary/20 bg-primary/5 shadow-md">
                <span className="text-3xl font-extrabold text-primary leading-none">{result.overallScore}</span>
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mt-1">
                  Score / 10
                </span>
              </div>
              <h3 className="text-sm font-bold text-foreground">Audit Performance Complete</h3>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Evaluated over 4 rigorous conceptual coding blocks and design methodologies.
              </p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/50">
              <div className="space-y-2.5">
                <h4 className="font-bold text-foreground flex items-center">
                  <Icon name="Check" className="w-4 h-4 mr-2 text-emerald-500 shrink-0" />
                  <span>Key Strengths</span>
                </h4>
                <ul className="space-y-1.5 pl-6 list-disc text-muted-foreground leading-relaxed">
                  {result.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-foreground flex items-center">
                  <Icon name="AlertCircle" className="w-4 h-4 mr-2 text-primary shrink-0" />
                  <span>Areas of Improvement</span>
                </h4>
                <ul className="space-y-1.5 pl-6 list-disc text-muted-foreground leading-relaxed">
                  {result.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Study Guide */}
            <div className="space-y-2 pt-4 border-t border-border/50">
              <h4 className="font-bold text-foreground flex items-center">
                <Icon name="Compass" className="w-4 h-4 mr-2 text-primary" />
                <span>Recommended Study Guide</span>
              </h4>
              <p className="text-muted-foreground leading-relaxed bg-muted/20 p-4 rounded-lg border border-border/40 select-text">
                {result.studyGuide}
              </p>
            </div>

            {/* Review of individual questions */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <h4 className="font-bold text-foreground">Detailed Question Breakdown</h4>
              <div className="space-y-3">
                {evaluations.map((item, index) => (
                  <details key={index} className="group border border-border/60 rounded-lg bg-card overflow-hidden">
                    <summary className="flex items-center justify-between p-3 cursor-pointer select-none hover:bg-muted/10">
                      <span className="font-bold text-foreground">
                        Round {index + 1}: {item.score}/10
                      </span>
                      <Icon name="ChevronRight" className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
                    </summary>
                    <div className="p-4 border-t border-border/50 space-y-3 bg-muted/5">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">Question</div>
                        <p className="text-foreground leading-relaxed select-text font-medium">{item.question}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">Your Answer</div>
                        <pre className="text-foreground bg-background border border-border/40 p-2.5 rounded font-mono text-[10px] whitespace-pre-wrap select-all">
                          {item.answer}
                        </pre>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">Feedback</div>
                        <p className="text-muted-foreground leading-relaxed select-text">{item.feedback}</p>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </CardContent>
          <div className="flex justify-end p-4 border-t border-border bg-muted/10">
            <Button onClick={handleReset} className="w-full sm:w-auto">
              Reset and Restart
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
