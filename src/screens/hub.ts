import {
  AVATARS,
  ICONS,
  STICKERS,
  avatarSvg,
  mascotSvg,
  stepArt,
  stickerSvg,
} from '../brand';
import {
  GAMES,
  controlIcon,
  gameById,
  starsFor,
  type GameMeta,
} from '../game/registry';
import {
  addProfile,
  awardSticker,
  canAddProfile,
  getActive,
  getSettings,
  getState,
  recordRun,
  resetProgress,
  session,
  setActive,
  setDemo,
  setRound,
  setSound,
  totalStickers,
  type RunResult,
} from '../store';
import {
  $,
  closeAllDialogs,
  closeDialog,
  confetti,
  confirmDialog,
  esc,
  openDialog,
  starSvg,
  toast,
} from '../dom';
import { playRound, stopRound, type RoundResult } from './play';
import { sfx, setMuted, unlockAudio } from '../audio/sfx';

let lastResult: { game: GameMeta; demo: boolean } | null = null;

export function initHub() {
  $('#hero-mascot').innerHTML = mascotSvg();
  document.querySelectorAll<HTMLElement>('.step-art').forEach((node) => {
    const kind = node.dataset.art?.replace('step-', '') as 'camera' | 'space' | 'play';
    node.innerHTML = stepArt(kind);
  });

  const settings = getSettings();
  setMuted(!settings.sound);
  syncSoundButton();

  render();
  wireStatic();
  maybeInAppBanner();
  wireDeepLink();
}

function syncSoundButton() {
  const btn = $('#btn-sound');
  const muted = !getSettings().sound;
  btn.setAttribute('aria-pressed', String(muted));
  btn.setAttribute('aria-label', muted ? '소리 켜기' : '소리 끄기');
}

function render() {
  renderProfiles();
  renderGames();
  renderAlbum();
  syncSoundButton();
  document.querySelectorAll<HTMLButtonElement>('.seg [data-players]').forEach((b) => {
    b.setAttribute('aria-checked', String(Number(b.dataset.players) === session.players));
  });
  $('#player-hint').textContent =
    session.players === 2
      ? '2명은 화면을 좌우로 나눠요. 스티커는 함께 받아요.'
      : '사람을 고르면 이 기기에 기록이 쌓여요.';
}

function renderProfiles() {
  const active = getActive();
  const list = $('#profile-list');
  list.innerHTML = getState()
    .profiles.map((p) => {
      const plays = Object.values(p.plays).reduce((sum, r) => sum + r.plays, 0);
      return `<button class="profile-card" type="button" data-profile="${p.id}"
        aria-pressed="${p.id === active.id}" aria-label="${esc(p.name)} 선택">
        <span class="profile-avatar">${avatarSvg(p.avatar)}</span>
        <span class="profile-meta">
          <strong>${esc(p.name)}</strong>
          <small>스티커 ${totalStickers(p)} · ${plays}판</small>
        </span>
        <span class="profile-check" aria-hidden="true">✓</span>
      </button>`;
    })
    .join('');

  list.querySelectorAll<HTMLButtonElement>('[data-profile]').forEach((b) => {
    b.addEventListener('click', () => {
      setActive(b.dataset.profile!);
      sfx('tap');
      render();
    });
  });

  $('#btn-add-profile').toggleAttribute('data-full', !canAddProfile());
}

function renderGames() {
  const active = getActive();
  const grid = $('#game-grid');
  grid.innerHTML = GAMES.map((g) => {
    const rec = active.plays[g.id];
    const stamp = rec.plays > 0 ? `${rec.plays}` : '새 놀이';
    const best = session.players === 2 ? '' : rec.best > 0 ? `최고 <b>${rec.best}</b>` : '기록 없음';
    return `<button class="game-card" type="button" data-game="${g.id}" aria-label="${g.title} 놀이 열기">
      <div class="game-art" style="background:${g.color}">
        ${g.art()}
        <span class="game-tape" aria-hidden="true"></span>
        <span class="game-stamp"><span class="s">★</span>${stamp}</span>
      </div>
      <div class="game-body">
        <div class="game-title-row">
          <h3>${g.title}</h3>
          <span class="game-play" aria-hidden="true">${ICONS.play}</span>
        </div>
        <p class="game-desc">${g.desc}</p>
        <div class="game-foot">
          <span class="game-control">${g.controlLabel}</span>
          <span class="game-best">${best}</span>
        </div>
      </div>
    </button>`;
  }).join('');

  grid.querySelectorAll<HTMLButtonElement>('[data-game]').forEach((b) => {
    b.addEventListener('click', () => {
      unlockAudio();
      sfx('tap');
      openGameModal(gameById(b.dataset.game!));
    });
  });
}

function renderAlbum() {
  const active = getActive();
  const owned = new Set(active.stickers);
  const n = totalStickers(active);
  $('#sticker-grid').innerHTML = STICKERS.map((_, i) => {
    if (owned.has(i)) {
      return `<div class="sticker-slot on" style="--rot:${((i * 37) % 17) - 8}deg">${stickerSvg(i)}</div>`;
    }
    return `<div class="sticker-slot" aria-label="빈 스티커 자리 ${i + 1}"><span class="slot-num">${i + 1}</span></div>`;
  }).join('');

  $('#sticker-count').textContent = String(n);
  $('#sticker-total').textContent = `/ ${STICKERS.length}`;
  const ring = $('#ring-fg');
  const circumference = 2 * Math.PI * 33;
  ring.style.strokeDasharray = String(circumference);
  ring.style.strokeDashoffset = String(circumference * (1 - n / STICKERS.length));

  $('#album-note').textContent =
    n === 0
      ? '첫 스티커를 기다리고 있어요. 한 판 놀면 스티커를 받아요.'
      : n >= STICKERS.length
        ? '앨범 완성! 마을 축제가 열렸어요. 이제 반짝이 스티커가 쌓여요.'
        : `${STICKERS.length - n}개만 더 모으면 앨범이 완성돼요.`;
}

function openGameModal(game: GameMeta) {
  const active = getActive();
  const rec = active.plays[game.id];
  const seconds = getSettings().round;
  const playersText = session.players === 2 ? '2명 대결' : '1명';

  openDialog(
    'dialog-game',
    `<div class="modal-card">
      <button class="modal-x" type="button" data-close aria-label="닫기">${ICONS.close}</button>
      <div class="gm-art" style="background:${game.color}">${game.art()}</div>
      <div class="gm-body">
        <span class="modal-kicker">${game.controlLabel} · ${playersText} · ${seconds}초</span>
        <div class="gm-head">
          <h2>${game.title}</h2>
          <span class="gm-control-tag">${game.tagline}</span>
        </div>
        <p class="gm-desc">${game.desc}</p>
        <div class="gm-how">
          <span class="gm-how-icon">${controlIcon(game.control)}</span>
          <div>
            <strong>이렇게 해요</strong>
            <span>${game.hint}. ${game.tip}</span>
          </div>
        </div>
        <div class="gm-foot">
          <button class="btn btn-primary" type="button" data-start>시작하기</button>
          <button class="btn btn-ghost" type="button" data-demo>카메라 없이 해 보기</button>
        </div>
        <div class="gm-meta">
          <span>점프 없이 상체만 · 영상은 저장하지 않아요</span>
          ${
            session.players === 2
              ? '<span>2명 기록은 저장하지 않아요</span>'
              : `<span class="gm-best">최고 <b>${rec.best || 0}</b>점</span>`
          }
        </div>
      </div>
    </div>`,
  );

  const dlg = $('#dialog-game');
  dlg.querySelectorAll('[data-close]').forEach((b) =>
    b.addEventListener('click', () => closeDialog('dialog-game')),
  );
  dlg.querySelector('[data-start]')?.addEventListener('click', () => startGame(game, getSettings().demo));
  dlg.querySelector('[data-demo]')?.addEventListener('click', () => startGame(game, true));
}

function startGame(game: GameMeta, demo: boolean) {
  closeAllDialogs();
  unlockAudio();
  playRound({
    game,
    players: session.players,
    demo,
    seconds: getSettings().round,
    onFinish: handleFinish,
    onExit: () => {
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });
}

function handleFinish(r: RoundResult) {
  lastResult = { game: r.game, demo: r.demo };
  let record: RunResult | null = null;
  if (r.players === 1) {
    record = recordRun(r.game.id, r.scores[0]);
  } else {
    record = awardSticker();
  }
  const stars = r.players === 1 ? starsFor(r.game, r.scores[0], r.seconds) : 0;
  const title =
    r.players === 2
      ? r.scores[0] === r.scores[1]
        ? '무승부!'
        : r.scores[0] > r.scores[1]
          ? 'P1 승리!'
          : 'P2 승리!'
      : stars >= 3
        ? '마을 최고!'
        : stars === 2
          ? '아주 잘했어요!'
          : stars === 1
            ? '잘했어요!'
            : '다음엔 더 잘할 수 있어요';

  const rewardTitle = record.albumJustCompleted
    ? '앨범을 다 채웠어요!'
    : record.sticker.isNew
      ? '새 스티커를 받았어요'
      : '반짝이 스티커를 받았어요';

  const rewardSub = record.albumJustCompleted
    ? '12개 스티커를 모두 모았어요. 마을 축제가 열렸어요!'
    : record.sticker.isNew
      ? '칭찬 스티커 앨범에 붙였어요.'
      : '앨범은 이미 가득! 응원의 마음을 담았어요.';

  const scoresHtml =
    r.players === 2
      ? `<div class="result-score"><div><span>P1</span><strong>${r.scores[0]}</strong></div><div><span>P2</span><strong>${r.scores[1]}</strong></div></div>`
      : `<div class="result-score"><div><span>내 점수</span><strong>${r.scores[0]}</strong></div><div><span>레벨</span><strong>${r.levels[0]}</strong></div></div>`;

  openDialog(
    'dialog-result',
    `<div class="modal-card">
      <div class="result-top">
        ${
          r.players === 1
            ? `<div class="result-star-row">${[0, 1, 2].map((i) => starSvg(i < stars)).join('')}</div>`
            : '<div class="result-star-row">' + starSvg(true) + '</div>'
        }
        <h2>${title}</h2>
        <p>${r.game.title} · ${r.seconds}초 · ${r.players === 2 ? '2명 대결' : '1명 놀이'}</p>
        ${scoresHtml}
      </div>
      <div class="result-body">
        <div class="result-reward">
          <div class="rw-art">${stickerSvg(record.sticker.index)}</div>
          <div>
            <strong>${rewardTitle}</strong>
            <small>${rewardSub}</small>
            ${
              r.players === 1 && record.isBest && r.scores[0] > 0
                ? `<span class="result-best">${esc(getActive().name)}의 새 최고 기록!</span>`
                : ''
            }
          </div>
        </div>
        <div class="result-actions">
          <button class="btn btn-primary" type="button" data-act="again">한 판 더</button>
          <button class="btn btn-ghost" type="button" data-act="other">다른 놀이</button>
        </div>
        <p class="modal-note">앨범 ${record.stickersTotal}/${STICKERS.length} · 기록은 이 기기에만 저장돼요.</p>
      </div>
    </div>`,
  );

  render();
  const dlg = $('#dialog-result');
  dlg.querySelector('[data-act="again"]')?.addEventListener('click', () => {
    closeDialog('dialog-result');
    if (lastResult) startGame(lastResult.game, lastResult.demo);
  });
  dlg.querySelector('[data-act="other"]')?.addEventListener('click', () => {
    closeDialog('dialog-result');
    document.getElementById('games')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  dlg.addEventListener('close', () => stopRound(), { once: true });

  sfx('stamp');
  if (stars >= 2 || record.albumJustCompleted) {
    const top = dlg.querySelector('.result-top') as HTMLElement | null;
    if (top) window.setTimeout(() => confetti(top, 28), 120);
  }
}

function wireStatic() {
  $('#btn-start').addEventListener('click', () => {
    unlockAudio();
    sfx('tap');
    document.getElementById('games')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#btn-start-2').addEventListener('click', () => {
    unlockAudio();
    sfx('tap');
    document.getElementById('games')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#btn-guide').addEventListener('click', openGuide);
  $('#btn-settings').addEventListener('click', openSettings);
  $('#btn-sound').addEventListener('click', () => {
    const next = !getSettings().sound;
    setSound(next);
    setMuted(!next);
    if (next) {
      unlockAudio();
      sfx('tap');
      toast('소리를 켰어요');
    } else {
      toast('소리를 껐어요');
    }
    syncSoundButton();
  });

  document.querySelectorAll<HTMLButtonElement>('.seg [data-players]').forEach((b) => {
    b.addEventListener('click', () => {
      session.players = Number(b.dataset.players) === 2 ? 2 : 1;
      sfx('tap');
      render();
    });
  });

  $('#btn-add-profile').addEventListener('click', () => {
    if (!canAddProfile()) {
      toast('사람은 4명까지 만들 수 있어요');
      return;
    }
    openProfileDialog();
  });

  // 바깥 클릭 닫기
  for (const dlg of document.querySelectorAll('dialog.modal')) {
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) (dlg as HTMLDialogElement).close();
    });
  }

  window.addEventListener(
    'scroll',
    () => {
      $('.topbar').classList.toggle('is-stuck', window.scrollY > 8);
    },
    { passive: true },
  );
}

function openProfileDialog() {
  let avatar = AVATARS[0].id;
  openDialog(
    'dialog-profile',
    `<div class="modal-card">
      <button class="modal-x" type="button" data-close aria-label="닫기">${ICONS.close}</button>
      <p class="modal-kicker">새 사람</p>
      <h2>누가 놀까요?</h2>
      <p class="modal-sub">이름과 얼굴을 골라 주세요. 기록은 이 기기에만 저장돼요.</p>
      <div style="margin-top:20px">
        <label class="field-label" for="profile-name">이름 (2~8글자)</label>
        <input class="text-input" id="profile-name" type="text" maxlength="8" autocomplete="off" placeholder="예: 별이" />
      </div>
      <div style="margin-top:18px">
        <span class="field-label">얼굴</span>
        <div class="avatar-pick" role="group" aria-label="얼굴 고르기">
          ${AVATARS.map(
            (a) =>
              `<button class="avatar-opt" type="button" data-avatar="${a.id}" aria-pressed="${a.id === avatar}" aria-label="${a.name}">${a.art}</button>`,
          ).join('')}
        </div>
      </div>
      <button class="btn btn-primary" type="button" data-save style="width:100%">만들기</button>
    </div>`,
  );

  const dlg = $('#dialog-profile');
  dlg.querySelectorAll('[data-avatar]').forEach((b) => {
    b.addEventListener('click', () => {
      avatar = (b as HTMLElement).dataset.avatar as typeof avatar;
      dlg.querySelectorAll('[data-avatar]').forEach((x) =>
        x.setAttribute('aria-pressed', String(x === b)),
      );
    });
  });
  dlg.querySelector('[data-close]')?.addEventListener('click', () => closeDialog('dialog-profile'));
  dlg.querySelector('[data-save]')?.addEventListener('click', () => {
    const input = dlg.querySelector<HTMLInputElement>('#profile-name');
    const profile = addProfile(input?.value ?? '', avatar);
    if (!profile) {
      toast('사람은 4명까지 만들 수 있어요');
      return;
    }
    sfx('stamp');
    closeDialog('dialog-profile');
    render();
    toast(`${profile.name}를 만들었어요!`);
  });
}

function openSettings() {
  const s = getSettings();
  openDialog(
    'dialog-settings',
    `<div class="modal-card">
      <button class="modal-x" type="button" data-close aria-label="닫기">${ICONS.close}</button>
      <p class="modal-kicker">설정</p>
      <h2>놀이 설정</h2>
      <div class="set-group">
        <h3>소리</h3>
        <div class="set-row">
          <span>효과음</span>
          <button class="switch" type="button" id="sw-sound" aria-checked="${s.sound}" aria-label="효과음"><i></i></button>
        </div>
      </div>
      <div class="set-group">
        <h3>한 판 시간</h3>
        <div class="set-row">
          <span>놀이 시간</span>
          <div class="tseg" role="radiogroup" aria-label="한 판 시간">
            ${[30, 60, 90]
              .map(
                (n) =>
                  `<button type="button" role="radio" data-sec="${n}" aria-checked="${s.round === n}">${n}초</button>`,
              )
              .join('')}
          </div>
        </div>
      </div>
      <div class="set-group">
        <h3>카메라</h3>
        <div class="set-row">
          <span>카메라 없이 시작</span>
          <button class="switch" type="button" id="sw-demo" aria-checked="${s.demo}" aria-label="카메라 없이 시작"><i></i></button>
        </div>
        <p class="modal-note">켜 두면 마우스나 손가락으로 놀이를 구경할 수 있어요.</p>
      </div>
      <div class="set-group">
        <h3>기록</h3>
        <div class="set-row">
          <span>${esc(getActive().name)}의 기록 지우기</span>
          <button class="danger-link" type="button" id="reset-progress">모두 지우기</button>
        </div>
        <p class="modal-note">스티커와 최고 점수가 지워져요. 되돌릴 수 없어요.</p>
      </div>
      <div class="version-line">
        <span>몸짓 마을 v0.1</span>
        <a href="./privacy.html">개인정보처리방침</a>
      </div>
    </div>`,
  );

  const dlg = $('#dialog-settings');
  dlg.querySelector('[data-close]')?.addEventListener('click', () => closeDialog('dialog-settings'));

  const soundBtn = dlg.querySelector<HTMLButtonElement>('#sw-sound')!;
  soundBtn.addEventListener('click', () => {
    const next = soundBtn.getAttribute('aria-checked') !== 'true';
    soundBtn.setAttribute('aria-checked', String(next));
    setSound(next);
    setMuted(!next);
    if (next) {
      unlockAudio();
      sfx('tap');
    }
    syncSoundButton();
  });

  dlg.querySelectorAll<HTMLButtonElement>('[data-sec]').forEach((b) => {
    b.addEventListener('click', () => {
      const sec = Number(b.dataset.sec) as 30 | 60 | 90;
      setRound(sec);
      dlg.querySelectorAll('[data-sec]').forEach((x) =>
        x.setAttribute('aria-checked', String(x === b)),
      );
      sfx('tap');
      toast(`한 판 ${sec}초로 바꿨어요`);
    });
  });

  const demoBtn = dlg.querySelector<HTMLButtonElement>('#sw-demo')!;
  demoBtn.addEventListener('click', () => {
    const next = demoBtn.getAttribute('aria-checked') !== 'true';
    demoBtn.setAttribute('aria-checked', String(next));
    setDemo(next);
    toast(next ? '카메라 없이 시작해요' : '카메라를 켜고 시작해요');
  });

  dlg.querySelector('#reset-progress')?.addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: '기록을 모두 지울까요?',
      text: '스티커와 최고 점수가 사라져요. 되돌릴 수 없어요.',
      ok: '지우기',
      danger: true,
    });
    if (!ok) return;
    resetProgress();
    render();
    toast('기록을 지웠어요');
  });
}

function openGuide() {
  openDialog(
    'dialog-guide',
    `<div class="modal-card">
      <button class="modal-x" type="button" data-close aria-label="닫기">${ICONS.close}</button>
      <p class="modal-kicker">노는 방법</p>
      <h2>카메라 앞, 이렇게 놀아요</h2>
      <div class="guide-steps">
        <div class="guide-step">
          <span class="gi">${stepArt('camera')}</span>
          <div><strong>1. 카메라를 켜요</strong><span>주소창의 카메라를 허용해 주세요. 영상은 이 기기 밖으로 나가지 않아요.</span></div>
        </div>
        <div class="guide-step">
          <span class="gi">${stepArt('space')}</span>
          <div><strong>2. 한 걸음 뒤로</strong><span>머리부터 손끝까지 화면에 다 보이게 서 주세요.</span></div>
        </div>
        <div class="guide-step">
          <span class="gi">${stepArt('play')}</span>
          <div><strong>3. 손으로 놀아요</strong><span>손을 대거나, 빠르게 휘두르거나, 잠깐 멈춰요. 점프는 하지 않아요.</span></div>
        </div>
      </div>
      <p class="guide-tip">카메라가 켜지지 않나요? 카톡·인스타 안에서 열었다면 <b>크롬으로 열기</b>를 눌러 주세요. 카메라 없이도 마우스로 놀이를 구경할 수 있어요.</p>
      <button class="btn btn-primary" type="button" data-close style="width:100%;margin-top:16px">알겠어요</button>
    </div>`,
  );
  $('#dialog-guide').querySelectorAll('[data-close]').forEach((b) =>
    b.addEventListener('click', () => closeDialog('dialog-guide')),
  );
}

function maybeInAppBanner() {
  const ua = navigator.userAgent;
  if (!/KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Line\//i.test(ua)) return;
  const bar = document.createElement('div');
  bar.className = 'escape';
  bar.innerHTML = `<p>앱 안에서는 카메라가 막힐 수 있어요. 크롬으로 열어 주세요.</p>
    <button type="button" data-copy>링크 복사</button>
    <button class="ex" type="button" data-close aria-label="닫기">✕</button>`;
  document.body.append(bar);
  bar.querySelector('[data-copy]')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      toast('링크를 복사했어요');
    } catch {
      toast('주소창의 주소를 복사해 주세요');
    }
  });
  bar.querySelector('[data-close]')?.addEventListener('click', () => bar.remove());
}

function wireDeepLink() {
  const params = new URLSearchParams(location.search);
  const id = params.get('game');
  if (!id) return;
  const game = gameById(id);
  if (!GAMES.some((g) => g.id === id)) return;
  window.setTimeout(() => {
    if (params.get('start') === '1' || params.get('demo') === '1') startGame(game, true);
    else openGameModal(game);
  }, 300);
}
