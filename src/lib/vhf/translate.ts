import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sectorById } from "@/lib/vhf/sectors";
import type { AiResult, Procedure, TranslateInput } from "@/lib/vhf/types";

const schema = z.object({
  mode: z.enum(["translate", "compose"]),
  text: z.string().trim().min(1).max(1500),
  from: z.enum(["auto", "ru", "en", "de", "hu", "sk", "sr", "ro", "bg", "uk", "nl", "fr"]),
  to: z.enum(["ru", "en", "de", "hu", "sk", "sr", "ro", "bg", "uk", "nl", "fr"]),
  ui: z.enum(["ru", "en"]),
  context: z.object({
    vessel: z.string().max(80),
    direction: z.enum(["upstream", "downstream", "stopped", "unknown"]),
    situation: z.enum(["routine", "safety", "urgency", "distress"]),
    sectorId: z.string().max(40),
    channel: z.string().max(8),
    km: z.string().max(12),
  }),
});

const procedures: Procedure[] = ["routine", "safety", "urgency", "distress", "unknown"];

function asProcedure(value: unknown): Procedure {
  return procedures.find((item) => item === value) ?? "unknown";
}

function parseResult(raw: string): AiResult | null {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const value = JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
    if (typeof value.radio !== "string" || !value.radio.trim()) return null;
    const notes = Array.isArray(value.notes)
      ? value.notes.filter((note): note is string => typeof note === "string" && note.trim().length > 0)
      : typeof value.notes === "string" && value.notes.trim()
        ? [value.notes.trim()]
        : [];
    return {
      radio: value.radio.trim().slice(0, 2000),
      spoken:
        typeof value.spoken === "string" && value.spoken.trim()
          ? value.spoken.trim().slice(0, 2000)
          : value.radio.trim().slice(0, 2000),
      gloss: typeof value.gloss === "string" ? value.gloss.trim().slice(0, 1200) : "",
      procedure: asProcedure(value.procedure),
      notes: notes.map((note) => note.trim()).slice(0, 4),
      suggestedReply: typeof value.suggestedReply === "string" ? value.suggestedReply.trim().slice(0, 800) : "",
      detected: typeof value.detected === "string" ? value.detected.trim().slice(0, 80) : "",
    };
  } catch {
    return null;
  }
}

export const translateVhf = createServerFn({ method: "POST" })
  .validator((input: unknown): TranslateInput | null => {
    const parsed = schema.safeParse(input);
    return parsed.success ? parsed.data : null;
  })
  .handler(async ({ data }): Promise<{ ok: true; result: AiResult } | { ok: false; error: "unavailable" | "failed" | "invalid" }> => {
    if (!data) return { ok: false, error: "invalid" };
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "unavailable" };

    const sector = sectorById(data.context.sectorId);
    const notesLang = data.ui === "ru" ? "Russian" : "English";
    const system = `You are a Danube VHF interpreter for a working skipper. Convert heard traffic or a plain-language intent into correct, speakable river-radio language. You are not a general chatbot.

Rules:
- Prefer inland radio procedure and CEVNI meaning over a literary translation.
- Kilometres increase upstream, from Sulina km 0 to Kelheim about km 2414. Upstream is toward Kelheim. Downstream is toward the Black Sea.
- German zu Berg = upstream. zu Tal = downstream. Never "mountain" or "valley".
- Hungarian hegymenet = upstream, völgymenet = downstream. Romanian amonte / aval. Dutch opvaart / afvaart, ik vaar op / ik vaar af. French montant / avalant.
- Normal CEVNI meeting: each vessel keeps the STARBOARD side of the fairway and they pass PORT to PORT (Backbord an Backbord, левыми бортами).
- Blue board (blaue Tafel, синий щит, kék tábla, panou albastru, plava tabla) plus a scintillating white light asks to pass STARBOARD TO STARBOARD (правыми бортами). Do not invert this.
- Schubverband / tolt kötelék / convoi împins / potisnuti sastav / duwstel / convoi poussé = pushed convoy, Russian толкаемый состав. Not a train.
- Tiefgang / merülés / pescaj / gaz / ponor / diepgang / tirant d'eau = draught of the vessel, not the depth of the river.
- Stromkilometer / folyamkilométer / kilometreraai / point kilométrique = the river kilometre. Do not change the number.
- Kommen = Over. Ende = Out. Do not use both. A call that expects an answer ends with Over. A finished call ends with Out.
- MAYDAY, PAN PAN and SÉCURITÉ stay untranslated in every language. MAYDAY is distress, PAN PAN is urgency, SÉCURITÉ is a safety broadcast.
- Inland Danube ship-to-ship is usually VHF channel 10, including inland distress on the German reach. The maritime Danube (Sulina and the delta) uses channel 16 for distress and calling. Never invent a lock working channel.
- Preserve vessel names, call signs, MMSI, kilometres, lock and place names, times, speeds, draughts, dimensions and channel numbers exactly. Never invent a number, a name or a person count.
- In compose mode the input is an intent, not yet a call. Write one complete minimal transmission in the TARGET language. You may use vessel, kilometre, channel and direction from the context when the skipper set them. Do not add facts that are in neither the intent nor those fields.
- In translate mode translate what was said. You may repair broken grammar into radio phrasing and mention that in notes. Do not add a greeting that was not there.
- If port/starboard, bank, upstream/downstream or blue-board intent is ambiguous, do not guess. Say so in notes.
- radio and spoken are only in the TARGET language. spoken is the same call with numbers expanded for reading aloud, in the target language.
- gloss and notes are in ${notesLang}. notes: at most 4 short strings. suggestedReply is one short next call in the TARGET language, or empty. For somebody else's MAYDAY, do not invent a rescue; a request to repeat the position is acceptable.
- detected is the source language name in ${notesLang}.
- Return a JSON object with keys radio, spoken, gloss, procedure, notes, suggestedReply, detected. procedure is one of routine, safety, urgency, distress, unknown.`;

    const user = [
      `Mode: ${data.mode}`,
      `Source language: ${data.from === "auto" ? "unknown, detect it" : data.from}`,
      `Target language: ${data.to}`,
      `Vessel: ${data.context.vessel || "(not set)"}`,
      `Direction: ${data.context.direction}`,
      `Skipper-selected situation: ${data.context.situation}`,
      `Sector: ${sector.name.en}, km band ${sector.km}, maritime channel-16 culture: ${sector.maritime ? "yes" : "no"}`,
      `Languages often heard on this sector: ${sector.heard.join(", ")}`,
      `Skipper kilometre: ${data.context.km || "(not set)"}`,
      `Working channel: ${data.context.channel || "(not set)"}`,
      data.mode === "translate" ? "HEARD:" : "INTENT:",
      data.text,
    ].join("\n");

    try {
      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        signal: AbortSignal.timeout(28000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.2,
          max_tokens: 800,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!response.ok) return { ok: false, error: "failed" };
      const body = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      const text = body.choices?.[0]?.message?.content ?? "";
      const result = parseResult(text);
      if (!result) return { ok: false, error: "failed" };
      return { ok: true, result };
    } catch {
      return { ok: false, error: "failed" };
    }
  });
