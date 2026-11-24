import { useState } from "react";
import { ContextForm } from "@/components/vhf/context-form";
import { ResultCard } from "@/components/vhf/result-card";
import { Button } from "@/components/vhf/ui";
import { t } from "@/lib/vhf/i18n";
import { languageById } from "@/lib/vhf/languages";
import { presets } from "@/lib/vhf/samples";
import { runTranslate } from "@/lib/vhf/run";
import { sectorById } from "@/lib/vhf/sectors";
import { useVhf } from "@/lib/vhf/store";
import type { Direction, Situation, UiLang } from "@/lib/vhf/types";
import { cn } from "@/lib/cn";

function directionLabel(ui: UiLang, direction: Direction) {
  if (direction === "upstream") return t(ui, "dirUp");
  if (direction === "downstream") return t(ui, "dirDown");
  if (direction === "stopped") return t(ui, "dirStopped");
  return t(ui, "dirUnknown");
}

function situationLabel(ui: UiLang, situation: Situation) {
  if (situation === "safety") return t(ui, "sitSafety");
  if (situation === "urgency") return t(ui, "sitUrgency");
  if (situation === "distress") return t(ui, "sitDistress");
  return t(ui, "sitRoutine");
}

export function ComposeView() {
  const ui = useVhf((state) => state.ui);
  const to = useVhf((state) => state.to);
  const intent = useVhf((state) => state.intent);
  const context = useVhf((state) => state.context);
  const active = useVhf((state) => state.active);
  const setIntent = useVhf((state) => state.setIntent);
  const setActive = useVhf((state) => state.setActive);
  const patchContext = useVhf((state) => state.patchContext);
  const pushLog = useVhf((state) => state.pushLog);
  const setView = useVhf((state) => state.setView);
  const setDraft = useVhf((state) => state.setDraft);
  const setFrom = useVhf((state) => state.setFrom);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sector = sectorById(context.sectorId);
  const hot = context.situation === "distress" || context.situation === "urgency";

  async function compose() {
    const text = intent.trim();
    if (!text) {
      setError(t(ui, "errShort"));
      return;
    }
    setPending(true);
    setError(null);
    const response = await runTranslate({ mode: "compose", text, from: ui, to, ui, context });
    setPending(false);
    if (!response.ok) {
      setError(t(ui, response.error === "unavailable" ? "errUnavailable" : response.error === "invalid" ? "errInvalid" : "errFailed"));
      return;
    }
    setActive({ result: response.result, cached: response.cached, mode: "compose" });
    pushLog({
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      at: Date.now(),
      mode: "compose",
      text,
      from: ui,
      to,
      context,
      result: response.result,
    });
  }

  const chips = [
    languageById(to)[ui],
    sector.name[ui],
    directionLabel(ui, context.direction),
    situationLabel(ui, context.situation),
    context.km ? `${t(ui, "km")} ${context.km}` : "",
    context.channel ? `CH ${context.channel}` : "",
    context.vessel,
  ].filter(Boolean);

  return (
    <div className="grid gap-4">
      <ContextForm />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={cn(
              "h-11 shrink-0 rounded-lg border px-3 text-sm font-semibold",
              preset.situation === "distress" ? "border-danger text-danger" : "border-border bg-surface text-fg",
            )}
            onClick={() => {
              setIntent(preset.text[ui]);
              patchContext({ situation: preset.situation });
            }}
          >
            {preset.label[ui]}
          </button>
        ))}
      </div>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!pending) void compose();
        }}
      >
        <textarea
          value={intent}
          maxLength={1500}
          placeholder={t(ui, "intentPlaceholder")}
          onChange={(event) => setIntent(event.target.value)}
          className="min-h-32 w-full resize-y rounded-lg border border-border bg-surface p-3 text-base leading-relaxed text-fg outline-none placeholder:text-muted focus:border-primary"
        />
        {hot ? <p className="text-sm leading-relaxed text-danger">{t(ui, "distressNote")}</p> : null}
        {error ? (
          <p className="text-sm leading-relaxed text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" variant="primary" disabled={pending} className="sm:w-fit">
          {pending ? t(ui, "translating") : t(ui, "composeBtn")}
        </Button>
      </form>
      <div aria-live="polite">
        {active?.mode === "compose" ? (
          <ResultCard
            ui={ui}
            result={active.result}
            cached={active.cached}
            to={to}
            chips={chips}
            onUseReply={(text) => {
              setDraft(text);
              setFrom(to);
              setActive(null);
              setView("air");
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
