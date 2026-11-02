export function $<T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document): T {
  const node = root.querySelector(sel);
  if (!node) throw new Error(`missing element: ${sel}`);
  return node as T;
}

export function $maybe(sel: string, root: ParentNode = document): HTMLElement | null {
  return root.querySelector(sel) as HTMLElement | null;
}

export function esc(value: string) {
  return value.replace(/[&<>"']/g, (ch) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] as string,
  );
}

let toastTimer = 0;
export function toast(message: string, ms = 2400) {
  const node = $maybe('#toast');
  if (!node) return;
  node.textContent = message;
  node.classList.add('on');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => node.classList.remove('on'), ms);
}

export function openDialog(id: string, html?: string) {
  const dlg = document.getElementById(id) as HTMLDialogElement | null;
  if (!dlg) return;
  if (html !== undefined) dlg.innerHTML = html;
  if (!dlg.open) dlg.showModal();
}

export function closeDialog(id: string) {
  const dlg = document.getElementById(id) as HTMLDialogElement | null;
  if (dlg?.open) dlg.close();
}

export function closeAllDialogs() {
  for (const dlg of document.querySelectorAll('dialog[open]')) (dlg as HTMLDialogElement).close();
}

/** 바깥을 누르면 닫히게 */
export function wireBackdropClose() {
  for (const dlg of document.querySelectorAll('dialog.modal')) {
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) (dlg as HTMLDialogElement).close();
    });
  }
}

export function confirmDialog(opts: {
  title: string;
  text?: string;
  ok?: string;
  cancel?: string;
  danger?: boolean;
}): Promise<boolean> {
  const html = `
    <div class="modal-card">
      <h2>${esc(opts.title)}</h2>
      ${opts.text ? `<p class="modal-sub">${esc(opts.text)}</p>` : ''}
      <div class="confirm-actions">
        <button class="btn btn-ghost" type="button" data-act="cancel">${esc(opts.cancel ?? '취소')}</button>
        <button class="btn ${opts.danger ? 'btn-danger' : 'btn-primary'}" type="button" data-act="ok">${esc(opts.ok ?? '좋아요')}</button>
      </div>
    </div>`;
  openDialog('dialog-confirm', html);
  const dlg = document.getElementById('dialog-confirm') as HTMLDialogElement;

  return new Promise<boolean>((resolve) => {
    const done = (value: boolean) => {
      dlg.close();
      dlg.innerHTML = '';
      resolve(value);
    };
    dlg.querySelector('[data-act="cancel"]')?.addEventListener('click', () => done(false));
    dlg.querySelector('[data-act="ok"]')?.addEventListener('click', () => done(true));
    dlg.addEventListener('close', () => resolve(false), { once: true });
  });
}

export function starSvg(on: boolean, size = 46) {
  const badge = on
    ? '<circle cx="30" cy="30" r="27" fill="#fffdf6" stroke="#1d1a3a" stroke-width="3.2" />'
    : '';
  const star = `<path d="M30 3l7.8 16.2 17.9 2.4-13 12.5 3.2 17.7L30 43.5 14.1 51.8l3.2-17.7-13-12.5 17.9-2.4z"
      fill="${on ? '#ffd23f' : '#fffdf6'}" stroke="#1d1a3a" stroke-width="3.4" stroke-linejoin="round"/>`;
  const art = on
    ? `<g transform="translate(30 30) scale(0.82) translate(-30 -30)">${star}</g>`
    : star;
  return `<svg class="result-star${on ? ' on' : ''}" width="${size}" height="${size}" viewBox="0 0 60 60" aria-hidden="true">
    ${badge}
    ${art}
  </svg>`;
}

export function confetti(container: HTMLElement, count = 26) {
  const colors = ['#ffd23f', '#ff6b57', '#2ed3a0', '#2f5bff', '#ffb3c7', '#c9b6ff'];
  const layer = document.createElement('div');
  layer.className = 'confetti';
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('i');
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    piece.style.animationDuration = `${1.3 + Math.random() * 1.1}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.width = `${5 + Math.random() * 6}px`;
    piece.style.height = `${9 + Math.random() * 8}px`;
    layer.append(piece);
  }
  container.append(layer);
  setTimeout(() => layer.remove(), 2800);
}
