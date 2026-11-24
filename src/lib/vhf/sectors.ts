import type { LangId } from "@/lib/vhf/languages";

export type Sector = {
  id: string;
  km: string;
  maritime: boolean;
  heard: LangId[];
  name: { ru: string; en: string };
  hint: { ru: string; en: string };
};

export const sectors: Sector[] = [
  {
    id: "unset",
    km: "—",
    maritime: false,
    heard: ["de", "en", "ru"],
    name: { ru: "Участок не задан", en: "Sector not set" },
    hint: {
      ru: "На внутреннем Дунае судно–судно чаще канал 10. У Сулины и в море — 16. Канал шлюза смотрите на щите.",
      en: "Inland ship-to-ship is usually channel 10. Sulina and the sea use 16. A lock’s channel is posted on the chamber.",
    },
  },
  {
    id: "de",
    km: "2414–2225",
    maritime: false,
    heard: ["de", "nl", "en"],
    name: { ru: "Кельхайм — Пассау", en: "Kelheim — Passau" },
    hint: {
      ru: "Немецкий участок. Вверх — zu Berg, вниз — zu Tal. Бедствие и судно–судно на внутренних вод Германии: канал 10.",
      en: "German reach. Upstream is zu Berg, downstream is zu Tal. Inland distress and ship-to-ship: channel 10.",
    },
  },
  {
    id: "at",
    km: "2225–1872",
    maritime: false,
    heard: ["de", "sk", "en", "nl"],
    name: { ru: "Австрия, Пассау — Девин", en: "Austria, Passau — Devín" },
    hint: {
      ru: "Немецкий эфир, DoRIS. Километры растут вверх, к Кельхайму. Судно–судно обычно канал 10.",
      en: "German on the air, DoRIS. Kilometres increase upstream, toward Kelheim. Ship-to-ship is usually channel 10.",
    },
  },
  {
    id: "sk-hu",
    km: "1872–1646",
    maritime: false,
    heard: ["sk", "hu", "de", "en"],
    name: { ru: "Братислава — Будапешт", en: "Bratislava — Budapest" },
    hint: {
      ru: "Словацкий и венгерский. Венгры: hegymenet — вверх, völgymenet — вниз. Шлюз Габчиково около км 1819.",
      en: "Slovak and Hungarian. Hegymenet is upstream, völgymenet is downstream. Gabčíkovo lock is near km 1819.",
    },
  },
  {
    id: "hu",
    km: "1646–1433",
    maritime: false,
    heard: ["hu", "sr", "en", "de"],
    name: { ru: "Будапешт — Мохач", en: "Budapest — Mohács" },
    hint: {
      ru: "Венгерский эфир. Zsilip — шлюз, tolt kötelék — толкаемый состав, merülés — осадка.",
      en: "Hungarian on the air. Zsilip is a lock, tolt kötelék a pushed convoy, merülés the draught.",
    },
  },
  {
    id: "rs",
    km: "1433–863",
    maritime: false,
    heard: ["sr", "ro", "en", "ru"],
    name: { ru: "Сербия и Железные Ворота", en: "Serbia and the Iron Gates" },
    hint: {
      ru: "Сербский, у Джердапа ещё румынский. Prevodnica — шлюз. Железные Ворота I около км 943, II около км 863.",
      en: "Serbian, plus Romanian at the Iron Gates. Prevodnica is a lock. Iron Gate I is near km 943, II near km 863.",
    },
  },
  {
    id: "ro-bg",
    km: "863–170",
    maritime: false,
    heard: ["ro", "bg", "en", "ru"],
    name: { ru: "Румыния — Болгария", en: "Romania — Bulgaria" },
    hint: {
      ru: "Румынский и болгарский. Amonte — вверх, aval — вниз. Pescaj и газене — осадка. Русе — около км 495.",
      en: "Romanian and Bulgarian. Amonte is upstream, aval downstream. Pescaj and газене mean draught. Ruse is near km 495.",
    },
  },
  {
    id: "lower",
    km: "170–70",
    maritime: false,
    heard: ["ro", "en", "ru", "uk"],
    name: { ru: "Брэила — Тулча", en: "Brăila — Tulcea" },
    hint: {
      ru: "Нижний Дунай, в основном румынский. До моря ещё речные правила, к Сулине готовьте канал 16.",
      en: "Lower Danube, mostly Romanian. Still inland rules, but have channel 16 ready as you near Sulina.",
    },
  },
  {
    id: "delta",
    km: "70–0",
    maritime: true,
    heard: ["ro", "en", "ru", "uk"],
    name: { ru: "Дельта и Сулина", en: "Delta and Sulina" },
    hint: {
      ru: "Морской участок. Бедствие и вызов — канал 16. MAYDAY, PAN PAN и SÉCURITÉ не переводятся.",
      en: "Maritime reach. Distress and calling: channel 16. MAYDAY, PAN PAN and SÉCURITÉ stay untranslated.",
    },
  },
];

export function sectorById(id: string): Sector {
  return sectors.find((sector) => sector.id === id) ?? sectors[0];
}
