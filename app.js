import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

const NOTES = window.NOTES || [];
const GROUPS = window.GROUPS || [];

/* ---------- theme ---------- */
export function initTheme() {
  const btn = document.getElementById('themeBtn');
  const sync = () => {
    const dark = document.documentElement.classList.contains('dark');
    if (btn) btn.textContent = dark ? '☀️' : '🌙';
  };
  sync();
  btn?.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
    sync();
    // re-render mermaid diagrams with a matching theme if a note is open
    const content = document.getElementById('content');
    if (content && content.querySelector('.mermaid')) reRenderMermaid(content, dark);
  });
}

function stars(n) {
  return n > 0 ? `<span class="stars" title="${n === 3 ? 'High-priority topic' : 'Important topic'}">${'★'.repeat(n)}</span>` : '';
}

/* ---------- landing ---------- */
export function buildLanding() {
  const root = document.getElementById('groups');
  if (!root) return;

  const sections = GROUPS.map(g => {
    const items = NOTES.filter(n => n.group === g);
    const cards = items.map(n => `
      <a class="card" data-search="${(n.num + ' ' + n.title + ' ' + n.group).toLowerCase()}" href="note.html?note=${encodeURIComponent(n.file)}">
        <div class="card-top"><span class="n">NOTE ${n.num}</span>${stars(n.stars)}</div>
        <div class="t">${n.title}</div>
      </a>`).join('');
    return `<section class="group"><h2 class="group-title">${g}</h2><div class="grid">${cards}</div></section>`;
  }).join('');

  root.innerHTML = sections;

  const search = document.getElementById('search');
  search?.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    document.querySelectorAll('.card').forEach(c => {
      c.style.display = !q || c.dataset.search.includes(q) ? '' : 'none';
    });
    // hide empty groups
    document.querySelectorAll('.group').forEach(sec => {
      const anyVisible = [...sec.querySelectorAll('.card')].some(c => c.style.display !== 'none');
      sec.style.display = anyVisible ? '' : 'none';
    });
  });
}

/* ---------- sidebar ---------- */
function buildSidebar(activeFile) {
  const ol = document.getElementById('toc');
  if (!ol) return;
  ol.innerHTML = NOTES.map(n => {
    const active = n.file === activeFile ? ' class="active"' : '';
    return `<li data-search="${(n.num + ' ' + n.title).toLowerCase()}"><a href="note.html?note=${encodeURIComponent(n.file)}"${active}>
      <span class="n">${n.num}</span><span>${n.title}</span></a></li>`;
  }).join('');

  const sideSearch = document.getElementById('sideSearch');
  sideSearch?.addEventListener('input', () => {
    const q = sideSearch.value.trim().toLowerCase();
    ol.querySelectorAll('li').forEach(li => {
      li.style.display = !q || li.dataset.search.includes(q) ? '' : 'none';
    });
  });
}

function pager(idx) {
  const prev = NOTES[idx - 1], next = NOTES[idx + 1];
  const p = prev ? `<a class="prev" href="note.html?note=${encodeURIComponent(prev.file)}"><span class="lbl">← Previous</span><span class="ttl">${prev.num}. ${prev.title}</span></a>` : `<span class="prev disabled"></span>`;
  const nx = next ? `<a class="next" href="note.html?note=${encodeURIComponent(next.file)}"><span class="lbl">Next →</span><span class="ttl">${next.num}. ${next.title}</span></a>` : `<span class="next disabled"></span>`;
  return `<nav class="pager">${p}${nx}</nav>`;
}

/* ---------- markdown + diagrams ---------- */
function renderMarkdown(md) {
  const blocks = [];
  md = md.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
    const i = blocks.push(code.trim()) - 1;
    return `@@MERMAID_${i}@@`;
  });
  marked.setOptions({ gfm: true, breaks: false });
  let html = marked.parse(md);
  html = html.replace(/@@MERMAID_(\d+)@@/g, (_, i) => `<pre class="mermaid">${blocks[i].replace(/</g, '&lt;')}</pre>`);
  return html;
}

async function reRenderMermaid(container, dark) {
  // Mermaid can only run once per node; re-run needs the original source.
  container.querySelectorAll('.mermaid').forEach(m => { if (m.dataset.src) { m.innerHTML = m.dataset.src; m.removeAttribute('data-processed'); } });
  mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'neutral' });
  try { await mermaid.run({ nodes: container.querySelectorAll('.mermaid') }); } catch (e) {}
}

function addCopyButtons(container) {
  container.querySelectorAll('pre > code').forEach(code => {
    const pre = code.parentElement;
    if (pre.classList.contains('mermaid') || pre.querySelector('.copy-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(code.innerText); btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = 'Copy', 1400); }
      catch (e) { btn.textContent = 'Error'; }
    });
    pre.appendChild(btn);
  });
}

function buildMiniToc(container) {
  const list = document.getElementById('minitoc');
  const aside = document.getElementById('onthispage');
  if (!list) return;
  const heads = [...container.querySelectorAll('h2, h3')];
  if (heads.length < 2) { if (aside) aside.style.display = 'none'; return; }
  heads.forEach((h, i) => {
    if (!h.id) h.id = 'h-' + i + '-' + h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  });
  list.innerHTML = heads.map(h => `<li class="lvl-${h.tagName.toLowerCase()}"><a href="#${h.id}">${h.textContent.replace(/[⭐★]/g, '').trim()}</a></li>`).join('');

  // scroll-spy
  const links = new Map([...list.querySelectorAll('a')].map(a => [a.getAttribute('href').slice(1), a]));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        list.querySelectorAll('a.active').forEach(a => a.classList.remove('active'));
        links.get(e.target.id)?.classList.add('active');
      }
    });
  }, { rootMargin: '0px 0px -75% 0px', threshold: 0 });
  heads.forEach(h => obs.observe(h));
}

function progressBar() {
  const bar = document.getElementById('progress');
  if (!bar) return;
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = max > 0 ? (h.scrollTop / max * 100) + '%' : '0%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- note loading ---------- */
export async function loadNote() {
  const params = new URLSearchParams(location.search);
  let file = params.get('note');
  if (!file || !NOTES.some(n => n.file === file)) file = NOTES[0].file;
  const idx = NOTES.findIndex(n => n.file === file);

  buildSidebar(file);

  const el = document.getElementById('content');
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(res.status);
    const md = await res.text();
    el.innerHTML = renderMarkdown(md) + pager(idx);

    // stash mermaid source for theme re-render
    el.querySelectorAll('.mermaid').forEach(m => m.dataset.src = m.textContent);

    el.querySelectorAll('pre code').forEach(b => { if (window.hljs) window.hljs.highlightElement(b); });
    const dark = document.documentElement.classList.contains('dark');
    mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'neutral' });
    try { await mermaid.run({ nodes: el.querySelectorAll('.mermaid') }); } catch (e) {}

    addCopyButtons(el);
    buildMiniToc(el);

    const h1 = el.querySelector('h1');
    document.title = (h1 ? h1.textContent.replace(/[⭐★]/g, '').trim() : NOTES[idx].title) + ' · GenAI Notes';
    window.scrollTo(0, 0);

    // keyboard nav
    window.onkeydown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' && NOTES[idx + 1]) location.href = 'note.html?note=' + encodeURIComponent(NOTES[idx + 1].file);
      if (e.key === 'ArrowLeft' && NOTES[idx - 1]) location.href = 'note.html?note=' + encodeURIComponent(NOTES[idx - 1].file);
    };
  } catch (e) {
    el.innerHTML = `<p>Could not load <code>${file}</code> (${e.message}).</p>`;
  }
}

/* ---------- reader chrome (mobile menu + progress) ---------- */
export function initReaderChrome() {
  progressBar();
  const btn = document.getElementById('menuBtn');
  const sb = document.getElementById('sidebar');
  btn?.addEventListener('click', () => sb.classList.toggle('open'));
  sb?.addEventListener('click', (e) => { if (e.target.closest('a')) sb.classList.remove('open'); });
}
