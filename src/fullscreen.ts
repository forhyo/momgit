type FsElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};
type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

export function fullscreenSupported() {
  const el = document.documentElement as FsElement;
  return Boolean(el.requestFullscreen || el.webkitRequestFullscreen);
}

export function isFullscreen() {
  const doc = document as FsDocument;
  return Boolean(document.fullscreenElement || doc.webkitFullscreenElement);
}

export async function enterFullscreen() {
  if (!fullscreenSupported() || isFullscreen()) return;
  const el = document.documentElement as FsElement;
  try {
    if (el.requestFullscreen) await el.requestFullscreen();
    else await el.webkitRequestFullscreen?.();
  } catch {
    /* 브라우저가 거부하면 그냥 창 모드로 둔다 */
  }
}

export async function exitFullscreen() {
  if (!isFullscreen()) return;
  const doc = document as FsDocument;
  try {
    if (document.exitFullscreen) await document.exitFullscreen();
    else await doc.webkitExitFullscreen?.();
  } catch {
    /* 이미 빠져나왔으면 무시 */
  }
}

export function toggleFullscreen() {
  return isFullscreen() ? exitFullscreen() : enterFullscreen();
}
