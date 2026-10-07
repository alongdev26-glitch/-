// Each language has its own national edition of the board: famous streets of that
// country, its own currency and its own card texts. Prices, rents and rules are the same.
import type { Lang } from '../i18n';
import { BOARD, GO_SALARY } from './board';
import { CHANCE, CHEST, type CardEffect } from './cards';

export interface Edition {
  /** money as shown in this edition */
  money: (n: number) => string;
  /** the currency sign alone (flying bills) */
  symbol: string;
  /** name of every space, by board index (0–39) */
  names: string[];
  /** city of each property (empty for the other spaces) */
  cities: Record<number, string>;
  /** corner squares, split over two lines */
  corners: {
    goNote: string;
    go: string;
    jail: string;
    visiting: string;
    parking1: string;
    parking2: string;
    toJail1: string;
    toJail2: string;
  };
  /** the two card decks */
  chestName: string;
  chanceName: string;
  railsTitle: string;
  utilitiesTitle: string;
  /** card texts in the order of cards.ts, as templates: {a} amount (or per house), {b} per hotel,
   *  {to} the destination, {go} the start square, {n} steps */
  chance: string[];
  chest: string[];
  /** the menu subtitle */
  tagline: string;
  /** default names for the computer players */
  bots: string[];
  /** how a street and its city are written together (default "street, city") */
  place?: (street: string, city: string) => string;
}

const he: Edition = {
  money: (n) => `ש"ח ${n}`,
  symbol: '₪',
  names: [
    'דרך צלחה', "שד' התמרים", 'תיבת המזל', 'דרך הערבה', 'מס הכנסה', 'רכבת דרום',
    "רח' הגליל", 'הפתעה', "רח' הירדן", "רח' הבנים", 'בכלא',
    "שד' שזר", 'חברת החשמל', 'רח\' קק"ל', "שד' רגר", 'רכבת מרכז',
    "שד' בנימין", 'תיבת המזל', "רח' הרצל", 'כיכר העצמאות', 'חניה חינם',
    'דרך אבא הלל', 'הפתעה', "רח' ז'בוטינסקי", "רח' ביאליק", 'רכבת מזרח',
    'דרך העצמאות', "רח' החלוץ", 'חברת המים', "שד' מוריה", 'גש לכלא',
    "רח' יפו", "רח' בן יהודה", 'תיבת המזל', "רח' המלך ג'ורג'", 'רכבת צפון',
    'הפתעה', "רח' אלנבי", 'מס מותרות', "רח' דיזנגוף",
  ],
  cities: {
    1: 'אילת', 3: 'אילת',
    6: 'טבריה', 8: 'טבריה', 9: 'טבריה',
    11: 'באר-שבע', 13: 'באר-שבע', 14: 'באר-שבע',
    16: 'נתניה', 18: 'נתניה', 19: 'נתניה',
    21: 'רמת-גן', 23: 'רמת-גן', 24: 'רמת-גן',
    26: 'חיפה', 27: 'חיפה', 29: 'חיפה',
    31: 'ירושלים', 32: 'ירושלים', 34: 'ירושלים',
    37: 'תל-אביב', 39: 'תל-אביב',
  },
  corners: {
    goNote: 'כל העובר מקבל ש"ח 200',
    go: 'דרך צלחה',
    jail: 'בכלא',
    visiting: 'רק מבקר',
    parking1: 'חניה',
    parking2: 'חינם',
    toJail1: 'גש',
    toJail2: 'לכלא',
  },
  chestName: 'תיבת המזל',
  chanceName: 'הפתעה',
  railsTitle: 'רכבות',
  utilitiesTitle: 'חברות',
  chance: [
    "מונית לוקחת אותך ל\"{go}\": קבל {a}",
    "סוף שבוע חופשי! סע ל{to}",
    "הופעה בעיר: התקדם ל{to}",
    "סידורים בחברה הקרובה. אם יש לה בעלים, שלם פי 10 מהקוביות",
    "תפוס את הרכבת הקרובה. אם יש לה בעלים, שלם כפול",
    "כרטיס גירוד זוכה! קבל {a}",
    "חבר עורך דין מוציא אותך מהכלא. שמור את הכרטיס",
    "שכחת את המפתחות! חזור {n} משבצות",
    "נתפסת חוצה באדום. ישר לכלא, בלי לעבור ב\"{go}\"",
    "הגג דולף: שלם {a} לכל בית ו-{b} לכל מלון",
    "דוח חניה: שלם {a}",
    "טיול ברכבת: סע ל{to}",
    "יום קניות! התקדם ל{to}",
    "עשית מסיבה: שלם לכל שחקן {a}",
    "האפליקציה שלך הפכה ויראלית: קבל {a}",
    "גיוס המונים: כל שחקן נותן לך {a}",
  ],
  chest: [
    "אוטובוס חינם ל\"{go}\": קבל {a}",
    "זכית בתחרות בישול: קבל {a}",
    "ביקור אצל רופא השיניים: שלם {a}",
    "מכרת את האופניים הישנים: קבל {a}",
    "צא מהכלא חינם. שמור את הכרטיס",
    "לכלא! בלי לעבור ב\"{go}\"",
    "בונוס בעבודה: קבל {a}",
    "מצאת כסף במעיל ישן: קבל {a}",
    "יום הולדת! כל שחקן נותן לך {a}",
    "תוכנית החיסכון הבשילה: קבל {a}",
    "המכונית במוסך: שלם {a}",
    "מנוי לחדר כושר: שלם {a}",
    "שמרטפות: קבל {a}",
    "שיפוץ בבית: שלם {a} לכל בית ו-{b} לכל מלון",
    "זכית בהגרלה: קבל {a}",
    "סבתא שלחה מתנה: קבל {a}",
  ],
  tagline: 'משחק המסחר בנכסים: ירושלים, תל-אביב, חיפה ועוד',
  bots: ['הנרי', 'מרק', 'סופיה'],
};

const en: Edition = {
  money: (n) => `$${n}`,
  symbol: '$',
  names: [
    'START', 'Bourbon Street', 'Lucky Chest', 'Canal Street', 'Income Tax', 'South Station',
    'Broadway', 'Surprise', 'Music Row', 'Demonbreun Street', 'Jail',
    'Michigan Avenue', 'Electric Company', 'State Street', 'Wacker Drive', 'Union Station',
    'Ocean Drive', 'Lucky Chest', 'Collins Avenue', 'Lincoln Road', 'No-Fee Parking',
    'The Strip', 'Surprise', 'Fremont Street', 'Paradise Road', 'Penn Station',
    'Sunset Boulevard', 'Hollywood Boulevard', 'Water Works', 'Rodeo Drive', 'Off to Jail',
    'Lombard Street', 'Market Street', 'Lucky Chest', 'Castro Street', 'Grand Central',
    'Surprise', 'Wall Street', 'Luxury Tax', 'Fifth Avenue',
  ],
  cities: {
    1: 'New Orleans', 3: 'New Orleans',
    6: 'Nashville', 8: 'Nashville', 9: 'Nashville',
    11: 'Chicago', 13: 'Chicago', 14: 'Chicago',
    16: 'Miami', 18: 'Miami', 19: 'Miami',
    21: 'Las Vegas', 23: 'Las Vegas', 24: 'Las Vegas',
    26: 'Los Angeles', 27: 'Los Angeles', 29: 'Los Angeles',
    31: 'San Francisco', 32: 'San Francisco', 34: 'San Francisco',
    37: 'New York', 39: 'New York',
  },
  corners: {
    goNote: 'Collect $200 as you pass',
    go: 'START',
    jail: 'In Jail',
    visiting: 'Visiting',
    parking1: 'No-Fee',
    parking2: 'Parking',
    toJail1: 'Off to',
    toJail2: 'Jail',
  },
  chestName: 'Lucky Chest',
  chanceName: 'Surprise',
  railsTitle: 'Stations',
  utilitiesTitle: 'Utilities',
  chance: [
    "A taxi takes you to {go}: collect {a}",
    "Weekend getaway! Go to {to}",
    "Concert in town: advance to {to}",
    "Errands at the nearest utility. If it is owned, pay 10× the dice",
    "Catch the nearest train. If the station is owned, pay double",
    "Winning scratch card! Collect {a}",
    "Your lawyer friend gets you out of jail. Keep this card",
    "You forgot your keys! Go back {n} spaces",
    "Caught crossing on red. Straight to jail, without passing {go}",
    "The roof leaks: pay {a} per house and {b} per hotel",
    "Parking ticket: pay {a}",
    "Train trip: go to {to}",
    "Shopping day! Advance to {to}",
    "You threw a party: pay each player {a}",
    "Your app went viral: collect {a}",
    "Crowdfunding: every player gives you {a}",
  ],
  chest: [
    "Free bus to {go}: collect {a}",
    "You won a cooking contest: collect {a}",
    "Dentist visit: pay {a}",
    "You sold your old bike: collect {a}",
    "Get out of jail free. Keep this card",
    "Off to jail! Without passing {go}",
    "Bonus at work: collect {a}",
    "Found money in an old coat: collect {a}",
    "It's your birthday! Every player gives you {a}",
    "Your savings plan matures: collect {a}",
    "The car is in the garage: pay {a}",
    "Gym membership: pay {a}",
    "Babysitting money: collect {a}",
    "Home renovation: pay {a} per house and {b} per hotel",
    "You won a raffle: collect {a}",
    "Grandma sent a gift: collect {a}",
  ],
  tagline: 'The property trading game: New York, Las Vegas, Miami and more',
  bots: ['Henry', 'Mark', 'Sophia'],
};

const ar: Edition = {
  money: (n) => `${n} د.إ`,
  symbol: 'د.إ',
  names: [
    'انطلق', 'كورنيش أم القيوين', 'صندوق الحظ', 'السوق القديم', 'ضريبة الدخل', 'محطة الاتحاد',
    'كورنيش الفجيرة', 'مفاجأة', 'شارع حمد بن عبدالله', 'شارع الشيخ زايد بن سلطان', 'السجن',
    'كورنيش عجمان', 'هيئة الكهرباء', 'شارع الشيخ خليفة', 'شارع الجرف', 'محطة برج خليفة',
    'جزيرة المرجان', 'صندوق الحظ', 'شارع النخيل', 'شارع الشيخ محمد بن سالم', 'موقف بلا رسوم',
    'القصباء', 'مفاجأة', 'المجاز', 'شارع الملك فيصل', 'محطة المطار',
    'شارع خليفة', 'شارع زايد الأول', 'هيئة المياه', 'جبل حفيت', 'اذهب إلى السجن',
    'كورنيش أبوظبي', 'جزيرة ياس', 'صندوق الحظ', 'جزيرة السعديات', 'محطة مول الإمارات',
    'مفاجأة', 'نخلة جميرا', 'ضريبة الرفاهية', 'داون تاون دبي',
  ],
  cities: {
    1: 'أم القيوين', 3: 'أم القيوين',
    6: 'الفجيرة', 8: 'الفجيرة', 9: 'الفجيرة',
    11: 'عجمان', 13: 'عجمان', 14: 'عجمان',
    16: 'رأس الخيمة', 18: 'رأس الخيمة', 19: 'رأس الخيمة',
    21: 'الشارقة', 23: 'الشارقة', 24: 'الشارقة',
    26: 'العين', 27: 'العين', 29: 'العين',
    31: 'أبوظبي', 32: 'أبوظبي', 34: 'أبوظبي',
    37: 'دبي', 39: 'دبي',
  },
  corners: {
    goNote: 'خذ 200 د.إ عند المرور',
    go: 'انطلق',
    jail: 'في السجن',
    visiting: 'زيارة فقط',
    parking1: 'موقف',
    parking2: 'بلا رسوم',
    toJail1: 'اذهب إلى',
    toJail2: 'السجن',
  },
  chestName: 'صندوق الحظ',
  chanceName: 'مفاجأة',
  railsTitle: 'محطات المترو',
  utilitiesTitle: 'الهيئات',
  chance: [
    "سيارة أجرة توصلك إلى \"{go}\": خذ {a}",
    "عطلة نهاية الأسبوع! اذهب إلى {to}",
    "حفلة في المدينة: تقدّم إلى {to}",
    "مشاوير عند أقرب هيئة. إذا كانت مملوكة، ادفع 10 أضعاف النرد",
    "الحق بأقرب قطار. إذا كانت المحطة مملوكة، ادفع الضعف",
    "بطاقة خدش رابحة! خذ {a}",
    "صديقك المحامي يخرجك من السجن. احتفظ بالبطاقة",
    "نسيت المفاتيح! ارجع {n} خانات",
    "عبرت والإشارة حمراء. إلى السجن مباشرة دون المرور بـ\"{go}\"",
    "السقف يسرّب: ادفع {a} عن كل بيت و{b} عن كل فندق",
    "مخالفة وقوف: ادفع {a}",
    "رحلة بالقطار: اذهب إلى {to}",
    "يوم تسوّق! تقدّم إلى {to}",
    "أقمت حفلة: ادفع لكل لاعب {a}",
    "تطبيقك انتشر بسرعة: خذ {a}",
    "تمويل جماعي: كل لاعب يعطيك {a}",
  ],
  chest: [
    "حافلة مجانية إلى \"{go}\": خذ {a}",
    "فزت بمسابقة طبخ: خذ {a}",
    "زيارة طبيب الأسنان: ادفع {a}",
    "بعت دراجتك القديمة: خذ {a}",
    "اخرج من السجن مجانًا. احتفظ بالبطاقة",
    "إلى السجن! دون المرور بـ\"{go}\"",
    "مكافأة في العمل: خذ {a}",
    "وجدت مالًا في معطف قديم: خذ {a}",
    "عيد ميلادك! كل لاعب يعطيك {a}",
    "خطة الادخار استحقت: خذ {a}",
    "السيارة في الورشة: ادفع {a}",
    "اشتراك النادي الرياضي: ادفع {a}",
    "مجالسة الأطفال: خذ {a}",
    "تجديد البيت: ادفع {a} عن كل بيت و{b} عن كل فندق",
    "ربحت في السحب: خذ {a}",
    "هدية من الجدة: خذ {a}",
  ],
  tagline: 'لعبة تجارة العقارات: دبي، أبوظبي، الشارقة والمزيد',
  bots: ['سالم', 'مريم', 'خالد'],
};

const fr: Edition = {
  money: (n) => `${n} €`,
  symbol: '€',
  names: [
    'Départ', 'Rue de Béthune', 'Coffre chance', 'Grand-Place', 'Impôts', 'Gare du Nord',
    'La Canebière', 'Surprise', 'Vieux-Port', 'Corniche Kennedy', 'Prison',
    "Cours de l'Intendance", "Compagnie d'électricité", 'Place de la Bourse', 'Rue Sainte-Catherine', 'Gare de Lyon',
    'Rue de la République', 'Coffre chance', 'Place Bellecour', 'Vieux Lyon', 'Parking sans frais',
    'Promenade des Anglais', 'Surprise', 'Place Masséna', 'Cours Saleya', "Gare de l'Est",
    'La Croisette', "Rue d'Antibes", 'Compagnie des eaux', 'Le Suquet', 'Allez en prison',
    'Avenue de l\'Impératrice', 'Rue Mazagran', 'Coffre chance', 'Avenue Édouard VII', 'Gare Montparnasse',
    'Surprise', 'Avenue Montaigne', 'Taxe de luxe', 'Champs-Élysées',
  ],
  cities: {
    1: 'Lille', 3: 'Lille',
    6: 'Marseille', 8: 'Marseille', 9: 'Marseille',
    11: 'Bordeaux', 13: 'Bordeaux', 14: 'Bordeaux',
    16: 'Lyon', 18: 'Lyon', 19: 'Lyon',
    21: 'Nice', 23: 'Nice', 24: 'Nice',
    26: 'Cannes', 27: 'Cannes', 29: 'Cannes',
    31: 'Biarritz', 32: 'Biarritz', 34: 'Biarritz',
    37: 'Paris', 39: 'Paris',
  },
  corners: {
    goNote: 'Recevez 200 € en passant',
    go: 'Départ',
    jail: 'En prison',
    visiting: 'En visite',
    parking1: 'Parking',
    parking2: 'sans frais',
    toJail1: 'Allez en',
    toJail2: 'prison',
  },
  chestName: 'Coffre chance',
  chanceName: 'Surprise',
  railsTitle: 'Gares',
  utilitiesTitle: 'Compagnies',
  chance: [
    "Un taxi vous emmène au « {go} » : recevez {a}",
    "Week-end évasion ! Allez à : {to}",
    "Concert en ville : avancez jusqu'à {to}",
    "Démarches à la compagnie la plus proche. Si elle a un propriétaire, payez 10× les dés",
    "Prenez le train le plus proche. Si la gare a un propriétaire, payez le double",
    "Ticket à gratter gagnant ! Recevez {a}",
    "Votre ami avocat vous sort de prison. Gardez cette carte",
    "Vous avez oublié vos clés ! Reculez de {n} cases",
    "Pris à traverser au rouge. Direct en prison, sans passer par « {go} »",
    "Le toit fuit : payez {a} par maison et {b} par hôtel",
    "Amende de stationnement : payez {a}",
    "Voyage en train : allez à {to}",
    "Journée shopping ! Avancez jusqu'à {to}",
    "Vous avez fait la fête : payez {a} à chaque joueur",
    "Votre appli fait le buzz : recevez {a}",
    "Financement participatif : chaque joueur vous donne {a}",
  ],
  chest: [
    "Bus gratuit jusqu'au « {go} » : recevez {a}",
    "Vous gagnez un concours de cuisine : recevez {a}",
    "Visite chez le dentiste : payez {a}",
    "Vous vendez votre vieux vélo : recevez {a}",
    "Sortez de prison gratuitement. Gardez cette carte",
    "En prison ! Sans passer par « {go} »",
    "Prime au travail : recevez {a}",
    "De l'argent dans un vieux manteau : recevez {a}",
    "C'est votre anniversaire ! Chaque joueur vous donne {a}",
    "Votre épargne arrive à terme : recevez {a}",
    "La voiture au garage : payez {a}",
    "Abonnement à la salle de sport : payez {a}",
    "Baby-sitting : recevez {a}",
    "Travaux à la maison : payez {a} par maison et {b} par hôtel",
    "Vous gagnez une tombola : recevez {a}",
    "Un cadeau de mamie : recevez {a}",
  ],
  tagline: "Le jeu d'échange immobilier : Paris, Lyon, Marseille et plus",
  bots: ['Louis', 'Chloé', 'Hugo'],
};

const ru: Edition = {
  money: (n) => `${n} ₽`,
  symbol: '₽',
  names: [
    'Старт', 'ул. Куйбышева', 'Сундук удачи', 'Ленинградская ул.', 'Подоходный налог', 'Ленинградский вокзал',
    'ул. Светланская', 'Сюрприз', 'ул. Алеутская', 'Океанский проспект', 'Тюрьма',
    'Красный проспект', 'Электросеть', 'ул. Ленина', 'площадь Ленина', 'Казанский вокзал',
    'ул. Баумана', 'Сундук удачи', 'Кремлёвская ул.', 'ул. Пушкина', 'Стоянка без оплаты',
    'ул. Вайнера', 'Сюрприз', 'проспект Ленина', 'Плотинка', 'Курский вокзал',
    'Курортный проспект', 'Морской порт', 'Водоканал', 'ул. Навагинская', 'Иди в тюрьму',
    'Невский проспект', 'Дворцовая площадь', 'Сундук удачи', 'Литейный проспект', 'Киевский вокзал',
    'Сюрприз', 'Рублёвка', 'Налог на роскошь', 'Красная площадь',
  ],
  cities: {
    1: 'Самара', 3: 'Самара',
    6: 'Владивосток', 8: 'Владивосток', 9: 'Владивосток',
    11: 'Новосибирск', 13: 'Новосибирск', 14: 'Новосибирск',
    16: 'Казань', 18: 'Казань', 19: 'Казань',
    21: 'Екатеринбург', 23: 'Екатеринбург', 24: 'Екатеринбург',
    26: 'Сочи', 27: 'Сочи', 29: 'Сочи',
    31: 'Санкт-Петербург', 32: 'Санкт-Петербург', 34: 'Санкт-Петербург',
    37: 'Москва', 39: 'Москва',
  },
  corners: {
    goNote: 'Проходя, получи 200 ₽',
    go: 'Старт',
    jail: 'В тюрьме',
    visiting: 'Просто в гостях',
    parking1: 'Стоянка',
    parking2: 'без оплаты',
    toJail1: 'Иди в',
    toJail2: 'тюрьму',
  },
  chestName: 'Сундук удачи',
  chanceName: 'Сюрприз',
  railsTitle: 'Вокзалы',
  utilitiesTitle: 'Компании',
  chance: [
    "Такси довезёт до «{go}»: получи {a}",
    "Выходные за городом! Отправляйся: {to}",
    "Концерт в городе: иди на {to}",
    "Дела в ближайшей компании. Если у неё есть владелец, заплати 10× кубиков",
    "Успей на ближайший поезд. Если у вокзала есть владелец, заплати вдвойне",
    "Выигрышный лотерейный билет! Получи {a}",
    "Друг-адвокат вытащит тебя из тюрьмы. Сохрани эту карту",
    "Забыл ключи! Вернись на {n} клетки назад",
    "Переходил на красный. Сразу в тюрьму, не проходя «{go}»",
    "Протекает крыша: заплати {a} за каждый дом и {b} за каждый отель",
    "Штраф за парковку: заплати {a}",
    "Поездка на поезде: отправляйся на {to}",
    "День шопинга! Иди на {to}",
    "Ты устроил вечеринку: заплати каждому игроку {a}",
    "Твоё приложение стало вирусным: получи {a}",
    "Краудфандинг: каждый игрок даёт тебе {a}",
  ],
  chest: [
    "Бесплатный автобус до «{go}»: получи {a}",
    "Ты выиграл кулинарный конкурс: получи {a}",
    "Визит к стоматологу: заплати {a}",
    "Ты продал старый велосипед: получи {a}",
    "Бесплатный выход из тюрьмы. Сохрани эту карту",
    "В тюрьму! Не проходя «{go}»",
    "Премия на работе: получи {a}",
    "Деньги в старом пальто: получи {a}",
    "С днём рождения! Каждый игрок даёт тебе {a}",
    "Накопительный вклад созрел: получи {a}",
    "Машина в ремонте: заплати {a}",
    "Абонемент в спортзал: заплати {a}",
    "Подработка няней: получи {a}",
    "Ремонт дома: заплати {a} за каждый дом и {b} за каждый отель",
    "Выигрыш в лотерею: получи {a}",
    "Подарок от бабушки: получи {a}",
  ],
  tagline: 'Игра в торговлю недвижимостью: Москва, Санкт-Петербург, Сочи и другие',
  bots: ['Иван', 'Маша', 'Дима'],
};

const ja: Edition = {
  money: (n) => `¥${n}`,
  symbol: '¥',
  names: [
    'スタート', '大通公園', 'ラッキーボックス', 'すすきの', '所得税', '東京駅',
    '本通り', 'サプライズ', '平和大通り', '宮島口', '刑務所',
    '天神', '電力会社', '中洲', '博多駅前', '新宿駅',
    '栄', 'ラッキーボックス', '大須', '名駅', '休憩パーキング',
    '道頓堀', 'サプライズ', '心斎橋', '梅田', '品川駅',
    '祇園', '四条通', '水道局', '嵐山', '刑務所へ',
    'みなとみらい', '元町', 'ラッキーボックス', '山下公園', '上野駅',
    'サプライズ', '六本木', 'ぜいたく税', '銀座',
  ],
  cities: {
    1: '札幌', 3: '札幌',
    6: '広島', 8: '広島', 9: '広島',
    11: '福岡', 13: '福岡', 14: '福岡',
    16: '名古屋', 18: '名古屋', 19: '名古屋',
    21: '大阪', 23: '大阪', 24: '大阪',
    26: '京都', 27: '京都', 29: '京都',
    31: '横浜', 32: '横浜', 34: '横浜',
    37: '東京', 39: '東京',
  },
  corners: {
    goNote: '通過するたびに¥200',
    go: 'スタート',
    jail: '刑務所',
    visiting: '見学のみ',
    parking1: '休憩',
    parking2: 'パーキング',
    toJail1: '刑務所',
    toJail2: 'へ行け',
  },
  chestName: 'ラッキーボックス',
  chanceName: 'サプライズ',
  railsTitle: '駅',
  utilitiesTitle: '公共会社',
  chance: [
    "タクシーで「{go}」へ：{a}を受け取る",
    "週末旅行！{to}へ行く",
    "街でコンサート：{to}へ進む",
    "一番近い公共会社で用事。持ち主がいればサイコロの10倍を払う",
    "一番近い電車に乗る。駅に持ち主がいれば2倍払う",
    "スクラッチくじが当たった！{a}を受け取る",
    "弁護士の友だちが刑務所から出してくれる。このカードは持っておける",
    "鍵を忘れた！{n}マス戻る",
    "赤信号で渡って捕まった。「{go}」を通らずに刑務所へ",
    "屋根から雨漏り：家1軒につき{a}、ホテル1軒につき{b}払う",
    "駐車違反：{a}払う",
    "電車の旅：{to}へ行く",
    "ショッピングの日！{to}へ進む",
    "パーティーを開いた：各プレイヤーに{a}払う",
    "アプリがバズった：{a}を受け取る",
    "クラウドファンディング：全員から{a}ずつもらう",
  ],
  chest: [
    "無料バスで「{go}」へ：{a}を受け取る",
    "料理コンテストで優勝：{a}を受け取る",
    "歯医者さん：{a}払う",
    "古い自転車を売った：{a}を受け取る",
    "刑務所から無料で出られる。このカードは持っておける",
    "刑務所へ！「{go}」を通過しない",
    "仕事のボーナス：{a}を受け取る",
    "古いコートからお金が出てきた：{a}を受け取る",
    "お誕生日！全員から{a}ずつもらう",
    "積立預金が満期に：{a}を受け取る",
    "車が修理工場へ：{a}払う",
    "ジムの会費：{a}払う",
    "ベビーシッターのバイト：{a}を受け取る",
    "家のリフォーム：家1軒につき{a}、ホテル1軒につき{b}払う",
    "抽選に当たった：{a}を受け取る",
    "おばあちゃんからプレゼント：{a}を受け取る",
  ],
  tagline: '不動産トレードゲーム：東京、大阪、京都など',
  place: (street, city) => `${city}・${street}`,
  bots: ['ハルト', 'サクラ', 'ユイ'],
};

export const EDITIONS: Record<Lang, Edition> = { he, en, ar, fr, ru, ja };

// ---------- the edition in play ----------
// One game is on screen at a time, so the board's names and the card texts are swapped
// in place for the game's edition (the engine and every screen read BOARD / DECKS).

let active: Lang = 'he';
let applied = false;

export const edition = () => EDITIONS[active];
export const editionLang = () => active;

/** Money in the edition in play: ש"ח 200 / $200 / 200 د.إ */
export const money = (n: number) => EDITIONS[active].money(n);

export function applyEdition(lang: Lang) {
  if (applied && lang === active) return;
  applied = true;
  active = lang;
  const e = EDITIONS[lang];
  for (const sp of BOARD) {
    sp.name = e.names[sp.id];
    if (sp.kind === 'property') sp.city = e.cities[sp.id];
  }
  CHANCE.forEach((c, i) => (c.text = fillCard(e, e.chance[i], c.effect)));
  CHEST.forEach((c, i) => (c.text = fillCard(e, e.chest[i], c.effect)));
}

/** A card's text: the edition's template with this card's amounts and places put in. */
function fillCard(e: Edition, tpl: string, fx: CardEffect): string {
  const place = (id: number) => {
    const city = e.cities[id];
    return city ? (e.place ? e.place(e.names[id], city) : `${e.names[id]}, ${city}`) : e.names[id];
  };
  const vals: Record<string, string> = { go: e.names[0] };
  if (fx.type === 'move') {
    vals.to = place(fx.to);
    vals.a = e.money(fx.to === 0 ? GO_SALARY * 2 : 0);
  }
  if (fx.type === 'money' || fx.type === 'payEach' || fx.type === 'collectEach') vals.a = e.money(Math.abs(fx.amount));
  if (fx.type === 'repairs') {
    vals.a = e.money(fx.house);
    vals.b = e.money(fx.hotel);
  }
  if (fx.type === 'back') vals.n = String(fx.steps);
  return tpl.replace(/\{(\w+)\}/g, (m, k) => vals[k] ?? m);
}
