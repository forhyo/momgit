export type Camera = {
  stream: MediaStream;
  stop: () => void;
};

export async function openCamera(video: HTMLVideoElement): Promise<Camera> {
  if (!navigator.mediaDevices?.getUserMedia) {
    const err = new Error('이 브라우저에서는 카메라를 쓸 수 없어요.');
    err.name = 'NotSupportedError';
    throw err;
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: 'user',
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30, max: 30 },
    },
  });

  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;

  if (video.readyState < 1) {
    await new Promise<void>((resolve) => {
      const done = () => {
        video.removeEventListener('loadedmetadata', done);
        resolve();
      };
      video.addEventListener('loadedmetadata', done);
      setTimeout(done, 4000);
    });
  }
  await video.play().catch(() => undefined);

  return {
    stream,
    stop: () => {
      for (const track of stream.getTracks()) track.stop();
      video.srcObject = null;
    },
  };
}

/** 카메라 오류를 아이도 읽을 수 있는 말로 바꾼다. */
export function cameraMessage(e: unknown): string {
  const err = e instanceof Error ? e : null;
  const name = err?.name ?? '';
  const text = err?.message ?? String(e);

  if (name === 'NotSupportedError' || !navigator.mediaDevices?.getUserMedia) {
    return '이 브라우저에서는 카메라를 켤 수 없어요. 크롬이나 사파리에서 https 주소로 열어 주세요.';
  }
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return '카메라 권한이 꺼져 있어요. 주소창의 카메라 아이콘에서 허용을 눌러 주세요.';
  }
  if (name === 'NotFoundError' || /not found|no camera/i.test(text)) {
    return '카메라를 찾지 못했어요. 기기에 카메라가 있는지 확인해 주세요.';
  }
  if (name === 'NotReadableError' || /in use|could not start/i.test(text)) {
    return '카메라를 다른 앱이 쓰고 있어요. 화상회의 앱을 끄고 다시 해 주세요.';
  }
  return `카메라를 준비하다가 문제가 생겼어요. (${text})`;
}

/** 카카오톡·인스타그램 같은 앱 안의 브라우저인지 */
export function inAppBrowser() {
  const ua = navigator.userAgent;
  return /KAKAOTALK|Instagram|FBAN|FBAV|NAVER|DaumApps|Line\//i.test(ua);
}
