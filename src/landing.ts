// Human-facing responses: the root page, icons, robots.txt and security.txt.
//
// A person who opens the storage host in a browser used to get the API's
// JSON 404 and read it as a broken site. The root now explains in one
// screen what this host is (ciphertext-only storage for Secret Keeper cloud
// copies), why a user would want a copy (restore on a new device by seed
// phrase, unlike the file export; removal), and where to go (the app,
// secretkeeper.net). The app's "Learn more" link on the cloud-copy card
// opens this page, so settings paths and action names repeat the app's
// labels word for word. No object listing, no counters: the existence of a
// storage-id is never shown.
//
// Palette, language set, theme/language controls and hotkeys follow
// secretkeeper.net (site/src/layouts/Base.astro, site/src/styles/global.css):
// the server renders the page in the language picked from Accept-Language,
// the page carries all strings and switches language client-side (manual
// choice is kept in localStorage 'lang', theme in 'theme'; Ctrl+Shift+Z
// toggles the theme, Cmd/Ctrl+Shift+L cycles languages). Icons are embedded
// (src/icons.ts): one Node process, no static files on disk.

const SITE = 'https://secretkeeper.net';
const SUPPORT = 'support@secretkeeper.net';
const REPO = 'https://github.com/Paymaster-Technologies/sk-storage';

export type Lang = 'en' | 'ru' | 'es' | 'pt' | 'fr' | 'tr' | 'ar' | 'fa' | 'bn';

/** Same order and labels as the site's language dropdown. */
export const LANGS: { code: Lang; label: string; dir?: 'rtl' }[] = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'fa', label: 'فارسی', dir: 'rtl' },
  { code: 'bn', label: 'বাংলা' },
];

interface Strings {
  title: string;
  lead: string;
  /** Heading of the "why keep a copy" card: what the user gets out of it. */
  why: string;
  /**
   * Bullets of the why card: restore on a new device by seed phrase, how it
   * differs from the file export, how to remove it. `{export}` and `{delete}`
   * are the app's own labels ([exportAction], [deleteAction]) as pills.
   */
  whySteps: string[];
  /** The app's "Export to file" action, word for word as in the app. */
  exportAction: string;
  /** The app's "Delete from cloud" action, word for word as in the app. */
  deleteAction: string;
  /** Heading of the explainer card. */
  how: string;
  /** Bullet points of the explainer card. */
  what: string[];
  user: string;
  /** The app's settings path, word for word as in the app, rendered as a pill where `{path}` stands in [userSteps]. */
  settingsPath: string;
  /** Bullets of the user card. `{path}` is [settingsPath], `{addr}` the address pill with its copy button. */
  userSteps: string[];
  dev: string;
  /** Link text for `{repo}` in [devSteps] (the word GitHub). */
  devRepo: string;
  /** Bullets of the self-hosting card. `{repo}` is the GitHub link. */
  devSteps: string[];
  copy: string;
  copied: string;
  protocol: string;
  /** Shown only when the host does not answer. */
  down: string;
  /** Shown only when server and client clocks disagree; `{s}` is the gap in seconds. */
  skew: string;
  themeToggle: string;
  langSwitch: string;
}

const STRINGS: Record<Lang, Strings> = {
  en: {
    title: 'Secret Keeper storage',
    lead: 'This host keeps cloud copies of Secret Keeper profiles.',
    why: 'Why keep a copy?',
    whySteps: [
      'Your data lives only on your device. Lose or replace it, and the cloud copy brings everything back to the new device from the seed phrase alone: the app looks for the copy while you set it up.',
      'Unlike {export} (a .skb file you keep and carry yourself), the copy stays current on its own and keeps all your devices in sync.',
      'To remove it, tap {delete} on the same screen: the server keeps nothing after that.',
    ],
    exportAction: 'Export to file',
    deleteAction: 'Delete from cloud',
    how: 'How it works',
    what: [
      'Every object here is encrypted on the device before it leaves it.',
      'The server stores ciphertext, authenticates requests by an Ed25519 signature and takes no part in the cryptography: it cannot read, merge or restore anything.',
    ],
    user: 'Want to keep your copy here?',
    settingsPath: 'Settings → Data → Cloud copy',
    userSteps: [
      'In the app open {path} and paste this server address: {addr}',
      'Devices on the same seed phrase sync through it on their own.',
    ],
    dev: 'Want to keep your copy on your own server?',
    devRepo: 'GitHub',
    devSteps: [
      'This is a single Node process with a small signed HTTP API (SKS1).',
      'Get the source code on {repo}.',
      'Run it on your host and put its address in the same settings screen.',
    ],
    copy: 'Copy',
    copied: 'Copied',
    protocol: 'Protocol',
    down: 'Storage is unreachable',
    skew: 'Server clock differs from yours by {s} s',
    themeToggle: 'Toggle color theme',
    langSwitch: 'Language',
  },
  ru: {
    title: 'Хранилище Secret Keeper',
    lead: 'Здесь живут облачные копии профилей Secret Keeper.',
    why: 'Зачем нужна копия?',
    whySteps: [
      'Ваши данные живут только на вашем устройстве. Потеряли или сменили его: облачная копия вернёт всё на новое устройство по одной seed-фразе, приложение само найдёт копию при настройке.',
      'В отличие от {export} (файл .skb, который вы храните и переносите сами), копия поддерживает себя в актуальном состоянии и синхронизирует все ваши устройства.',
      'Чтобы убрать её, нажмите {delete} на том же экране: после этого на сервере не остаётся ничего.',
    ],
    exportAction: 'Экспорт в файл',
    deleteAction: 'Удалить из облака',
    how: 'Как это работает',
    what: [
      'Каждый объект шифруется на устройстве до того, как его покинет.',
      'Сервер хранит шифртекст, проверяет подпись Ed25519 на запросах и в криптографии не участвует: прочитать, слить или восстановить что-либо он не может.',
    ],
    user: 'Хотите хранить копию здесь?',
    settingsPath: 'Настройки → Данные → Облачная копия',
    userSteps: [
      'В приложении откройте {path} и вставьте адрес этого сервера: {addr}',
      'Устройства с одной seed-фразой синхронизируются через него сами.',
    ],
    dev: 'Хотите хранить копию на своём сервере?',
    devRepo: 'GitHub',
    devSteps: [
      'Это один процесс Node с небольшим подписанным HTTP API (SKS1).',
      'Возьмите исходный код на {repo}.',
      'Поднимите его у себя и укажите в том же экране настроек свой адрес.',
    ],
    copy: 'Копировать',
    copied: 'Скопировано',
    protocol: 'Протокол',
    down: 'Хранилище недоступно',
    skew: 'Часы сервера расходятся с вашими на {s} с',
    themeToggle: 'Переключить тему',
    langSwitch: 'Язык',
  },
  es: {
    title: 'Almacenamiento de Secret Keeper',
    lead: 'Aquí viven las copias en la nube de los perfiles de Secret Keeper.',
    why: '¿Para qué sirve la copia?',
    whySteps: [
      'Sus datos viven solo en su dispositivo. Si lo pierde o lo cambia, la copia en la nube lo devuelve todo al dispositivo nuevo con solo la frase semilla: la aplicación busca la copia durante la configuración.',
      'A diferencia de {export} (un archivo .skb que usted guarda y traslada por su cuenta), la copia se mantiene al día por sí sola y sincroniza todos sus dispositivos.',
      'Para quitarla, pulse {delete} en la misma pantalla: después de eso el servidor no conserva nada.',
    ],
    exportAction: 'Exportar a archivo',
    deleteAction: 'Eliminar de la nube',
    how: 'Cómo funciona',
    what: [
      'Cada objeto se cifra en el dispositivo antes de salir de él.',
      'El servidor guarda texto cifrado, autentica las solicitudes con una firma Ed25519 y no participa en la criptografía: no puede leer, fusionar ni restaurar nada.',
    ],
    user: '¿Quiere guardar su copia aquí?',
    settingsPath: 'Ajustes → Datos → Copia en la nube',
    userSteps: [
      'En la aplicación abra {path} y pegue la dirección de este servidor: {addr}',
      'Los dispositivos con la misma frase semilla se sincronizan a través de él por sí solos.',
    ],
    dev: '¿Quiere guardar su copia en su propio servidor?',
    devRepo: 'GitHub',
    devSteps: [
      'Es un único proceso de Node con una pequeña API HTTP firmada (SKS1).',
      'Tome el código fuente en {repo}.',
      'Ejecútelo en su host e indique su dirección en la misma pantalla de ajustes.',
    ],
    copy: 'Copiar',
    copied: 'Copiado',
    protocol: 'Protocolo',
    down: 'El almacenamiento no está disponible',
    skew: 'El reloj del servidor difiere del suyo en {s} s',
    themeToggle: 'Cambiar tema',
    langSwitch: 'Idioma',
  },
  pt: {
    title: 'Armazenamento do Secret Keeper',
    lead: 'Aqui ficam as cópias na nuvem dos perfis do Secret Keeper.',
    why: 'Para que serve a cópia?',
    whySteps: [
      'Os seus dados vivem apenas no seu dispositivo. Se o perder ou trocar, a cópia na nuvem devolve tudo ao novo dispositivo só com a frase semente: a aplicação procura a cópia durante a configuração.',
      'Ao contrário de {export} (um ficheiro .skb que guarda e transporta por si), a cópia mantém-se atualizada sozinha e sincroniza todos os seus dispositivos.',
      'Para a remover, toque em {delete} no mesmo ecrã: depois disso o servidor não guarda nada.',
    ],
    exportAction: 'Exportar para ficheiro',
    deleteAction: 'Apagar da nuvem',
    how: 'Como funciona',
    what: [
      'Cada objeto é cifrado no dispositivo antes de sair dele.',
      'O servidor guarda texto cifrado, autentica os pedidos por assinatura Ed25519 e não participa na criptografia: não consegue ler, fundir nem restaurar nada.',
    ],
    user: 'Quer guardar a sua cópia aqui?',
    settingsPath: 'Definições → Dados → Cópia na nuvem',
    userSteps: [
      'Na aplicação abra {path} e cole o endereço deste servidor: {addr}',
      'Os dispositivos com a mesma frase semente sincronizam-se através dele sozinhos.',
    ],
    dev: 'Quer guardar a sua cópia no seu próprio servidor?',
    devRepo: 'GitHub',
    devSteps: [
      'É um único processo Node com uma pequena API HTTP assinada (SKS1).',
      'Obtenha o código-fonte no {repo}.',
      'Execute-o no seu host e indique o seu endereço no mesmo ecrã de definições.',
    ],
    copy: 'Copiar',
    copied: 'Copiado',
    protocol: 'Protocolo',
    down: 'O armazenamento está indisponível',
    skew: 'O relógio do servidor difere do seu em {s} s',
    themeToggle: 'Alternar tema',
    langSwitch: 'Idioma',
  },
  fr: {
    title: 'Stockage Secret Keeper',
    lead: 'Ici vivent les copies cloud des profils Secret Keeper.',
    why: 'À quoi sert la copie ?',
    whySteps: [
      "Vos données ne vivent que sur votre appareil. Perdu ou remplacé : la copie cloud remet tout sur le nouvel appareil à partir de la seule phrase de récupération, l'application cherche la copie pendant la configuration.",
      'Contrairement à {export} (un fichier .skb que vous gardez et déplacez vous-même), la copie reste à jour d\'elle-même et synchronise tous vos appareils.',
      'Pour la retirer, touchez {delete} sur le même écran : le serveur ne garde ensuite plus rien.',
    ],
    exportAction: 'Exporter vers un fichier',
    deleteAction: 'Supprimer du cloud',
    how: 'Comment ça marche',
    what: [
      "Chaque objet est chiffré sur l'appareil avant de le quitter.",
      'Le serveur stocke du texte chiffré, authentifie les requêtes par une signature Ed25519 et ne participe pas à la cryptographie : il ne peut rien lire, fusionner ni restaurer.',
    ],
    user: 'Vous voulez garder votre copie ici ?',
    settingsPath: 'Réglages → Données → Copie dans le cloud',
    userSteps: [
      'Dans l\'application, ouvrez {path} et collez l\'adresse de ce serveur : {addr}',
      'Les appareils partageant la même phrase de récupération se synchronisent via lui d\'eux-mêmes.',
    ],
    dev: 'Vous voulez garder votre copie sur votre propre serveur ?',
    devRepo: 'GitHub',
    devSteps: [
      'C\'est un seul processus Node avec une petite API HTTP signée (SKS1).',
      'Récupérez le code source sur {repo}.',
      'Lancez-le chez vous et saisissez son adresse dans le même écran de réglages.',
    ],
    copy: 'Copier',
    copied: 'Copié',
    protocol: 'Protocole',
    down: 'Le stockage est injoignable',
    skew: "L'horloge du serveur diffère de la vôtre de {s} s",
    themeToggle: 'Changer de thème',
    langSwitch: 'Langue',
  },
  tr: {
    title: 'Secret Keeper depolama',
    lead: 'Secret Keeper profillerinin bulut kopyaları burada yaşar.',
    why: 'Kopya ne işe yarar?',
    whySteps: [
      'Verileriniz yalnızca cihazınızda yaşar. Cihazı kaybeder ya da değiştirirseniz bulut kopyası her şeyi yalnızca tohum ifadesiyle yeni cihaza geri getirir: uygulama kurulum sırasında kopyayı kendisi arar.',
      '{export} seçeneğinden (kendi sakladığınız ve taşıdığınız bir .skb dosyası) farklı olarak kopya kendini güncel tutar ve tüm cihazlarınızı eşitler.',
      'Kaldırmak için aynı ekranda {delete} seçeneğine dokunun: ardından sunucuda hiçbir şey kalmaz.',
    ],
    exportAction: 'Dosyaya aktar',
    deleteAction: 'Buluttan sil',
    how: 'Nasıl çalışır',
    what: [
      'Her nesne cihazdan ayrılmadan önce cihazda şifrelenir.',
      'Sunucu şifreli metni saklar, istekleri Ed25519 imzasıyla doğrular ve kriptografiye katılmaz: hiçbir şeyi okuyamaz, birleştiremez veya geri yükleyemez.',
    ],
    user: 'Kopyanızı burada tutmak ister misiniz?',
    settingsPath: 'Ayarlar → Veriler → Bulut kopyası',
    userSteps: [
      'Uygulamada {path} bölümünü açın ve bu sunucunun adresini yapıştırın: {addr}',
      'Aynı tohum ifadesine sahip cihazlar onun üzerinden kendiliğinden eşitlenir.',
    ],
    dev: 'Kopyanızı kendi sunucunuzda tutmak ister misiniz?',
    devRepo: 'GitHub',
    devSteps: [
      'Bu, küçük bir imzalı HTTP API (SKS1) içeren tek bir Node sürecidir.',
      'Kaynak kodunu {repo}\'dan alın.',
      'Kendi sunucunuzda çalıştırın ve adresini aynı ayar ekranına girin.',
    ],
    copy: 'Kopyala',
    copied: 'Kopyalandı',
    protocol: 'Protokol',
    down: 'Depolama erişilemiyor',
    skew: 'Sunucu saati sizinkinden {s} sn farklı',
    themeToggle: 'Temayı değiştir',
    langSwitch: 'Dil',
  },
  ar: {
    title: 'تخزين Secret Keeper',
    lead: 'هنا تُحفظ النسخ السحابية لملفات Secret Keeper الشخصية.',
    why: 'ما فائدة النسخة؟',
    whySteps: [
      'بياناتك موجودة على جهازك فقط. إذا فقدته أو استبدلته، تعيد النسخة السحابية كل شيء إلى الجهاز الجديد بعبارة البذرة وحدها: يبحث التطبيق عن النسخة أثناء الإعداد.',
      'بخلاف {export} (ملف ‎.skb تحتفظ به وتنقله بنفسك)، تبقى النسخة محدّثة تلقائيًا وتزامن جميع أجهزتك.',
      'لإزالتها اضغط {delete} في الشاشة نفسها: بعد ذلك لا يحتفظ الخادم بأي شيء.',
    ],
    exportAction: 'تصدير إلى ملف',
    deleteAction: 'حذف من السحابة',
    how: 'كيف يعمل',
    what: [
      'يُشفَّر كل كائن على الجهاز قبل أن يغادره.',
      'يخزّن الخادم النص المشفّر، ويتحقق من الطلبات بتوقيع Ed25519، ولا يشارك في التشفير: لا يمكنه قراءة أي شيء أو دمجه أو استعادته.',
    ],
    user: 'هل تريد حفظ نسختك هنا؟',
    settingsPath: 'الإعدادات ← البيانات ← نسخة سحابية',
    userSteps: [
      'في التطبيق افتح {path} والصق عنوان هذا الخادم: {addr}',
      'الأجهزة التي تشترك في عبارة البذرة نفسها تتزامن عبره تلقائيًا.',
    ],
    dev: 'هل تريد حفظ نسختك على خادمك الخاص؟',
    devRepo: 'GitHub',
    devSteps: [
      'هذه عملية Node واحدة مع واجهة HTTP موقّعة صغيرة (SKS1).',
      'خذ الشفرة المصدرية من {repo}.',
      'شغّلها لديك وأدخل عنوانها في شاشة الإعدادات نفسها.',
    ],
    copy: 'نسخ',
    copied: 'تم النسخ',
    protocol: 'البروتوكول',
    down: 'التخزين غير متاح',
    skew: 'ساعة الخادم تختلف عن ساعتك بمقدار {s} ث',
    themeToggle: 'تبديل السمة',
    langSwitch: 'اللغة',
  },
  fa: {
    title: 'فضای ذخیره‌سازی Secret Keeper',
    lead: 'نسخه‌های ابری پروفایل‌های Secret Keeper اینجا نگهداری می‌شوند.',
    why: 'نسخه به چه کار می‌آید؟',
    whySteps: [
      'داده‌های شما فقط روی دستگاه خودتان است. اگر آن را گم یا عوض کنید، نسخهٔ ابری همه‌چیز را تنها با عبارت بازیابی به دستگاه جدید برمی‌گرداند: برنامه هنگام راه‌اندازی خودش نسخه را پیدا می‌کند.',
      'برخلاف {export} (فایل ‎.skb که خودتان نگه می‌دارید و جابه‌جا می‌کنید)، نسخه خودش به‌روز می‌ماند و همهٔ دستگاه‌هایتان را همگام می‌کند.',
      'برای حذف آن در همان صفحه {delete} را بزنید: پس از آن چیزی روی سرور نمی‌ماند.',
    ],
    exportAction: 'برون‌بری به فایل',
    deleteAction: 'حذف از ابر',
    how: 'چطور کار می‌کند',
    what: [
      'هر شیء پیش از خروج از دستگاه روی همان دستگاه رمزگذاری می‌شود.',
      'سرور متن رمزشده را نگه می‌دارد، درخواست‌ها را با امضای Ed25519 احراز می‌کند و در رمزنگاری نقشی ندارد: نمی‌تواند چیزی را بخواند، ادغام کند یا بازیابی کند.',
    ],
    user: 'می‌خواهید نسخه‌تان را اینجا نگه دارید؟',
    settingsPath: 'تنظیمات ← داده‌ها ← نسخهٔ ابری',
    userSteps: [
      'در برنامه {path} را باز کنید و نشانی این سرور را بچسبانید: {addr}',
      'دستگاه‌هایی با یک عبارت بازیابی از طریق آن خودبه‌خود همگام می‌شوند.',
    ],
    dev: 'می‌خواهید نسخه‌تان را روی سرور خودتان نگه دارید؟',
    devRepo: 'GitHub',
    devSteps: [
      'این یک فرایند Node با یک API کوچک HTTP امضاشده (SKS1) است.',
      'کد منبع را از {repo} بگیرید.',
      'آن را روی میزبان خود اجرا کنید و نشانی‌اش را در همان صفحه تنظیمات وارد کنید.',
    ],
    copy: 'کپی',
    copied: 'کپی شد',
    protocol: 'پروتکل',
    down: 'فضای ذخیره‌سازی در دسترس نیست',
    skew: 'ساعت سرور {s} ثانیه با ساعت شما تفاوت دارد',
    themeToggle: 'تغییر پوسته',
    langSwitch: 'زبان',
  },
  bn: {
    title: 'Secret Keeper স্টোরেজ',
    lead: 'Secret Keeper প্রোফাইলের ক্লাউড কপি এখানে থাকে।',
    why: 'কপি কেন দরকার?',
    whySteps: [
      'আপনার ডেটা শুধু আপনার ডিভাইসেই থাকে। ডিভাইস হারালে বা বদলালে ক্লাউড কপি শুধু সিড ফ্রেজ দিয়েই সব নতুন ডিভাইসে ফিরিয়ে আনে: সেটআপের সময় অ্যাপ নিজেই কপি খুঁজে নেয়।',
      '{export} (একটি .skb ফাইল, যা আপনি নিজে রাখেন ও বহন করেন) থেকে ভিন্নভাবে, কপি নিজে থেকেই হালনাগাদ থাকে এবং আপনার সব ডিভাইস সিঙ্ক রাখে।',
      'সরাতে চাইলে একই স্ক্রিনে {delete} চাপুন: এরপর সার্ভারে কিছুই থাকে না।',
    ],
    exportAction: 'ফাইলে রপ্তানি',
    deleteAction: 'ক্লাউড থেকে মুছুন',
    how: 'এটি কীভাবে কাজ করে',
    what: [
      'প্রতিটি অবজেক্ট ডিভাইস ছাড়ার আগে ডিভাইসেই এনক্রিপ্ট হয়।',
      'সার্ভার শুধু সাইফারটেক্সট রাখে, Ed25519 স্বাক্ষর দিয়ে অনুরোধ যাচাই করে এবং ক্রিপ্টোগ্রাফিতে অংশ নেয় না: কিছু পড়তে, মেলাতে বা পুনরুদ্ধার করতে পারে না।',
    ],
    user: 'আপনার কপি এখানে রাখতে চান?',
    settingsPath: 'সেটিংস → ডেটা → ক্লাউড কপি',
    userSteps: [
      'অ্যাপে {path} খুলুন এবং এই সার্ভারের ঠিকানা পেস্ট করুন: {addr}',
      'একই সিড ফ্রেজের ডিভাইসগুলো এর মাধ্যমে নিজে থেকেই সিঙ্ক হয়।',
    ],
    dev: 'আপনার কপি নিজের সার্ভারে রাখতে চান?',
    devRepo: 'GitHub',
    devSteps: [
      'এটি একটি ছোট স্বাক্ষরিত HTTP API (SKS1) সহ একটি Node প্রসেস।',
      '{repo} থেকে সোর্স কোড নিন।',
      'নিজের হোস্টে চালান এবং এর ঠিকানা একই সেটিংস স্ক্রিনে দিন।',
    ],
    copy: 'কপি করুন',
    copied: 'কপি হয়েছে',
    protocol: 'প্রোটোকল',
    down: 'স্টোরেজ পাওয়া যাচ্ছে না',
    skew: 'সার্ভারের ঘড়ি আপনার ঘড়ির থেকে {s} সেকেন্ড আলাদা',
    themeToggle: 'থিম বদলান',
    langSwitch: 'ভাষা',
  },
};

const isLang = (s: string): s is Lang => Object.hasOwn(STRINGS, s);

/** Best supported language by Accept-Language quality; English when nothing matches. */
export function pickLanguage(acceptLanguage: string | undefined): Lang {
  if (!acceptLanguage) return 'en';
  let best: { lang: Lang; q: number } | undefined;
  for (const part of acceptLanguage.split(',')) {
    const [tagRaw, ...params] = part.trim().split(';');
    const primary = tagRaw.trim().toLowerCase().split('-')[0];
    let q = 1;
    for (const p of params) {
      const [k, v] = p.trim().split('=');
      if (k === 'q') q = Number(v);
    }
    if (!Number.isFinite(q) || q <= 0 || !isLang(primary)) continue;
    if (!best || q > best.q) best = { lang: primary, q };
  }
  return best?.lang ?? 'en';
}

const escape = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Site URLs per language: English lives at the root, others under a prefix. */
const siteUrl = (lang: Lang, path: string) => (lang === 'en' ? `${SITE}${path}` : `${SITE}/${lang}${path}`);

// Secret Keeper logo inside a cloud: the brand mark of the app sitting in
// the cloud this host provides. Cloud outline in the brand blue on the
// card surface; the mark itself is the site's 128px icon.
const CLOUD_LOGO = `<svg class="cloud" viewBox="0 0 200 140" width="200" height="140" aria-hidden="true">
<path d="M56 122c-22 0-40-16-40-37 0-19 14-34 33-36C56 28 75 16 98 16c26 0 48 17 52 40 20 2 36 18 36 37 0 16-13 29-30 29H56z" fill="var(--item)" stroke="var(--primary)" stroke-width="4" stroke-linejoin="round"/>
<image href="/icon-128.png" x="64" y="36" width="72" height="72"/>
</svg>`;

// Hosts that serve the same API under another product's name get no
// Secret Keeper landing at all: only that product's logo, centred. The logo
// is inline SVG, so the page needs nothing else from this process.
// storage.e-num.com: shield + key mark of E-num (assets/images/enum_logo_login2.svg
// in the E-num app repository), E-num blue #036cb5.
const ENUM_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 225 236" width="225" height="236" role="img" aria-label="E-num">
<path fill="none" d="M185.592,53.014C155.83,52.303 132.398,43.526 112.497,25.48C92.599,43.526 69.168,52.303 39.408,53.014C39.382,55.936 39.324,59.307 39.211,65.182C38.828,85.135 38.908,94.839 39.911,106.477C41.811,128.514 47.005,146.387 56.974,161.509C68.577,179.111 86.564,192.593 112.497,201.763C138.432,192.593 156.42,179.111 168.025,161.509C177.994,146.386 183.189,128.513 185.089,106.476C186.092,94.838 186.172,85.134 185.789,65.181C185.676,59.306 185.618,55.935 185.592,53.014Z" stroke-width="8" stroke="#036cb5"/>
<g transform="translate(42.630 47.030) scale(0.12734)"><g fill="none" stroke="#036cb5" stroke-width="52" stroke-linecap="round" stroke-linejoin="round" transform="translate(31.04 29.28) scale(1.00461) rotate(45 311.7 280.8)">
<path fill="#036cb5" stroke="none" d="M522.7 280.8 A211.0 211.0 0 1 0 512.7 345.0 L448.4 345.0 A151.0 151.0 0 1 1 462.7 280.8 Z"/>
<path stroke-width="60" d="M318.7 280.8 H492.7"/>
<path d="M561.0 305.0 V267.2 A40.0 40.0 0 0 1 641.0 267.2 V305.0"/>
<path d="M711.0 230.0 V267.7 A40.0 40.0 0 0 0 791.0 267.7 V230.0"/>
<path d="M861.0 305.0 V267.2 A40.0 40.0 0 0 1 941.0 267.2 V305.0 M941.0 267.2 A40.0 40.0 0 0 1 1021.0 267.2 V305.0"/>
<path d="M468.6 371.0 H1053.0"/>
</g></g>
</svg>`;

const LOGO_HOSTS: Record<string, { title: string; logo: string }> = {
  'storage.e-num.com': { title: 'E-num', logo: ENUM_LOGO },
};

/**
 * The logo-only page for [host] (Host header, port stripped), or undefined
 * when the host gets the regular landing.
 */
export function logoPageHtml(host: string | undefined): string | undefined {
  const brand = LOGO_HOSTS[(host ?? '').replace(/:\d+$/, '').toLowerCase()];
  if (!brand) return undefined;
  const favicon = `data:image/svg+xml,${encodeURIComponent(brand.logo)}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escape(brand.title)}</title>
<link rel="icon" type="image/svg+xml" href="${favicon}">
<style>
:root{color-scheme:light dark}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fff}
@media(prefers-color-scheme:dark){body{background:rgb(1,1,2)}}
svg{width:min(60vw,225px);height:auto}
</style>
</head>
<body>
${brand.logo}
</body>
</html>
`;
}

// Card icons as on the site's scenario tiles (.card-icon: glyph in a
// square tinted with its colour). Material Design Icons paths.
const CARD_ICONS = {
  why: {
    color: '#4CAF50',
    path: 'M12,3A9,9 0 0,0 3,12H0L4,16L8,12H5A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19C10.5,19 9.09,18.5 7.94,17.7L6.5,19.14C8.04,20.3 9.94,21 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M14,12A2,2 0 0,0 12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12Z',
  },
  how: {
    color: 'var(--primary)',
    path: 'M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.1 14.8,9.5V11C15.4,11 16,11.6 16,12.3V15.8C16,16.4 15.4,17 14.7,17H9.2C8.6,17 8,16.4 8,15.7V12.2C8,11.6 8.6,11 9.2,11V9.5C9.2,8.1 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V11H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z',
  },
  user: {
    color: '#00BCD4',
    path: 'M14,13V17H10V13H7L12,8L17,13M19.35,10.03C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.03C2.34,8.36 0,10.9 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.03Z',
  },
  dev: {
    color: '#F2C14E',
    path: 'M4,1H20A1,1 0 0,1 21,2V6A1,1 0 0,1 20,7H4A1,1 0 0,1 3,6V2A1,1 0 0,1 4,1M4,9H20A1,1 0 0,1 21,10V14A1,1 0 0,1 20,15H4A1,1 0 0,1 3,14V10A1,1 0 0,1 4,9M4,17H20A1,1 0 0,1 21,18V22A1,1 0 0,1 20,23H4A1,1 0 0,1 3,22V18A1,1 0 0,1 4,17M9,5A1,1 0 0,0 10,4A1,1 0 0,0 9,3A1,1 0 0,0 8,4A1,1 0 0,0 9,5M9,13A1,1 0 0,0 10,12A1,1 0 0,0 9,11A1,1 0 0,0 8,12A1,1 0 0,0 9,13M9,21A1,1 0 0,0 10,20A1,1 0 0,0 9,19A1,1 0 0,0 8,20A1,1 0 0,0 9,21M5,4H7V3H5V4M5,12H7V11H5V12M5,20H7V19H5V20Z',
  },
};
const cardIcon = (id: keyof typeof CARD_ICONS) =>
  `<div class="card-icon" style="--icon-color:${CARD_ICONS[id].color}"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${CARD_ICONS[id].path}"></path></svg></div>`;

const COPY_SVG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';

// Inline pieces the card bullets embed via `{path}` / `{export}` / `{delete}`
// (the app's own labels as pills) and `{addr}` / `{repo}`; the address pill
// starts its own line.
// One set of templates for the server render and the client's language
// switch (shipped in the i18n JSON); `{text}` and `{copy}` are filled with
// escaped strings by [fill].
const SLOTS = {
  path: '<span class="pill">{text}</span>',
  export: '<span class="pill">{text}</span>',
  delete: '<span class="pill">{text}</span>',
  addr: `<br><span class="addr"><code id="addr">{text}</code><button id="copy" class="icon-btn small" title="{copy}" aria-label="{copy}">${COPY_SVG}</button></span>`,
  repo: `<a href="${REPO}" target="_blank" rel="noopener">{text}</a>`,
};
const fill = (tpl: string, vars: Record<string, string>) =>
  tpl.replace(/\{(\w+)\}/g, (m, k: string) => (Object.hasOwn(vars, k) ? vars[k]! : m));

/** [origin] is the address the app should be pointed at (scheme + host, no path). */
export function landingHtml(lang: Lang, origin: string): string {
  const t = STRINGS[lang];
  const dir = LANGS.find((l) => l.code === lang)?.dir ?? 'ltr';
  const links = Object.fromEntries(LANGS.map((l) => [l.code, { protocol: siteUrl(l.code, '/protocol'), site: siteUrl(l.code, '/') }]));
  const i18n = JSON.stringify({ strings: STRINGS, langs: LANGS, links, slots: SLOTS });
  const slots = {
    path: fill(SLOTS.path, { text: escape(t.settingsPath) }),
    export: fill(SLOTS.export, { text: escape(t.exportAction) }),
    delete: fill(SLOTS.delete, { text: escape(t.deleteAction) }),
    addr: fill(SLOTS.addr, { text: escape(origin), copy: escape(t.copy) }),
    repo: fill(SLOTS.repo, { text: escape(t.devRepo) }),
  };
  const list = (id: string, items: string[]) => `<ul id="${id}">${items.map((x) => `<li>${fill(escape(x), slots)}</li>`).join('')}</ul>`;
  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escape(t.title)}</title>
<link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png">
<link rel="icon" type="image/png" sizes="128x128" href="/icon-128.png">
<link rel="apple-touch-icon" href="/icon-128.png">
<style>
:root{color-scheme:light dark;--bg:rgb(241,241,243);--item:rgb(252,252,255);--separator:rgb(228,228,231);--secondary:rgb(99,99,105);--text:rgb(1,1,2);--primary:rgb(50,106,251);--primary-soft:rgba(50,106,251,.12);--primary-legible:rgb(21,71,214);}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:rgb(1,1,2);--item:rgb(23,23,26);--separator:rgb(58,58,61);--secondary:rgb(153,153,158);--text:rgb(250,250,255);--primary-legible:rgb(151,180,253)}}
:root[data-theme=dark]{--bg:rgb(1,1,2);--item:rgb(23,23,26);--separator:rgb(58,58,61);--secondary:rgb(153,153,158);--text:rgb(250,250,255);--primary-legible:rgb(151,180,253)}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
main{max-width:600px;width:100%}
.cloud{display:block;margin:0 auto 20px;width:200px;height:140px}
h1{font-size:28px;line-height:1.2;margin:0 0 8px;letter-spacing:-.01em;text-align:center}
.lead{font-size:18px;margin:0 0 20px;color:var(--secondary);text-align:center}
p{margin:0 0 16px}
.cards{display:grid;gap:12px;margin:24px 0}
.card{background:var(--item);border:1px solid var(--separator);border-radius:14px;padding:16px 18px}
.card header{display:flex;align-items:center;gap:12px;margin:0 0 8px}
.card h2{font-size:16px;margin:0}
.card-icon{--icon-color:var(--primary);flex:none;width:36px;height:36px;border-radius:10px;background:color-mix(in srgb,var(--icon-color) 12%,transparent);color:var(--icon-color);display:flex;align-items:center;justify-content:center}
.pill,.addr{display:inline-block;border-radius:999px;background:color-mix(in srgb,var(--text) 10%,transparent);color:var(--text);padding:0 8px;line-height:1.6}
.pill{white-space:nowrap}
.addr{display:inline-flex;align-items:center;gap:2px;max-width:100%;padding:0 2px 0 10px;vertical-align:middle;margin-top:4px}
.addr code{font:14px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--text);overflow-wrap:anywhere;direction:ltr;text-align:start;cursor:text}
.icon-btn.small{width:26px;height:26px;border-radius:13px;color:var(--secondary)}
.icon-btn.small:hover{color:var(--text)}
.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(8px);background:var(--text);color:var(--bg);padding:8px 14px;border-radius:999px;font-size:14px;opacity:0;pointer-events:none;transition:opacity .15s,transform .15s}
.toast.show{opacity:1;transform:translateX(-50%)}
a{color:var(--primary-legible);text-decoration:none}
a:hover{text-decoration:underline}
footer{display:flex;flex-wrap:wrap;gap:8px 20px;align-items:center;margin-top:24px;padding-top:8px;border-top:1px solid var(--separator);color:var(--secondary);font-size:14px}
footer .spacer{flex:1}
.notice{display:flex;gap:10px;align-items:flex-start;padding:12px;border-radius:12px;background:color-mix(in srgb,#ffc107 18%,var(--bg));color:var(--text);font-size:15px;margin:0 0 24px}
.notice[hidden]{display:none}
.notice svg{flex:none;margin-top:1px}
.card ul{margin:0;padding-inline-start:20px;color:var(--secondary);font-size:15px}
.card li+li{margin-top:4px}
.controls{display:flex;align-items:center;gap:4px}
.icon-btn{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:20px;color:var(--text);border:0;background:none;cursor:pointer;padding:0}
.icon-btn:hover{background:var(--primary-soft)}
.lang-dd{position:relative}
.lang-dd summary{list-style:none;display:flex;align-items:center;gap:4px;cursor:pointer;font-weight:500;color:var(--text);padding:7px 8px;border-radius:8px}
.lang-dd summary::-webkit-details-marker{display:none}
.lang-dd summary:hover{color:var(--primary)}
.lang-dd[open] summary svg{transform:rotate(180deg)}
.lang-dd ul{position:absolute;inset-inline-end:0;bottom:calc(100% + 6px);margin:0;padding:4px;list-style:none;background:var(--item);border:.5px solid var(--separator);border-radius:12px;box-shadow:0 12px 40px rgba(1,1,2,.25);z-index:1}
.lang-dd li a,.lang-dd li .lang-cur{display:block;padding:8px 12px;border-radius:8px;font-size:14px;white-space:nowrap}
.lang-dd li a{color:var(--text)}
.lang-dd li a:hover{background:var(--primary-soft);text-decoration:none}
.lang-dd li .lang-cur{color:var(--primary-legible);font-weight:600}
</style>
<script>
(function(){var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;})();
</script>
</head>
<body>
<main>
${CLOUD_LOGO}
<h1 data-i18n="title">${escape(t.title)}</h1>
<p class="lead" data-i18n="lead">${escape(t.lead)}</p>
<div class="notice" id="status" hidden role="status"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path><path d="M12 9v4M12 17h.01"></path></svg><span id="status-text"></span></div>
<div class="cards">
<section class="card"><header>${cardIcon('why')}<h2 data-i18n="why">${escape(t.why)}</h2></header>${list('why-steps', t.whySteps)}</section>
<section class="card"><header>${cardIcon('how')}<h2 data-i18n="how">${escape(t.how)}</h2></header>${list('what', t.what)}</section>
<section class="card"><header>${cardIcon('user')}<h2 data-i18n="user">${escape(t.user)}</h2></header>${list('user-steps', t.userSteps)}</section>
<section class="card"><header>${cardIcon('dev')}<h2 data-i18n="dev">${escape(t.dev)}</h2></header>${list('dev-steps', t.devSteps)}</section>
</div>
<footer>
<a id="link-protocol" href="${links[lang]!.protocol}" target="_blank" rel="noopener" data-i18n="protocol">${escape(t.protocol)}</a>
<a id="link-site" href="${links[lang]!.site}" target="_blank" rel="noopener">secretkeeper.net</a>
<a href="mailto:${SUPPORT}">${SUPPORT}</a>
<span class="spacer"></span>
<span class="controls">
<details class="lang-dd" id="lang-dd">
<summary id="lang-summary" aria-label="${escape(t.langSwitch)}" title="${escape(t.langSwitch)}">${lang.charAt(0).toUpperCase() + lang.slice(1)} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></summary>
<ul id="lang-list">
${LANGS.map((l) => (l.code === lang ? `<li><span class="lang-cur" data-lang="${l.code}" aria-current="true">${l.label}</span></li>` : `<li><a href="#" data-lang="${l.code}">${l.label}</a></li>`)).join('\n')}
</ul>
</details>
<button id="theme-toggle" class="icon-btn" title="${escape(t.themeToggle)}" aria-label="${escape(t.themeToggle)}">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle id="theme-icon-sun" cx="12" cy="12" r="4"></circle><g id="theme-icon-rays"><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></g><path id="theme-icon-moon" d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" style="display:none"></path></svg>
</button>
</span>
</footer>
</main>
<div class="toast" id="toast" role="status"></div>
<script id="i18n" type="application/json">${i18n.replace(/</g, '\\u003c')}</script>
<script>
(function(){
var I=JSON.parse(document.getElementById('i18n').textContent);
var root=document.documentElement,lang=root.lang;
// Health: null = not checked yet / fine, 'down' = no answer, number = clock gap in seconds.
var health=null;
var $=function(id){return document.getElementById(id)};
var byId=function(c){for(var i=0;i<I.langs.length;i++)if(I.langs[i].code===c)return I.langs[i];return null};
// Same filling as on the server: bullet text is escaped, {path}/{addr}/{repo} become the inline pieces.
function esc(s){return s.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function fill(tpl,v){return tpl.replace(/\\{(\\w+)\\}/g,function(m,k){return Object.prototype.hasOwnProperty.call(v,k)?v[k]:m})}
function renderList(id,items,slots){$(id).innerHTML=items.map(function(x){return '<li>'+fill(esc(x),slots)+'</li>'}).join('')}

// Status line is silent while everything is fine: the page comes from the
// same process as /healthz, so "online" would say nothing. It appears when
// the host stops answering or its clock drifts from the client's (SKS1
// rejects requests outside a 5 minute window; 30 s is the warning line).
function renderStatus(){var t=I.strings[lang],s=$('status'),x=$('status-text');
if(health===null){s.hidden=true;return}
s.hidden=false;x.textContent=health==='down'?t.down:t.skew.replace('{s}',String(health));}
// Language: the server rendered Accept-Language's pick; a manual choice
// (localStorage 'lang') wins over it, as on the site.
function applyLang(code){var t=I.strings[code];if(!t)return;lang=code;
root.lang=code;root.dir=(byId(code)||{}).dir||'ltr';document.title=t.title;
document.querySelectorAll('[data-i18n]').forEach(function(el){el.textContent=t[el.dataset.i18n]});
var slots={path:fill(I.slots.path,{text:esc(t.settingsPath)}),export:fill(I.slots.export,{text:esc(t.exportAction)}),delete:fill(I.slots.delete,{text:esc(t.deleteAction)}),addr:fill(I.slots.addr,{text:esc(location.origin),copy:esc(t.copy)}),repo:fill(I.slots.repo,{text:esc(t.devRepo)})};
renderList('why-steps',t.whySteps,slots);renderList('what',t.what,{});renderList('user-steps',t.userSteps,slots);renderList('dev-steps',t.devSteps,slots);
$('link-protocol').href=I.links[code].protocol;$('link-site').href=I.links[code].site;
var sum=$('lang-summary');sum.setAttribute('aria-label',t.langSwitch);sum.title=t.langSwitch;
sum.firstChild.textContent=code.charAt(0).toUpperCase()+code.slice(1)+' ';
$('lang-list').innerHTML=I.langs.map(function(l){return l.code===code
?'<li><span class="lang-cur" data-lang="'+l.code+'" aria-current="true">'+l.label+'</span></li>'
:'<li><a href="#" data-lang="'+l.code+'">'+l.label+'</a></li>'}).join('');
var tb=$('theme-toggle');tb.title=t.themeToggle;tb.setAttribute('aria-label',t.themeToggle);
renderStatus();}
var dd=$('lang-dd');
dd.addEventListener('click',function(e){var a=e.target.closest('a[data-lang]');if(!a)return;
e.preventDefault();localStorage.setItem('lang',a.dataset.lang);applyLang(a.dataset.lang);dd.removeAttribute('open');});
document.addEventListener('click',function(e){if(dd.hasAttribute('open')&&!dd.contains(e.target))dd.removeAttribute('open')});
var saved=localStorage.getItem('lang');if(saved&&saved!==lang&&I.strings[saved])applyLang(saved);

// Server address: what the browser actually connected to beats the
// server's guess from the Host header (proxies, non-standard ports).
// The pill is re-rendered on language switch, hence delegated handlers.
$('addr').textContent=location.origin;
var toast=$('toast'),toastTimer;
function selectAddr(){var r=document.createRange();r.selectNodeContents($('addr'));var sel=getSelection();sel.removeAllRanges();sel.addRange(r);}
document.addEventListener('click',function(e){
if(e.target.closest('#copy')){
navigator.clipboard.writeText($('addr').textContent).then(function(){
toast.textContent=I.strings[lang].copied;toast.classList.add('show');
clearTimeout(toastTimer);toastTimer=setTimeout(function(){toast.classList.remove('show')},1600);})
// Clipboard refused (no permission, insecure context): leave the address selected for Cmd/Ctrl+C.
.catch(selectAddr);}
else if(e.target.closest('#addr'))selectAddr();});

// Theme: click flips the visible one; system theme applies until the first click.
var sun=$('theme-icon-sun'),rays=$('theme-icon-rays'),moon=$('theme-icon-moon');
function isDark(){var m=root.dataset.theme;return m==='dark'||(m!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)}
function renderIcon(){var d=isDark();sun.style.display=d?'none':'';rays.style.display=d?'none':'';moon.style.display=d?'':'none'}
function toggleTheme(){var n=isDark()?'light':'dark';root.dataset.theme=n;localStorage.setItem('theme',n);renderIcon()}
$('theme-toggle').addEventListener('click',toggleTheme);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',renderIcon);renderIcon();

// Hotkeys as on the site: Ctrl+Shift+Z theme (by e.code, any layout),
// Cmd/Ctrl+Shift+L next language.
document.addEventListener('keydown',function(e){
if(e.ctrlKey&&e.shiftKey&&!e.metaKey&&!e.altKey&&e.code==='KeyZ'){e.preventDefault();toggleTheme();return}
if((e.metaKey||e.ctrlKey)&&e.shiftKey&&!e.altKey&&e.code==='KeyL'){e.preventDefault();
var i=I.langs.findIndex(function(l){return l.code===lang});var next=I.langs[(i+1)%I.langs.length].code;
localStorage.setItem('lang',next);applyLang(next);}});

// Pulse: /healthz now, every 30 s, and when the tab becomes visible again.
function check(){var t0=Date.now();
fetch('/healthz',{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){
if(!j||!j.ok||typeof j.time!=='number'){health='down';renderStatus();return}
var gap=Math.round((j.time-(t0+Date.now())/2)/1000);
health=Math.abs(gap)>=30?gap:null;renderStatus();})
.catch(function(){health='down';renderStatus()});}
check();setInterval(check,30000);
document.addEventListener('visibilitychange',function(){if(!document.hidden)check()});
})();
</script>
</body>
</html>
`;
}

export const ROBOTS_TXT = 'User-agent: *\nDisallow: /\n';

/** RFC 9116. `Expires` is rebuilt per response so the file never goes stale. */
export function securityTxt(now: number): string {
  const expires = new Date(now + 365 * 24 * 3600 * 1000).toISOString();
  return [
    `Contact: mailto:${SUPPORT}`,
    `Expires: ${expires}`,
    'Preferred-Languages: en, ru',
    `Policy: ${SITE}/protocol`,
    '',
  ].join('\n');
}
