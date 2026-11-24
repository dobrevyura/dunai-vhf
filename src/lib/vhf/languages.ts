export const languages = [
  { id: "ru", ru: "Русский", en: "Russian", bcp47: "ru-RU" },
  { id: "en", ru: "Английский", en: "English", bcp47: "en-GB" },
  { id: "de", ru: "Немецкий", en: "German", bcp47: "de-DE" },
  { id: "hu", ru: "Венгерский", en: "Hungarian", bcp47: "hu-HU" },
  { id: "sk", ru: "Словацкий", en: "Slovak", bcp47: "sk-SK" },
  { id: "sr", ru: "Сербский", en: "Serbian", bcp47: "sr-RS" },
  { id: "ro", ru: "Румынский", en: "Romanian", bcp47: "ro-RO" },
  { id: "bg", ru: "Болгарский", en: "Bulgarian", bcp47: "bg-BG" },
  { id: "uk", ru: "Украинский", en: "Ukrainian", bcp47: "uk-UA" },
  { id: "nl", ru: "Нидерландский", en: "Dutch", bcp47: "nl-NL" },
  { id: "fr", ru: "Французский", en: "French", bcp47: "fr-FR" },
] as const;

export type LangId = (typeof languages)[number]["id"];

export function isLangId(value: string): value is LangId {
  return languages.some((lang) => lang.id === value);
}

export function languageById(id: LangId) {
  return languages.find((lang) => lang.id === id) ?? languages[0];
}
