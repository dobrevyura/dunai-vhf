import type { LangId } from "@/lib/vhf/languages";

export const categories = [
  { id: "call", ru: "Вызов", en: "Call" },
  { id: "meet", ru: "Расхождение", en: "Meeting" },
  { id: "over", ru: "Обгон", en: "Overtaking" },
  { id: "lock", ru: "Шлюз", en: "Lock" },
  { id: "move", ru: "Ход", en: "Under way" },
  { id: "distress", ru: "Бедствие", en: "Distress" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

export type Phrase = {
  id: string;
  category: CategoryId;
  title: { ru: string; en: string };
  note?: { ru: string; en: string };
  lines: Record<LangId, string>;
};

export type Slots = {
  vessel: string;
  station: string;
  km: string;
  ch: string;
  n: string;
  l: string;
  b: string;
  d: string;
};

const blank = "…";

export function fillLine(line: string, slots: Slots): string {
  const pick = (value: string) => (value.trim() ? value.trim() : blank);
  return line
    .replaceAll("{vessel}", pick(slots.vessel))
    .replaceAll("{station}", pick(slots.station))
    .replaceAll("{km}", pick(slots.km))
    .replaceAll("{ch}", pick(slots.ch))
    .replaceAll("{n}", pick(slots.n))
    .replaceAll("{l}", pick(slots.l))
    .replaceAll("{b}", pick(slots.b))
    .replaceAll("{d}", pick(slots.d));
}

export const traps: {
  id: string;
  term: string;
  bad: { ru: string; en: string };
  good: { ru: string; en: string };
}[] = [
  {
    id: "berg",
    term: "zu Berg",
    bad: { ru: "к горе", en: "to the mountain" },
    good: { ru: "вверх по течению, к Кельхайму", en: "upstream, toward Kelheim" },
  },
  {
    id: "tal",
    term: "zu Tal",
    bad: { ru: "в долину", en: "to the valley" },
    good: { ru: "вниз по течению, к морю", en: "downstream, toward the sea" },
  },
  {
    id: "kommen",
    term: "Kommen",
    bad: { ru: "приходи", en: "come here" },
    good: { ru: "приём, жду ответ", en: "over, reply expected" },
  },
  {
    id: "ende",
    term: "Ende",
    bad: { ru: "конец пути", en: "the end of the trip" },
    good: { ru: "конец связи, ответа не жду", en: "out, no reply expected" },
  },
  {
    id: "blue",
    term: "blaue Tafel / синий щит",
    bad: { ru: "синяя табличка, декоративный знак", en: "a blue information sign" },
    good: { ru: "прошу расходиться правыми бортами", en: "request to pass starboard to starboard" },
  },
  {
    id: "port",
    term: "Backbord an Backbord",
    bad: { ru: "ошибка расхождения", en: "a wrong meeting" },
    good: { ru: "обычное расхождение левыми бортами", en: "the normal port-to-port meeting" },
  },
  {
    id: "schub",
    term: "Schubverband",
    bad: { ru: "поезд или морской караван", en: "a railway train or a sea convoy" },
    good: { ru: "толкаемый состав", en: "a pushed convoy" },
  },
  {
    id: "tief",
    term: "Tiefgang",
    bad: { ru: "глубина реки", en: "depth of the river" },
    good: { ru: "осадка судна", en: "the vessel’s draught" },
  },
  {
    id: "km",
    term: "Stromkilometer",
    bad: { ru: "скорость или электрический километр", en: "a speed, or an electric kilometre" },
    good: { ru: "километр Дуная. К морю номер меньше", en: "the Danube kilometre. The number falls toward the sea" },
  },
  {
    id: "hu",
    term: "hegymenet / völgymenet",
    bad: { ru: "поход в горы / в долину", en: "a hike up or down a hill" },
    good: { ru: "венгерский вверх / вниз", en: "Hungarian for upstream / downstream" },
  },
  {
    id: "ro",
    term: "amonte / aval",
    bad: { ru: "названия мест", en: "place names" },
    good: { ru: "румынский вверх / вниз", en: "Romanian for upstream / downstream" },
  },
  {
    id: "nl",
    term: "opvaart / afvaart",
    bad: { ru: "отход от причала", en: "leaving a berth" },
    good: { ru: "нидерландский вверх / вниз", en: "Dutch for upstream / downstream" },
  },
  {
    id: "fr",
    term: "montant / avalant",
    bad: { ru: "поднимающийся груз", en: "rising cargo" },
    good: { ru: "французский вверх / вниз", en: "French for upstream / downstream" },
  },
  {
    id: "ch",
    term: "канал 10 и канал 16",
    bad: { ru: "везде только 16, как в море", en: "channel 16 everywhere, as at sea" },
    good: {
      ru: "на реке чаще 10, у Сулины и в море — 16",
      en: "inland is usually 10; Sulina and the sea use 16",
    },
  },
  {
    id: "mayday",
    term: "MAYDAY / PAN PAN / SÉCURITÉ",
    bad: { ru: "перевести как «майский день» или «безопасность»", en: "translate them as ordinary words" },
    good: {
      ru: "не переводятся: бедствие, срочность, объявление о безопасности",
      en: "never translated: distress, urgency, safety broadcast",
    },
  },
];

function line(lines: Record<LangId, string>): Record<LangId, string> {
  return lines;
}

export const phrases: Phrase[] = [
  {
    id: "call",
    category: "call",
    title: { ru: "Вызов станции", en: "Calling a station" },
    lines: line({
      ru: "{station}, я теплоход {vessel}. Приём.",
      en: "{station}, this is motor vessel {vessel}. Over.",
      de: "{station}, hier Motorschiff {vessel}. Kommen.",
      hu: "{station}, itt a {vessel} motorhajó. Vétel.",
      sk: "{station}, tu motorová loď {vessel}. Príjem.",
      sr: "{station}, ovde motorni brod {vessel}. Prijem.",
      ro: "{station}, aici nava {vessel}. Recepție.",
      bg: "{station}, тук моторен кораб {vessel}. Прием.",
      uk: "{station}, я теплохід {vessel}. Прийом.",
      nl: "{station}, hier motorschip {vessel}. Over.",
      fr: "{station}, ici l'automoteur {vessel}. À vous.",
    }),
  },
  {
    id: "again",
    category: "call",
    title: { ru: "Повторите", en: "Say again" },
    lines: line({
      ru: "Повторите. Приём.",
      en: "Say again. Over.",
      de: "Wiederholen Sie. Kommen.",
      hu: "Ismételje. Vétel.",
      sk: "Zopakujte. Príjem.",
      sr: "Ponovite. Prijem.",
      ro: "Repetați. Recepție.",
      bg: "Повторете. Прием.",
      uk: "Повторіть. Прийом.",
      nl: "Zeg het nog eens. Over.",
      fr: "Répétez. À vous.",
    }),
  },
  {
    id: "slow",
    category: "call",
    title: { ru: "Говорите медленно", en: "Speak slowly" },
    lines: line({
      ru: "Говорите медленно. Приём.",
      en: "Speak slowly. Over.",
      de: "Sprechen Sie langsam. Kommen.",
      hu: "Beszéljen lassan. Vétel.",
      sk: "Hovorte pomaly. Príjem.",
      sr: "Govorite polako. Prijem.",
      ro: "Vorbiți rar. Recepție.",
      bg: "Говорете бавно. Прием.",
      uk: "Говоріть повільно. Прийом.",
      nl: "Spreek langzaam. Over.",
      fr: "Parlez lentement. À vous.",
    }),
  },
  {
    id: "switch",
    category: "call",
    title: { ru: "Смена канала", en: "Change channel" },
    lines: line({
      ru: "Перейдите на канал {ch}. Приём.",
      en: "Switch to channel {ch}. Over.",
      de: "Wechseln Sie auf Kanal {ch}. Kommen.",
      hu: "Váltson a {ch}. csatornára. Vétel.",
      sk: "Prejdite na kanál {ch}. Príjem.",
      sr: "Pređite na kanal {ch}. Prijem.",
      ro: "Treceți pe canalul {ch}. Recepție.",
      bg: "Преминете на канал {ch}. Прием.",
      uk: "Перейдіть на канал {ch}. Прийом.",
      nl: "Schakel over naar kanaal {ch}. Over.",
      fr: "Passez sur le canal {ch}. À vous.",
    }),
  },
  {
    id: "out",
    category: "call",
    title: { ru: "Конец связи", en: "Out" },
    lines: line({
      ru: "Понял. Спасибо. Конец связи.",
      en: "Understood. Thank you. Out.",
      de: "Verstanden. Danke. Ende.",
      hu: "Értettem. Köszönöm. Vége.",
      sk: "Rozumiem. Ďakujem. Koniec.",
      sr: "Razumeo. Hvala. Kraj.",
      ro: "Am înțeles. Mulțumesc. Sfârșit.",
      bg: "Разбрах. Благодаря. Край.",
      uk: "Зрозумів. Дякую. Кінець зв'язку.",
      nl: "Begrepen. Dank u. Uit.",
      fr: "Compris. Merci. Terminé.",
    }),
  },
  {
    id: "port",
    category: "meet",
    title: { ru: "Обычное расхождение, левыми", en: "Normal meeting, port to port" },
    note: {
      ru: "По CEVNI каждый держится правой стороны фарватера. Это не синий щит.",
      en: "Under CEVNI each vessel keeps to the starboard side of the fairway. This is not the blue board.",
    },
    lines: line({
      ru: "Держусь правой стороны фарватера. Расходимся левыми бортами. Приём.",
      en: "I will keep to the starboard side of the fairway. We pass port to port. Over.",
      de: "Ich halte die Steuerbordseite des Fahrwassers. Wir begegnen uns Backbord an Backbord. Kommen.",
      hu: "A hajóút jobb oldalán maradok. Bal oldalakkal találkozunk. Vétel.",
      sk: "Držím sa pravej strany plavebnej dráhy. Míňame sa ľavými bokmi. Príjem.",
      sr: "Držim se desne strane plovnog puta. Mimoilazimo se levim bokovima. Prijem.",
      ro: "Rămân pe partea de tribord a șenalului. Ne întâlnim babord la babord. Recepție.",
      bg: "Държа дясната страна на фарватера. Разминаваме се с леви бордове. Прием.",
      uk: "Тримаюся правого боку фарватеру. Розходимося лівими бортами. Прийом.",
      nl: "Ik houd de stuurboordzijde van het vaarwater. Wij ontmoeten bakboord aan bakboord. Over.",
      fr: "Je me tiens sur tribord du chenal. Nous nous croisons bâbord sur bâbord. À vous.",
    }),
  },
  {
    id: "blue",
    category: "meet",
    title: { ru: "Синий щит, правыми", en: "Blue board, starboard to starboard" },
    note: {
      ru: "Синий щит и белый проблесковый огонь: просьба разойтись правыми бортами. Согласие — тот же сигнал.",
      en: "Blue board and a scintillating white light: a request to pass starboard to starboard. Agreement is the same signal.",
    },
    lines: line({
      ru: "Показываю синий щит. Прошу расходиться правыми бортами. Приём.",
      en: "I am showing the blue board. I request to pass starboard to starboard. Over.",
      de: "Ich zeige die blaue Tafel. Ich bitte um Begegnung Steuerbord an Steuerbord. Kommen.",
      hu: "Kék táblát mutatok. Kérem, hogy jobb oldalakkal térjünk ki. Vétel.",
      sk: "Ukazujem modrú tabuľu. Žiadam o míňanie pravými bokmi. Príjem.",
      sr: "Pokazujem plavu tablu. Molim mimoilaženje desnim bokovima. Prijem.",
      ro: "Arăt panoul albastru. Cer întâlnire tribord la tribord. Recepție.",
      bg: "Показвам синя табела. Моля разминаване с десни бордове. Прием.",
      uk: "Показую синій щит. Прошу розходження правими бортами. Прийом.",
      nl: "Ik voer een blauw bord. Ik vraag een ontmoeting stuurboord aan stuurboord. Over.",
      fr: "Je montre le panneau bleu. Je demande un croisement tribord sur tribord. À vous.",
    }),
  },
  {
    id: "blue-yes",
    category: "meet",
    title: { ru: "Согласен на синий щит", en: "Agree the blue board" },
    lines: line({
      ru: "Согласен. Тоже показываю синий щит. Расходимся правыми бортами. Приём.",
      en: "Agreed. I also show the blue board. We pass starboard to starboard. Over.",
      de: "Einverstanden. Ich zeige ebenfalls die blaue Tafel. Wir begegnen uns Steuerbord an Steuerbord. Kommen.",
      hu: "Egyetértek. Én is kék táblát mutatok. Jobb oldalakkal térünk ki. Vétel.",
      sk: "Súhlasím. Aj ja ukazujem modrú tabuľu. Míňame sa pravými bokmi. Príjem.",
      sr: "Saglasan. I ja pokazujem plavu tablu. Mimoilazimo se desnim bokovima. Prijem.",
      ro: "De acord. Arăt și eu panoul albastru. Ne întâlnim tribord la tribord. Recepție.",
      bg: "Съгласен. И аз показвам синя табела. Разминаваме се с десни бордове. Прием.",
      uk: "Згоден. Теж показую синій щит. Розходимося правими бортами. Прийом.",
      nl: "Akkoord. Ik voer ook een blauw bord. Wij ontmoeten stuurboord aan stuurboord. Over.",
      fr: "D'accord. Je montre aussi le panneau bleu. Nous nous croisons tribord sur tribord. À vous.",
    }),
  },
  {
    id: "overtake",
    category: "over",
    title: { ru: "Обгон по левому борту", en: "Overtake on the port side" },
    note: {
      ru: "Обычный обгон на CEVNI — по левому борту обгоняемого, если не договорились иначе.",
      en: "A normal CEVNI overtaking pass is on the port side of the vessel being overtaken, unless you agree otherwise.",
    },
    lines: line({
      ru: "Намерен обогнать вас по левому борту. Приём.",
      en: "I intend to overtake you on your port side. Over.",
      de: "Ich will Sie an Backbord überholen. Kommen.",
      hu: "Bal oldalról szándékozom előzni. Vétel.",
      sk: "Mienim vás predbehnúť z ľavej strany. Príjem.",
      sr: "Nameravam da vas prestignem s vaše leve strane. Prijem.",
      ro: "Intenționez să vă depășesc prin babord. Recepție.",
      bg: "Възнамерявам да ви изпреваря откъм левия борд. Прием.",
      uk: "Маю намір обігнати вас з лівого борту. Прийом.",
      nl: "Ik wil u aan bakboord oplopen. Over.",
      fr: "Je compte vous dépasser par bâbord. À vous.",
    }),
  },
  {
    id: "over-yes",
    category: "over",
    title: { ru: "Согласен на обгон", en: "Agree to be overtaken" },
    lines: line({
      ru: "Согласен. Обгоняйте по моему левому борту. Приём.",
      en: "Agreed. Overtake on my port side. Over.",
      de: "Einverstanden. Überholen Sie an meiner Backbordseite. Kommen.",
      hu: "Egyetértek. Előzzön a bal oldalamon. Vétel.",
      sk: "Súhlasím. Predbehnite ma z ľavej strany. Príjem.",
      sr: "Saglasan. Prestignite me s leve strane. Prijem.",
      ro: "De acord. Depășiți-mă prin babord. Recepție.",
      bg: "Съгласен. Изпреварете ме откъм левия борд. Прием.",
      uk: "Згоден. Обганяйте з мого лівого борту. Прийом.",
      nl: "Akkoord. Loop mij aan bakboord op. Over.",
      fr: "D'accord. Dépassez-moi par bâbord. À vous.",
    }),
  },
  {
    id: "over-no",
    category: "over",
    title: { ru: "Обгон нельзя", en: "Do not overtake" },
    lines: line({
      ru: "Отрицательно. Не обгоняйте. Фарватер не свободен. Приём.",
      en: "Negative. Do not overtake. The fairway is not clear. Over.",
      de: "Negativ. Nicht überholen. Das Fahrwasser ist nicht frei. Kommen.",
      hu: "Nemleges. Ne előzzön. A hajóút nem szabad. Vétel.",
      sk: "Záporne. Nepredbiehajte. Plavebná dráha nie je voľná. Príjem.",
      sr: "Negativno. Ne prestižite. Plovni put nije slobodan. Prijem.",
      ro: "Negativ. Nu depășiți. Șenalul nu este liber. Recepție.",
      bg: "Отрицателно. Не изпреварвайте. Фарватерът не е свободен. Прием.",
      uk: "Негативно. Не обганяйте. Фарватер не вільний. Прийом.",
      nl: "Negatief. Niet oplopen. Het vaarwater is niet vrij. Over.",
      fr: "Négatif. Ne dépassez pas. Le chenal n'est pas libre. À vous.",
    }),
  },
  {
    id: "lock-down",
    category: "lock",
    title: { ru: "Шлюзование вниз", en: "Downstream lockage" },
    lines: line({
      ru: "Шлюз {station}, я теплоход {vessel}. Прошу шлюзование вниз. Километр {km}. Осадка {d} метра. Приём.",
      en: "Lock {station}, this is motor vessel {vessel}. I request downstream lockage. Kilometre {km}. Draught {d} metres. Over.",
      de: "Schleuse {station}, hier Motorschiff {vessel}. Ich bitte um Talschleusung. Stromkilometer {km}. Tiefgang {d} Meter. Kommen.",
      hu: "{station} zsilip, itt a {vessel} motorhajó. Völgymeneti zsilipelést kérek. Folyamkilométer {km}. Merülés {d} méter. Vétel.",
      sk: "Plavebná komora {station}, tu loď {vessel}. Žiadam o preplavenie po prúde. Kilometer {km}. Ponor {d} metre. Príjem.",
      sr: "Prevodnica {station}, ovde motorni brod {vessel}. Molim nizvodni prolaz. Kilometar {km}. Gaz {d} metara. Prijem.",
      ro: "Ecluza {station}, aici nava {vessel}. Cer ecluzare în aval. Kilometrul {km}. Pescaj {d} metri. Recepție.",
      bg: "Шлюз {station}, тук моторен кораб {vessel}. Моля шлюзоване по течението. Километър {km}. Газене {d} метра. Прием.",
      uk: "Шлюз {station}, я теплохід {vessel}. Прошу шлюзування вниз. Кілометр {km}. Осадка {d} метра. Прийом.",
      nl: "Sluis {station}, hier motorschip {vessel}. Ik vraag een schutting afvarend. Kilometerraai {km}. Diepgang {d} meter. Over.",
      fr: "Écluse {station}, ici l'automoteur {vessel}. Je demande une éclusée avalante. Point kilométrique {km}. Tirant d'eau {d} mètres. À vous.",
    }),
  },
  {
    id: "lock-up",
    category: "lock",
    title: { ru: "Шлюзование вверх", en: "Upstream lockage" },
    lines: line({
      ru: "Шлюз {station}, я теплоход {vessel}. Прошу шлюзование вверх. Километр {km}. Осадка {d} метра. Приём.",
      en: "Lock {station}, this is motor vessel {vessel}. I request upstream lockage. Kilometre {km}. Draught {d} metres. Over.",
      de: "Schleuse {station}, hier Motorschiff {vessel}. Ich bitte um Bergschleusung. Stromkilometer {km}. Tiefgang {d} Meter. Kommen.",
      hu: "{station} zsilip, itt a {vessel} motorhajó. Hegymeneti zsilipelést kérek. Folyamkilométer {km}. Merülés {d} méter. Vétel.",
      sk: "Plavebná komora {station}, tu loď {vessel}. Žiadam o preplavenie proti prúdu. Kilometer {km}. Ponor {d} metre. Príjem.",
      sr: "Prevodnica {station}, ovde motorni brod {vessel}. Molim uzvodni prolaz. Kilometar {km}. Gaz {d} metara. Prijem.",
      ro: "Ecluza {station}, aici nava {vessel}. Cer ecluzare în amonte. Kilometrul {km}. Pescaj {d} metri. Recepție.",
      bg: "Шлюз {station}, тук моторен кораб {vessel}. Моля шлюзоване срещу течението. Километър {km}. Газене {d} метра. Прием.",
      uk: "Шлюз {station}, я теплохід {vessel}. Прошу шлюзування вгору. Кілометр {km}. Осадка {d} метра. Прийом.",
      nl: "Sluis {station}, hier motorschip {vessel}. Ik vraag een schutting opvarend. Kilometerraai {km}. Diepgang {d} meter. Over.",
      fr: "Écluse {station}, ici l'automoteur {vessel}. Je demande une éclusée montante. Point kilométrique {km}. Tirant d'eau {d} mètres. À vous.",
    }),
  },
  {
    id: "waiting",
    category: "lock",
    title: { ru: "Стою на ожидании", en: "At the waiting berth" },
    lines: line({
      ru: "Стою на ожидании, километр {km}. Готов к шлюзованию. Приём.",
      en: "I am at the waiting berth, kilometre {km}. Ready for lockage. Over.",
      de: "Ich liege am Warteplatz, Stromkilometer {km}. Bereit zur Schleusung. Kommen.",
      hu: "A várakozóhelynél állok, folyamkilométer {km}. Kész vagyok a zsilipelésre. Vétel.",
      sk: "Stojím na vyčkávaní, kilometer {km}. Pripravený na preplavenie. Príjem.",
      sr: "Stojim na čekanju, kilometar {km}. Spreman za prevodnicu. Prijem.",
      ro: "Sunt la dana de așteptare, kilometrul {km}. Gata de ecluzare. Recepție.",
      bg: "Стоя на изчакване, километър {km}. Готов съм за шлюзоване. Прием.",
      uk: "Стою на очікуванні, кілометр {km}. Готовий до шлюзування. Прийом.",
      nl: "Ik lig op de wachtplaats, kilometerraai {km}. Gereed voor de schutting. Over.",
      fr: "Je suis au garage d'attente, point kilométrique {km}. Prêt pour l'éclusée. À vous.",
    }),
  },
  {
    id: "up",
    category: "move",
    title: { ru: "Иду вверх", en: "Proceeding upstream" },
    lines: line({
      ru: "Иду вверх по течению. Моя позиция — километр {km}. Приём.",
      en: "I am proceeding upstream. My position is kilometre {km}. Over.",
      de: "Ich fahre zu Berg. Mein Standort ist Stromkilometer {km}. Kommen.",
      hu: "Hegymenetben megyek. A pozícióm a {km}. folyamkilométer. Vétel.",
      sk: "Plavím sa proti prúdu. Moja poloha je kilometer {km}. Príjem.",
      sr: "Plovim uzvodno. Moj položaj je kilometar {km}. Prijem.",
      ro: "Navighez în amonte. Poziția mea este kilometrul {km}. Recepție.",
      bg: "Движа се срещу течението. Позицията ми е километър {km}. Прием.",
      uk: "Іду вгору за течією. Моя позиція — кілометр {km}. Прийом.",
      nl: "Ik vaar op. Mijn positie is kilometerraai {km}. Over.",
      fr: "Je suis montant. Ma position est le point kilométrique {km}. À vous.",
    }),
  },
  {
    id: "down",
    category: "move",
    title: { ru: "Иду вниз", en: "Proceeding downstream" },
    lines: line({
      ru: "Иду вниз по течению. Моя позиция — километр {km}. Приём.",
      en: "I am proceeding downstream. My position is kilometre {km}. Over.",
      de: "Ich fahre zu Tal. Mein Standort ist Stromkilometer {km}. Kommen.",
      hu: "Völgymenetben megyek. A pozícióm a {km}. folyamkilométer. Vétel.",
      sk: "Plavím sa po prúde. Moja poloha je kilometer {km}. Príjem.",
      sr: "Plovim nizvodno. Moj položaj je kilometar {km}. Prijem.",
      bg: "Движа се по течението. Позицията ми е километър {km}. Прием.",
      ro: "Navighez în aval. Poziția mea este kilometrul {km}. Recepție.",
      uk: "Іду вниз за течією. Моя позиція — кілометр {km}. Прийом.",
      nl: "Ik vaar af. Mijn positie is kilometerraai {km}. Over.",
      fr: "Je suis avalant. Ma position est le point kilométrique {km}. À vous.",
    }),
  },
  {
    id: "convoy",
    category: "move",
    title: { ru: "Толкаемый состав", en: "Pushed convoy" },
    lines: line({
      ru: "Я толкаемый состав. Длина {l} метров, ширина {b} метров, осадка {d} метра. Приём.",
      en: "I am a pushed convoy. Length {l} metres, breadth {b} metres, draught {d} metres. Over.",
      de: "Ich bin ein Schubverband. Länge {l} Meter, Breite {b} Meter, Tiefgang {d} Meter. Kommen.",
      hu: "Tolt kötelék vagyok. Hossz {l} méter, szélesség {b} méter, merülés {d} méter. Vétel.",
      sk: "Som tlačený zostav. Dĺžka {l} metrov, šírka {b} metrov, ponor {d} metrov. Príjem.",
      sr: "Ja sam potisnuti sastav. Dužina {l} metara, širina {b} metara, gaz {d} metara. Prijem.",
      ro: "Sunt un convoi împins. Lungime {l} metri, lățime {b} metri, pescaj {d} metri. Recepție.",
      bg: "Аз съм тласкан състав. Дължина {l} метра, ширина {b} метра, газене {d} метра. Прием.",
      uk: "Я штовханий склад. Довжина {l} метрів, ширина {b} метрів, осадка {d} метра. Прийом.",
      nl: "Ik ben een duwstel. Lengte {l} meter, breedte {b} meter, diepgang {d} meter. Over.",
      fr: "Je suis un convoi poussé. Longueur {l} mètres, largeur {b} mètres, tirant d'eau {d} mètres. À vous.",
    }),
  },
  {
    id: "slow-down",
    category: "move",
    title: { ru: "Уменьшаю ход", en: "Reducing speed" },
    lines: line({
      ru: "Уменьшаю ход. Приём.",
      en: "I will reduce speed. Over.",
      de: "Ich werde die Fahrt vermindern. Kommen.",
      hu: "Csökkentem a sebességet. Vétel.",
      sk: "Znížim rýchlosť. Príjem.",
      sr: "Smanjujem brzinu. Prijem.",
      ro: "Reduc viteza. Recepție.",
      bg: "Намалявам хода. Прием.",
      uk: "Зменшую хід. Прийом.",
      nl: "Ik zal vaart minderen. Over.",
      fr: "Je réduis ma vitesse. À vous.",
    }),
  },
  {
    id: "securite",
    category: "distress",
    title: { ru: "Sécurité: препятствие", en: "Sécurité: obstacle" },
    note: {
      ru: "Объявление о безопасности. Слово SÉCURITÉ не переводится. Ответа обычно не ждут.",
      en: "A safety broadcast. The word SÉCURITÉ is not translated. A reply is usually not expected.",
    },
    lines: line({
      ru: "SÉCURITÉ, SÉCURITÉ, SÉCURITÉ. Всем станциям, я {vessel}. Плавающее препятствие на фарватере, километр {km}. Идите осторожно. Конец связи.",
      en: "SÉCURITÉ, SÉCURITÉ, SÉCURITÉ. All stations, this is {vessel}. Floating obstacle in the fairway at kilometre {km}. Navigate with caution. Out.",
      de: "SÉCURITÉ, SÉCURITÉ, SÉCURITÉ. An alle Funkstellen, hier {vessel}. Schwimmendes Hindernis im Fahrwasser bei Stromkilometer {km}. Mit Vorsicht fahren. Ende.",
      hu: "SÉCURITÉ, SÉCURITÉ, SÉCURITÉ. Minden állomásnak, itt {vessel}. Lebegő akadály a hajóútban, folyamkilométer {km}. Óvatosan haladjanak. Vége.",
      sk: "SÉCURITÉ, SÉCURITÉ, SÉCURITÉ. Všetkým staniciam, tu {vessel}. Plávajúca prekážka v plavebnej dráhe, kilometer {km}. Plavte opatrne. Koniec.",
      sr: "SÉCURITÉ, SÉCURITÉ, SÉCURITÉ. Svim stanicama, ovde {vessel}. Plutajuća prepreka na plovnom putu, kilometar {km}. Plovite oprezno. Kraj.",
      ro: "SÉCURITÉ, SÉCURITÉ, SÉCURITÉ. Tuturor stațiilor, aici {vessel}. Obstacol plutitor în șenal, kilometrul {km}. Navigați cu prudență. Sfârșit.",
      bg: "SÉCURITÉ, SÉCURITÉ, SÉCURITÉ. На всички станции, тук {vessel}. Плаващо препятствие във фарватера, километър {km}. Плавайте внимателно. Край.",
      uk: "SÉCURITÉ, SÉCURITÉ, SÉCURITÉ. Усім станціям, я {vessel}. Плавуча перешкода на фарватері, кілометр {km}. Йдіть обережно. Кінець зв'язку.",
      nl: "SÉCURITÉ, SÉCURITÉ, SÉCURITÉ. Aan alle stations, hier {vessel}. Drijvend obstakel in het vaarwater bij kilometerraai {km}. Vaar voorzichtig. Uit.",
      fr: "SÉCURITÉ, SÉCURITÉ, SÉCURITÉ. À toutes les stations, ici {vessel}. Obstacle flottant dans le chenal au point kilométrique {km}. Naviguez avec prudence. Terminé.",
    }),
  },
  {
    id: "pan",
    category: "distress",
    title: { ru: "Pan Pan: на мели", en: "Pan Pan: aground" },
    note: {
      ru: "Срочность, если затопление не грозит прямо сейчас. Если грозит — это уже MAYDAY.",
      en: "Urgency, when you are not in immediate danger of sinking. If you are, it is MAYDAY.",
    },
    lines: line({
      ru: "PAN PAN, PAN PAN, PAN PAN. {station}, я {vessel}. Сижу на мели, километр {km}. Непосредственной угрозы затопления нет. Нужна помощь буксира. Приём.",
      en: "PAN PAN, PAN PAN, PAN PAN. {station}, this is {vessel}. I am aground at kilometre {km}. No immediate danger of sinking. I require tug assistance. Over.",
      de: "PAN PAN, PAN PAN, PAN PAN. {station}, hier {vessel}. Ich bin festgekommen bei Stromkilometer {km}. Keine unmittelbare Sinkgefahr. Ich brauche Schlepperhilfe. Kommen.",
      hu: "PAN PAN, PAN PAN, PAN PAN. {station}, itt {vessel}. Megfeneklettem a {km}. folyamkilométernél. Nincs közvetlen elsüllyedésveszély. Vontatósegítség kell. Vétel.",
      sk: "PAN PAN, PAN PAN, PAN PAN. {station}, tu {vessel}. Som na plytčine, kilometer {km}. Nie je bezprostredné nebezpečenstvo potopenia. Potrebujem remorkér. Príjem.",
      sr: "PAN PAN, PAN PAN, PAN PAN. {station}, ovde {vessel}. Nasukan sam na kilometru {km}. Nema neposredne opasnosti od potonuća. Treba mi tegljač. Prijem.",
      ro: "PAN PAN, PAN PAN, PAN PAN. {station}, aici {vessel}. Sunt eșuat la kilometrul {km}. Nu există pericol imediat de scufundare. Am nevoie de un remorcher. Recepție.",
      bg: "PAN PAN, PAN PAN, PAN PAN. {station}, тук {vessel}. Заседнал съм на километър {km}. Няма непосредствена опасност от потъване. Нуждая се от влекач. Прием.",
      uk: "PAN PAN, PAN PAN, PAN PAN. {station}, я {vessel}. Сиджу на мілині, кілометр {km}. Безпосередньої загрози затоплення немає. Потрібна допомога буксира. Прийом.",
      nl: "PAN PAN, PAN PAN, PAN PAN. {station}, hier {vessel}. Ik zit aan de grond bij kilometerraai {km}. Geen onmiddellijk zinkgevaar. Ik heb een sleepboot nodig. Over.",
      fr: "PAN PAN, PAN PAN, PAN PAN. {station}, ici {vessel}. Je suis échoué au point kilométrique {km}. Pas de danger immédiat de couler. J'ai besoin d'un remorqueur. À vous.",
    }),
  },
  {
    id: "mayday",
    category: "distress",
    title: { ru: "Mayday: принимаю воду", en: "Mayday: taking water" },
    note: {
      ru: "Только при реальной и непосредственной опасности. Слово MAYDAY не переводится и не смягчается.",
      en: "Only in grave and imminent danger. The word MAYDAY is not translated and not softened.",
    },
    lines: line({
      ru: "MAYDAY MAYDAY MAYDAY. Я {vessel}, {vessel}, {vessel}. MAYDAY {vessel}. Дунай, километр {km}. Принимаю воду, нужна немедленная помощь. Приём.",
      en: "MAYDAY MAYDAY MAYDAY. This is {vessel}, {vessel}, {vessel}. MAYDAY {vessel}. Danube kilometre {km}. I am taking water and I require immediate assistance. Over.",
      de: "MAYDAY MAYDAY MAYDAY. Hier {vessel}, {vessel}, {vessel}. MAYDAY {vessel}. Donau Stromkilometer {km}. Ich mache Wasser und brauche sofortige Hilfe. Kommen.",
      hu: "MAYDAY MAYDAY MAYDAY. Itt {vessel}, {vessel}, {vessel}. MAYDAY {vessel}. Duna, folyamkilométer {km}. Vizet kapok, azonnali segítség kell. Vétel.",
      sk: "MAYDAY MAYDAY MAYDAY. Tu {vessel}, {vessel}, {vessel}. MAYDAY {vessel}. Dunaj, kilometer {km}. Naberam vodu a potrebujem okamžitú pomoc. Príjem.",
      sr: "MAYDAY MAYDAY MAYDAY. Ovde {vessel}, {vessel}, {vessel}. MAYDAY {vessel}. Dunav, kilometar {km}. Prodire voda, potrebna je hitna pomoć. Prijem.",
      ro: "MAYDAY MAYDAY MAYDAY. Aici {vessel}, {vessel}, {vessel}. MAYDAY {vessel}. Dunăre, kilometrul {km}. Am infiltrații de apă și am nevoie de ajutor imediat. Recepție.",
      bg: "MAYDAY MAYDAY MAYDAY. Тук {vessel}, {vessel}, {vessel}. MAYDAY {vessel}. Дунав, километър {km}. Приемам вода и се нуждая от незабавна помощ. Прием.",
      uk: "MAYDAY MAYDAY MAYDAY. Я {vessel}, {vessel}, {vessel}. MAYDAY {vessel}. Дунай, кілометр {km}. Приймаю воду, потрібна негайна допомога. Прийом.",
      nl: "MAYDAY MAYDAY MAYDAY. Hier {vessel}, {vessel}, {vessel}. MAYDAY {vessel}. Donau kilometerraai {km}. Ik maak water en heb onmiddellijk hulp nodig. Over.",
      fr: "MAYDAY MAYDAY MAYDAY. Ici {vessel}, {vessel}, {vessel}. MAYDAY {vessel}. Danube, point kilométrique {km}. Je fais eau et j'ai besoin d'une assistance immédiate. À vous.",
    }),
  },
];
