// Each language has its own national edition of the board: famous streets of that
// country, its own currency and its own card texts. Prices, rents and rules are the same.
import type { Lang } from '../i18n';
import { BOARD } from './board';
import { CHANCE, CHEST } from './cards';

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
  /** texts of the chance and chest cards, in the order of cards.ts */
  chance: string[];
  chest: string[];
  /** the menu subtitle */
  tagline: string;
  /** default names for the computer players */
  bots: string[];
}

const he: Edition = {
  money: (n) => `ש"ח ${n}`,
  symbol: '₪',
  names: [
    'דרך צלחה', "שד' התמרים", 'תיבת המזל', 'דרך הערבה', 'מס הכנסה', 'רכבת דרום',
    "רח' הגליל", 'הפתעה', "רח' הירדן", "רח' הבנים", 'בכלא',
    "שד' שזר", 'חברת החשמל', 'רח\' קק"ל', "שד' רגר", 'רכבת מרכז',
    "שד' בנימין", 'תיבת המזל', "רח' הרצל", 'כיכר העצמאות', 'חניה חופשית',
    'דרך אבא הלל', 'הפתעה', "רח' ז'בוטינסקי", "רח' ביאליק", 'רכבת מזרח',
    "רח' יפו", "רח' בן יהודה", 'חברת המים', "רח' המלך ג'ורג'", 'גש לכלא',
    'דרך העצמאות', "רח' החלוץ", 'תיבת המזל', "שד' מוריה", 'רכבת צפון',
    'הפתעה', "רח' אלנבי", 'מס מותרות', "רח' דיזנגוף",
  ],
  cities: {
    1: 'אילת', 3: 'אילת',
    6: 'טבריה', 8: 'טבריה', 9: 'טבריה',
    11: 'באר-שבע', 13: 'באר-שבע', 14: 'באר-שבע',
    16: 'נתניה', 18: 'נתניה', 19: 'נתניה',
    21: 'רמת-גן', 23: 'רמת-גן', 24: 'רמת-גן',
    26: 'ירושלים', 27: 'ירושלים', 29: 'ירושלים',
    31: 'חיפה', 32: 'חיפה', 34: 'חיפה',
    37: 'תל-אביב', 39: 'תל-אביב',
  },
  corners: {
    goNote: 'כל העובר מקבל ש"ח 200',
    go: 'דרך צלחה',
    jail: 'בכלא',
    visiting: 'רק מבקר',
    parking1: 'חניה',
    parking2: 'חופשית',
    toJail1: 'גש',
    toJail2: 'לכלא',
  },
  chestName: 'תיבת המזל',
  chanceName: 'הפתעה',
  railsTitle: 'רכבות',
  utilitiesTitle: 'חברות',
  chance: [
    'התקדם ל"דרך צלחה" וקבל ש"ח 400',
    "התקדם לרח' ביאליק, רמת-גן",
    "התקדם לשד' שזר, באר-שבע",
    'התקדם לחברה הקרובה. אם היא בבעלות, שלם פי 10 מסכום הקוביות',
    'התקדם לרכבת הקרובה. אם היא בבעלות, שלם כפול',
    'התקדם לרכבת הקרובה. אם היא בבעלות, שלם כפול',
    'הבנק משלם לך דיבידנד של ש"ח 50',
    'צא מהכלא חינם. שמור כרטיס זה',
    'חזור 3 משבצות אחורה',
    'גש לכלא! אל תעבור ב"דרך צלחה"',
    'תיקונים כלליים: שלם ש"ח 25 לכל בית וש"ח 100 לכל מלון',
    'קנס מהירות: שלם ש"ח 15',
    'נסע לרכבת דרום',
    "התקדם לרח' דיזנגוף, תל-אביב",
    'נבחרת ליו"ר הוועד: שלם לכל שחקן ש"ח 50',
    'הלוואת הבנייה שלך הבשילה: קבל ש"ח 150',
  ],
  chest: [
    'התקדם ל"דרך צלחה" וקבל ש"ח 400',
    'טעות של הבנק לטובתך: קבל ש"ח 200',
    'ביקור אצל רופא: שלם ש"ח 50',
    'מכרת מניות: קבל ש"ח 50',
    'צא מהכלא חינם. שמור כרטיס זה',
    'גש לכלא! אל תעבור ב"דרך צלחה"',
    'מענק חג: קבל ש"ח 100',
    'החזר מס הכנסה: קבל ש"ח 20',
    'יום הולדת שמח! קבל ש"ח 10 מכל שחקן',
    'פוליסת ביטוח חיים הבשילה: קבל ש"ח 100',
    'אשפוז בבית חולים: שלם ש"ח 100',
    'שכר לימוד: שלם ש"ח 50',
    'דמי ייעוץ: קבל ש"ח 25',
    'תיקוני רחוב: שלם ש"ח 40 לכל בית וש"ח 115 לכל מלון',
    'זכית במקום שני בתחרות יופי: קבל ש"ח 10',
    'קיבלת ירושה: קבל ש"ח 100',
  ],
  tagline: 'משחק המסחר בנכסים: ירושלים, תל-אביב, חיפה ועוד',
  bots: ['הנרי', 'מרק', 'סופיה'],
};

const en: Edition = {
  money: (n) => `$${n}`,
  symbol: '$',
  names: [
    'GO', 'Bourbon Street', 'Lucky Chest', 'Canal Street', 'Income Tax', 'South Station',
    'Broadway', 'Surprise', 'Music Row', 'Demonbreun Street', 'Jail',
    'Michigan Avenue', 'Electric Company', 'State Street', 'Wacker Drive', 'Union Station',
    'Ocean Drive', 'Lucky Chest', 'Collins Avenue', 'Lincoln Road', 'Free Parking',
    'Lombard Street', 'Surprise', 'Market Street', 'Castro Street', 'Penn Station',
    'The Strip', 'Fremont Street', 'Water Works', 'Paradise Road', 'Go to Jail',
    'Sunset Boulevard', 'Hollywood Boulevard', 'Lucky Chest', 'Rodeo Drive', 'Grand Central',
    'Surprise', 'Wall Street', 'Luxury Tax', 'Fifth Avenue',
  ],
  cities: {
    1: 'New Orleans', 3: 'New Orleans',
    6: 'Nashville', 8: 'Nashville', 9: 'Nashville',
    11: 'Chicago', 13: 'Chicago', 14: 'Chicago',
    16: 'Miami', 18: 'Miami', 19: 'Miami',
    21: 'San Francisco', 23: 'San Francisco', 24: 'San Francisco',
    26: 'Las Vegas', 27: 'Las Vegas', 29: 'Las Vegas',
    31: 'Los Angeles', 32: 'Los Angeles', 34: 'Los Angeles',
    37: 'New York', 39: 'New York',
  },
  corners: {
    goNote: 'Collect $200 as you pass',
    go: 'GO',
    jail: 'In Jail',
    visiting: 'Just Visiting',
    parking1: 'Free',
    parking2: 'Parking',
    toJail1: 'Go to',
    toJail2: 'Jail',
  },
  chestName: 'Lucky Chest',
  chanceName: 'Surprise',
  railsTitle: 'Stations',
  utilitiesTitle: 'Utilities',
  chance: [
    'Advance to GO and collect $400',
    'Advance to Castro Street, San Francisco',
    'Advance to Michigan Avenue, Chicago',
    'Advance to the nearest utility. If it is owned, pay 10 times the dice',
    'Advance to the nearest station. If it is owned, pay double rent',
    'Advance to the nearest station. If it is owned, pay double rent',
    'The bank pays you a dividend of $50',
    'Get out of jail free. Keep this card',
    'Go back 3 spaces',
    'Go to jail! Do not pass GO',
    'General repairs: pay $25 for each house and $100 for each hotel',
    'Speeding fine: pay $15',
    'Take a trip to South Station',
    'Advance to Fifth Avenue, New York',
    'You were elected chairman: pay each player $50',
    'Your building loan matures: collect $150',
  ],
  chest: [
    'Advance to GO and collect $400',
    'Bank error in your favor: collect $200',
    "Doctor's visit: pay $50",
    'You sold some stock: collect $50',
    'Get out of jail free. Keep this card',
    'Go to jail! Do not pass GO',
    'Holiday bonus: collect $100',
    'Income tax refund: collect $20',
    'Happy birthday! Collect $10 from every player',
    'Life insurance matures: collect $100',
    'Hospital stay: pay $100',
    'School fees: pay $50',
    'Consulting fee: collect $25',
    'Street repairs: pay $40 for each house and $115 for each hotel',
    'You won second prize in a beauty contest: collect $10',
    'You inherit $100',
  ],
  tagline: 'The property trading game: New York, Las Vegas, Miami and more',
  bots: ['Henry', 'Mark', 'Sophia'],
};

const ar: Edition = {
  money: (n) => `${n} د.إ`,
  symbol: 'د.إ',
  names: [
    'انطلق', 'كورنيش الفجيرة', 'صندوق الحظ', 'شارع حمد بن عبدالله', 'ضريبة الدخل', 'محطة الاتحاد',
    'كورنيش عجمان', 'مفاجأة', 'شارع الشيخ خليفة', 'شارع الجرف', 'السجن',
    'جزيرة المرجان', 'هيئة الكهرباء', 'شارع النخيل', 'شارع الشيخ محمد بن سالم', 'محطة برج خليفة',
    'القصباء', 'صندوق الحظ', 'المجاز', 'شارع الملك فيصل', 'موقف مجاني',
    'شارع خليفة', 'مفاجأة', 'شارع زايد الأول', 'جبل حفيت', 'محطة المطار',
    'كورنيش أبوظبي', 'جزيرة ياس', 'هيئة المياه', 'جزيرة السعديات', 'اذهب إلى السجن',
    'شارع الشيخ زايد', 'جميرا', 'صندوق الحظ', 'دبي مارينا', 'محطة مول الإمارات',
    'مفاجأة', 'نخلة جميرا', 'ضريبة الرفاهية', 'داون تاون دبي',
  ],
  cities: {
    1: 'الفجيرة', 3: 'الفجيرة',
    6: 'عجمان', 8: 'عجمان', 9: 'عجمان',
    11: 'رأس الخيمة', 13: 'رأس الخيمة', 14: 'رأس الخيمة',
    16: 'الشارقة', 18: 'الشارقة', 19: 'الشارقة',
    21: 'العين', 23: 'العين', 24: 'العين',
    26: 'أبوظبي', 27: 'أبوظبي', 29: 'أبوظبي',
    31: 'دبي', 32: 'دبي', 34: 'دبي',
    37: 'دبي', 39: 'دبي',
  },
  corners: {
    goNote: 'خذ 200 د.إ عند المرور',
    go: 'انطلق',
    jail: 'في السجن',
    visiting: 'زيارة فقط',
    parking1: 'موقف',
    parking2: 'مجاني',
    toJail1: 'اذهب إلى',
    toJail2: 'السجن',
  },
  chestName: 'صندوق الحظ',
  chanceName: 'مفاجأة',
  railsTitle: 'محطات المترو',
  utilitiesTitle: 'الهيئات',
  chance: [
    'تقدّم إلى "انطلق" وخذ 400 د.إ',
    'تقدّم إلى جبل حفيت، العين',
    'تقدّم إلى جزيرة المرجان، رأس الخيمة',
    'تقدّم إلى أقرب هيئة. إذا كانت مملوكة، ادفع 10 أضعاف مجموع النرد',
    'تقدّم إلى أقرب محطة. إذا كانت مملوكة، ادفع الضعف',
    'تقدّم إلى أقرب محطة. إذا كانت مملوكة، ادفع الضعف',
    'البنك يدفع لك أرباحًا بقيمة 50 د.إ',
    'اخرج من السجن مجانًا. احتفظ بهذه البطاقة',
    'ارجع 3 خانات إلى الوراء',
    'اذهب إلى السجن! لا تمر بـ"انطلق"',
    'إصلاحات عامة: ادفع 25 د.إ عن كل بيت و100 د.إ عن كل فندق',
    'مخالفة سرعة: ادفع 15 د.إ',
    'سافر إلى محطة الاتحاد',
    'تقدّم إلى داون تاون دبي',
    'انتُخبت رئيسًا للجنة: ادفع لكل لاعب 50 د.إ',
    'قرض البناء الخاص بك استحق: خذ 150 د.إ',
  ],
  chest: [
    'تقدّم إلى "انطلق" وخذ 400 د.إ',
    'خطأ من البنك لصالحك: خذ 200 د.إ',
    'زيارة الطبيب: ادفع 50 د.إ',
    'بعت أسهمًا: خذ 50 د.إ',
    'اخرج من السجن مجانًا. احتفظ بهذه البطاقة',
    'اذهب إلى السجن! لا تمر بـ"انطلق"',
    'مكافأة العيد: خذ 100 د.إ',
    'استرداد ضريبة الدخل: خذ 20 د.إ',
    'عيد ميلاد سعيد! خذ 10 د.إ من كل لاعب',
    'استحقت بوليصة التأمين على الحياة: خذ 100 د.إ',
    'إقامة في المستشفى: ادفع 100 د.إ',
    'رسوم المدرسة: ادفع 50 د.إ',
    'أتعاب استشارة: خذ 25 د.إ',
    'إصلاح الشوارع: ادفع 40 د.إ عن كل بيت و115 د.إ عن كل فندق',
    'فزت بالمركز الثاني في مسابقة جمال: خذ 10 د.إ',
    'ورثت 100 د.إ',
  ],
  tagline: 'لعبة تجارة العقارات: دبي، أبوظبي، الشارقة والمزيد',
  bots: ['سالم', 'مريم', 'خالد'],
};

const fr: Edition = {
  money: (n) => `${n} €`,
  symbol: '€',
  names: [
    'Départ', 'Rue de Béthune', 'Coffre chance', 'Grand-Place', 'Impôts', 'Gare du Nord',
    "Cours de l'Intendance", 'Surprise', 'Place de la Bourse', 'Rue Sainte-Catherine', 'Prison',
    'Rue de la République', "Compagnie d'électricité", 'Place Bellecour', 'Vieux Lyon', 'Gare de Lyon',
    'La Canebière', 'Coffre chance', 'Vieux-Port', 'Corniche Kennedy', 'Parc gratuit',
    'Promenade des Anglais', 'Surprise', 'Place Masséna', 'Cours Saleya', "Gare de l'Est",
    'La Croisette', "Rue d'Antibes", 'Compagnie des eaux', 'Le Suquet', 'Allez en prison',
    'Boulevard Haussmann', 'Place Vendôme', 'Coffre chance', 'Rue de Rivoli', 'Gare Montparnasse',
    'Surprise', 'Avenue Montaigne', 'Taxe de luxe', 'Champs-Élysées',
  ],
  cities: {
    1: 'Lille', 3: 'Lille',
    6: 'Bordeaux', 8: 'Bordeaux', 9: 'Bordeaux',
    11: 'Lyon', 13: 'Lyon', 14: 'Lyon',
    16: 'Marseille', 18: 'Marseille', 19: 'Marseille',
    21: 'Nice', 23: 'Nice', 24: 'Nice',
    26: 'Cannes', 27: 'Cannes', 29: 'Cannes',
    31: 'Paris', 32: 'Paris', 34: 'Paris',
    37: 'Paris', 39: 'Paris',
  },
  corners: {
    goNote: 'Recevez 200 € en passant',
    go: 'Départ',
    jail: 'En prison',
    visiting: 'Simple visite',
    parking1: 'Parc',
    parking2: 'gratuit',
    toJail1: 'Allez en',
    toJail2: 'prison',
  },
  chestName: 'Coffre chance',
  chanceName: 'Surprise',
  railsTitle: 'Gares',
  utilitiesTitle: 'Compagnies',
  chance: [
    'Avancez jusqu\'à "Départ" et recevez 400 €',
    'Avancez jusqu\'au Cours Saleya, Nice',
    'Avancez jusqu\'à la Rue de la République, Lyon',
    'Avancez jusqu\'à la compagnie la plus proche. Si elle a un propriétaire, payez 10 fois les dés',
    'Avancez jusqu\'à la gare la plus proche. Si elle a un propriétaire, payez le double',
    'Avancez jusqu\'à la gare la plus proche. Si elle a un propriétaire, payez le double',
    'La banque vous verse un dividende de 50 €',
    'Vous êtes libéré de prison. Gardez cette carte',
    'Reculez de 3 cases',
    'Allez en prison ! Ne passez pas par "Départ"',
    'Réparations : payez 25 € par maison et 100 € par hôtel',
    'Excès de vitesse : payez 15 €',
    'Allez à la Gare du Nord',
    'Avancez jusqu\'aux Champs-Élysées, Paris',
    'Vous êtes élu président : payez 50 € à chaque joueur',
    'Votre prêt immobilier arrive à échéance : recevez 150 €',
  ],
  chest: [
    'Avancez jusqu\'à "Départ" et recevez 400 €',
    'Erreur de la banque en votre faveur : recevez 200 €',
    'Visite chez le médecin : payez 50 €',
    'Vous vendez des actions : recevez 50 €',
    'Vous êtes libéré de prison. Gardez cette carte',
    'Allez en prison ! Ne passez pas par "Départ"',
    'Prime de fêtes : recevez 100 €',
    "Remboursement d'impôts : recevez 20 €",
    "Joyeux anniversaire ! Recevez 10 € de chaque joueur",
    'Votre assurance vie arrive à échéance : recevez 100 €',
    "Séjour à l'hôpital : payez 100 €",
    'Frais de scolarité : payez 50 €',
    'Honoraires de conseil : recevez 25 €',
    'Travaux de voirie : payez 40 € par maison et 115 € par hôtel',
    'Deuxième prix de beauté : recevez 10 €',
    'Vous héritez de 100 €',
  ],
  tagline: "Le jeu d'échange immobilier : Paris, Lyon, Marseille et plus",
  bots: ['Louis', 'Chloé', 'Hugo'],
};

const ru: Edition = {
  money: (n) => `${n} ₽`,
  symbol: '₽',
  names: [
    'Старт', 'ул. Светланская', 'Сундук удачи', 'ул. Алеутская', 'Подоходный налог', 'Ленинградский вокзал',
    'ул. Баумана', 'Сюрприз', 'Кремлёвская ул.', 'ул. Пушкина', 'Тюрьма',
    'Курортный проспект', 'Электросеть', 'Морской порт', 'ул. Навагинская', 'Казанский вокзал',
    'ул. Вайнера', 'Сундук удачи', 'проспект Ленина', 'Плотинка', 'Бесплатная парковка',
    'Красный проспект', 'Сюрприз', 'ул. Ленина', 'площадь Ленина', 'Курский вокзал',
    'Невский проспект', 'Дворцовая площадь', 'Водоканал', 'Литейный проспект', 'Иди в тюрьму',
    'Арбат', 'Тверская улица', 'Сундук удачи', 'Кутузовский проспект', 'Киевский вокзал',
    'Сюрприз', 'Рублёвка', 'Налог на роскошь', 'Красная площадь',
  ],
  cities: {
    1: 'Владивосток', 3: 'Владивосток',
    6: 'Казань', 8: 'Казань', 9: 'Казань',
    11: 'Сочи', 13: 'Сочи', 14: 'Сочи',
    16: 'Екатеринбург', 18: 'Екатеринбург', 19: 'Екатеринбург',
    21: 'Новосибирск', 23: 'Новосибирск', 24: 'Новосибирск',
    26: 'Санкт-Петербург', 27: 'Санкт-Петербург', 29: 'Санкт-Петербург',
    31: 'Москва', 32: 'Москва', 34: 'Москва',
    37: 'Москва', 39: 'Москва',
  },
  corners: {
    goNote: 'Проходя, получи 200 ₽',
    go: 'Старт',
    jail: 'В тюрьме',
    visiting: 'Просто в гостях',
    parking1: 'Бесплатная',
    parking2: 'парковка',
    toJail1: 'Иди в',
    toJail2: 'тюрьму',
  },
  chestName: 'Сундук удачи',
  chanceName: 'Сюрприз',
  railsTitle: 'Вокзалы',
  utilitiesTitle: 'Компании',
  chance: [
    'Иди на «Старт» и получи 400 ₽',
    'Иди на площадь Ленина, Новосибирск',
    'Иди на Курортный проспект, Сочи',
    'Иди к ближайшей компании. Если у неё есть владелец, заплати 10× сумму кубиков',
    'Иди к ближайшему вокзалу. Если у него есть владелец, заплати вдвойне',
    'Иди к ближайшему вокзалу. Если у него есть владелец, заплати вдвойне',
    'Банк выплачивает тебе дивиденды 50 ₽',
    'Бесплатный выход из тюрьмы. Сохрани эту карту',
    'Вернись на 3 клетки назад',
    'Иди в тюрьму! Не проходи «Старт»',
    'Ремонт: заплати 25 ₽ за каждый дом и 100 ₽ за каждый отель',
    'Штраф за превышение скорости: заплати 15 ₽',
    'Поезжай на Ленинградский вокзал',
    'Иди на Красную площадь, Москва',
    'Тебя выбрали председателем: заплати каждому игроку 50 ₽',
    'Твой строительный кредит погашен: получи 150 ₽',
  ],
  chest: [
    'Иди на «Старт» и получи 400 ₽',
    'Ошибка банка в твою пользу: получи 200 ₽',
    'Визит к врачу: заплати 50 ₽',
    'Ты продал акции: получи 50 ₽',
    'Бесплатный выход из тюрьмы. Сохрани эту карту',
    'Иди в тюрьму! Не проходи «Старт»',
    'Праздничная премия: получи 100 ₽',
    'Возврат налога: получи 20 ₽',
    'С днём рождения! Получи по 10 ₽ от каждого игрока',
    'Страхование жизни: получи 100 ₽',
    'Лечение в больнице: заплати 100 ₽',
    'Плата за учёбу: заплати 50 ₽',
    'Гонорар за консультацию: получи 25 ₽',
    'Ремонт улицы: заплати 40 ₽ за каждый дом и 115 ₽ за каждый отель',
    'Второе место в конкурсе красоты: получи 10 ₽',
    'Ты получил наследство: 100 ₽',
  ],
  tagline: 'Игра в торговлю недвижимостью: Москва, Санкт-Петербург, Сочи и другие',
  bots: ['Иван', 'Маша', 'Дима'],
};

const ja: Edition = {
  money: (n) => `¥${n}`,
  symbol: '¥',
  names: [
    'スタート', '大通公園', 'ラッキーボックス', 'すすきの', '所得税', '東京駅',
    '天神', 'サプライズ', '中洲', '博多駅前', '刑務所',
    '本通り', '電力会社', '平和大通り', '宮島口', '新宿駅',
    '栄', 'ラッキーボックス', '大須', '名駅', '無料駐車場',
    '祇園', 'サプライズ', '四条通', '嵐山', '品川駅',
    '道頓堀', '心斎橋', '水道局', '梅田', '刑務所へ',
    '新宿', '渋谷', 'ラッキーボックス', '表参道', '上野駅',
    'サプライズ', '六本木', 'ぜいたく税', '銀座',
  ],
  cities: {
    1: '札幌', 3: '札幌',
    6: '福岡', 8: '福岡', 9: '福岡',
    11: '広島', 13: '広島', 14: '広島',
    16: '名古屋', 18: '名古屋', 19: '名古屋',
    21: '京都', 23: '京都', 24: '京都',
    26: '大阪', 27: '大阪', 29: '大阪',
    31: '東京', 32: '東京', 34: '東京',
    37: '東京', 39: '東京',
  },
  corners: {
    goNote: '通過するたびに¥200',
    go: 'スタート',
    jail: '刑務所',
    visiting: '見学のみ',
    parking1: '無料',
    parking2: '駐車場',
    toJail1: '刑務所',
    toJail2: 'へ行け',
  },
  chestName: 'ラッキーボックス',
  chanceName: 'サプライズ',
  railsTitle: '駅',
  utilitiesTitle: '公共会社',
  chance: [
    '「スタート」へ進み¥400を受け取る',
    '京都・嵐山へ進む',
    '広島・本通りへ進む',
    '一番近い公共会社へ進む。持ち主がいればサイコロの目の10倍を払う',
    '一番近い駅へ進む。持ち主がいれば2倍払う',
    '一番近い駅へ進む。持ち主がいれば2倍払う',
    '銀行から配当金¥50',
    '刑務所から無料で出られる。このカードは持っておける',
    '3マス戻る',
    '刑務所へ行け！「スタート」を通過しない',
    '修理費：家1軒につき¥25、ホテル1軒につき¥100払う',
    'スピード違反の罰金：¥15払う',
    '東京駅へ行く',
    '東京・銀座へ進む',
    '会長に選ばれた：各プレイヤーに¥50払う',
    '建築ローンが満期に：¥150を受け取る',
  ],
  chest: [
    '「スタート」へ進み¥400を受け取る',
    '銀行のミスで得をした：¥200を受け取る',
    '病院の診察：¥50払う',
    '株を売った：¥50を受け取る',
    '刑務所から無料で出られる。このカードは持っておける',
    '刑務所へ行け！「スタート」を通過しない',
    'ボーナス：¥100を受け取る',
    '税金の還付：¥20を受け取る',
    'お誕生日おめでとう！全員から¥10ずつもらう',
    '生命保険が満期に：¥100を受け取る',
    '入院費：¥100払う',
    '授業料：¥50払う',
    'コンサルタント料：¥25を受け取る',
    '道路工事：家1軒につき¥40、ホテル1軒につき¥115払う',
    '美人コンテストで2位：¥10を受け取る',
    '遺産を相続：¥100を受け取る',
  ],
  tagline: '不動産トレードゲーム：東京、大阪、京都など',
  bots: ['ハルト', 'サクラ', 'ユイ'],
};

export const EDITIONS: Record<Lang, Edition> = { he, en, ar, fr, ru, ja };

// ---------- the edition in play ----------
// One game is on screen at a time, so the board's names and the card texts are swapped
// in place for the game's edition (the engine and every screen read BOARD / DECKS).

let active: Lang = 'he';

export const edition = () => EDITIONS[active];
export const editionLang = () => active;

/** Money in the edition in play: ש"ח 200 / $200 / 200 د.إ */
export const money = (n: number) => EDITIONS[active].money(n);

export function applyEdition(lang: Lang) {
  if (lang === active && BOARD[0].name === EDITIONS[lang].names[0]) return;
  active = lang;
  const e = EDITIONS[lang];
  for (const sp of BOARD) {
    sp.name = e.names[sp.id];
    if (sp.kind === 'property') sp.city = e.cities[sp.id];
  }
  CHANCE.forEach((c, i) => (c.text = e.chance[i]));
  CHEST.forEach((c, i) => (c.text = e.chest[i]));
}
