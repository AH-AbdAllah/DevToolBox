"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { WORDLIST } from "@/lib/wordlist";

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  bgColor: string;
  entropy: number;
  timeToCrack: string;
}

export function PasswordClient() {
  const [mode, setMode] = useState<"password" | "passphrase">("password");
  const [password, setPassword] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  // Password Options
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);

  // Passphrase Options
  const [wordCount, setWordCount] = useState(5);
  const [separator, setSeparator] = useState("-");

  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    label: "Weak",
    color: "bg-destructive",
    bgColor: "text-destructive",
    entropy: 0,
    timeToCrack: "instant",
  });

  const { isCopied, copy } = useCopyToClipboard();

  // CSPRNG Random Index Generator
  const getSecureRandomIndex = (max: number): number => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  };

  // 1. Password Strength Calculation
  const evaluateStrength = useCallback(
    (pwd: string): PasswordStrength => {
      if (!pwd) {
        return {
          score: 0,
          label: "Too Short",
          color: "bg-muted",
          bgColor: "text-muted-foreground",
          entropy: 0,
          timeToCrack: "n/a",
        };
      }

      let entropy = 0;
      if (mode === "password") {
        let poolSize = 0;
        if (/[A-Z]/.test(pwd)) poolSize += 26;
        if (/[a-z]/.test(pwd)) poolSize += 26;
        if (/[0-9]/.test(pwd)) poolSize += 10;
        // Match symbols roughly
        const symbolCount = (pwd.match(/[^A-Za-z0-9]/g) || []).length;
        if (symbolCount > 0) poolSize += 32;

        // Fallback poolSize to length of pool if no characters matched
        if (poolSize === 0) poolSize = 10;

        entropy = pwd.length * Math.log2(poolSize);
      } else {
        // Passphrase entropy: count of words * log2(length of wordlist)
        // Wordlist length is 250
        const words = pwd.split(separator).filter(Boolean);
        entropy = words.length * Math.log2(WORDLIST.length);
      }

      // Convert entropy to score & labels
      let score = 0;
      let label = "Very Weak";
      let color = "bg-destructive";
      let bgColor = "text-destructive";

      if (entropy >= 28 && entropy < 45) {
        score = 1;
        label = "Weak";
        color = "bg-orange-500";
        bgColor = "text-orange-500";
      } else if (entropy >= 45 && entropy < 65) {
        score = 2;
        label = "Medium";
        color = "bg-yellow-500";
        bgColor = "text-yellow-500";
      } else if (entropy >= 65 && entropy < 85) {
        score = 3;
        label = "Strong";
        color = "bg-emerald-500";
        bgColor = "text-emerald-500";
      } else if (entropy >= 85) {
        score = 4;
        label = "Excellent";
        color = "bg-primary";
        bgColor = "text-primary";
      }

      // Time-to-crack estimation (guessing at 100 Billion attempts/sec)
      const attemptsPerSec = 1e11;
      const totalCombinations = Math.pow(2, entropy);
      const secondsToCrack = (0.5 * totalCombinations) / attemptsPerSec;

      let timeToCrack = "Instant";
      if (secondsToCrack > 31536000 * 1e9) {
        timeToCrack = `${(secondsToCrack / (31536000 * 1e9)).toFixed(0)} Billion Years`;
      } else if (secondsToCrack > 31536000 * 1e6) {
        timeToCrack = `${(secondsToCrack / (31536000 * 1e6)).toFixed(0)} Million Years`;
      } else if (secondsToCrack > 31536000) {
        timeToCrack = `${(secondsToCrack / 31536000).toFixed(0)} Years`;
      } else if (secondsToCrack > 86400) {
        timeToCrack = `${(secondsToCrack / 86400).toFixed(0)} Days`;
      } else if (secondsToCrack > 3600) {
        timeToCrack = `${(secondsToCrack / 3600).toFixed(0)} Hours`;
      } else if (secondsToCrack > 60) {
        timeToCrack = `${(secondsToCrack / 60).toFixed(0)} Minutes`;
      } else if (secondsToCrack > 0.01) {
        timeToCrack = `${secondsToCrack.toFixed(2)} Seconds`;
      }

      return { score, label, color, bgColor, entropy: Math.round(entropy), timeToCrack };
    },
    [mode, separator]
  );

  // 2. CSPRNG Password Generator
  const generatePassword = useCallback(() => {
    let generated = "";

    if (mode === "password") {
      let uppercasePool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let lowercasePool = "abcdefghijklmnopqrstuvwxyz";
      let numbersPool = "0123456789";
      let symbolsPool = "!@#$%^&*()_+-=[]{}|;:',./<>?";

      if (excludeSimilar) {
        const similarPattern = /[iIl1o0O]/g;
        uppercasePool = uppercasePool.replace(similarPattern, "");
        lowercasePool = lowercasePool.replace(similarPattern, "");
        numbersPool = numbersPool.replace(similarPattern, "");
        symbolsPool = symbolsPool.replace(similarPattern, "");
      }

      let characterPool = "";
      const requiredCharacters: string[] = [];

      if (uppercase && uppercasePool) {
        characterPool += uppercasePool;
        requiredCharacters.push(uppercasePool[getSecureRandomIndex(uppercasePool.length)]);
      }
      if (lowercase && lowercasePool) {
        characterPool += lowercasePool;
        requiredCharacters.push(lowercasePool[getSecureRandomIndex(lowercasePool.length)]);
      }
      if (numbers && numbersPool) {
        characterPool += numbersPool;
        requiredCharacters.push(numbersPool[getSecureRandomIndex(numbersPool.length)]);
      }
      if (symbols && symbolsPool) {
        characterPool += symbolsPool;
        requiredCharacters.push(symbolsPool[getSecureRandomIndex(symbolsPool.length)]);
      }

      // If no character type is checked, fall back to lowercase
      if (!characterPool) {
        characterPool = lowercasePool;
        requiredCharacters.push(lowercasePool[getSecureRandomIndex(lowercasePool.length)]);
      }

      // Fill remaining length
      const remainingLength = Math.max(0, length - requiredCharacters.length);
      const generatedPart: string[] = [];
      for (let i = 0; i < remainingLength; i++) {
        const randomIndex = getSecureRandomIndex(characterPool.length);
        generatedPart.push(characterPool[randomIndex]);
      }

      // Mix required and generated parts randomly
      const fullList = [...requiredCharacters, ...generatedPart];
      for (let i = fullList.length - 1; i > 0; i--) {
        const j = getSecureRandomIndex(i + 1);
        [fullList[i], fullList[j]] = [fullList[j], fullList[i]];
      }

      generated = fullList.join("");
    } else {
      // Passphrase generation
      const passphraseWords: string[] = [];
      for (let i = 0; i < wordCount; i++) {
        const wordIndex = getSecureRandomIndex(WORDLIST.length);
        passphraseWords.push(WORDLIST[wordIndex]);
      }
      generated = passphraseWords.join(separator);
    }

    setPassword(generated);

    // Save history (limit to last 5, avoiding duplicates)
    setHistory((prev) => {
      const nextHistory = [generated, ...prev.filter((item) => item !== generated)].slice(0, 5);
      return nextHistory;
    });
  }, [
    mode,
    length,
    uppercase,
    lowercase,
    numbers,
    symbols,
    excludeSimilar,
    wordCount,
    separator,
  ]);

  // Generate a password on component mount
  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  // Evaluate strength when password changes
  useEffect(() => {
    const evaluated = evaluateStrength(password);
    setStrength(evaluated);
  }, [password, evaluateStrength]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Configuration column */}
      <Card className="lg:col-span-2 border-border flex flex-col justify-between">
        <CardContent className="p-6 space-y-6">
          {/* Mode Switcher */}
          <div className="inline-flex rounded-lg border border-input p-0.5 bg-background w-full">
            <button
              onClick={() => {
                setMode("password");
              }}
              className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                mode === "password"
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Secure Password
            </button>
            <button
              onClick={() => {
                setMode("passphrase");
              }}
              className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                mode === "passphrase"
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Memorable Passphrase
            </button>
          </div>

          <div className="border-t border-border/50" />

          {/* Secure Password Mode Settings */}
          {mode === "password" && (
            <div className="space-y-6 animate-fade-in">
              <Slider
                label="Password Length"
                value={length}
                min={4}
                max={64}
                onChange={(e) => setLength(parseInt(e.target.value, 10))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Switch
                  label="Uppercase (A-Z)"
                  checked={uppercase}
                  onChange={(e) => setUppercase(e.target.checked)}
                />
                <Switch
                  label="Lowercase (a-z)"
                  checked={lowercase}
                  onChange={(e) => setLowercase(e.target.checked)}
                />
                <Switch
                  label="Numbers (0-9)"
                  checked={numbers}
                  onChange={(e) => setNumbers(e.target.checked)}
                />
                <Switch
                  label="Special Symbols (!@#...)"
                  checked={symbols}
                  onChange={(e) => setSymbols(e.target.checked)}
                />
              </div>

              <div className="border-t border-border/50 pt-4" />

              <Switch
                label="Exclude Similar Characters (e.g. i, l, 1, o, 0)"
                checked={excludeSimilar}
                onChange={(e) => setExcludeSimilar(e.target.checked)}
              />
            </div>
          )}

          {/* Passphrase Mode Settings */}
          {mode === "passphrase" && (
            <div className="space-y-6 animate-fade-in">
              <Slider
                label="Word Count"
                value={wordCount}
                min={3}
                max={12}
                onChange={(e) => setWordCount(parseInt(e.target.value, 10))}
              />

              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Word Separator</span>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { key: "-", label: "Hyphen (-)" },
                    { key: ".", label: "Period (.)" },
                    { key: "_", label: "Under (_)" },
                    { key: " ", label: "Space ( )" },
                    { key: "", label: "None" },
                  ].map((sep) => (
                    <button
                      key={sep.key}
                      onClick={() => setSeparator(sep.key)}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        separator === sep.key
                          ? "bg-primary border-primary text-primary-foreground shadow"
                          : "border-input bg-background text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                      }`}
                    >
                      {sep.key === "" ? "None" : sep.key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output & strength evaluation column */}
      <div className="space-y-6">
        {/* Output box */}
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <div className="relative group">
              <div className="w-full min-h-[70px] flex items-center justify-center p-3 rounded-lg bg-secondary/35 border border-border font-mono text-center text-sm font-semibold select-all break-all pr-10">
                {password}
              </div>
              <button
                onClick={generatePassword}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none transition-colors"
                title="Regenerate"
              >
                <Icon name="Shuffle" className="w-4 h-4" />
              </button>
            </div>

            <Button onClick={() => copy(password)} className="w-full flex items-center justify-center">
              {isCopied ? (
                <>
                  <Icon name="Check" className="w-4 h-4 mr-2 text-emerald-300" />
                  <span className="text-emerald-300 font-bold">Copied Successfully!</span>
                </>
              ) : (
                <>
                  <Icon name="Copy" className="w-4 h-4 mr-2" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Strength indicators */}
        <Card className="border-border bg-card">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Strength Status
              </span>
              <span className={`text-xs font-bold uppercase ${strength.bgColor}`}>
                {strength.label}
              </span>
            </div>

            {/* Strength Meter Bar */}
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-full flex-1 border-r border-card last:border-0 transition-all duration-300 ${
                    step <= strength.score ? strength.color : "bg-transparent"
                  }`}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Entropy
                </span>
                <span className="text-sm font-mono font-bold text-foreground">
                  {strength.entropy} bits
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Time to Crack
                </span>
                <span className="text-sm font-bold text-foreground block truncate">
                  ~ {strength.timeToCrack}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Local Generation History */}
        {history.length > 1 && (
          <Card className="border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
                  <Icon name="History" className="w-3.5 h-3.5 mr-1 text-primary" />
                  <span>Session Log History</span>
                </span>
                <button
                  onClick={() => setHistory([password])}
                  className="text-[10px] text-muted-foreground hover:text-destructive transition-colors font-medium cursor-pointer"
                >
                  Clear History
                </button>
              </div>
              <div className="border-t border-border/50" />
              <div className="space-y-1.5">
                {history.slice(1).map((histPwd, i) => (
                  <HistoryItemRow key={i} password={histPwd} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Sub-component: row for password history
function HistoryItemRow({ password }: { password: string }) {
  const { isCopied, copy } = useCopyToClipboard();

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/25 hover:bg-secondary/40 border border-border/40 transition-colors text-xs">
      <span className="font-mono text-muted-foreground select-all truncate max-w-[180px] sm:max-w-[220px]">
        {password}
      </span>
      <button
        onClick={() => copy(password)}
        className="p-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        title="Copy item"
      >
        {isCopied ? (
          <Icon name="Check" className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Icon name="Copy" className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
