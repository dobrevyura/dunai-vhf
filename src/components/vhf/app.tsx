import { useEffect } from "react";
import { BookOpen, MessageSquarePlus, Radio, ScrollText } from "lucide-react";
import { AirView } from "@/components/vhf/air-view";
import { ComposeView } from "@/components/vhf/compose-view";
import { LogView } from "@/components/vhf/log-view";
import { PhraseView } from "@/components/vhf/phrase-view";
import { cn } from "@/lib/cn";
import { t } from "@/lib/vhf/i18n";
import { useVhf } from "@/lib/vhf/store";
import type { UiLang, ViewId } from "@/lib/vhf/types";

const views: { id: ViewId; icon: typeof Radio }[] = [
  { id: "air", icon: Radio },
  { id: "phrases", icon: BookOpen },
  { id: "compose", icon: MessageSquarePlus },
  { id: "log", icon: ScrollText },
];

export function VhfApp() {
  const ui = useVhf((state) => state.ui);
  const view = useVhf((state) => state.view);
  const channel = useVhf((state) => state.context.channel);
  const setUi = useVhf((state) => state.setUi);
  const setView = useVhf((state) => state.setView);

  useEffect(() => {
    void useVhf.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = ui;
  }, [ui]);

  return (
    <div className="min-h-dvh bg-bg text-fg lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="faceplate hidden border-r border-border bg-surface lg:flex lg:flex-col lg:px-4 lg:py-6">
        <Wordmark />
        <p className="mt-1 text-sm text-muted">{t(ui, "notOnAir")}</p>
        <nav className="mt-8 grid gap-1">
          {views.map((item) => (
            <NavButton key={item.id} id={item.id} active={view === item.id} ui={ui} onClick={() => setView(item.id)} />
          ))}
        </nav>
        <p className="mt-auto pt-8 text-xs leading-relaxed text-muted">{t(ui, "disclaimer")}</p>
      </aside>
      <div className="min-w-0">
        <div className="h-1 bg-primary" />
        <header className="flex items-center justify-between gap-3 px-4 py-4">
          <div className="lg:hidden">
            <Wordmark />
            <p className="text-xs text-muted">{t(ui, "notOnAir")}</p>
          </div>
          <p className="hidden text-sm text-muted lg:block">{t(ui, "context")}</p>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-border bg-bg px-3 py-1 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">CH</p>
              <p className="font-mono text-xl leading-none text-primary tabular-nums">{channel || "—"}</p>
            </div>
            <div className="flex rounded-lg border border-border p-1">
              {(["ru", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setUi(lang)}
                  className={cn(
                    "h-11 rounded-md px-3 text-xs font-semibold uppercase",
                    ui === lang ? "bg-primary text-primary-fg" : "text-muted",
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </header>
        <main className="mx-auto grid w-full max-w-5xl gap-4 px-4 pb-28 lg:pb-10">
          {view === "air" ? <AirView /> : null}
          {view === "phrases" ? <PhraseView /> : null}
          {view === "compose" ? <ComposeView /> : null}
          {view === "log" ? <LogView /> : null}
          <p className="text-xs leading-relaxed text-muted lg:hidden">{t(ui, "disclaimer")}</p>
        </main>
        <nav className="dock fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface lg:hidden">
          <div className="grid grid-cols-4">
            {views.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold",
                    active ? "text-primary" : "text-muted",
                  )}
                >
                  <Icon className="size-5" />
                  {t(ui, item.id)}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

function Wordmark() {
  return (
    <p className="font-display leading-none tracking-wide text-fg">
      <span className="text-4xl">DUNAI</span> <span className="text-2xl text-primary">VHF</span>
    </p>
  );
}

function NavButton({
  id,
  active,
  ui,
  onClick,
}: {
  id: ViewId;
  active: boolean;
  ui: UiLang;
  onClick: () => void;
}) {
  const item = views.find((entry) => entry.id === id);
  if (!item) return null;
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-12 items-center gap-3 rounded-lg px-3 text-left text-base font-semibold",
        active ? "bg-bg text-primary" : "text-muted hover:bg-bg hover:text-fg",
      )}
    >
      <Icon className="size-5" />
      {t(ui, id)}
    </button>
  );
}
