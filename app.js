import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

const NOTES = window.NOTES || [];

function buildSidebar(activeFile) {
  const ol = document.getElementById('toc');
  if (!ol) return;
  ol.innerHTML = NOTES.map(n => {
    const active = n.file === activeFile ? ' class="active"' : '';
    return `<li><a href="note.html?note=${encodeURIComponent(n.file)}"${active}>
      <span class="n">${n.num}</span><span>${n.title}</span></a></li>`;
  }).join('');
}

function pager(idx) {
  const prev = NOTES[idx - 1];
  const next = NOTES[idx + 1];
  const p = prev
    ? `<a class="prev" href="note.html?note=${encodeURIComponent(prev.file)}"><span class="lbl">← Previous</span><span class="ttl">${prev.num}. ${prev.title}</span></a>`
    : `<a class="prev disabled">.</a>`;
  const nx = next
    ? `<a class="next" href="note.html?note=${encodeURIComponent(next.file)}"><span class="lbl">Next →</span><span class="ttl">${next.num}. ${next.title}</span></a>`
    : `<a class="next disabled">.</a>`;
  return `<nav class="pager">${p}${nx}</nav>`;
}

function renderMarkdown(md) {
  // Pull out mermaid blocks before markdown parsing
  const blocks = [];
  md = md.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
    const i = blocks.push(code.trim()) - 1;
    return `@@MERMAID_${i}@@`;
  });
  marked.setOptions({ gfm: true, breaks: false });
  let html = marked.parse(md);
  html = html.replace(/@@MERMAID_(\d+)@@/g, (_, i) =>
    `<pre class="mermaid">${blocks[i].replace(/</g, '&lt;')}</pre>`);
  return html;
}

async function highlightAndDiagram(container) {
  container.querySelectorAll('pre code').forEach(b => {
    if (window.hljs) window.hljs.highlightElement(b);
  });
  mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
  try {
    await mermaid.run({ nodes: container.querySelectorAll('.mermaid') });
  } catch (e) { /* leave source visible if a diagram fails */ }
}

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
    await highlightAndDiagram(el);
    const h1 = el.querySelector('h1');
    document.title = (h1 ? h1.textContent : NOTES[idx].title) + ' · GenAI Notes';
    window.scrollTo(0, 0);
  } catch (e) {
    el.innerHTML = `<p>Could not load <code>${file}</code> (${e.message}).</p>`;
  }
}

export function buildLanding() {
  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = NOTES.map(n =>
    `<a class="card" href="note.html?note=${encodeURIComponent(n.file)}">
      <div class="n">NOTE ${n.num}</div><div class="t">${n.title}</div></a>`
  ).join('');
}
