import { useMemo, useState } from "react";
import { Copy, Volume2 } from "lucide-react";
import { Button, controlClass, Field } from "@/components/vhf/ui";
import { cn } from "@/lib/cn";
import { t } from "@/lib/vhf/i18n";
import { languages, type LangId } from "@/lib/vhf/languages";
import { categories, fillLine, phrases, traps, type Slots } from "@/lib/vhf/phrases";
import { copyText, speak, spellItu, spellRu } from "@/lib/vhf/speech";
import { useVhf } from "@/lib/vhf/store";

export function PhraseView() {
  const ui = useVhf((state) => state.ui);
  const to = useVhf((state) => state.to);
  const context = useVhf((state) => state.context);
  const setView = useVhf((state) => state.setView);
  const setDraft = useVhf((state) => state.setDraft);
  const setFrom = useVhf((state) => state.setFrom);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"all" | "traps" | (typeof categories)[number]["id"]>("all");
  const [station, setStation] = useState("");
  const [n, setN] = useState("");
  const [l, setL] = useState("");
  const [b, setB] = useState("");
  const [d, setD] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [spell, setSpell] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const slots: Slots = {
    vessel: context.vessel,
    station,
    km: context.km,
    ch: context.channel,
    n,
    l,
    b,
    d,
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return phrases.filter((phrase) => {
      if (cat !== "all" && cat !== "traps" && phrase.category !== cat) return false;
      if (!needle) return true;
      const blob = `${phrase.title.ru} ${phrase.title.en} ${Object.values(phrase.lines).join(" ")}`.toLowerCase();
      return blob.includes(needle);
    });
  }, [cat, query]);

  async function copy(id: string, text: string) {
    const ok = await copyText(text);
    if (!ok) return;
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1400);
  }

  const showPhrases = cat !== "traps";
  const showTraps = cat === "all" || cat === "traps";

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-relaxed text-muted">{t(ui, "fillHint")}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Field label={t(ui, "station")}>
          <input className={controlClass} value={station} maxLength={40} onChange={(event) => setStation(event.target.value)} />
        </Field>
        <Field label={t(ui, "number")}>
          <input className={controlClass} value={n} maxLength={12} onChange={(event) => setN(event.target.value)} />
        </Field>
        <Field label={t(ui, "length")}>
          <input className={controlClass} value={l} maxLength={8} onChange={(event) => setL(event.target.value)} />
        </Field>
        <Field label={t(ui, "breadth")}>
          <input className={controlClass} value={b} maxLength={8} onChange={(event) => setB(event.target.value)} />
        </Field>
        <Field label={t(ui, "draught")}>
          <input className={controlClass} value={d} maxLength={8} onChange={(event) => setD(event.target.value)} />
        </Field>
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t(ui, "search")}
        className="h-12 w-full rounded-lg border border-border bg-surface px-3 text-base text-fg outline-none placeholder:text-muted focus:border-primary"
      />
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip active={cat === "all"} onClick={() => setCat("all")}>
          {t(ui, "all")}
        </Chip>
        <Chip active={cat === "traps"} onClick={() => setCat("traps")}>
          {t(ui, "traps")}
        </Chip>
        {categories.map((item) => (
          <Chip key={item.id} active={cat === item.id} onClick={() => setCat(item.id)}>
            {item[ui]}
          </Chip>
        ))}
      </div>
      {showTraps ? (
        <section className="grid gap-2">
          {cat === "all" ? <h2 className="font-display text-2xl tracking-wide">{t(ui, "traps")}</h2> : null}
          <p className="text-sm text-muted">{t(ui, "trapsLead")}</p>
          <div className="grid gap-2">
            {traps
              .filter((trap) => {
                const needle = query.trim().toLowerCase();
                if (!needle) return true;
                return `${trap.term} ${trap.bad.ru} ${trap.bad.en} ${trap.good.ru} ${trap.good.en}`.toLowerCase().includes(needle);
              })
              .map((trap) => (
                <article key={trap.id} className="rounded-lg border border-border bg-surface p-3">
                  <p className="font-mono text-sm text-primary">{trap.term}</p>
                  <p className="mt-1 text-sm text-muted line-through">{trap.bad[ui]}</p>
                  <p className="text-sm text-fg">{trap.good[ui]}</p>
                </article>
              ))}
          </div>
        </section>
      ) : null}
      {showPhrases ? (
        <div className="grid gap-3">
          {filtered.length === 0 ? <p className="text-sm text-muted">{t(ui, "noMatch")}</p> : null}
          {filtered.map((phrase) => {
            const line = fillLine(phrase.lines[to], slots);
            const expanded = open === phrase.id;
            return (
              <article key={phrase.id} className="grid gap-3 rounded-lg border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold text-fg">{phrase.title[ui]}</h2>
                  <span className="shrink-0 text-xs uppercase tracking-wider text-muted">
                    {categories.find((item) => item.id === phrase.category)?.[ui]}
                  </span>
                </div>
                <p className="font-mono text-base leading-relaxed break-words text-fg">{line}</p>
                {phrase.note ? <p className="text-sm leading-relaxed text-muted">{phrase.note[ui]}</p> : null}
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="primary" size="sm" onClick={() => speak(line, to)}>
                    <Volume2 className="size-4" />
                    {t(ui, "speak")}
                  </Button>
                  <Button type="button" size="sm" onClick={() => copy(phrase.id, line)}>
                    <Copy className="size-4" />
                    {copied === phrase.id ? t(ui, "copied") : t(ui, "copy")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setDraft(line);
                      setFrom(to);
                      setView("air");
                    }}
                  >
                    {t(ui, "toTranslator")}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(expanded ? null : phrase.id)}>
                    {expanded ? t(ui, "collapse") : t(ui, "expand")}
                  </Button>
                </div>
                {expanded ? (
                  <ul className="grid gap-2">
                    {languages.map((lang) => (
                      <li key={lang.id} className="grid gap-1">
                        <span className="text-xs uppercase tracking-wider text-muted">{lang[ui]}</span>
                        <span className="font-mono text-sm leading-relaxed break-words text-fg">
                          {fillLine(phrase.lines[lang.id as LangId], slots)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
      <section className="grid gap-3 rounded-lg border border-border bg-surface p-4">
        <h2 className="font-display text-2xl tracking-wide">{t(ui, "spellTitle")}</h2>
        <p className="text-sm text-muted">{t(ui, "spellHint")}</p>
        <input
          value={spell}
          onChange={(event) => setSpell(event.target.value)}
          placeholder={t(ui, "spellPlaceholder")}
          className="h-12 rounded-lg border border-border bg-bg px-3 font-mono text-base text-fg outline-none focus:border-primary"
        />
        {spell.trim() ? (
          <div className="grid gap-2 text-sm leading-relaxed">
            <p>
              <span className="text-muted">{t(ui, "itu")}: </span>
              <span className="font-mono text-fg">{spellItu(spell)}</span>
            </p>
            <p>
              <span className="text-muted">{t(ui, "rus")}: </span>
              <span className="text-fg">{spellRu(spell)}</span>
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Chip({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 shrink-0 rounded-lg border px-3 text-sm font-semibold",
        active ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface text-fg",
      )}
    >
      {children}
    </button>
  );
}
