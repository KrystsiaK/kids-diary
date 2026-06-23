"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ROUTED_LOCALES = new Set(["en", "ru", "pt", "pl", "es"]);

type TranslatableFields = {
  title: string;
  kicker: string;
  excerpt: string;
  content: string;
};

type TranslationContextValue = {
  fields: TranslatableFields;
  isTranslated: boolean;
  isLoading: boolean;
  error: boolean;
  promptLocale: string | null;
  acceptTranslation: () => void;
  dismiss: () => void;
};

const EntryTranslationContext = createContext<TranslationContextValue | null>(null);

export function EntryTranslationProvider({
  entryId,
  locale,
  initial,
  children,
}: {
  entryId: string;
  locale: string;
  initial: TranslatableFields;
  children: React.ReactNode;
}) {
  const [fields, setFields] = useState(initial);
  const [isTranslated, setIsTranslated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [promptLocale, setPromptLocale] = useState<string | null>(null);

  useEffect(() => {
    const dismissed =
      window.localStorage.getItem(`translate-dismissed-${entryId}`) === "true";

    if (dismissed) {
      return;
    }

    const browserLanguage = (navigator.language || "en").split("-")[0].toLowerCase();

    if (browserLanguage !== locale && !ROUTED_LOCALES.has(browserLanguage)) {
      // One-time read of a browser-only API (navigator.language) unavailable during SSR —
      // not derived from props/state, so this isn't the render-loop pattern the rule guards against.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPromptLocale(browserLanguage);
    }
  }, [entryId, locale]);

  const acceptTranslation = useCallback(() => {
    if (!promptLocale) {
      return;
    }

    setIsLoading(true);
    setError(false);

    fetch("/api/entries/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId, locale: promptLocale }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Translation request failed.");
        }
        return response.json();
      })
      .then((translated: TranslatableFields) => {
        setFields(translated);
        setIsTranslated(true);
        setPromptLocale(null);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [entryId, promptLocale]);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(`translate-dismissed-${entryId}`, "true");
    setPromptLocale(null);
  }, [entryId]);

  return (
    <EntryTranslationContext.Provider
      value={{ fields, isTranslated, isLoading, error, promptLocale, acceptTranslation, dismiss }}
    >
      {children}
    </EntryTranslationContext.Provider>
  );
}

export function useEntryTranslation() {
  const context = useContext(EntryTranslationContext);

  if (!context) {
    throw new Error("useEntryTranslation must be used within an EntryTranslationProvider");
  }

  return context;
}
