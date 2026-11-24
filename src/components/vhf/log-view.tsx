import { useState } from "react";
import { Button } from "@/components/vhf/ui";
import { t } from "@/lib/vhf/i18n";
import { languageById } from "@/lib/vhf/languages";
import { useVhf } from "@/lib/vhf/store";

export function LogView() {
  const ui = useVhf((state) => state.ui);
  const log = useVhf((state) => state.log);
  const openLog = useVhf((state) => state.openLog);
  const removeLog = useVhf((state) => state.removeLog);
  const clearLog = useVhf((state) => state.clearLog);
  const [armed, setArmed] = useState(false);

  if (log.length === 0) {
    return <p className="text-base leading-relaxed text-muted">{t(ui, "emptyLog")}</p>;
  }

  return (
    <div className="grid gap-3">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => {
            if (!armed) {
              setArmed(true);
              return;
            }
            clearLog();
            setArmed(false);
          }}
        >
          {armed ? t(ui, "confirmClear") : t(ui, "clearLog")}
        </Button>
      </div>
      {log.map((item) => (
        <article key={item.id} className="grid gap-2 rounded-lg border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-muted">
            <span>{item.mode === "compose" ? t(ui, "logCompose") : t(ui, "logTranslate")}</span>
            <span className="tabular-nums">
              {new Intl.DateTimeFormat(ui === "ru" ? "ru-RU" : "en-GB", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }).format(item.at)}
            </span>
            <span>
              {item.from === "auto" ? t(ui, "auto") : languageById(item.from)[ui]} → {languageById(item.to)[ui]}
            </span>
          </div>
          <p className="text-sm leading-relaxed break-words text-muted">{item.text}</p>
          <p className="font-mono text-sm leading-relaxed break-words text-fg">{item.result.radio}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="primary" onClick={() => openLog(item.id)}>
              {t(ui, "open")}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => removeLog(item.id)}>
              {t(ui, "remove")}
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
