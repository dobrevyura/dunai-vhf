import { readTranslationCache, writeTranslationCache } from "@/lib/vhf/store";
import { translateVhf } from "@/lib/vhf/translate";
import type { TranslateInput } from "@/lib/vhf/types";

export async function runTranslate(input: TranslateInput) {
  const key = JSON.stringify(input);
  const cached = readTranslationCache(key);
  if (cached) return { ok: true as const, result: cached, cached: true as const };
  const response = await translateVhf({ data: input });
  if (response.ok) {
    writeTranslationCache(key, response.result);
    return { ok: true as const, result: response.result, cached: false as const };
  }
  return { ok: false as const, error: response.error, cached: false as const };
}
