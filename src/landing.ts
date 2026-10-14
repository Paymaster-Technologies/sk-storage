// Human-facing responses: the root page, icons, robots.txt and security.txt.
//
// A person who opens the storage host in a browser used to get the API's
// JSON 404 and read it as a broken site. The root now explains in one
// screen what this host is (ciphertext-only storage for Secret Keeper cloud
// copies) and where to go (the app, secretkeeper.net). No object listing,
// no counters: the existence of a storage-id is never shown.
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
  /** Heading of the explainer card. */
  how: string;
  /** Bullet points of the explainer card. */
  what: string[];
  user: string;
  /** The app's settings path, rendered as a pill where `{path}` stands in [userSteps]. */
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
    how: 'How it works',
    what: [
      'Every object here is encrypted on the device before it leaves it.',
      'The server stores ciphertext, authenticates requests by an Ed25519 signature and takes no part in the cryptography: it cannot read, merge or restore anything.',
    ],
    user: 'Want to keep your copy here?',
    settingsPath: 'Settings → Cloud copy',
    userSteps: [
      'In the app open {path} and paste this server address: {addr}',
      'Devices on the same seed phrase sync through it on their own.',
    ],
    dev: 'Want to keep your copy on your own server?',
    devRepo: 'GitHub',
    devSteps: [
      'This is a single Node process with a small signed HTTP API (SKS1).',
      'Source code on {repo}.',
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
    how: 'Как это работает',
    what: [
      'Каждый объект шифруется на устройстве до того, как его покинет.',
      'Сервер хранит шифртекст, проверяет подпись Ed25519 на запросах и в криптографии не участвует: прочитать, слить или восстановить что-либо он не может.',
    ],
    user: 'Хотите хранить копию здесь?',
    settingsPath: 'Настройки → Облачная копия',
    userSteps: [
      'В приложении откройте {path} и вставьте адрес этого сервера: {addr}',
      'Устройства с одной seed-фразой синхронизируются через него сами.',
    ],
    dev: 'Хотите хранить копию на своём сервере?',
    devRepo: 'GitHub',
    devSteps: [
      'Это один процесс Node с небольшим подписанным HTTP API (SKS1).',
      'Исходный код на {repo}.',
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
    how: 'Cómo funciona',
    what: [
      'Cada objeto se cifra en el dispositivo antes de salir de él.',
      'El servidor guarda texto cifrado, autentica las solicitudes con una firma Ed25519 y no participa en la criptografía: no puede leer, fusionar ni restaurar nada.',
    ],
    user: '¿Quiere guardar su copia aquí?',
    settingsPath: 'Ajustes → Copia en la nube',
    userSteps: [
      'En la aplicación abra {path} y pegue la dirección de este servidor: {addr}',
      'Los dispositivos con la misma frase semilla se sincronizan a través de él por sí solos.',
    ],
    dev: '¿Quiere guardar su copia en su propio servidor?',
    devRepo: 'GitHub',
    devSteps: [
      'Es un único proceso de Node con una pequeña API HTTP firmada (SKS1).',
      'Código fuente en {repo}.',
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
    how: 'Como funciona',
    what: [
      'Cada objeto é cifrado no dispositivo antes de sair dele.',
      'O servidor guarda texto cifrado, autentica os pedidos por assinatura Ed25519 e não participa na criptografia: não consegue ler, fundir nem restaurar nada.',
    ],
    user: 'Quer guardar a sua cópia aqui?',
    settingsPath: 'Definições → Cópia na nuvem',
    userSteps: [
      'Na aplicação abra {path} e cole o endereço deste servidor: {addr}',
      'Os dispositivos com a mesma frase semente sincronizam-se através dele sozinhos.',
    ],
    dev: 'Quer guardar a sua cópia no seu próprio servidor?',
    devRepo: 'GitHub',
    devSteps: [
      'É um único processo Node com uma pequena API HTTP assinada (SKS1).',
      'Código-fonte no {repo}.',
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
    how: 'Comment ça marche',
    what: [
      "Chaque objet est chiffré sur l'appareil avant de le quitter.",
      'Le serveur stocke du texte chiffré, authentifie les requêtes par une signature Ed25519 et ne participe pas à la cryptographie : il ne peut rien lire, fusionner ni restaurer.',
    ],
    user: 'Vous voulez garder votre copie ici ?',
    settingsPath: 'Réglages → Copie cloud',
    userSteps: [
      'Dans l\'application, ouvrez {path} et collez l\'adresse de ce serveur : {addr}',
      'Les appareils partageant la même phrase de récupération se synchronisent via lui d\'eux-mêmes.',
    ],
    dev: 'Vous voulez garder votre copie sur votre propre serveur ?',
    devRepo: 'GitHub',
    devSteps: [
      'C\'est un seul processus Node avec une petite API HTTP signée (SKS1).',
      'Code source sur {repo}.',
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
    how: 'Nasıl çalışır',
    what: [
      'Her nesne cihazdan ayrılmadan önce cihazda şifrelenir.',
      'Sunucu şifreli metni saklar, istekleri Ed25519 imzasıyla doğrular ve kriptografiye katılmaz: hiçbir şeyi okuyamaz, birleştiremez veya geri yükleyemez.',
    ],
    user: 'Kopyanızı burada tutmak ister misiniz?',
    settingsPath: 'Ayarlar → Bulut kopyası',
    userSteps: [
      'Uygulamada {path} bölümünü açın ve bu sunucunun adresini yapıştırın: {addr}',
      'Aynı tohum ifadesine sahip cihazlar onun üzerinden kendiliğinden eşitlenir.',
    ],
    dev: 'Kopyanızı kendi sunucunuzda tutmak ister misiniz?',
    devRepo: 'GitHub',
    devSteps: [
      'Bu, küçük bir imzalı HTTP API (SKS1) içeren tek bir Node sürecidir.',
      '{repo}\'daki kaynak kodu.',
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
    how: 'كيف يعمل',
    what: [
      'يُشفَّر كل كائن على الجهاز قبل أن يغادره.',
      'يخزّن الخادم النص المشفّر، ويتحقق من الطلبات بتوقيع Ed25519، ولا يشارك في التشفير: لا يمكنه قراءة أي شيء أو دمجه أو استعادته.',
    ],
    user: 'هل تريد حفظ نسختك هنا؟',
    settingsPath: 'الإعدادات ← النسخة السحابية',
    userSteps: [
      'في التطبيق افتح {path} والصق عنوان هذا الخادم: {addr}',
      'الأجهزة التي تشترك في عبارة البذرة نفسها تتزامن عبره تلقائيًا.',
    ],
    dev: 'هل تريد حفظ نسختك على خادمك الخاص؟',
    devRepo: 'GitHub',
    devSteps: [
      'هذه عملية Node واحدة مع واجهة HTTP موقّعة صغيرة (SKS1).',
      'الشفرة المصدرية على {repo}.',
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
    how: 'چطور کار می‌کند',
    what: [
      'هر شیء پیش از خروج از دستگاه روی همان دستگاه رمزگذاری می‌شود.',
      'سرور متن رمزشده را نگه می‌دارد، درخواست‌ها را با امضای Ed25519 احراز می‌کند و در رمزنگاری نقشی ندارد: نمی‌تواند چیزی را بخواند، ادغام کند یا بازیابی کند.',
    ],
    user: 'می‌خواهید نسخه‌تان را اینجا نگه دارید؟',
    settingsPath: 'تنظیمات ← نسخه ابری',
    userSteps: [
      'در برنامه {path} را باز کنید و نشانی این سرور را بچسبانید: {addr}',
      'دستگاه‌هایی با یک عبارت بازیابی از طریق آن خودبه‌خود همگام می‌شوند.',
    ],
    dev: 'می‌خواهید نسخه‌تان را روی سرور خودتان نگه دارید؟',
    devRepo: 'GitHub',
    devSteps: [
      'این یک فرایند Node با یک API کوچک HTTP امضاشده (SKS1) است.',
      'کد منبع در {repo}.',
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
    how: 'এটি কীভাবে কাজ করে',
    what: [
      'প্রতিটি অবজেক্ট ডিভাইস ছাড়ার আগে ডিভাইসেই এনক্রিপ্ট হয়।',
      'সার্ভার শুধু সাইফারটেক্সট রাখে, Ed25519 স্বাক্ষর দিয়ে অনুরোধ যাচাই করে এবং ক্রিপ্টোগ্রাফিতে অংশ নেয় না: কিছু পড়তে, মেলাতে বা পুনরুদ্ধার করতে পারে না।',
    ],
    user: 'আপনার কপি এখানে রাখতে চান?',
    settingsPath: 'সেটিংস → ক্লাউড কপি',
    userSteps: [
      'অ্যাপে {path} খুলুন এবং এই সার্ভারের ঠিকানা পেস্ট করুন: {addr}',
      'একই সিড ফ্রেজের ডিভাইসগুলো এর মাধ্যমে নিজে থেকেই সিঙ্ক হয়।',
    ],
    dev: 'আপনার কপি নিজের সার্ভারে রাখতে চান?',
    devRepo: 'GitHub',
    devSteps: [
      'এটি একটি ছোট স্বাক্ষরিত HTTP API (SKS1) সহ একটি Node প্রসেস।',
      '{repo}-এ সোর্স কোড।',
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

const COPY_SVG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';

// Inline pieces the card bullets embed via `{path}` / `{addr}` / `{repo}`;
// the address pill starts its own line.
// One set of templates for the server render and the client's language
// switch (shipped in the i18n JSON); `{text}` and `{copy}` are filled with
// escaped strings by [fill].
const SLOTS = {
  path: '<span class="pill">{text}</span>',
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
.card h2{font-size:16px;margin:0 0 6px}
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
<section class="card"><h2 data-i18n="how">${escape(t.how)}</h2>${list('what', t.what)}</section>
<section class="card"><h2 data-i18n="user">${escape(t.user)}</h2>${list('user-steps', t.userSteps)}</section>
<section class="card"><h2 data-i18n="dev">${escape(t.dev)}</h2>${list('dev-steps', t.devSteps)}</section>
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
var slots={path:fill(I.slots.path,{text:esc(t.settingsPath)}),addr:fill(I.slots.addr,{text:esc(location.origin),copy:esc(t.copy)}),repo:fill(I.slots.repo,{text:esc(t.devRepo)})};
renderList('what',t.what,{});renderList('user-steps',t.userSteps,slots);renderList('dev-steps',t.devSteps,slots);
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
