import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  audio: z.string().min(100).max(1_400_000),
  language: z.enum(["", "ru", "en", "de", "hu", "sk", "sr", "ro", "bg", "uk", "nl", "fr"]),
});

const terms = ["MAYDAY", "PAN PAN", "SECURITE", "Schleuse", "Schubverband", "zu Berg", "zu Tal", "Tiefgang"];

export const transcribeVhf = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const parsed = schema.safeParse(input);
    return parsed.success ? parsed.data : null;
  })
  .handler(async ({ data }): Promise<
    { ok: true; text: string } | { ok: false; error: "unavailable" | "failed" | "invalid" | "empty" }
  > => {
    if (!data) return { ok: false, error: "invalid" };
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "unavailable" };

    const bytes = Buffer.from(data.audio, "base64");
    if (bytes.length < 1000 || bytes.length > 1_000_000) return { ok: false, error: "invalid" };
    if (bytes.subarray(0, 4).toString("ascii") !== "RIFF") return { ok: false, error: "invalid" };

    const form = new FormData();
    form.append("model", "grok-voice-transcribe-2.0");
    if (data.language) {
      form.append("language", data.language);
      form.append("format", "true");
    }
    for (const term of terms) form.append("keyterm", term);
    form.append("file", new File([new Uint8Array(bytes)], "clip.wav", { type: "audio/wav" }));

    try {
      const response = await fetch("https://api.x.ai/v1/stt", {
        method: "POST",
        signal: AbortSignal.timeout(30000),
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
      if (!response.ok) return { ok: false, error: "failed" };
      const body = (await response.json()) as { text?: unknown };
      const text = typeof body.text === "string" ? body.text.trim() : "";
      if (!text) return { ok: false, error: "empty" };
      return { ok: true, text: text.slice(0, 1500) };
    } catch {
      return { ok: false, error: "failed" };
    }
  });
