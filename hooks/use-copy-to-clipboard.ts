import { useState, useCallback, useEffect } from "react";
import { copyToClipboard } from "@/lib/utils";

export function useCopyToClipboard(timeout = 2000) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(async (value: string) => {
    const success = await copyToClipboard(value);
    if (success) {
      setIsCopied(true);
    }
  }, []);

  useEffect(() => {
    if (!isCopied) return;

    const timer = setTimeout(() => {
      setIsCopied(false);
    }, timeout);

    return () => clearTimeout(timer);
  }, [isCopied, timeout]);

  return { isCopied, copy };
}
