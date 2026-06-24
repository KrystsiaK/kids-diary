"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { AnimatePresence, motion } from "framer-motion";
import { marked } from "marked";
import TurndownService from "turndown";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";

import { unwrapExperimentI18nBraces } from "@/features/content/lib/experiment-i18n";
import { prepareRichHtml } from "@/features/content/lib/rich-content";
import { buildScopedCustomCss } from "@/features/content/lib/scoped-css";

export type RichEditorHandle = {
  insertImage: (url: string) => void;
};

type EditorMode = "visual" | "markdown" | "html";

type RichEditorProps = {
  customCss?: string;
  enableHtmlMode?: boolean;
  value?: string;
  onChange?: (html: string) => void;
  onImageInsert?: () => void;
  placeholder?: string;
  name?: string;
};

const turndown = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

function htmlToMarkdown(html: string): string {
  if (!html || html === "<p></p>") return "";
  return turndown.turndown(html);
}

function markdownToHtml(md: string): string {
  if (!md.trim()) return "";
  return prepareRichHtml(String(marked.parse(md, { async: false })));
}

function normalizeHtml(html: string) {
  return prepareRichHtml(html);
}

/* ── Toolbar helpers ─────────────────────────────────────── */

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarBtn({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      className={`rounded-md border px-2 py-1 text-xs font-medium transition select-none ${
        active
          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
          : "border-white/10 bg-white/5 text-stone-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      }`}
      disabled={disabled}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="h-5 w-px bg-white/10 shrink-0" />;
}

/* ── Mode tab ────────────────────────────────────────────── */

const MODE_LABELS: Record<EditorMode, string> = {
  visual: "Visual",
  markdown: "Markdown",
  html: "HTML",
};

function ModeTab({ id, current, onClick }: { id: EditorMode; current: EditorMode; onClick: () => void }) {
  const active = id === current;
  return (
    <button
      className={`rounded-md px-3 py-1 text-xs font-semibold tracking-wide transition ${
        active ? "bg-[var(--accent)] text-white" : "text-stone-400 hover:text-stone-200"
      }`}
      onClick={onClick}
      type="button"
    >
      {MODE_LABELS[id]}
    </button>
  );
}

/* ── Preview pane ────────────────────────────────────────── */

function PreviewPane({ customCss = "", html }: { customCss?: string; html: string }) {
  const safeHtml = normalizeHtml(html);
  const displayHtml = unwrapExperimentI18nBraces(safeHtml);
  const previewScopeClass = "experiment-preview-scope";
  const scopedCss = buildScopedCustomCss(customCss, `.${previewScopeClass}`);

  return (
    <div className="h-[320px] overflow-auto border-t border-white/10 bg-[var(--surface)] px-6 py-5">
      <div className="text-[10px] uppercase tracking-widest text-stone-600 mb-3">Preview</div>
      {safeHtml && safeHtml !== "<p></p>" ? (
        <>
          {scopedCss && <style>{scopedCss}</style>}
          <div
            className={`rich-content ${previewScopeClass}`}
            dangerouslySetInnerHTML={{ __html: displayHtml }}
          />
        </>
      ) : (
        <div className="text-sm text-stone-600 italic">Nothing to preview yet…</div>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */

export const RichEditor = forwardRef<RichEditorHandle, RichEditorProps>(
  function RichEditor(
    {
      customCss = "",
      enableHtmlMode = false,
      value = "",
      onChange,
      onImageInsert,
      placeholder,
      name = "content",
    },
    ref,
  ) {
    const [html, setHtml] = useState(value);
    const [mode, setMode] = useState<EditorMode>("visual");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [mdText, setMdText] = useState(() => htmlToMarkdown(value));

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
          link: false,
          underline: false,
        }),
        TiptapImage.configure({ inline: false, allowBase64: false }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        }),
        Placeholder.configure({ placeholder: placeholder ?? "Write the full entry here…" }),
        Underline,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
      ],
      content: value,
      immediatelyRender: false,
      editorProps: {
        attributes: { class: "rich-content min-h-[280px] outline-none px-5 py-4" },
      },
      onUpdate({ editor }) {
        const next = normalizeHtml(editor.getHTML());
        setHtml(next);
        onChange?.(next);
      },
    });

    useImperativeHandle(ref, () => ({
      insertImage(url: string) {
        editor?.chain().focus().setImage({ src: url }).run();
      },
    }));

    // ── Mode switching ─────────────────────────────────────
    // Before switching away from a mode, flush any pending edits.
    function switchMode(next: EditorMode) {
      if (mode === next) return;

      // Commit current mode's content → canonical html state
      let committed = html;

      if (mode === "markdown") {
        committed = markdownToHtml(mdText);
        setHtml(committed);
        onChange?.(committed);
      }

      if (mode === "html") {
        committed = normalizeHtml(committed);
        setHtml(committed);
        onChange?.(committed);
      }

      if (next === "visual") {
        editor?.commands.setContent(committed, {
          emitUpdate: false,
        } as Parameters<typeof editor.commands.setContent>[1]);
      }

      // Populate the incoming mode
      if (next === "markdown") {
        const md = htmlToMarkdown(committed);
        setMdText(md);
      }

      setMode(next);
      setShowLinkInput(false);
    }

    const applyLink = useCallback(() => {
      if (!editor) return;
      if (linkUrl.trim()) {
        editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
      } else {
        editor.chain().focus().unsetLink().run();
      }
      setLinkUrl("");
      setShowLinkInput(false);
    }, [editor, linkUrl]);

    // Keep mdRef up to date as the user types in markdown textarea
    function handleMdChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
      const nextMarkdown = e.target.value;
      const nextHtml = markdownToHtml(nextMarkdown);

      setMdText(nextMarkdown);
      setHtml(nextHtml);
      onChange?.(nextHtml);
    }

    if (!editor) return null;

    const showToolbar = mode === "visual";
    const editorHeightClass = previewOpen ? "h-[360px]" : "h-[520px]";

    return (
      <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-black/20 transition focus-within:border-[var(--ring)]/40 focus-within:ring-2 focus-within:ring-[var(--ring)]/20">

        {/* Mode tabs + hint */}
        <div className="grid min-w-0 gap-2 border-b border-white/10 bg-black/30 px-3 py-1.5 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex min-w-0 flex-wrap items-center gap-0.5">
            {(["visual", "markdown", ...(enableHtmlMode ? ["html" as const] : [])] as EditorMode[]).map((m) => (
              <ModeTab key={m} id={m} current={mode} onClick={() => switchMode(m)} />
            ))}
          </div>
          <div className="flex min-w-0 flex-wrap items-center justify-start gap-3 sm:justify-end">
            <span className="hidden min-w-0 truncate text-[10px] tracking-wide text-stone-600 sm:block">
              {mode === "markdown" && "Write Markdown · saves as HTML"}
              {mode === "html" && "Article HTML only · page/style/script tags are stripped"}
              {mode === "visual" && "WYSIWYG rich text"}
            </span>
            <button
              className={`rounded-md px-3 py-1 text-xs font-semibold tracking-wide transition ${
                previewOpen
                  ? "bg-[var(--accent)] text-white"
                  : "border border-white/10 bg-white/5 text-stone-300 hover:bg-white/10"
              }`}
              onClick={() => setPreviewOpen((current) => !current)}
              type="button"
            >
              Preview
            </button>
          </div>
        </div>

        {/* Formatting toolbar — Visual + Split only */}
        <AnimatePresence initial={false}>
          {showToolbar && (
            <motion.div
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              initial={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="flex max-w-full flex-wrap items-center gap-1 overflow-x-auto border-b border-white/10 bg-black/10 px-3 py-2">
                <ToolbarBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><strong>B</strong></ToolbarBtn>
                <ToolbarBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><em>I</em></ToolbarBtn>
                <ToolbarBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><span className="underline">U</span></ToolbarBtn>
                <Sep />
                <ToolbarBtn active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">H1</ToolbarBtn>
                <ToolbarBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</ToolbarBtn>
                <ToolbarBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</ToolbarBtn>
                <Sep />
                <ToolbarBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">≡</ToolbarBtn>
                <ToolbarBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list">#≡</ToolbarBtn>
                <ToolbarBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">❝</ToolbarBtn>
                <Sep />
                <ToolbarBtn
                  active={editor.isActive("link")}
                  onClick={() => {
                    if (editor.isActive("link")) { editor.chain().focus().unsetLink().run(); }
                    else { setShowLinkInput((v) => !v); }
                  }}
                  title={editor.isActive("link") ? "Remove link" : "Add link"}
                >🔗</ToolbarBtn>
                {onImageInsert && (
                  <ToolbarBtn onClick={onImageInsert} title="Insert image from media library">🖼</ToolbarBtn>
                )}
                <Sep />
                <ToolbarBtn active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">{"<>"}</ToolbarBtn>
                <ToolbarBtn active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">{"</>"}</ToolbarBtn>
                <Sep />
                <ToolbarBtn disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} title="Undo">↩</ToolbarBtn>
                <ToolbarBtn disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} title="Redo">↪</ToolbarBtn>
              </div>

              <AnimatePresence>
                {showLinkInput && (
                  <motion.div
                    animate={{ height: "auto", opacity: 1 }}
                    className="overflow-hidden"
                    exit={{ height: 0, opacity: 0 }}
                    initial={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    <div className="flex items-center gap-2 border-b border-white/10 bg-black/10 px-3 py-2">
                      <input
                        autoFocus
                        className="flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none placeholder:text-stone-600 focus:border-[var(--ring)]/40"
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); applyLink(); }
                          if (e.key === "Escape") { setShowLinkInput(false); setLinkUrl(""); }
                        }}
                        placeholder="https://example.com"
                        type="url"
                        value={linkUrl}
                      />
                      <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-stone-300 hover:bg-white/10" onClick={applyLink} type="button">Apply</button>
                      <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-stone-300 hover:bg-white/10" onClick={() => { setShowLinkInput(false); setLinkUrl(""); }} type="button">Cancel</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor panes */}
        <div className="flex min-w-0 flex-col">

          {/* Visual */}
          {mode === "visual" && (
            <div className={`${editorHeightClass} min-w-0 overflow-auto`}>
              <EditorContent editor={editor} />
            </div>
          )}

          {/* Markdown textarea */}
          {mode === "markdown" && (
            <div className="flex min-w-0 flex-col">
              <div className="overflow-x-auto px-5 pt-3 pb-1 text-[10px] uppercase tracking-widest text-stone-600">
                Markdown — # H1 &nbsp;## H2 &nbsp;**bold** &nbsp;*italic* &nbsp;- list &nbsp;&gt; blockquote
              </div>
              <textarea
                className={`${editorHeightClass} resize-none overflow-auto bg-transparent px-5 py-2 font-mono text-sm text-stone-200 outline-none placeholder:text-stone-600 leading-7`}
                onChange={handleMdChange}
                placeholder={"# Title\n\nWrite your story here\n\n**Bold**, *italic*, - bullet lists, > blockquotes"}
                spellCheck={false}
                value={mdText}
              />
            </div>
          )}

          {/* HTML textarea */}
          {mode === "html" && (
            <div className="flex min-w-0 flex-col">
              <div className="overflow-x-auto px-5 pt-3 pb-1 text-[10px] uppercase tracking-widest text-stone-600">
                Article HTML fragment only — full documents, styles and scripts are removed before preview/save.
              </div>
              <textarea
                className={`${editorHeightClass} resize-none overflow-auto bg-transparent px-5 py-2 font-mono text-xs text-emerald-300 outline-none placeholder:text-stone-600 leading-6`}
                onChange={(e) => {
                  const nextHtml = e.target.value;
                  setHtml(nextHtml);
                  onChange?.(normalizeHtml(nextHtml));
                }}
                placeholder="<p>Write HTML here…</p>"
                spellCheck={false}
                value={html}
                wrap="off"
              />
            </div>
          )}

          {previewOpen && <PreviewPane customCss={customCss} html={html} />}
        </div>

        {/* Hidden form field — always carries current HTML */}
        <input name={name} type="hidden" value={normalizeHtml(html)} />
      </div>
    );
  },
);
