import { isLangId, languageById, type LangId } from "@/lib/vhf/languages";

const ITU = [
  "Alpha",
  "Bravo",
  "Charlie",
  "Delta",
  "Echo",
  "Foxtrot",
  "Golf",
  "Hotel",
  "India",
  "Juliett",
  "Kilo",
  "Lima",
  "Mike",
  "November",
  "Oscar",
  "Papa",
  "Quebec",
  "Romeo",
  "Sierra",
  "Tango",
  "Uniform",
  "Victor",
  "Whiskey",
  "X-ray",
  "Yankee",
  "Zulu",
];

const RU: Record<string, string> = {
  а: "Анна",
  б: "Борис",
  в: "Василий",
  г: "Григорий",
  д: "Дмитрий",
  е: "Елена",
  ё: "Елена",
  ж: "Женя",
  з: "Зинаида",
  и: "Иван",
  й: "Иван краткий",
  к: "Константин",
  л: "Леонид",
  м: "Михаил",
  н: "Николай",
  о: "Ольга",
  п: "Павел",
  р: "Роман",
  с: "Семён",
  т: "Татьяна",
  у: "Ульяна",
  ф: "Фёдор",
  х: "Харитон",
  ц: "Цапля",
  ч: "Человек",
  ш: "Шура",
  щ: "Щука",
  ъ: "твёрдый знак",
  ы: "Еры",
  ь: "мягкий знак",
  э: "Эхо",
  ю: "Юрий",
  я: "Яков",
};

export function spellItu(text: string): string {
  return [...text]
    .map((char) => {
      const upper = char.toUpperCase();
      const index = upper.charCodeAt(0) - 65;
      if (index >= 0 && index < 26) return ITU[index];
      if (char === " ") return "/";
      return char;
    })
    .join(" ");
}

export function spellRu(text: string): string {
  return [...text]
    .map((char) => {
      const word = RU[char.toLowerCase()];
      if (word) return word;
      if (char === " ") return "/";
      return char;
    })
    .join(" ");
}

export function speak(text: string, lang: string): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = isLangId(lang) ? languageById(lang).bcp47 : "en-GB";
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
  return true;
}

export async function blobToWavBase64(blob: Blob): Promise<string | null> {
  const audio = new AudioContext();
  try {
    const decoded = await audio.decodeAudioData(await blob.arrayBuffer());
    const rate = 16000;
    const length = Math.min(rate * 20, Math.floor(decoded.duration * rate));
    if (length < rate * 0.35) return null;
    const left = decoded.getChannelData(0);
    const right = decoded.numberOfChannels > 1 ? decoded.getChannelData(1) : null;
    const pcm = new Int16Array(length);
    let peak = 0;
    for (let index = 0; index < length; index += 1) {
      const source = (index * decoded.sampleRate) / rate;
      const base = Math.floor(source);
      const next = Math.min(base + 1, left.length - 1);
      const mix = source - base;
      let sample = left[base] * (1 - mix) + left[next] * mix;
      if (right) sample = (sample + right[base] * (1 - mix) + right[next] * mix) / 2;
      const clipped = Math.max(-1, Math.min(1, sample));
      const value = clipped < 0 ? clipped * 0x8000 : clipped * 0x7fff;
      pcm[index] = value;
      peak = Math.max(peak, Math.abs(value));
    }
    if (peak < 180) return null;
    const data = new Uint8Array(pcm.buffer);
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    const write = (offset: number, text: string) => {
      for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index));
    };
    write(0, "RIFF");
    view.setUint32(4, 36 + data.length, true);
    write(8, "WAVE");
    write(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, rate, true);
    view.setUint32(28, rate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    write(36, "data");
    view.setUint32(40, data.length, true);
    const wav = new Uint8Array(44 + data.length);
    wav.set(new Uint8Array(header), 0);
    wav.set(data, 44);
    let binary = "";
    const step = 0x2000;
    for (let index = 0; index < wav.length; index += step) {
      binary += String.fromCharCode(...wav.subarray(index, index + step));
    }
    return btoa(binary);
  } finally {
    await audio.close();
  }
}

export async function copyText(text: string): Promise<boolean> {
  if (!text.trim()) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "true");
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
