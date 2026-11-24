import type { Direction, Situation } from "@/lib/vhf/types";
import type { LangId } from "@/lib/vhf/languages";

export type Sample = {
  from: LangId;
  text: string;
  sectorId: string;
  direction: Direction;
  km: string;
  situation: Situation;
};

export const samples: Sample[] = [
  {
    from: "de",
    sectorId: "sk-hu",
    direction: "downstream",
    km: "1819",
    situation: "routine",
    text: "Schleuse Gabčíkovo, hier Schubverband Donau Star. Wir fahren zu Tal. Stromkilometer 1819. Tiefgang zwei Meter vier. Länge einhundertfünfundachtzig Meter. Bitte um Talschleusung. Kommen.",
  },
  {
    from: "en",
    sectorId: "at",
    direction: "upstream",
    km: "1810",
    situation: "routine",
    text: "Motor vessel approaching the bend, this is convoy Orion. I am showing a blue board. Please pass starboard to starboard. My position is kilometre 1810. Over.",
  },
  {
    from: "ro",
    sectorId: "ro-bg",
    direction: "upstream",
    km: "495",
    situation: "safety",
    text: "Securitate, securitate. Aici împingătorul Dunărea. Sunt la kilometrul 495, amonte de Giurgiu. Am un obiect plutitor în șenal. Navigați cu prudență.",
  },
  {
    from: "hu",
    sectorId: "hu",
    direction: "upstream",
    km: "1642",
    situation: "routine",
    text: "Itt a motorhajó Tisza. Kilométer 1642, hegymenetben. Nem értem. Kérem, ismételje lassan. Vétel.",
  },
];

export const presets: {
  id: string;
  situation: Situation;
  label: { ru: string; en: string };
  text: { ru: string; en: string };
}[] = [
  {
    id: "meet",
    situation: "routine",
    label: { ru: "Левыми бортами", en: "Port to port" },
    text: {
      ru: "Иду своим ходом. Прошу обычное расхождение: держусь правой стороны фарватера, левыми бортами.",
      en: "I am under way. I want a normal meeting: I will keep to the starboard side of the fairway and pass port to port.",
    },
  },
  {
    id: "blue",
    situation: "routine",
    label: { ru: "Синий щит", en: "Blue board" },
    text: {
      ru: "Показываю синий щит. Прошу расхождение правыми бортами.",
      en: "I am showing the blue board. I request to pass starboard to starboard.",
    },
  },
  {
    id: "over",
    situation: "routine",
    label: { ru: "Обгон слева", en: "Overtake port" },
    text: {
      ru: "Хочу обогнать судно впереди по его левому борту.",
      en: "I want to overtake the vessel ahead on their port side.",
    },
  },
  {
    id: "lock",
    situation: "routine",
    label: { ru: "Шлюз вниз", en: "Lock down" },
    text: {
      ru: "Вызываю шлюз. Иду вниз, прошу шлюзование. Осадка 2,4 метра. Стою у ожидания.",
      en: "I am calling the lock. I am heading downstream and request lockage. Draught 2.4 metres. I am at the waiting berth.",
    },
  },
  {
    id: "pos",
    situation: "routine",
    label: { ru: "Моя позиция", en: "My position" },
    text: {
      ru: "Сообщаю, что иду вверх, и называю километр из обстановки, если он задан.",
      en: "Report that I am proceeding upstream, and give the kilometre from the situation if it is set.",
    },
  },
  {
    id: "sec",
    situation: "safety",
    label: { ru: "Sécurité", en: "Sécurité" },
    text: {
      ru: "Нужно объявление SÉCURITÉ: в фарватере плавающий предмет, судам идти осторожно. Это не бедствие.",
      en: "I need a SÉCURITÉ broadcast: floating object in the fairway, vessels should navigate with caution. This is not distress.",
    },
  },
  {
    id: "pan",
    situation: "urgency",
    label: { ru: "На мели", en: "Aground" },
    text: {
      ru: "Срочность, не бедствие: сижу на мели, затопление прямо сейчас не грозит, нужен буксир.",
      en: "Urgency, not distress: I am aground, I am not in immediate danger of sinking, I need a tug.",
    },
  },
  {
    id: "mayday",
    situation: "distress",
    label: { ru: "Mayday", en: "Mayday" },
    text: {
      ru: "Только если опасность реальная: принимаю воду, нужна немедленная помощь. Не выдумывай число людей.",
      en: "Only if the danger is real: I am taking water and need immediate assistance. Do not invent the number of persons.",
    },
  },
];
