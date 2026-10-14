// Human-facing responses: the root page, robots.txt and security.txt.
//
// A person who opens the storage host in a browser used to get the API's
// JSON 404 and read it as a broken site. The root now explains in one
// screen what this host is (ciphertext-only storage for Secret Keeper cloud
// copies) and where to go (the app, secretkeeper.net). No object listing,
// no counters: the existence of a storage-id is never shown.
//
// Palette and tone follow secretkeeper.net (site/src/styles/global.css);
// the page is a single static document with one fetch of /healthz.

const SITE = 'https://secretkeeper.net';
const SUPPORT = 'support@secretkeeper.net';

interface Strings {
  lang: string;
  title: string;
  lead: string;
  what: string;
  user: string;
  userHint: string;
  dev: string;
  devHint: string;
  protocol: string;
  site: string;
  status: string;
  checking: string;
  ok: string;
  down: string;
}

const EN: Strings = {
  lang: 'en',
  title: 'Secret Keeper storage',
  lead: 'This host keeps cloud copies of Secret Keeper profiles.',
  what:
    'Every object here is encrypted on the device before it leaves it. The server stores ciphertext, ' +
    'authenticates requests by an Ed25519 signature and takes no part in the cryptography: it cannot ' +
    'read, merge or restore anything. There is nothing to see or log into on this page.',
  user: 'Using the app?',
  userHint: 'Cloud copies are set up in the app: Settings → Cloud copy. Devices on the same seed phrase sync through this host on their own.',
  dev: 'Running your own?',
  devHint: 'The server is a single Node process with a small signed HTTP API (SKS1). Point the app at your host in the same settings screen.',
  protocol: 'Protocol',
  site: 'secretkeeper.net',
  status: 'Status',
  checking: 'checking…',
  ok: 'online',
  down: 'unreachable',
};

const RU: Strings = {
  lang: 'ru',
  title: 'Хранилище Secret Keeper',
  lead: 'Здесь живут облачные копии профилей Secret Keeper.',
  what:
    'Каждый объект шифруется на устройстве до того, как его покинет. Сервер хранит шифртекст, ' +
    'проверяет подпись Ed25519 на запросах и в криптографии не участвует: прочитать, слить или ' +
    'восстановить что-либо он не может. Смотреть и входить на этой странице некуда.',
  user: 'Пользуетесь приложением?',
  userHint: 'Облачная копия настраивается в приложении: Настройки → Облачная копия. Устройства с одной seed-фразой синхронизируются через этот хост сами.',
  dev: 'Поднимаете свой?',
  devHint: 'Сервер - один процесс Node с небольшим подписанным HTTP API (SKS1). Адрес своего хоста указывается в том же экране настроек.',
  protocol: 'Протокол',
  site: 'secretkeeper.net',
  status: 'Статус',
  checking: 'проверяем…',
  ok: 'в сети',
  down: 'недоступен',
};

/** Picks Russian when it ranks first among supported languages, English otherwise. */
export function pickLanguage(acceptLanguage: string | undefined): 'en' | 'ru' {
  if (!acceptLanguage) return 'en';
  let best: { lang: 'en' | 'ru'; q: number } | undefined;
  for (const part of acceptLanguage.split(',')) {
    const [tagRaw, ...params] = part.trim().split(';');
    const tag = tagRaw.trim().toLowerCase();
    let q = 1;
    for (const p of params) {
      const [k, v] = p.trim().split('=');
      if (k === 'q') q = Number(v);
    }
    if (!Number.isFinite(q) || q <= 0) continue;
    const lang = tag === 'ru' || tag.startsWith('ru-') ? 'ru' : tag === 'en' || tag.startsWith('en-') ? 'en' : undefined;
    if (lang && (!best || q > best.q)) best = { lang, q };
  }
  return best?.lang ?? 'en';
}

const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function landingHtml(lang: 'en' | 'ru'): string {
  const t = lang === 'ru' ? RU : EN;
  const protocolUrl = lang === 'ru' ? `${SITE}/ru/protocol` : `${SITE}/protocol`;
  const siteUrl = lang === 'ru' ? `${SITE}/ru/` : `${SITE}/`;
  return `<!doctype html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escape(t.title)}</title>
<style>
:root{color-scheme:light dark;--bg:rgb(241,241,243);--item:rgb(252,252,255);--separator:rgb(228,228,231);--secondary:rgb(99,99,105);--text:rgb(1,1,2);--primary:rgb(50,106,251);--primary-legible:rgb(21,71,214);--ok:#4caf50;--danger:#de3b3b}
@media(prefers-color-scheme:dark){:root{--bg:rgb(1,1,2);--item:rgb(23,23,26);--separator:rgb(58,58,61);--secondary:rgb(153,153,158);--text:rgb(250,250,255);--primary-legible:rgb(151,180,253)}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
main{max-width:600px;width:100%}
h1{font-size:28px;line-height:1.2;margin:0 0 8px;letter-spacing:-.01em}
.lead{font-size:18px;margin:0 0 24px;color:var(--secondary)}
p{margin:0 0 16px}
.cards{display:grid;gap:12px;margin:24px 0}
.card{background:var(--item);border:1px solid var(--separator);border-radius:14px;padding:16px 18px}
.card h2{font-size:16px;margin:0 0 6px}
.card p{margin:0;color:var(--secondary);font-size:15px}
a{color:var(--primary-legible);text-decoration:none}
a:hover{text-decoration:underline}
footer{display:flex;flex-wrap:wrap;gap:8px 20px;align-items:center;margin-top:24px;padding-top:16px;border-top:1px solid var(--separator);color:var(--secondary);font-size:14px}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--secondary);margin-right:6px;vertical-align:middle}
.dot.ok{background:var(--ok)}.dot.down{background:var(--danger)}
</style>
</head>
<body>
<main>
<h1>${escape(t.title)}</h1>
<p class="lead">${escape(t.lead)}</p>
<p>${escape(t.what)}</p>
<div class="cards">
<section class="card"><h2>${escape(t.user)}</h2><p>${escape(t.userHint)}</p></section>
<section class="card"><h2>${escape(t.dev)}</h2><p>${escape(t.devHint)}</p></section>
</div>
<footer>
<span><span class="dot" id="dot"></span><span id="status">${escape(t.status)}: ${escape(t.checking)}</span></span>
<a href="${protocolUrl}">${escape(t.protocol)}</a>
<a href="${siteUrl}">${escape(t.site)}</a>
<a href="mailto:${SUPPORT}">${SUPPORT}</a>
</footer>
</main>
<script>
(function(){var d=document.getElementById('dot'),s=document.getElementById('status');
fetch('/healthz',{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){
d.className='dot '+(j&&j.ok?'ok':'down');s.textContent=${JSON.stringify(t.status + ': ')}+(j&&j.ok?${JSON.stringify(t.ok)}:${JSON.stringify(t.down)});
}).catch(function(){d.className='dot down';s.textContent=${JSON.stringify(t.status + ': ' + t.down)}});})();
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
