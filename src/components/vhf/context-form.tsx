import { ArrowLeftRight } from "lucide-react";
import { languageById, languages, type LangId } from "@/lib/vhf/languages";
import { sectorById, sectors } from "@/lib/vhf/sectors";
import { t } from "@/lib/vhf/i18n";
import { useVhf } from "@/lib/vhf/store";
import type { Direction, Situation, SourceLang, UiLang } from "@/lib/vhf/types";
import { controlClass, Field } from "@/components/vhf/ui";

const directions: Direction[] = ["unknown", "upstream", "downstream", "stopped"];
const situations: Situation[] = ["routine", "safety", "urgency", "distress"];

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

export function ContextForm() {
  const ui = useVhf((state) => state.ui);
  const from = useVhf((state) => state.from);
  const to = useVhf((state) => state.to);
  const context = useVhf((state) => state.context);
  const setFrom = useVhf((state) => state.setFrom);
  const setTo = useVhf((state) => state.setTo);
  const patchContext = useVhf((state) => state.patchContext);
  const sector = sectorById(context.sectorId);

  function swap() {
    if (from === "auto") {
      setFrom(to);
      setTo(to === "en" ? "de" : "en");
      return;
    }
    setFrom(to);
    setTo(from);
  }

  return (
    <section className="grid gap-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label={t(ui, "vessel")} className="sm:col-span-2">
          <input
            className={controlClass}
            value={context.vessel}
            maxLength={80}
            placeholder="Donau Star"
            onChange={(event) => patchContext({ vessel: event.target.value })}
          />
        </Field>
        <Field label={t(ui, "from")}>
          <select
            className={controlClass}
            value={from}
            onChange={(event) => setFrom(event.target.value as SourceLang)}
          >
            <option value="auto">{t(ui, "auto")}</option>
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang[ui]}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex h-12 min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 focus-within:border-primary">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted">{t(ui, "to")}</span>
          <select className={controlClass} value={to} onChange={(event) => setTo(event.target.value as LangId)}>
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang[ui]}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="grid size-11 shrink-0 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-fg"
            aria-label={t(ui, "swap")}
            onClick={swap}
          >
            <ArrowLeftRight className="size-4" />
          </button>
        </div>
        <Field label={t(ui, "direction")}>
          <select
            className={controlClass}
            value={context.direction}
            onChange={(event) => patchContext({ direction: event.target.value as Direction })}
          >
            {directions.map((direction) => (
              <option key={direction} value={direction}>
                {directionLabel(ui, direction)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t(ui, "situation")}>
          <select
            className={controlClass}
            value={context.situation}
            onChange={(event) => patchContext({ situation: event.target.value as Situation })}
          >
            {situations.map((situation) => (
              <option key={situation} value={situation}>
                {situationLabel(ui, situation)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t(ui, "sector")} className="sm:col-span-2">
          <select
            className={controlClass}
            value={context.sectorId}
            onChange={(event) => patchContext({ sectorId: event.target.value })}
          >
            {sectors.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name[ui]} · {item.km}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t(ui, "km")}>
          <input
            className={controlClass}
            inputMode="decimal"
            value={context.km}
            maxLength={12}
            placeholder="1819"
            onChange={(event) => patchContext({ km: event.target.value })}
          />
        </Field>
        <Field label={t(ui, "channel")}>
          <input
            className={`${controlClass} font-mono tabular-nums`}
            inputMode="numeric"
            value={context.channel}
            maxLength={8}
            onChange={(event) => patchContext({ channel: event.target.value.replace(/[^\d]/g, "") })}
          />
          <button type="button" className="h-11 px-2 text-sm font-semibold text-primary" onClick={() => patchContext({ channel: "10" })}>
            10
          </button>
          <button type="button" className="h-11 px-2 text-sm font-semibold text-primary" onClick={() => patchContext({ channel: "16" })}>
            16
          </button>
        </Field>
      </div>
      <p className="text-sm leading-relaxed text-muted">
        {sector.hint[ui]}{" "}
        {from !== "auto" ? languageById(from)[ui] : t(ui, "auto")} → {languageById(to)[ui]}.
      </p>
    </section>
  );
}
