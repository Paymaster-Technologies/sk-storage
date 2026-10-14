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
  what: string;
  user: string;
  userHint: string;
  dev: string;
  devHint: string;
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
    what:
      'Every object here is encrypted on the device before it leaves it. The server stores ciphertext, ' +
      'authenticates requests by an Ed25519 signature and takes no part in the cryptography: it cannot ' +
      'read, merge or restore anything. There is nothing to see or log into on this page.',
    user: 'Using the app?',
    userHint:
      'Cloud copies are set up in the app: Settings → Cloud copy. Devices on the same seed phrase sync through this host on their own.',
    dev: 'Running your own?',
    devHint:
      'The server is a single Node process with a small signed HTTP API (SKS1). Point the app at your host in the same settings screen.',
    protocol: 'Protocol',
    down: 'Storage is unreachable',
    skew: 'Server clock differs from yours by {s} s',
    themeToggle: 'Toggle color theme',
    langSwitch: 'Language',
  },
  ru: {
    title: 'Хранилище Secret Keeper',
    lead: 'Здесь живут облачные копии профилей Secret Keeper.',
    what:
      'Каждый объект шифруется на устройстве до того, как его покинет. Сервер хранит шифртекст, ' +
      'проверяет подпись Ed25519 на запросах и в криптографии не участвует: прочитать, слить или ' +
      'восстановить что-либо он не может. Смотреть и входить на этой странице некуда.',
    user: 'Пользуетесь приложением?',
    userHint:
      'Облачная копия настраивается в приложении: Настройки → Облачная копия. Устройства с одной seed-фразой синхронизируются через этот хост сами.',
    dev: 'Поднимаете свой?',
    devHint:
      'Сервер - один процесс Node с небольшим подписанным HTTP API (SKS1). Адрес своего хоста указывается в том же экране настроек.',
    protocol: 'Протокол',
    down: 'Хранилище недоступно',
    skew: 'Часы сервера расходятся с вашими на {s} с',
    themeToggle: 'Переключить тему',
    langSwitch: 'Язык',
  },
  es: {
    title: 'Almacenamiento de Secret Keeper',
    lead: 'Aquí viven las copias en la nube de los perfiles de Secret Keeper.',
    what:
      'Cada objeto se cifra en el dispositivo antes de salir de él. El servidor guarda texto cifrado, ' +
      'autentica las solicitudes con una firma Ed25519 y no participa en la criptografía: no puede leer, ' +
      'fusionar ni restaurar nada. En esta página no hay nada que ver ni donde iniciar sesión.',
    user: '¿Usa la aplicación?',
    userHint:
      'La copia en la nube se configura en la aplicación: Ajustes → Copia en la nube. Los dispositivos con la misma frase semilla se sincronizan a través de este servidor por sí solos.',
    dev: '¿Monta el suyo?',
    devHint:
      'El servidor es un único proceso de Node con una pequeña API HTTP firmada (SKS1). La dirección de su servidor se indica en la misma pantalla de ajustes.',
    protocol: 'Protocolo',
    down: 'El almacenamiento no está disponible',
    skew: 'El reloj del servidor difiere del suyo en {s} s',
    themeToggle: 'Cambiar tema',
    langSwitch: 'Idioma',
  },
  pt: {
    title: 'Armazenamento do Secret Keeper',
    lead: 'Aqui ficam as cópias na nuvem dos perfis do Secret Keeper.',
    what:
      'Cada objeto é cifrado no dispositivo antes de sair dele. O servidor guarda texto cifrado, ' +
      'autentica os pedidos por assinatura Ed25519 e não participa na criptografia: não consegue ler, ' +
      'fundir nem restaurar nada. Nesta página não há nada para ver nem onde entrar.',
    user: 'Usa a aplicação?',
    userHint:
      'A cópia na nuvem configura-se na aplicação: Definições → Cópia na nuvem. Os dispositivos com a mesma frase semente sincronizam-se através deste servidor sozinhos.',
    dev: 'Vai montar o seu?',
    devHint:
      'O servidor é um único processo Node com uma pequena API HTTP assinada (SKS1). O endereço do seu servidor indica-se no mesmo ecrã de definições.',
    protocol: 'Protocolo',
    down: 'O armazenamento está indisponível',
    skew: 'O relógio do servidor difere do seu em {s} s',
    themeToggle: 'Alternar tema',
    langSwitch: 'Idioma',
  },
  fr: {
    title: 'Stockage Secret Keeper',
    lead: 'Ici vivent les copies cloud des profils Secret Keeper.',
    what:
      "Chaque objet est chiffré sur l'appareil avant de le quitter. Le serveur stocke du texte chiffré, " +
      'authentifie les requêtes par une signature Ed25519 et ne participe pas à la cryptographie : il ne peut ' +
      "rien lire, fusionner ni restaurer. Il n'y a rien à voir ni où se connecter sur cette page.",
    user: "Vous utilisez l'application ?",
    userHint:
      "La copie cloud se configure dans l'application : Réglages → Copie cloud. Les appareils partageant la même phrase de récupération se synchronisent via ce serveur d'eux-mêmes.",
    dev: 'Vous hébergez le vôtre ?',
    devHint:
      "Le serveur est un seul processus Node avec une petite API HTTP signée (SKS1). L'adresse de votre serveur se saisit dans le même écran de réglages.",
    protocol: 'Protocole',
    down: 'Le stockage est injoignable',
    skew: "L'horloge du serveur diffère de la vôtre de {s} s",
    themeToggle: 'Changer de thème',
    langSwitch: 'Langue',
  },
  tr: {
    title: 'Secret Keeper depolama',
    lead: 'Secret Keeper profillerinin bulut kopyaları burada yaşar.',
    what:
      'Her nesne cihazdan ayrılmadan önce cihazda şifrelenir. Sunucu şifreli metni saklar, istekleri ' +
      'Ed25519 imzasıyla doğrular ve kriptografiye katılmaz: hiçbir şeyi okuyamaz, birleştiremez veya geri ' +
      'yükleyemez. Bu sayfada görülecek ya da giriş yapılacak bir şey yok.',
    user: 'Uygulamayı mı kullanıyorsunuz?',
    userHint:
      'Bulut kopyası uygulamada ayarlanır: Ayarlar → Bulut kopyası. Aynı tohum ifadesine sahip cihazlar bu sunucu üzerinden kendiliğinden eşitlenir.',
    dev: 'Kendi sunucunuzu mu kuruyorsunuz?',
    devHint:
      'Sunucu, küçük bir imzalı HTTP API (SKS1) içeren tek bir Node sürecidir. Kendi sunucunuzun adresi aynı ayar ekranında girilir.',
    protocol: 'Protokol',
    down: 'Depolama erişilemiyor',
    skew: 'Sunucu saati sizinkinden {s} sn farklı',
    themeToggle: 'Temayı değiştir',
    langSwitch: 'Dil',
  },
  ar: {
    title: 'تخزين Secret Keeper',
    lead: 'هنا تُحفظ النسخ السحابية لملفات Secret Keeper الشخصية.',
    what:
      'يُشفَّر كل كائن على الجهاز قبل أن يغادره. يخزّن الخادم النص المشفّر، ويتحقق من الطلبات بتوقيع Ed25519، ' +
      'ولا يشارك في التشفير: لا يمكنه قراءة أي شيء أو دمجه أو استعادته. لا يوجد في هذه الصفحة ما يمكن مشاهدته أو تسجيل الدخول إليه.',
    user: 'هل تستخدم التطبيق؟',
    userHint:
      'تُضبط النسخة السحابية في التطبيق: الإعدادات ← النسخة السحابية. الأجهزة التي تشترك في عبارة البذرة نفسها تتزامن عبر هذا الخادم تلقائيًا.',
    dev: 'هل تشغّل خادمك الخاص؟',
    devHint:
      'الخادم عملية Node واحدة مع واجهة HTTP موقّعة صغيرة (SKS1). يُدخل عنوان خادمك في شاشة الإعدادات نفسها.',
    protocol: 'البروتوكول',
    down: 'التخزين غير متاح',
    skew: 'ساعة الخادم تختلف عن ساعتك بمقدار {s} ث',
    themeToggle: 'تبديل السمة',
    langSwitch: 'اللغة',
  },
  fa: {
    title: 'فضای ذخیره‌سازی Secret Keeper',
    lead: 'نسخه‌های ابری پروفایل‌های Secret Keeper اینجا نگهداری می‌شوند.',
    what:
      'هر شیء پیش از خروج از دستگاه روی همان دستگاه رمزگذاری می‌شود. سرور متن رمزشده را نگه می‌دارد، درخواست‌ها را با ' +
      'امضای Ed25519 احراز می‌کند و در رمزنگاری نقشی ندارد: نمی‌تواند چیزی را بخواند، ادغام کند یا بازیابی کند. در این صفحه چیزی برای دیدن یا ورود وجود ندارد.',
    user: 'از برنامه استفاده می‌کنید؟',
    userHint:
      'نسخه ابری در برنامه تنظیم می‌شود: تنظیمات ← نسخه ابری. دستگاه‌هایی با یک عبارت بازیابی از طریق این سرور خودبه‌خود همگام می‌شوند.',
    dev: 'سرور خودتان را راه می‌اندازید؟',
    devHint:
      'سرور یک فرایند Node با یک API کوچک HTTP امضاشده (SKS1) است. نشانی سرور خودتان در همان صفحه تنظیمات وارد می‌شود.',
    protocol: 'پروتکل',
    down: 'فضای ذخیره‌سازی در دسترس نیست',
    skew: 'ساعت سرور {s} ثانیه با ساعت شما تفاوت دارد',
    themeToggle: 'تغییر پوسته',
    langSwitch: 'زبان',
  },
  bn: {
    title: 'Secret Keeper স্টোরেজ',
    lead: 'Secret Keeper প্রোফাইলের ক্লাউড কপি এখানে থাকে।',
    what:
      'প্রতিটি অবজেক্ট ডিভাইস ছাড়ার আগে ডিভাইসেই এনক্রিপ্ট হয়। সার্ভার শুধু সাইফারটেক্সট রাখে, Ed25519 স্বাক্ষর দিয়ে অনুরোধ ' +
      'যাচাই করে এবং ক্রিপ্টোগ্রাফিতে অংশ নেয় না: কিছু পড়তে, মেলাতে বা পুনরুদ্ধার করতে পারে না। এই পৃষ্ঠায় দেখার বা লগ ইন করার কিছু নেই।',
    user: 'অ্যাপ ব্যবহার করছেন?',
    userHint:
      'ক্লাউড কপি অ্যাপে সেট করা হয়: সেটিংস → ক্লাউড কপি। একই সিড ফ্রেজের ডিভাইসগুলো এই সার্ভারের মাধ্যমে নিজে থেকেই সিঙ্ক হয়।',
    dev: 'নিজের সার্ভার চালাচ্ছেন?',
    devHint:
      'সার্ভারটি একটি ছোট স্বাক্ষরিত HTTP API (SKS1) সহ একটি Node প্রসেস। নিজের সার্ভারের ঠিকানা একই সেটিংস স্ক্রিনে দিতে হয়।',
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

export function landingHtml(lang: Lang): string {
  const t = STRINGS[lang];
  const dir = LANGS.find((l) => l.code === lang)?.dir ?? 'ltr';
  const links = Object.fromEntries(LANGS.map((l) => [l.code, { protocol: siteUrl(l.code, '/protocol'), site: siteUrl(l.code, '/') }]));
  const i18n = JSON.stringify({ strings: STRINGS, langs: LANGS, links });
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
:root{color-scheme:light dark;--bg:rgb(241,241,243);--item:rgb(252,252,255);--separator:rgb(228,228,231);--secondary:rgb(99,99,105);--text:rgb(1,1,2);--primary:rgb(50,106,251);--primary-soft:rgba(50,106,251,.12);--primary-legible:rgb(21,71,214);--warn:#e0a526;--danger:#de3b3b}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:rgb(1,1,2);--item:rgb(23,23,26);--separator:rgb(58,58,61);--secondary:rgb(153,153,158);--text:rgb(250,250,255);--primary-legible:rgb(151,180,253)}}
:root[data-theme=dark]{--bg:rgb(1,1,2);--item:rgb(23,23,26);--separator:rgb(58,58,61);--secondary:rgb(153,153,158);--text:rgb(250,250,255);--primary-legible:rgb(151,180,253)}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
main{max-width:600px;width:100%}
.cloud{display:block;margin:0 auto 20px;width:200px;height:140px}
h1{font-size:28px;line-height:1.2;margin:0 0 8px;letter-spacing:-.01em;text-align:center}
.lead{font-size:18px;margin:0 0 24px;color:var(--secondary);text-align:center}
p{margin:0 0 16px}
.cards{display:grid;gap:12px;margin:24px 0}
.card{background:var(--item);border:1px solid var(--separator);border-radius:14px;padding:16px 18px}
.card h2{font-size:16px;margin:0 0 6px}
.card p{margin:0;color:var(--secondary);font-size:15px}
a{color:var(--primary-legible);text-decoration:none}
a:hover{text-decoration:underline}
footer{margin-top:24px;padding-top:12px;border-top:1px solid var(--separator);color:var(--secondary);font-size:14px}
footer .row{display:flex;flex-wrap:wrap;gap:8px 20px;align-items:center}
footer .row+.row{margin-top:4px}
footer .spacer{flex:1}
.status[hidden]{display:none}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-inline-end:6px;vertical-align:middle}
.status.down .dot{background:var(--danger)}.status.skew .dot{background:var(--warn)}
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
<p data-i18n="what">${escape(t.what)}</p>
<div class="cards">
<section class="card"><h2 data-i18n="user">${escape(t.user)}</h2><p data-i18n="userHint">${escape(t.userHint)}</p></section>
<section class="card"><h2 data-i18n="dev">${escape(t.dev)}</h2><p data-i18n="devHint">${escape(t.devHint)}</p></section>
</div>
<footer>
<div class="row">
<a id="link-protocol" href="${links[lang]!.protocol}" data-i18n="protocol">${escape(t.protocol)}</a>
<a id="link-site" href="${links[lang]!.site}">secretkeeper.net</a>
<a href="mailto:${SUPPORT}">${SUPPORT}</a>
</div>
<div class="row">
<span class="status" id="status" hidden><span class="dot"></span><span id="status-text"></span></span>
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
</div>
</footer>
</main>
<script id="i18n" type="application/json">${i18n.replace(/</g, '\\u003c')}</script>
<script>
(function(){
var I=JSON.parse(document.getElementById('i18n').textContent);
var root=document.documentElement,lang=root.lang;
// Health: null = not checked yet / fine, 'down' = no answer, number = clock gap in seconds.
var health=null;
var $=function(id){return document.getElementById(id)};
var byId=function(c){for(var i=0;i<I.langs.length;i++)if(I.langs[i].code===c)return I.langs[i];return null};

// Status line is silent while everything is fine: the page comes from the
// same process as /healthz, so "online" would say nothing. It appears when
// the host stops answering or its clock drifts from the client's (SKS1
// rejects requests outside a 5 minute window; 30 s is the warning line).
function renderStatus(){var t=I.strings[lang],s=$('status'),x=$('status-text');
if(health===null){s.hidden=true;s.className='status';return}
s.hidden=false;
if(health==='down'){s.className='status down';x.textContent=t.down;return}
s.className='status skew';x.textContent=t.skew.replace('{s}',String(health));}
// Language: the server rendered Accept-Language's pick; a manual choice
// (localStorage 'lang') wins over it, as on the site.
function applyLang(code){var t=I.strings[code];if(!t)return;lang=code;
root.lang=code;root.dir=(byId(code)||{}).dir||'ltr';document.title=t.title;
document.querySelectorAll('[data-i18n]').forEach(function(el){el.textContent=t[el.dataset.i18n]});
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
