"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { Link } from "@/i18n/navigation";
import { CloseIcon } from "@/shared/icons/site-icons";

type RelatedEntry = { title: string; href: string };
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  relatedEntries?: RelatedEntry[];
};

const ARTHUR_AVATAR_SRC = "/media/arthur-avatar.png";

function ArthurAvatar({
  alt,
  className = "size-12",
  reduceMotion,
  showWave = false,
}: {
  alt: string;
  className?: string;
  reduceMotion: boolean | null;
  showWave?: boolean;
}) {
  return (
    <motion.div
      animate={
        reduceMotion
          ? undefined
          : {
              rotate: [0, -2.5, 2.5, 0],
              scale: [1, 1.035, 1],
              y: [0, -5, 0],
            }
      }
      className={`pointer-events-none relative shrink-0 ${className}`}
      transition={
        reduceMotion
          ? undefined
          : {
              duration: 2.8,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 0.35,
            }
      }
    >
      {showWave && (
        <motion.span
          aria-hidden="true"
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [0.55, 0, 0.55],
                  scale: [0.94, 1.32, 0.94],
                }
          }
          className="absolute inset-0 rounded-full border border-[color-mix(in_oklab,var(--accent)_76%,white)]"
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 1.8,
                  ease: "easeOut",
                  repeat: Infinity,
                }
          }
        />
      )}
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                rotate: [0, 1.5, -1.5, 0],
                scale: [1, 1.04, 1],
              }
        }
        className="relative size-full overflow-hidden rounded-full border border-white/25 bg-[radial-gradient(circle_at_50%_35%,color-mix(in_oklab,var(--accent)_28%,transparent),var(--surface)_68%)] shadow-[0_14px_34px_rgba(0,0,0,0.35)] ring-2 ring-[color-mix(in_oklab,var(--accent)_54%,transparent)]"
        transition={
          reduceMotion
            ? undefined
            : {
                duration: 1.6,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.5,
              }
        }
      >
        <Image
          alt={alt}
          className="arthur-avatar-image object-contain object-bottom"
          fill
          sizes="(max-width: 640px) 72px, 80px"
          src={ARTHUR_AVATAR_SRC}
        />
      </motion.div>
      {showWave && (
        <motion.span
          aria-hidden="true"
          animate={
            reduceMotion
              ? undefined
              : {
                  rotate: [0, 26, -18, 24, -10, 0],
                  scale: [1, 1.18, 1.08, 1.18, 1],
                }
          }
          className="absolute -right-2 -top-2 grid size-8 origin-bottom-left place-items-center rounded-full border border-white/25 bg-[var(--background)] text-base shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 0.9,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1.25,
                }
          }
        >
          👋
        </motion.span>
      )}
    </motion.div>
  );
}

export function ChatWidget() {
  const t = useTranslations("chat");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setStatusError(null);
    setIsLoading(true);
    scrollToBottom();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          locale,
          history: nextMessages
            .slice(-6)
            .map((entry) => ({ role: entry.role, content: entry.content })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const key =
          data.error === "rate_limited"
            ? "rateLimited"
            : data.error === "budget_exhausted"
              ? "budgetExhausted"
              : "error";
        setStatusError(t(key));
        return;
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.answer, relatedEntries: data.relatedEntries ?? [] },
      ]);
      scrollToBottom();
    } catch {
      setStatusError(t("error"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex h-[31rem] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[1.8rem] border border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_96%,transparent)] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            exit={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : 0.97 }}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <ArthurAvatar
                  alt={t("avatarAlt")}
                  className="size-11"
                  reduceMotion={reduceMotion}
                  showWave
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {t("name")}
                  </p>
                  <p className="truncate text-xs text-[var(--muted)]">{t("title")}</p>
                </div>
              </div>
              <button
                aria-label={t("close")}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                onClick={() => setOpen(false)}
                type="button"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.length === 0 && (
                <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface)]/70 p-3">
                  <div className="flex items-start gap-3">
                    <ArthurAvatar
                      alt={t("avatarAlt")}
                      className="size-10"
                      reduceMotion={reduceMotion}
                      showWave
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {t("greeting")}
                      </p>
                      <p className="text-sm leading-6 text-[var(--muted)]">{t("empty")}</p>
                    </div>
                  </div>
                </div>
              )}
              {messages.map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-end gap-2 ${
                    entry.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {entry.role === "assistant" && (
                    <ArthurAvatar
                      alt={t("avatarAlt")}
                      className="size-8"
                      reduceMotion={reduceMotion}
                    />
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                      entry.role === "user"
                        ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                        : "bg-[var(--surface)] text-[var(--foreground)]"
                    }`}
                  >
                    <p>{entry.content}</p>
                    {entry.relatedEntries && entry.relatedEntries.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2 border-t border-[var(--border)] pt-2">
                        <span className="text-xs text-[var(--muted)]">{t("relatedLabel")}</span>
                        {entry.relatedEntries.map((related) => (
                          <Link
                            key={related.href}
                            className="text-xs text-[var(--accent)] underline underline-offset-2 transition hover:text-[var(--foreground)]"
                            href={related.href}
                          >
                            {related.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2">
                  <ArthurAvatar
                    alt={t("avatarAlt")}
                    className="size-8"
                    reduceMotion={reduceMotion}
                  />
                  <div className="rounded-2xl bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]">
                    {t("thinking")}
                  </div>
                </div>
              )}
              {statusError && <p className="text-sm text-rose-400">{statusError}</p>}
            </div>

            <form
              className="flex items-center gap-2 border-t border-[var(--border)] p-3"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
            >
              <input
                className="flex-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--foreground)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                disabled={isLoading}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t("placeholder")}
                type="text"
                value={input}
              />
              <button
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)] transition disabled:opacity-50"
                disabled={isLoading || !input.trim()}
                type="submit"
              >
                {t("send")}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        aria-label={open ? t("close") : t("openLabel")}
        className="group relative inline-flex size-16 items-center justify-center overflow-visible rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[0_16px_40px_rgba(0,0,0,0.3)] transition hover:bg-[color-mix(in_oklab,var(--accent)_82%,white)]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {!open && (
          <motion.span
            animate={{ opacity: 1, x: 0 }}
            className="pointer-events-none absolute right-[calc(100%+0.75rem)] hidden w-max max-w-44 rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_94%,transparent)] px-3 py-2 text-left text-xs font-semibold leading-5 text-[var(--foreground)] shadow-[0_14px_34px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:block"
            initial={{ opacity: 0, x: reduceMotion ? 0 : 8 }}
            transition={{ delay: 0.35, duration: 0.25, ease: "easeOut" }}
          >
            {t("launcherHint")}
          </motion.span>
        )}
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={open ? "close" : "open"}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center"
            exit={{ opacity: 0, scale: 0.7 }}
            initial={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {open ? (
              <CloseIcon className="size-6" />
            ) : (
              <ArthurAvatar
                alt={t("avatarAlt")}
                className="size-16"
                reduceMotion={reduceMotion}
                showWave
              />
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
