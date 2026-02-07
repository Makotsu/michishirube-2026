/**
 * ミチシルベ2026 - セッション・登壇者ページ JavaScript
 * デザインガイドライン v3.0 準拠
 */

// グローバルデータストア
let appData = {
  sessions: [],
  speakers: [],
  venues: [],
  timeSlots: []
};

// DOM要素のキャッシュ
const DOM = {};

/**
 * 初期化
 */
document.addEventListener('DOMContentLoaded', async () => {
  initializeImageErrorHandler();
  initializeFontSizeControls();
  await loadData();
  initializeNavigation();
  initializeBackToTop();
  initializeScrollAnimations();
  initializePage();
  Favorites._updateBadge();
});

/**
 * 画像読み込みエラーのグローバルハンドラ
 */
function initializeImageErrorHandler() {
  document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG' && e.target.closest('.speaker-photo, .speaker-item, .venue-speaker, .modal-body')) {
      e.target.src = `${getBasePath()}images/speakers/default.svg`;
    }
  }, true);
}

/**
 * フォントサイズ切り替え機能の初期化
 */
function initializeFontSizeControls() {
  // 保存された設定を適用（プライベートブラウジング対応）
  let savedSize = CONFIG.DEFAULTS.FONT_SIZE;
  try {
    savedSize = localStorage.getItem(CONFIG.STORAGE_KEYS.FONT_SIZE) || CONFIG.DEFAULTS.FONT_SIZE;
  } catch (e) {
    // プライベートブラウジングモード等でlocalStorageが使用不可の場合
  }
  setFontSize(savedSize);

  // ボタンにイベントリスナーを追加
  document.querySelectorAll('.font-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const size = btn.dataset.size;
      setFontSize(size);
      try {
        localStorage.setItem(CONFIG.STORAGE_KEYS.FONT_SIZE, size);
      } catch (e) {
        // プライベートブラウジングモード等でlocalStorageが使用不可の場合
      }
    });
  });
}

/**
 * フォントサイズを設定
 */
function setFontSize(size) {
  const html = document.documentElement;

  // 既存のフォントサイズクラスを削除
  html.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');

  // 新しいクラスを追加
  html.classList.add(`font-size-${size}`);

  // すべてのボタンのアクティブ状態を更新
  document.querySelectorAll('.font-size-btn').forEach(btn => {
    if (btn.dataset.size === size) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * JSONデータを読み込む
 */
async function loadData() {
  try {
    const basePath = getBasePath();
    const response = await fetch(`${basePath}data/sessions.json`);
    if (!response.ok) throw new Error('データの読み込みに失敗しました');
    const data = await response.json();
    Object.assign(appData, data);
  } catch (error) {
    console.error('Error loading data:', error);
    showError('データの読み込みに失敗しました。ページを再読み込みしてください。');
  }
}

/**
 * ベースパスを取得（Utils への委譲）
 */
const getBasePath = Utils.getBasePath.bind(Utils);

/**
 * ナビゲーションの初期化
 */
function initializeNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      nav.classList.toggle('active');
    });

    // ナビゲーションリンクをクリックしたらメニューを閉じる（モバイル）
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 768) {
          navToggle.classList.remove('active');
          nav.classList.remove('active');
        }
      });
    });
  }
}

/**
 * Back to Topボタンの初期化
 */
function initializeBackToTop() {
  const backToTop = document.querySelector('.back-to-top');
  if (!backToTop) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        backToTop.classList.toggle('visible', window.scrollY > 300);
        ticking = false;
      });
      ticking = true;
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * スクロールアニメーションの初期化
 */
function initializeScrollAnimations() {
  // Intersection Observer for fade-in animations
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // 監視対象の要素を登録（動的に追加される要素用のMutationObserver）
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          const fadeElements = node.querySelectorAll ? node.querySelectorAll('.fade-in') : [];
          fadeElements.forEach(el => observer.observe(el));
          if (node.classList && node.classList.contains('fade-in')) {
            observer.observe(node);
          }
        }
      });
    });
  });

  // 特定のコンテナのみ監視（パフォーマンス最適化）
  const dynamicContainers = [
    document.getElementById('tab-contents'),
    document.getElementById('speakers-grid'),
    document.getElementById('venue-sessions'),
    document.getElementById('timetable-body')
  ].filter(Boolean);

  if (dynamicContainers.length > 0) {
    dynamicContainers.forEach(container => {
      mutationObserver.observe(container, { childList: true, subtree: true });
    });
  } else {
    // フォールバック: コンテナがまだない場合はbodyを監視
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  // 既存の要素を監視
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

/**
 * ページ種別に応じた初期化
 */
function initializePage() {
  const pageType = document.body.dataset.page;

  switch (pageType) {
    case 'sessions':
      initializeSessionsPage();
      break;
    case 'timetable':
      initializeTimetablePage();
      break;
    case 'speakers':
      initializeSpeakersPage();
      break;
    case 'venue':
      initializeVenuePage();
      break;
    case 'schedule':
      initializeSchedulePage();
      break;
  }
}

/* ========================================
   セッション一覧ページ（タブ形式）
======================================== */
function initializeSessionsPage() {
  DOM.venueTabs = document.getElementById('venue-tabs');
  DOM.tabContents = document.getElementById('tab-contents');
  DOM.searchInput = document.getElementById('search-input');

  if (!DOM.venueTabs || !DOM.tabContents) return;

  // タブとコンテンツを生成
  renderVenueTabs();

  // 検索機能
  if (DOM.searchInput) {
    DOM.searchInput.addEventListener('input', debounce(filterTabSessions, 300));
  }

  // URLハッシュがあれば該当するセッションにスクロール
  if (window.location.hash) {
    const sessionId = decodeURIComponent(window.location.hash.substring(1));
    setTimeout(() => {
      scrollToSession(sessionId);
    }, 100);
  }
}

/**
 * 指定されたセッションIDのセッションにスクロール
 */
function scrollToSession(sessionId) {
  const session = appData.sessions.find(s => s.id === sessionId);
  if (!session) return;

  // 該当セッションの会場タブをアクティブにする
  const venueId = session.venue;
  const tab = DOM.venueTabs.querySelector(`.venue-tab[data-venue="${venueId}"]`);
  if (tab) {
    // タブのアクティブ状態・ARIA属性を更新
    DOM.venueTabs.querySelectorAll('.venue-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');

    // コンテンツのアクティブ状態を更新
    DOM.tabContents.querySelectorAll('.venue-tab-content').forEach(c => {
      c.classList.remove('active');
      c.setAttribute('hidden', '');
    });
    const content = DOM.tabContents.querySelector(`.venue-tab-content[data-venue="${venueId}"]`);
    if (content) {
      content.classList.add('active');
      content.removeAttribute('hidden');
    }
  }

  // 該当セッションにスクロール
  setTimeout(() => {
    const sessionElement = document.querySelector(`.tab-session-item[data-session-id="${sessionId}"]`);
    if (sessionElement) {
      sessionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      sessionElement.classList.add('highlight');
    }
  }, 100);
}

/**
 * ローディングスピナーを表示
 */
function showLoadingSpinner(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>読み込み中...</p>
    </div>
  `;
}

/**
 * 会場タブを生成
 */
function renderVenueTabs() {
  const basePath = getBasePath();

  // タブヘッダーを生成（ARIA タブパターン対応）
  const tabsHtml = appData.venues.map((venue, index) => {
    const sessionCount = appData.sessions.filter(s => s.venue === venue.id).length;
    const isActive = index === 0;
    return `
      <button class="venue-tab ${isActive ? 'active' : ''}"
              data-venue="${venue.id}"
              role="tab"
              id="tab-${venue.id}"
              aria-selected="${isActive}"
              aria-controls="panel-${venue.id}"
              tabindex="${isActive ? '0' : '-1'}">
        ${venue.nameJp || venue.id}
        <small>(${sessionCount})</small>
      </button>
    `;
  }).join('');

  DOM.venueTabs.innerHTML = tabsHtml;

  // タブコンテンツを生成
  const contentsHtml = appData.venues.map((venue, index) => {
    const venueSessions = appData.sessions
      .filter(s => s.venue === venue.id)
      .sort((a, b) => {
        return CONFIG.TIME_SLOT_ORDER.indexOf(a.timeSlot) - CONFIG.TIME_SLOT_ORDER.indexOf(b.timeSlot);
      });
    const isActive = index === 0;

    return `
      <div class="venue-tab-content ${isActive ? 'active' : ''}"
           data-venue="${venue.id}"
           role="tabpanel"
           id="panel-${venue.id}"
           aria-labelledby="tab-${venue.id}"
           ${isActive ? '' : 'hidden'}>
        <div class="venue-summary">
          <div class="venue-icon">${venue.nameJp || venue.id}</div>
          <div class="venue-info">
            <h3>${venue.name}</h3>
            <p class="venue-theme">${venue.theme || ''}</p>
            <p class="venue-location">${venue.location || ''} / ${venueSessions.length}セッション</p>
          </div>
        </div>
        <div class="tab-sessions-list">
          ${venueSessions.map(session => renderTabSession(session, basePath)).join('')}
        </div>
      </div>
    `;
  }).join('');

  DOM.tabContents.innerHTML = contentsHtml;

  // タブ切り替え関数
  function switchTab(tab) {
    const venueId = tab.dataset.venue;

    // タブのアクティブ状態・ARIA属性を更新
    DOM.venueTabs.querySelectorAll('.venue-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');

    // コンテンツのアクティブ状態を更新
    DOM.tabContents.querySelectorAll('.venue-tab-content').forEach(c => {
      c.classList.remove('active');
      c.setAttribute('hidden', '');
    });
    const content = DOM.tabContents.querySelector(`.venue-tab-content[data-venue="${venueId}"]`);
    if (content) {
      content.classList.add('active');
      content.removeAttribute('hidden');
    }
  }

  // タブ切り替えイベント（クリック）
  DOM.venueTabs.querySelectorAll('.venue-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab));
  });

  // タブキーボード操作（矢印キーで移動）
  DOM.venueTabs.addEventListener('keydown', (e) => {
    const tabs = [...DOM.venueTabs.querySelectorAll('.venue-tab')];
    const currentIndex = tabs.indexOf(e.target);
    if (currentIndex === -1) return;

    let newIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      newIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = tabs.length - 1;
    } else {
      return;
    }

    tabs[newIndex].focus();
    switchTab(tabs[newIndex]);
  });
}

/**
 * タブ内のセッションをレンダリング
 */
function renderTabSession(session, basePath) {
  const timeSlot = appData.timeSlots.find(t => t.id === session.timeSlot);

  return `
    <article class="tab-session-item" data-session-id="${session.id}">
      <div class="tab-session-header">
        <span class="session-code">${session.venueCode}</span>
        <span class="time-slot">${timeSlot ? timeSlot.name : ''}</span>
      </div>
      <div class="tab-session-body">
        <h3>${escapeHtml(session.title)}</h3>
        <p class="description">${escapeHtml(session.description)}</p>
        <button type="button" class="description-toggle-btn" aria-expanded="false">詳しく読む</button>
        <div class="tab-session-speakers">
          <h4>登壇者</h4>
          <div class="speakers-list">
            ${session.speakers.map(speaker => {
              const speakerData = appData.speakers.find(s =>
                s.name.replace(/\s/g, '') === speaker.name.replace(/\s/g, '')
              );
              const photoSrc = speakerData ? `${basePath}${speakerData.photo}` : `${basePath}images/speakers/default.svg`;
              const affiliation = speakerData?.affiliation || '';

              return `
                <button type="button" class="speaker-item" data-speaker-name="${escapeHtml(speaker.name)}">
                  <img src="${photoSrc}" alt="${escapeHtml(speaker.name)}" loading="lazy">
                  <div class="speaker-item-info">
                    <h5>${escapeHtml(speaker.name)}</h5>
                    ${affiliation ? `<p class="affiliation">${escapeHtml(affiliation)}</p>` : ''}
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>
      <div class="tab-session-footer">
        <button type="button" class="favorite-btn ${Favorites.isFavorited(session.id) ? 'is-favorited' : ''}"
                data-session-id="${session.id}"
                aria-pressed="${Favorites.isFavorited(session.id)}"
                aria-label="${Favorites.isFavorited(session.id) ? 'お気に入りから削除: ' : 'お気に入りに追加: '}${escapeHtml(session.title)}">
          <span class="favorite-btn-icon" aria-hidden="true">${Favorites.isFavorited(session.id) ? '\u2605' : '\u2606'}</span>
          <span class="favorite-btn-text">${Favorites.isFavorited(session.id) ? '\u8ffd\u52a0\u6e08\u307f' : '\u6c17\u306b\u306a\u308b'}</span>
        </button>
      </div>
    </article>
  `;
}

/**
 * タブ内のセッションを検索でフィルタリング
 */
function filterTabSessions() {
  const searchTerm = DOM.searchInput?.value.toLowerCase() || '';
  const basePath = getBasePath();

  // 各タブのコンテンツを再生成
  appData.venues.forEach(venue => {
    const content = DOM.tabContents.querySelector(`.venue-tab-content[data-venue="${venue.id}"]`);
    if (!content) return;

    const venueSessions = appData.sessions
      .filter(s => s.venue === venue.id)
      .filter(session => {
        if (!searchTerm) return true;
        return session.title.toLowerCase().includes(searchTerm) ||
          session.description.toLowerCase().includes(searchTerm) ||
          session.speakers.some(sp => sp.name.toLowerCase().includes(searchTerm) ||
            (sp.nameKana && sp.nameKana.toLowerCase().includes(searchTerm)));
      })
      .sort((a, b) => {
        return CONFIG.TIME_SLOT_ORDER.indexOf(a.timeSlot) - CONFIG.TIME_SLOT_ORDER.indexOf(b.timeSlot);
      });

    const sessionsList = content.querySelector('.tab-sessions-list');
    if (sessionsList) {
      if (venueSessions.length === 0) {
        sessionsList.innerHTML = `<div class="no-results"><p>該当するセッションがありません</p></div>`;
      } else {
        sessionsList.innerHTML = venueSessions.map(session => renderTabSession(session, basePath)).join('');
      }
    }

    // タブのカウントも更新
    const tab = DOM.venueTabs.querySelector(`.venue-tab[data-venue="${venue.id}"] small`);
    if (tab) {
      tab.textContent = `(${venueSessions.length})`;
    }
  });
}

/* ========================================
   タイムテーブルページ
======================================== */
function initializeTimetablePage() {
  DOM.timetableBody = document.getElementById('timetable-body');
  DOM.timetableHead = document.querySelector('.timetable thead tr');
  DOM.timetableWrapper = document.querySelector('.timetable-wrapper');
  if (!DOM.timetableBody) return;

  renderTimetableHeader();
  renderTimetable();
  renderTimetableMobile();
  updateVenueNavigation();
}

/**
 * タイムテーブルのヘッダーをレンダリング
 */
function renderTimetableHeader() {
  if (!DOM.timetableHead) return;

  const headerCells = appData.venues.map(venue => {
    return `<th data-venue="${venue.id}">
      <div class="timetable-venue-header">
        <span class="venue-id">${venue.id}</span>
        <span class="venue-name-jp">${venue.nameJp || ''}</span>
      </div>
    </th>`;
  }).join('');

  DOM.timetableHead.innerHTML = `<th>時間</th>${headerCells}`;
}

/**
 * タイムテーブルをレンダリング
 */
function renderTimetable() {
  if (!DOM.timetableBody) return;

  const venueCount = appData.venues.length;

  // 時間帯を正しい順序でソート
  const sortedTimeSlots = [...appData.timeSlots].sort((a, b) => {
    return CONFIG.TIME_SLOT_ORDER.indexOf(a.id) - CONFIG.TIME_SLOT_ORDER.indexOf(b.id);
  });

  // 時間帯ごとの行を生成
  const rows = sortedTimeSlots.map(slot => {
    const timeLabel = slot.label ? `<small>${slot.label}</small>` : '';

    // 全体セッション（オープニング・クロージング等）の場合
    if (slot.isPlenary) {
      const plenarySession = appData.plenarySessions
        ? appData.plenarySessions.find(p => p.timeSlot === slot.id)
        : null;

      const programsHtml = plenarySession
        ? plenarySession.programs
            .map(p => `<span>${escapeHtml(p)}</span>`)
            .join('<span class="timetable-plenary-sep" aria-hidden="true">／</span>')
        : '';

      const plenaryContent = plenarySession
        ? `<div class="timetable-plenary">
            <div class="timetable-plenary-title">${escapeHtml(plenarySession.title)}</div>
            <div class="timetable-plenary-meta">${escapeHtml(plenarySession.location)}</div>
            <div class="timetable-plenary-programs">${programsHtml}</div>
          </div>`
        : '';

      return `
        <tr data-timeslot="${slot.id}" class="timetable-plenary-row">
          <th>
            <div class="timetable-time">
              <span class="time">${slot.name}</span>
              ${timeLabel}
            </div>
          </th>
          <td colspan="${venueCount}" class="timetable-plenary-cell">
            ${plenaryContent}
          </td>
        </tr>
      `;
    }

    // 通常の選択セッション
    const cells = appData.venues.map(venue => {
      const session = appData.sessions.find(s =>
        s.venue === venue.id && s.timeSlot === slot.id
      );

      if (session) {
        const isFavTT = Favorites.isFavorited(session.id);
        return `
          <td data-venue="${venue.id}">
            <div class="timetable-session" data-session-id="${session.id}" role="button" tabindex="0" aria-label="セッション: ${escapeHtml(session.title)}">
              <button type="button" class="favorite-btn favorite-btn-compact ${isFavTT ? 'is-favorited' : ''}"
                      data-session-id="${session.id}"
                      aria-pressed="${isFavTT}"
                      aria-label="${isFavTT ? 'お気に入りから削除' : 'お気に入りに追加'}">
                <span class="favorite-btn-icon" aria-hidden="true">${isFavTT ? '\u2605' : '\u2606'}</span>
                <span class="favorite-btn-text sr-only">${isFavTT ? '\u8ffd\u52a0\u6e08\u307f' : '\u6c17\u306b\u306a\u308b'}</span>
              </button>
              <h4>${escapeHtml(session.title)}</h4>
              <div class="speakers">${session.speakers.map(s => s.name).join('、')}</div>
            </div>
          </td>
        `;
      } else {
        return `<td data-venue="${venue.id}"><div class="timetable-empty"></div></td>`;
      }
    }).join('');

    return `
      <tr data-timeslot="${slot.id}">
        <th>
          <div class="timetable-time">
            <span class="time">${slot.name}</span>
            ${timeLabel}
          </div>
        </th>
        ${cells}
      </tr>
    `;
  }).join('');

  DOM.timetableBody.innerHTML = rows;
}

/**
 * モバイル用タイムテーブルをレンダリング
 */
function renderTimetableMobile() {
  if (!DOM.timetableWrapper) return;

  // モバイル用コンテナを作成
  const mobileContainer = document.createElement('div');
  mobileContainer.className = 'timetable-mobile';

  // 時間帯を正しい順序でソート
  const sortedTimeSlots = [...appData.timeSlots].sort((a, b) => {
    return CONFIG.TIME_SLOT_ORDER.indexOf(a.id) - CONFIG.TIME_SLOT_ORDER.indexOf(b.id);
  });

  // 時間帯ごとにセッションをグループ化
  const slotsHtml = sortedTimeSlots.map(slot => {
    const timeLabel = slot.label ? `<small>${slot.label}</small>` : '';

    // 全体セッション（オープニング・クロージング等）の場合
    if (slot.isPlenary) {
      const plenarySession = appData.plenarySessions
        ? appData.plenarySessions.find(p => p.timeSlot === slot.id)
        : null;

      if (!plenarySession) return '';

      const mobileProgramsHtml = plenarySession.programs
        .map(p => `<span>${escapeHtml(p)}</span>`)
        .join('<span class="timetable-plenary-sep" aria-hidden="true">／</span>');

      return `
        <div class="timetable-mobile-slot timetable-mobile-plenary" data-timeslot="${slot.id}">
          <div class="timetable-mobile-slot-header">
            <h3>${slot.name}</h3>
            ${timeLabel}
          </div>
          <div class="timetable-mobile-sessions">
            <div class="timetable-plenary">
              <div class="timetable-plenary-title">${escapeHtml(plenarySession.title)}</div>
              <div class="timetable-plenary-meta">${escapeHtml(plenarySession.location)}</div>
              <div class="timetable-plenary-programs">${mobileProgramsHtml}</div>
            </div>
          </div>
        </div>
      `;
    }

    // 通常の選択セッション
    const slotSessions = appData.venues
      .map(venue => {
        const session = appData.sessions.find(s =>
          s.venue === venue.id && s.timeSlot === slot.id
        );
        return session ? { session, venue } : null;
      })
      .filter(Boolean);

    if (slotSessions.length === 0) return '';

    const sessionsHtml = slotSessions.map(({ session, venue }) => {
      const isFavMobile = Favorites.isFavorited(session.id);
      return `
      <div class="timetable-mobile-session" data-session-id="${session.id}" data-venue="${venue.id}" role="button" tabindex="0" aria-label="セッション: ${escapeHtml(session.title)}">
        <div class="timetable-mobile-session-header">
          <span class="timetable-mobile-session-venue">${venue.nameJp || venue.id}</span>
          <span class="timetable-mobile-session-code">${session.venueCode}</span>
          <button type="button" class="favorite-btn favorite-btn-compact ${isFavMobile ? 'is-favorited' : ''}"
                  data-session-id="${session.id}"
                  aria-pressed="${isFavMobile}"
                  aria-label="${isFavMobile ? 'お気に入りから削除' : 'お気に入りに追加'}">
            <span class="favorite-btn-icon" aria-hidden="true">${isFavMobile ? '\u2605' : '\u2606'}</span>
            <span class="favorite-btn-text sr-only">${isFavMobile ? '\u8ffd\u52a0\u6e08\u307f' : '\u6c17\u306b\u306a\u308b'}</span>
          </button>
        </div>
        <h4>${escapeHtml(session.title)}</h4>
        <div class="speakers">${session.speakers.map(s => s.name).join('、')}</div>
      </div>
    `;
    }).join('');

    return `
      <div class="timetable-mobile-slot" data-timeslot="${slot.id}">
        <div class="timetable-mobile-slot-header">
          <h3>${slot.name}</h3>
          ${timeLabel}
        </div>
        <div class="timetable-mobile-sessions">
          ${sessionsHtml}
        </div>
      </div>
    `;
  }).join('');

  mobileContainer.innerHTML = slotsHtml;

  // テーブルの後にモバイル用コンテナを挿入
  DOM.timetableWrapper.parentNode.insertBefore(mobileContainer, DOM.timetableWrapper.nextSibling);
}

/**
 * 会場ナビゲーションを更新
 */
function updateVenueNavigation() {
  const venueNav = document.querySelector('.venue-nav');
  if (!venueNav) return;

  const basePath = getBasePath();
  venueNav.innerHTML = appData.venues.map(venue => {
    const venueUrl = CONFIG.getPageUrl(basePath, `venue/${venue.id.toLowerCase()}`);
    return `<a href="${venueUrl}">${venue.nameJp || venue.id}（${venue.id}）</a>`;
  }).join('');
}

/* ========================================
   登壇者一覧ページ
======================================== */
function initializeSpeakersPage() {
  DOM.searchInput = document.getElementById('speaker-search');
  DOM.speakersGrid = document.getElementById('speakers-grid');

  if (!DOM.speakersGrid) return;

  // 登壇者をセッションID順（A1, A2, AL, A3, B1...）でソート
  const venueOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L'];
  const timeSlotOrder = CONFIG.TIME_SLOT_ORDER; // ['1', '2', 'L', '3']

  // セッションIDからソート用のインデックスを計算
  const getSessionSortIndex = (sessionId) => {
    if (!sessionId) return 999999;
    const venue = sessionId.charAt(0);
    const timeSlot = sessionId.substring(1);
    const venueIndex = venueOrder.indexOf(venue);
    const timeIndex = timeSlotOrder.indexOf(timeSlot);
    return (venueIndex >= 0 ? venueIndex : 99) * 100 + (timeIndex >= 0 ? timeIndex : 99);
  };

  const sortedSpeakers = [...appData.speakers].sort((a, b) => {
    // 各登壇者の最初のセッションIDを取得
    const sessionA = a.sessions && a.sessions.length > 0 ? a.sessions[0] : null;
    const sessionB = b.sessions && b.sessions.length > 0 ? b.sessions[0] : null;

    // セッションがない場合は後ろに回す
    if (!sessionA && sessionB) return 1;
    if (sessionA && !sessionB) return -1;
    if (!sessionA && !sessionB) return 0;

    // セッションID順で比較
    return getSessionSortIndex(sessionA) - getSessionSortIndex(sessionB);
  });

  renderSpeakers(sortedSpeakers);

  // 検索イベント
  if (DOM.searchInput) {
    DOM.searchInput.addEventListener('input', debounce(() => {
      const searchTerm = DOM.searchInput.value.toLowerCase();
      const filtered = sortedSpeakers.filter(speaker =>
        speaker.name.toLowerCase().includes(searchTerm) ||
        (speaker.nameKana && speaker.nameKana.toLowerCase().includes(searchTerm)) ||
        (speaker.affiliation && speaker.affiliation.toLowerCase().includes(searchTerm))
      );
      renderSpeakers(filtered);
    }, 300));
  }

  // URLハッシュがあれば該当する登壇者にスクロール
  if (window.location.hash) {
    const speakerName = decodeURIComponent(window.location.hash.substring(1));
    setTimeout(() => {
      const card = document.querySelector(`[data-speaker-name="${speakerName}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('highlight');
      }
    }, 100);
  }
}

/**
 * 登壇者をレンダリング
 */
function renderSpeakers(speakers) {
  if (!DOM.speakersGrid) return;

  if (speakers.length === 0) {
    DOM.speakersGrid.innerHTML = `
      <div class="no-results">
        <h3>該当する登壇者が見つかりませんでした</h3>
        <p>検索条件を変更してお試しください</p>
      </div>
    `;
    return;
  }

  const basePath = getBasePath();

  DOM.speakersGrid.innerHTML = speakers.map(speaker => `
    <article class="speaker-card" data-speaker-name="${escapeHtml(speaker.name)}" data-speaker-id="${speaker.id}">
      <div class="speaker-clickable">
        <img class="speaker-photo" src="${basePath}${speaker.photo}" alt="${escapeHtml(speaker.name)}" loading="lazy">
        <div class="speaker-info">
          <h3>${escapeHtml(speaker.name)}</h3>
          <p class="speaker-kana">${escapeHtml(speaker.nameKana || '')}</p>
          <p class="speaker-affiliation">${escapeHtml(speaker.affiliation || '')}</p>
        </div>
      </div>
      <div class="speaker-sessions">
        ${(speaker.sessions || []).map(sessionId => {
          const session = appData.sessions.find(s => s.id === sessionId);
          return session ? `<a href="${basePath || './'}#${sessionId}" class="session-tag">${session.venueCode}</a>` : '';
        }).join('')}
      </div>
    </article>
  `).join('');

  // カードのクリックイベントを追加
  DOM.speakersGrid.querySelectorAll('.speaker-clickable').forEach(clickable => {
    clickable.addEventListener('click', () => {
      const card = clickable.closest('.speaker-card');
      const speakerId = card.dataset.speakerId;
      const speaker = appData.speakers.find(s => s.id === speakerId);
      if (speaker) showSpeakerModal(speaker);
    });
  });
}

/* ========================================
   会場別ページ
======================================== */
function initializeVenuePage() {
  const venueId = document.body.dataset.venue;
  if (!venueId) return;

  DOM.sessionsContainer = document.getElementById('venue-sessions');
  if (!DOM.sessionsContainer) return;

  // 該当会場のセッションをフィルタ
  const venueSessions = appData.sessions
    .filter(s => s.venue === venueId)
    .sort((a, b) => {
      // 時間帯順にソート（1 → 2 → L → 3）
      return CONFIG.TIME_SLOT_ORDER.indexOf(a.timeSlot) - CONFIG.TIME_SLOT_ORDER.indexOf(b.timeSlot);
    });

  // 会場情報を更新
  updateVenuePageHeader(venueId);
  renderVenueSessions(venueSessions);
}

/**
 * 会場ページのヘッダーを更新
 */
function updateVenuePageHeader(venueId) {
  const venue = appData.venues.find(v => v.id === venueId);
  if (!venue) return;

  // ページヘッダーの更新
  const pageHeader = document.querySelector('.page-header');
  if (pageHeader) {
    const h1 = pageHeader.querySelector('h1');
    const p = pageHeader.querySelector('p');
    if (h1) h1.textContent = venue.name;
    if (p) {
      p.innerHTML = `${venue.theme || ''}<br><small style="color: var(--color-text-muted);">${venue.location || ''}</small>`;
    }
  }

  // パンくずリストの更新
  const breadcrumb = document.querySelector('.breadcrumb-list li:last-child');
  if (breadcrumb) {
    breadcrumb.textContent = venue.name;
  }

  // ページタイトルの更新
  document.title = `${venue.name} | ミチシルベ2026`;
}

/**
 * 会場別セッションをレンダリング
 */
function renderVenueSessions(sessions) {
  if (!DOM.sessionsContainer) return;

  const basePath = getBasePath();

  DOM.sessionsContainer.innerHTML = sessions.map(session => {
    const timeSlot = appData.timeSlots.find(t => t.id === session.timeSlot);

    return `
      <article class="venue-session">
        <div class="venue-session-header">
          <span class="venue-badge">${session.venueCode}</span>
          <span class="time-slot">${timeSlot ? timeSlot.name : ''}</span>
        </div>
        <div class="venue-session-body">
          <h3>${escapeHtml(session.title)}</h3>
          <p class="description">${escapeHtml(session.description)}</p>
          <div class="venue-session-speakers">
            ${session.speakers.map(speaker => {
              const speakerData = appData.speakers.find(s =>
                s.name.replace(/\s/g, '') === speaker.name.replace(/\s/g, '')
              );
              const photoSrc = speakerData ? `${basePath}${speakerData.photo}` : `${basePath}images/speakers/default.svg`;
              return `
                <button type="button" class="venue-speaker" data-speaker-name="${escapeHtml(speaker.name)}">
                  <img src="${photoSrc}" alt="${escapeHtml(speaker.name)}" loading="lazy">
                  <div class="venue-speaker-info">
                    <h4>${escapeHtml(speaker.name)}</h4>
                    <p>${escapeHtml(speaker.nameKana || '')}</p>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/* ========================================
   モーダル
======================================== */
function showSessionModal(session) {
  if (!session) return;

  const basePath = getBasePath();
  const timeSlot = appData.timeSlots.find(t => t.id === session.timeSlot);
  const venue = appData.venues.find(v => v.id === session.venue);

  const modalHtml = `
    <div class="modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal" role="document">
        <div class="modal-header">
          <h2 id="modal-title">${escapeHtml(session.title)}</h2>
          <button class="modal-close" aria-label="閉じる" type="button">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-section">
            <h4>会場・時間</h4>
            <p>${venue ? venue.name : session.venue} / ${timeSlot ? timeSlot.name : ''}</p>
          </div>
          <div class="modal-section">
            <button type="button" class="favorite-btn favorite-btn-modal ${Favorites.isFavorited(session.id) ? 'is-favorited' : ''}"
                    data-session-id="${session.id}"
                    aria-pressed="${Favorites.isFavorited(session.id)}"
                    aria-label="${Favorites.isFavorited(session.id) ? 'お気に入りから削除' : 'お気に入りに追加'}">
              <span class="favorite-btn-icon" aria-hidden="true">${Favorites.isFavorited(session.id) ? '\u2605' : '\u2606'}</span>
              <span class="favorite-btn-text">${Favorites.isFavorited(session.id) ? '\u6c17\u306b\u306a\u308b\u30ea\u30b9\u30c8\u306b\u8ffd\u52a0\u6e08\u307f' : '\u6c17\u306b\u306a\u308b'}</span>
            </button>
          </div>
          <div class="modal-section">
            <h4>概要</h4>
            <p>${escapeHtml(session.description)}</p>
          </div>
          <div class="modal-section">
            <h4>登壇者</h4>
            <div class="venue-session-speakers">
              ${session.speakers.map(speaker => {
                const speakerData = appData.speakers.find(s =>
                  s.name.replace(/\s/g, '') === speaker.name.replace(/\s/g, '')
                );
                const photoSrc = speakerData ? `${basePath}${speakerData.photo}` : `${basePath}${CONFIG.DEFAULTS.SPEAKER_PHOTO}`;
                return `
                  <button type="button" class="venue-speaker" data-speaker-name="${escapeHtml(speaker.name)}" data-close-modal="true">
                    <img src="${photoSrc}" alt="${escapeHtml(speaker.name)}" loading="lazy">
                    <div class="venue-speaker-info">
                      <h4>${escapeHtml(speaker.name)}</h4>
                      <p>${escapeHtml(speaker.nameKana || '')}</p>
                    </div>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  Modal.open(modalHtml);
}

function showSpeakerModal(speaker) {
  if (!speaker) return;

  const basePath = getBasePath();

  const modalHtml = `
    <div class="modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal" role="document">
        <div class="modal-header">
          <h2 id="modal-title">${escapeHtml(speaker.name)}</h2>
          <button class="modal-close" aria-label="閉じる" type="button">&times;</button>
        </div>
        <div class="modal-body">
          <div style="text-align: center; margin-bottom: 1rem;">
            <img src="${basePath}${speaker.photo}" alt="${escapeHtml(speaker.name)}"
                 style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover;"
>
          </div>
          <div class="modal-section">
            <h4>所属・役職</h4>
            <p>${escapeHtml(speaker.affiliation || '未設定')}</p>
          </div>
          <div class="modal-section">
            <h4>プロフィール</h4>
            <p>${escapeHtml(speaker.bio || 'プロフィール情報はありません。')}</p>
          </div>
          ${speaker.sns ? `
            <div class="modal-section">
              <h4>SNS / Website</h4>
              <p><a href="${escapeHtml(speaker.sns)}" target="_blank" rel="noopener noreferrer">${escapeHtml(speaker.sns)}</a></p>
            </div>
          ` : ''}
          ${speaker.sessions && speaker.sessions.length > 0 ? `
            <div class="modal-section">
              <h4>出演セッション</h4>
              <div class="speaker-sessions">
                ${speaker.sessions.map(sessionId => {
                  const session = appData.sessions.find(s => s.id === sessionId);
                  return session ? `<a href="${basePath || './'}#${sessionId}" class="session-tag">${session.venueCode}: ${escapeHtml(session.title)}</a>` : '';
                }).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  Modal.open(modalHtml);
}

// モーダル管理オブジェクト
const Modal = {
  previousFocus: null,

  trapFocus(modalElement) {
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    firstFocusable.focus();

    modalElement.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    });
  },

  open(modalHtml) {
    this.previousFocus = document.activeElement;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';

    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      this.trapFocus(modal);
    }
  },

  close() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
      if (this.previousFocus) {
        this.previousFocus.focus();
      }
    }
  }
};

// お気に入り管理オブジェクト
const Favorites = {
  _cache: null,

  getAll() {
    if (this._cache) return this._cache;
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES);
      this._cache = stored ? JSON.parse(stored) : [];
    } catch (e) {
      this._cache = [];
    }
    return this._cache;
  },

  _save(ids) {
    this._cache = ids;
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(ids));
    } catch (e) { /* Private Browsing */ }
  },

  toggle(sessionId) {
    const ids = this.getAll();
    const index = ids.indexOf(sessionId);
    const added = index === -1;
    if (added) {
      ids.push(sessionId);
    } else {
      ids.splice(index, 1);
    }
    this._save(ids);
    this._updateAllButtons(sessionId);
    this._updateBadge();

    // GA4イベント送信
    if (typeof gtag === 'function') {
      const session = appData.sessions.find(s => s.id === sessionId);
      gtag('event', added ? 'favorite_add' : 'favorite_remove', {
        session_id: sessionId,
        session_title: session ? session.title : '',
        venue: session ? session.venue : ''
      });
    }

    return added;
  },

  isFavorited(sessionId) {
    return this.getAll().includes(sessionId);
  },

  importFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get('s');
    if (!sessionParam) return false;
    const ids = sessionParam.split(',').filter(id => id.length >= 2);
    if (ids.length > 0) {
      this._save(ids);
      return true;
    }
    return false;
  },

  toUrl() {
    const ids = this.getAll();
    if (ids.length === 0) return '';
    const basePath = getBasePath();
    const scheduleUrl = CONFIG.getPageUrl(basePath, 'schedule');
    return `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}${scheduleUrl}?s=${ids.join(',')}`;
  },

  getConflicts() {
    const ids = this.getAll();
    const bySlot = {};
    ids.forEach(id => {
      const session = appData.sessions.find(s => s.id === id);
      if (session) {
        if (!bySlot[session.timeSlot]) bySlot[session.timeSlot] = [];
        bySlot[session.timeSlot].push(session);
      }
    });
    const conflicts = {};
    Object.entries(bySlot).forEach(([slot, sessions]) => {
      if (sessions.length > 1) conflicts[slot] = sessions;
    });
    return conflicts;
  },

  _updateAllButtons(sessionId) {
    const isFav = this.isFavorited(sessionId);
    document.querySelectorAll(`.favorite-btn[data-session-id="${sessionId}"]`).forEach(btn => {
      btn.classList.toggle('is-favorited', isFav);
      btn.setAttribute('aria-pressed', String(isFav));
      const icon = btn.querySelector('.favorite-btn-icon');
      const text = btn.querySelector('.favorite-btn-text');
      if (icon) icon.textContent = isFav ? '\u2605' : '\u2606';
      if (text) text.textContent = isFav ? '\u8ffd\u52a0\u6e08\u307f' : '\u6c17\u306b\u306a\u308b';
    });
  },

  _updateBadge() {
    const count = this.getAll().length;
    document.querySelectorAll('.favorites-badge').forEach(badge => {
      badge.textContent = count;
      badge.hidden = count === 0;
    });
  }
};

function closeModal(event) {
  if (event && event.target !== event.currentTarget) return;
  Modal.close();
}

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Enter/Spaceキーで role="button" 要素をクリック発火
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    const target = e.target;
    if (target.getAttribute('role') === 'button' && target.matches('.timetable-session, .timetable-mobile-session')) {
      e.preventDefault();
      target.click();
    }
  }
});

// スクロールとタップを区別するためのタッチ追跡
window._isScrolling = false;
let _touchStartY = 0;
document.addEventListener('touchstart', (e) => {
  _touchStartY = e.touches[0].clientY;
  window._isScrolling = false;
}, { passive: true });
document.addEventListener('touchmove', (e) => {
  if (Math.abs(e.touches[0].clientY - _touchStartY) > 10) {
    window._isScrolling = true;
  }
}, { passive: true });

// イベント委譲パターン
document.body.addEventListener('click', (e) => {
  // お気に入りボタンのトグル
  const favoriteBtn = e.target.closest('.favorite-btn');
  if (favoriteBtn) {
    e.preventDefault();
    e.stopPropagation();
    const sessionId = favoriteBtn.dataset.sessionId;
    Favorites.toggle(sessionId);
    return;
  }

  // セッション概要の「詳しく読む」トグル（ボタンまたは概要テキストクリック）
  const toggleBtn = e.target.closest('.description-toggle-btn');
  const descriptionEl = e.target.closest('.tab-session-body > .description');
  if (toggleBtn || (descriptionEl && !descriptionEl.classList.contains('expanded'))) {
    const description = toggleBtn
      ? toggleBtn.previousElementSibling
      : descriptionEl;
    if (description && description.classList.contains('description')) {
      const isExpanded = description.classList.toggle('expanded');
      const btn = description.nextElementSibling;
      if (btn && btn.classList.contains('description-toggle-btn')) {
        btn.classList.toggle('expanded', isExpanded);
        btn.textContent = isExpanded ? '閉じる' : '詳しく読む';
        btn.setAttribute('aria-expanded', isExpanded);
      }
    }
    return;
  }

  // 展開中の概要をタップで閉じる（スクロール時は除外）
  if (!window._isScrolling) {
    document.querySelectorAll('.description.expanded').forEach(desc => {
      desc.classList.remove('expanded');
      const btn = desc.nextElementSibling;
      if (btn && btn.classList.contains('description-toggle-btn')) {
        btn.classList.remove('expanded');
        btn.textContent = '詳しく読む';
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 登壇者モーダル表示
  const speakerTrigger = e.target.closest('[data-speaker-name]');
  if (speakerTrigger) {
    e.preventDefault();
    e.stopPropagation();
    const shouldCloseFirst = speakerTrigger.dataset.closeModal === 'true';
    if (shouldCloseFirst) {
      Modal.close();
    }
    showSpeakerModalByName(speakerTrigger.dataset.speakerName);
    return;
  }

  // セッションモーダル表示（タイムテーブル - PC/モバイル両対応）
  const sessionTrigger = e.target.closest('.timetable-session[data-session-id], .timetable-mobile-session[data-session-id], .schedule-session[data-session-id]');
  if (sessionTrigger) {
    const sessionId = sessionTrigger.dataset.sessionId;
    const session = appData.sessions.find(s => s.id === sessionId);
    if (session) showSessionModal(session);
    return;
  }

  // モーダル閉じる（閉じるボタン）
  if (e.target.closest('.modal-close')) {
    closeModal();
    return;
  }

  // モーダル閉じる（オーバーレイクリック）
  if (e.target.classList.contains('modal-overlay')) {
    closeModal();
    return;
  }
});

/* ========================================
   ユーティリティ関数（Utils オブジェクトへの委譲）
======================================== */
const escapeHtml = Utils.escapeHtml.bind(Utils);
const debounce = Utils.debounce.bind(Utils);

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.style.cssText = 'background: #fee; color: #c00; padding: 1rem; margin: 1rem; border-radius: 8px; text-align: center;';
  errorDiv.textContent = message;
  document.body.insertBefore(errorDiv, document.body.firstChild);
}

/**
 * 登壇者名からモーダルを表示
 */
function showSpeakerModalByName(speakerName) {
  const speaker = appData.speakers.find(s =>
    s.name.replace(/\s/g, '') === speakerName.replace(/\s/g, '')
  );
  if (speaker) {
    showSpeakerModal(speaker);
  }
}

/* ========================================
   マイスケジュールページ
======================================== */
function initializeSchedulePage() {
  Favorites.importFromUrl();

  const favorites = Favorites.getAll();
  const emptyEl = document.getElementById('schedule-empty');
  const contentEl = document.getElementById('schedule-content');
  const actionsEl = document.getElementById('schedule-actions');
  const conflictsEl = document.getElementById('schedule-conflicts');

  if (favorites.length === 0) {
    if (emptyEl) emptyEl.hidden = false;
    if (contentEl) contentEl.hidden = true;
    if (actionsEl) actionsEl.hidden = true;
    return;
  }

  if (emptyEl) emptyEl.hidden = true;
  if (contentEl) contentEl.hidden = false;
  if (actionsEl) actionsEl.hidden = false;

  renderSchedule(contentEl);
  renderConflicts(conflictsEl);
  initializeShareButtons();
}

function renderSchedule(container) {
  if (!container) return;

  const basePath = getBasePath();
  const favorites = Favorites.getAll();

  const sortedTimeSlots = [...appData.timeSlots].sort((a, b) => {
    return CONFIG.TIME_SLOT_ORDER.indexOf(a.id) - CONFIG.TIME_SLOT_ORDER.indexOf(b.id);
  });

  const conflicts = Favorites.getConflicts();

  const slotsHtml = sortedTimeSlots.map(slot => {
    const isPlenary = CONFIG.PLENARY_SLOTS.includes(slot.id);

    if (isPlenary) {
      const plenarySession = appData.plenarySessions
        ? appData.plenarySessions.find(p => p.timeSlot === slot.id)
        : null;

      if (!plenarySession) return '';

      const programsHtml = plenarySession.programs
        .map(p => `<span>${escapeHtml(p)}</span>`)
        .join('<span class="timetable-plenary-sep" aria-hidden="true">\uff0f</span>');

      return `
        <div class="schedule-slot schedule-slot-plenary">
          <div class="schedule-slot-header">
            <h3>${slot.name}</h3>
            ${slot.label ? `<small>${slot.label}</small>` : ''}
          </div>
          <div class="schedule-slot-body">
            <div class="timetable-plenary">
              <div class="timetable-plenary-title">${escapeHtml(plenarySession.title)}</div>
              <div class="timetable-plenary-meta">${escapeHtml(plenarySession.location)}</div>
              <div class="timetable-plenary-programs">${programsHtml}</div>
            </div>
          </div>
        </div>
      `;
    }

    const selectedSessions = appData.sessions.filter(s =>
      s.timeSlot === slot.id && favorites.includes(s.id)
    );
    const hasConflict = conflicts[slot.id];

    if (selectedSessions.length === 0) {
      return `
        <div class="schedule-slot schedule-slot-empty">
          <div class="schedule-slot-header">
            <h3>${slot.name}</h3>
            ${slot.label ? `<small>${slot.label}</small>` : ''}
          </div>
          <div class="schedule-slot-body">
            <p class="schedule-unselected">\u3053\u306e\u6642\u9593\u5e2f\u306e\u30bb\u30c3\u30b7\u30e7\u30f3\u306f\u672a\u9078\u629e\u3067\u3059</p>
          </div>
        </div>
      `;
    }

    const sessionsHtml = selectedSessions.map(session => {
      const venue = appData.venues.find(v => v.id === session.venue);
      const isFav = Favorites.isFavorited(session.id);
      return `
        <div class="schedule-session" data-venue="${session.venue}" data-session-id="${session.id}">
          <div class="schedule-session-header">
            <span class="schedule-session-venue">${venue ? venue.nameJp || venue.id : session.venue}</span>
            <span class="schedule-session-code">${session.venueCode}</span>
            <button type="button" class="favorite-btn favorite-btn-compact is-favorited"
                    data-session-id="${session.id}"
                    aria-pressed="true"
                    aria-label="\u304a\u6c17\u306b\u5165\u308a\u304b\u3089\u524a\u9664">
              <span class="favorite-btn-icon" aria-hidden="true">\u2605</span>
              <span class="favorite-btn-text sr-only">\u8ffd\u52a0\u6e08\u307f</span>
            </button>
          </div>
          <h4>${escapeHtml(session.title)}</h4>
          <div class="schedule-session-meta">
            ${venue ? `${venue.location || ''} / ` : ''}${session.speakers.map(s => s.name).join('\u3001')}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="schedule-slot ${hasConflict ? 'schedule-slot-conflict' : ''}">
        <div class="schedule-slot-header">
          <h3>${slot.name}</h3>
          ${slot.label ? `<small>${slot.label}</small>` : ''}
          ${hasConflict ? '<span class="schedule-conflict-badge">\u6642\u9593\u304c\u91cd\u8907\u3057\u3066\u3044\u307e\u3059</span>' : ''}
        </div>
        <div class="schedule-slot-body">
          ${sessionsHtml}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = slotsHtml;
}

function renderConflicts(container) {
  if (!container) return;

  const conflicts = Favorites.getConflicts();
  const conflictSlots = Object.keys(conflicts);

  if (conflictSlots.length === 0) {
    container.hidden = true;
    return;
  }

  container.hidden = false;
  const slotNames = conflictSlots.map(slotId => {
    const slot = appData.timeSlots.find(t => t.id === slotId);
    return slot ? slot.name : slotId;
  });

  container.innerHTML = `
    <div class="schedule-conflict-warning" role="alert">
      <strong>\u26a0 \u6642\u9593\u5e2f\u306e\u91cd\u8907\u304c\u3042\u308a\u307e\u3059</strong>
      <p>${slotNames.join('\u3001')}\u306e\u6642\u9593\u5e2f\u3067\u8907\u6570\u306e\u30bb\u30c3\u30b7\u30e7\u30f3\u304c\u9078\u629e\u3055\u308c\u3066\u3044\u307e\u3059\u3002</p>
    </div>
  `;
}

function initializeShareButtons() {
  const copyBtn = document.getElementById('share-copy');
  const lineBtn = document.getElementById('share-line');
  const printBtn = document.getElementById('share-print');

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const url = Favorites.toUrl();
      if (!url) return;
      try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = '\u30b3\u30d4\u30fc\u3057\u307e\u3057\u305f\uff01';
        setTimeout(() => { copyBtn.textContent = 'URL\u3092\u30b3\u30d4\u30fc'; }, 2000);
      } catch (e) {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        copyBtn.textContent = '\u30b3\u30d4\u30fc\u3057\u307e\u3057\u305f\uff01';
        setTimeout(() => { copyBtn.textContent = 'URL\u3092\u30b3\u30d4\u30fc'; }, 2000);
      }
    });
  }

  if (lineBtn) {
    lineBtn.addEventListener('click', () => {
      const url = Favorites.toUrl();
      if (!url) return;
      window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`, '_blank');
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

// 名前空間パターンでグローバルに公開
const Michishirube = {
  get data() { return appData; },
  config: CONFIG,
  utils: Utils,
  modal: Modal,
  favorites: Favorites,
  api: {
    showSessionModal: showSessionModal,
    showSpeakerModal: showSpeakerModal,
    showSpeakerModalByName: showSpeakerModalByName,
    closeModal: closeModal
  }
};
window.Michishirube = Michishirube;

// 後方互換性のため個別関数もグローバルに公開
window.showSessionModal = showSessionModal;
window.showSpeakerModal = showSpeakerModal;
window.showSpeakerModalByName = showSpeakerModalByName;
window.closeModal = closeModal;
window.appData = appData;
