import { useState } from "react";
import { Copy, Volume2 } from "lucide-react";
import { t } from "@/lib/vhf/i18n";
import { copyText, speak } from "@/lib/vhf/speech";
import type { AiResult, Procedure, UiLang } from "@/lib/vhf/types";
import type { LangId } from "@/lib/vhf/languages";
import { Button } from "@/components/vhf/ui";

function procedureLabel(ui: UiLang, procedure: Procedure) {
  if (procedure === "safety") return t(ui, "sitSafety");
  if (procedure === "urgency") return t(ui, "sitUrgency");
  if (procedure === "distress") return t(ui, "sitDistress");
  if (procedure === "routine") return t(ui, "sitRoutine");
  return t(ui, "dirUnknown");
}

function tone(procedure: Procedure) {
  if (procedure === "distress") return "border-danger text-danger";
  if (procedure === "safety" || procedure === "urgency") return "border-primary text-primary";
  return "border-border text-muted";
}

export function ResultCard({
  ui,
  result,
  cached,
  to,
  chips,
  onUseReply,
}: {
  ui: UiLang;
  result: AiResult;
  cached: boolean;
  to: LangId;
  chips: string[];
  onUseReply?: (text: string) => void;
}) {
  const [copied, setCopied] = useState<"line" | "card" | null>(null);

  async function copy(text: string, kind: "line" | "card") {
    const ok = await copyText(text);
    if (!ok) return;
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1400);
  }

  const card = [
    result.radio,
    result.gloss ? `${t(ui, "gloss")}: ${result.gloss}` : "",
    result.notes.length ? `${t(ui, "notes")}: ${result.notes.join(" ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <article className="grid gap-4 rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-md border px-2 py-1 text-xs font-semibold uppercase tracking-wider ${tone(result.procedure)}`}>
          {procedureLabel(ui, result.procedure)}
        </span>
        {result.detected ? (
          <span className="text-xs text-muted">
            {t(ui, "detected")}: {result.detected}
          </span>
        ) : null}
        {cached ? <span className="text-xs text-ok">{t(ui, "cached")}</span> : null}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t(ui, "radioOut")}</p>
        <p className="mt-1 font-mono text-base leading-relaxed break-words whitespace-pre-wrap text-fg">{result.radio}</p>
      </div>
      {result.spoken && result.spoken !== result.radio ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t(ui, "spoken")}</p>
          <p className="mt-1 text-sm leading-relaxed break-words text-fg">{result.spoken}</p>
        </div>
      ) : null}
      {result.gloss ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t(ui, "gloss")}</p>
          <p className="mt-1 text-base leading-relaxed break-words text-fg">{result.gloss}</p>
        </div>
      ) : null}
      {result.notes.length ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t(ui, "notes")}</p>
          <ul className="mt-1 grid gap-1 text-sm leading-relaxed text-fg">
            {result.notes.map((note) => (
              <li key={note} className="break-words">
                {note}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {result.suggestedReply ? (
        <div className="rounded-lg bg-bg p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t(ui, "suggested")}</p>
          <p className="mt-1 font-mono text-sm leading-relaxed break-words text-fg">{result.suggestedReply}</p>
          {onUseReply ? (
            <Button type="button" size="sm" className="mt-3" onClick={() => onUseReply(result.suggestedReply)}>
              {t(ui, "useReply")}
            </Button>
          ) : null}
        </div>
      ) : null}
      {chips.length ? (
        <p className="text-xs leading-relaxed text-muted">
          {t(ui, "accounted")}: {chips.join(" · ")}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="primary" size="sm" onClick={() => speak(result.radio, to)}>
          <Volume2 className="size-4" />
          {t(ui, "speak")}
        </Button>
        <Button type="button" size="sm" onClick={() => copy(result.radio, "line")}>
          <Copy className="size-4" />
          {copied === "line" ? t(ui, "copied") : t(ui, "copy")}
        </Button>
        <Button type="button" size="sm" onClick={() => copy(card, "card")}>
          {copied === "card" ? t(ui, "copied") : t(ui, "copyCard")}
        </Button>
      </div>
    </article>
  );
}

export function ExampleCard({ ui }: { ui: UiLang }) {
  return (
    <article className="grid gap-3 rounded-lg border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">{t(ui, "exampleKicker")}</p>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t(ui, "exampleHeardLabel")}</p>
        <p className="mt-1 font-mono text-sm leading-relaxed break-words text-fg">{t(ui, "exampleHeard")}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-danger">{t(ui, "exampleBadLabel")}</p>
        <p className="mt-1 text-sm leading-relaxed break-words text-muted line-through">{t(ui, "exampleBad")}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ok">{t(ui, "exampleGoodLabel")}</p>
        <p className="mt-1 text-base leading-relaxed break-words text-fg">{t(ui, "exampleGood")}</p>
      </div>
      <p className="text-sm leading-relaxed text-muted">{t(ui, "exampleNote")}</p>
    </article>
  );
}
