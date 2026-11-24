import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { ContextForm } from "@/components/vhf/context-form";
import { ExampleCard, ResultCard } from "@/components/vhf/result-card";
import { Button } from "@/components/vhf/ui";
import { t } from "@/lib/vhf/i18n";
import { isLangId, languageById } from "@/lib/vhf/languages";
import { runTranslate } from "@/lib/vhf/run";
import { samples } from "@/lib/vhf/samples";
import { sectorById } from "@/lib/vhf/sectors";
import { blobToWavBase64 } from "@/lib/vhf/speech";
import { transcribeVhf } from "@/lib/vhf/transcribe";
import { useVhf } from "@/lib/vhf/store";
import type { Direction, Situation, UiLang } from "@/lib/vhf/types";

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

export function AirView() {
  const ui = useVhf((state) => state.ui);
  const from = useVhf((state) => state.from);
  const to = useVhf((state) => state.to);
  const draft = useVhf((state) => state.draft);
  const context = useVhf((state) => state.context);
  const active = useVhf((state) => state.active);
  const setDraft = useVhf((state) => state.setDraft);
  const setFrom = useVhf((state) => state.setFrom);
  const setActive = useVhf((state) => state.setActive);
  const patchContext = useVhf((state) => state.patchContext);
  const pushLog = useVhf((state) => state.pushLog);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [sampleAt, setSampleAt] = useState(0);
  const session = useRef<{ stop: () => void } | null>(null);

  const hot = context.situation === "distress" || context.situation === "urgency";
  const sector = sectorById(context.sectorId);

  async function translate() {
    const text = draft.trim();
    if (!text) {
      setError(t(ui, "errShort"));
      return;
    }
    setPending(true);
    setError(null);
    const response = await runTranslate({ mode: "translate", text, from, to, ui, context });
    setPending(false);
    if (!response.ok) {
      setError(t(ui, response.error === "unavailable" ? "errUnavailable" : response.error === "invalid" ? "errInvalid" : "errFailed"));
      return;
    }
    setActive({ result: response.result, cached: response.cached, mode: "translate" });
    pushLog({
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      at: Date.now(),
      mode: "translate",
      text,
      from,
      to,
      context,
      result: response.result,
    });
  }

  function loadSample() {
    const sample = samples[sampleAt % samples.length];
    setSampleAt((value) => value + 1);
    setDraft(sample.text);
    setFrom(sample.from);
    patchContext({
      sectorId: sample.sectorId,
      direction: sample.direction,
      km: sample.km,
      situation: sample.situation,
    });
    setError(null);
  }

  function toggleMic() {
    if (session.current) {
      session.current.stop();
      return;
    }
    void startMic();
  }

  async function startMic() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError(t(ui, "noSpeech"));
      return;
    }
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setError(t(ui, name === "NotAllowedError" || name === "SecurityError" ? "micDenied" : "noSpeech"));
      return;
    }
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
    const mime = types.find((type) => MediaRecorder.isTypeSupported(type));
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      setError(t(ui, "noSpeech"));
      return;
    }
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    const timer = window.setTimeout(() => {
      if (recorder.state !== "inactive") recorder.stop();
    }, 20000);
    const release = () => {
      window.clearTimeout(timer);
      session.current = null;
      setListening(false);
    };
    recorder.onerror = () => {
      release();
      stream.getTracks().forEach((track) => track.stop());
      setError(t(ui, "noSpeech"));
    };
    recorder.onstop = () => {
      release();
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks, { type: recorder.mimeType || mime || "audio/webm" });
      void sendClip(blob);
    };
    recorder.start();
    setListening(true);
    session.current = {
      stop: () => {
        if (recorder.state !== "inactive") recorder.stop();
      },
    };
  }

  async function sendClip(blob: Blob) {
    setTranscribing(true);
    setError(null);
    try {
      const audio = await blobToWavBase64(blob);
      if (!audio) {
        setError(t(ui, "micEmpty"));
        return;
      }
      const response = await transcribeVhf({ data: { audio, language: isLangId(from) ? from : "" } });
      if (!response.ok) {
        setError(
          t(
            ui,
            response.error === "empty" ? "micEmpty" : response.error === "unavailable" ? "errUnavailable" : "micFailed",
          ),
        );
        return;
      }
      setDraft(`${useVhf.getState().draft} ${response.text}`.trim().slice(0, 1500));
    } catch {
      setError(t(ui, "micFailed"));
    } finally {
      setTranscribing(false);
    }
  }

  useEffect(() => {
    return () => session.current?.stop();
  }, []);

  const chips = [
    from === "auto" ? t(ui, "auto") : languageById(from)[ui],
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
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!pending) void translate();
          }}
        >
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">{t(ui, "youSaid")}</span>
            <textarea
              value={draft}
              maxLength={1500}
              spellCheck={false}
              placeholder={t(ui, "heardPlaceholder")}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  if (!pending) void translate();
                }
              }}
              className="min-h-40 w-full resize-y rounded-lg border border-border bg-surface p-3 font-mono text-base leading-relaxed text-fg outline-none placeholder:text-muted focus:border-primary"
            />
          </label>
          {listening ? <p className="text-sm text-primary">{t(ui, "micHearing")}</p> : null}
          {hot ? <p className="text-sm leading-relaxed text-danger">{t(ui, "distressNote")}</p> : null}
          {error ? (
            <p className="text-sm leading-relaxed text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="primary" disabled={pending} className="min-w-44 flex-1">
              {pending ? t(ui, "translating") : t(ui, "translate")}
            </Button>
            <Button type="button" aria-pressed={listening} disabled={transcribing} onClick={toggleMic}>
              {listening ? <Square className="size-4" /> : <Mic className="size-4" />}
              {transcribing ? t(ui, "micSending") : listening ? t(ui, "stop") : t(ui, "dictate")}
            </Button>
            <Button type="button" onClick={loadSample}>
              {t(ui, "sample")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setDraft("")}>
              {t(ui, "clear")}
            </Button>
          </div>
        </form>
        <div aria-live="polite">
          {active?.mode === "translate" ? (
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
              }}
            />
          ) : (
            <ExampleCard ui={ui} />
          )}
        </div>
      </div>
    </div>
  );
}
