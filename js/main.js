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
  await loadData();
  initializeNavigation();
  initializeBackToTop();
  initializeScrollAnimations();
  initializePage();
});

/**
 * JSONデータを読み込む
 */
async function loadData() {
  try {
    const basePath = getBasePath();
    const response = await fetch(`${basePath}data/sessions.json`);
    if (!response.ok) throw new Error('データの読み込みに失敗しました');
    appData = await response.json();
  } catch (error) {
    console.error('Error loading data:', error);
    showError('データの読み込みに失敗しました。ページを再読み込みしてください。');
  }
}

/**
 * ベースパスを取得
 */
function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/venue/')) {
    return '../';
  }
  return '';
}

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

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
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

  mutationObserver.observe(document.body, { childList: true, subtree: true });

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

  // タブヘッダーを生成
  const tabsHtml = appData.venues.map((venue, index) => {
    const sessionCount = appData.sessions.filter(s => s.venue === venue.id).length;
    return `
      <button class="venue-tab ${index === 0 ? 'active' : ''}" data-venue="${venue.id}">
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
        const order = ['1', '2', 'L', '3'];
        return order.indexOf(a.timeSlot) - order.indexOf(b.timeSlot);
      });

    return `
      <div class="venue-tab-content ${index === 0 ? 'active' : ''}" data-venue="${venue.id}">
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

  // タブ切り替えイベント
  DOM.venueTabs.querySelectorAll('.venue-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const venueId = tab.dataset.venue;

      // タブのアクティブ状態を更新
      DOM.venueTabs.querySelectorAll('.venue-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // コンテンツのアクティブ状態を更新
      DOM.tabContents.querySelectorAll('.venue-tab-content').forEach(c => c.classList.remove('active'));
      const content = DOM.tabContents.querySelector(`.venue-tab-content[data-venue="${venueId}"]`);
      if (content) content.classList.add('active');
    });
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
                <a href="${basePath}speakers.html#${encodeURIComponent(speaker.name)}" class="speaker-item">
                  <img src="${photoSrc}" alt="${escapeHtml(speaker.name)}" onerror="this.src='${basePath}images/speakers/default.svg'">
                  <div class="speaker-item-info">
                    <h5>${escapeHtml(speaker.name)}</h5>
                    <p>${escapeHtml(speaker.nameKana || '')}</p>
                    ${affiliation ? `<p class="affiliation">${escapeHtml(affiliation)}</p>` : ''}
                  </div>
                </a>
              `;
            }).join('')}
          </div>
        </div>
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
        const order = ['1', '2', '3', 'L'];
        return order.indexOf(a.timeSlot) - order.indexOf(b.timeSlot);
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

/**
 * フィルターオプションを生成
 */
function populateFilterOptions() {
  if (DOM.venueFilter) {
    appData.venues.forEach(venue => {
      const option = document.createElement('option');
      option.value = venue.id;
      option.textContent = venue.name;
      DOM.venueFilter.appendChild(option);
    });
  }

  if (DOM.timeFilter) {
    appData.timeSlots.forEach(slot => {
      const option = document.createElement('option');
      option.value = slot.id;
      option.textContent = slot.name;
      DOM.timeFilter.appendChild(option);
    });
  }
}

/**
 * セッションをフィルタリング
 */
function filterSessions() {
  const searchTerm = DOM.searchInput?.value.toLowerCase() || '';
  const venueFilter = DOM.venueFilter?.value || '';
  const timeFilter = DOM.timeFilter?.value || '';

  const filtered = appData.sessions.filter(session => {
    // 検索条件
    const matchesSearch = !searchTerm ||
      session.title.toLowerCase().includes(searchTerm) ||
      session.description.toLowerCase().includes(searchTerm) ||
      session.speakers.some(s => s.name.toLowerCase().includes(searchTerm) ||
        (s.nameKana && s.nameKana.toLowerCase().includes(searchTerm)));

    // 会場フィルター
    const matchesVenue = !venueFilter || session.venue === venueFilter;

    // 時間帯フィルター
    const matchesTime = !timeFilter || session.timeSlot === timeFilter;

    return matchesSearch && matchesVenue && matchesTime;
  });

  renderSessions(filtered);
}

/**
 * セッションをレンダリング
 */
function renderSessions(sessions) {
  if (!DOM.sessionsGrid) return;

  if (sessions.length === 0) {
    DOM.sessionsGrid.innerHTML = `
      <div class="no-results">
        <h3>該当するセッションが見つかりませんでした</h3>
        <p>検索条件を変更してお試しください</p>
      </div>
    `;
    return;
  }

  DOM.sessionsGrid.innerHTML = sessions.map(session => createSessionCard(session)).join('');

  // モーダル用のイベントリスナー
  DOM.sessionsGrid.querySelectorAll('.session-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('a')) {
        const sessionId = card.dataset.sessionId;
        const session = appData.sessions.find(s => s.id === sessionId);
        if (session) showSessionModal(session);
      }
    });
  });
}

/**
 * セッションカードを生成
 */
function createSessionCard(session) {
  const timeSlot = appData.timeSlots.find(t => t.id === session.timeSlot);
  const basePath = getBasePath();

  return `
    <article class="session-card" data-session-id="${session.id}">
      <div class="session-card-header">
        <span class="venue-badge">${session.venueCode}</span>
        <span class="time-slot">${timeSlot ? timeSlot.name : ''}</span>
      </div>
      <div class="session-card-body">
        <h3><a href="#" onclick="event.preventDefault();">${escapeHtml(session.title)}</a></h3>
        <p class="session-description">${escapeHtml(session.description)}</p>
        <div class="session-speakers">
          ${session.speakers.map(speaker => {
            const speakerData = appData.speakers.find(s =>
              s.name.replace(/\s/g, '') === speaker.name.replace(/\s/g, '')
            );
            const photoSrc = speakerData ? `${basePath}${speakerData.photo}` : `${basePath}images/speakers/default.svg`;
            return `
              <a href="${basePath}speakers.html#${encodeURIComponent(speaker.name)}" class="speaker-tag">
                <img src="${photoSrc}" alt="${escapeHtml(speaker.name)}" onerror="this.src='${basePath}images/speakers/default.svg'">
                ${escapeHtml(speaker.name)}
              </a>
            `;
          }).join('')}
        </div>
      </div>
    </article>
  `;
}

/* ========================================
   タイムテーブルページ
======================================== */
function initializeTimetablePage() {
  DOM.timetableBody = document.getElementById('timetable-body');
  DOM.timetableHead = document.querySelector('.timetable thead tr');
  if (!DOM.timetableBody) return;

  renderTimetableHeader();
  renderTimetable();
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

  // 時間帯を正しい順序でソート
  const sortedTimeSlots = [...appData.timeSlots].sort((a, b) => {
    const order = ['1', '2', 'L', '3'];
    return order.indexOf(a.id) - order.indexOf(b.id);
  });

  // 時間帯ごとの行を生成
  const rows = sortedTimeSlots.map(slot => {
    const cells = appData.venues.map(venue => {
      const session = appData.sessions.find(s =>
        s.venue === venue.id && s.timeSlot === slot.id
      );

      if (session) {
        return `
          <td data-venue="${venue.id}">
            <div class="timetable-session" data-session-id="${session.id}" onclick="showSessionModal(appData.sessions.find(s => s.id === '${session.id}'))">
              <h4>${escapeHtml(session.title)}</h4>
              <div class="speakers">${session.speakers.map(s => s.name).join('、')}</div>
            </div>
          </td>
        `;
      } else {
        return `<td data-venue="${venue.id}"><div class="timetable-empty"></div></td>`;
      }
    }).join('');

    const timeLabel = slot.label ? `<small>${slot.label}</small>` : '';
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
 * 会場ナビゲーションを更新
 */
function updateVenueNavigation() {
  const venueNav = document.querySelector('.venue-nav');
  if (!venueNav) return;

  const basePath = getBasePath();
  venueNav.innerHTML = appData.venues.map(venue => {
    return `<a href="${basePath}venue/${venue.id.toLowerCase()}.html">${venue.nameJp || venue.id}（${venue.id}）</a>`;
  }).join('');
}

/* ========================================
   登壇者一覧ページ
======================================== */
function initializeSpeakersPage() {
  DOM.searchInput = document.getElementById('speaker-search');
  DOM.speakersGrid = document.getElementById('speakers-grid');

  if (!DOM.speakersGrid) return;

  // 登壇者を五十音順でソート
  const sortedSpeakers = [...appData.speakers].sort((a, b) => {
    const kanaA = a.nameKana || '';
    const kanaB = b.nameKana || '';
    return kanaA.localeCompare(kanaB, 'ja');
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
    <article class="speaker-card" data-speaker-name="${escapeHtml(speaker.name)}">
      <img class="speaker-photo" src="${basePath}${speaker.photo}" alt="${escapeHtml(speaker.name)}" onerror="this.src='${basePath}images/speakers/default.svg'">
      <div class="speaker-info">
        <h3><a href="#" onclick="showSpeakerModal(appData.speakers.find(s => s.id === '${speaker.id}')); return false;">${escapeHtml(speaker.name)}</a></h3>
        <p class="speaker-kana">${escapeHtml(speaker.nameKana || '')}</p>
        <p class="speaker-affiliation">${escapeHtml(speaker.affiliation || '')}</p>
        <div class="speaker-sessions">
          ${(speaker.sessions || []).map(sessionId => {
            const session = appData.sessions.find(s => s.id === sessionId);
            return session ? `<a href="${basePath}index.html#${sessionId}" class="session-tag">${session.venueCode}</a>` : '';
          }).join('')}
        </div>
      </div>
    </article>
  `).join('');
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
      const order = ['1', '2', 'L', '3'];
      return order.indexOf(a.timeSlot) - order.indexOf(b.timeSlot);
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
                <a href="${basePath}speakers.html#${encodeURIComponent(speaker.name)}" class="venue-speaker">
                  <img src="${photoSrc}" alt="${escapeHtml(speaker.name)}" onerror="this.src='${basePath}images/speakers/default.svg'">
                  <div class="venue-speaker-info">
                    <h4>${escapeHtml(speaker.name)}</h4>
                    <p>${escapeHtml(speaker.nameKana || '')}</p>
                  </div>
                </a>
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
    <div class="modal-overlay active" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2>${escapeHtml(session.title)}</h2>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-section">
            <h4>会場・時間</h4>
            <p>${venue ? venue.name : session.venue} / ${timeSlot ? timeSlot.name : ''}</p>
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
                const photoSrc = speakerData ? `${basePath}${speakerData.photo}` : `${basePath}images/speakers/default.svg`;
                return `
                  <a href="${basePath}speakers.html#${encodeURIComponent(speaker.name)}" class="venue-speaker">
                    <img src="${photoSrc}" alt="${escapeHtml(speaker.name)}" onerror="this.src='${basePath}images/speakers/default.svg'">
                    <div class="venue-speaker-info">
                      <h4>${escapeHtml(speaker.name)}</h4>
                      <p>${escapeHtml(speaker.nameKana || '')}</p>
                    </div>
                  </a>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  document.body.style.overflow = 'hidden';
}

function showSpeakerModal(speaker) {
  if (!speaker) return;

  const basePath = getBasePath();

  const modalHtml = `
    <div class="modal-overlay active" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2>${escapeHtml(speaker.name)}</h2>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div style="text-align: center; margin-bottom: 1rem;">
            <img src="${basePath}${speaker.photo}" alt="${escapeHtml(speaker.name)}"
                 style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover;"
                 onerror="this.src='${basePath}images/speakers/default.svg'">
          </div>
          <p class="speaker-kana" style="text-align: center;">${escapeHtml(speaker.nameKana || '')}</p>
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
                  return session ? `<a href="${basePath}index.html#${sessionId}" class="session-tag">${session.venueCode}: ${escapeHtml(session.title)}</a>` : '';
                }).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  document.body.style.overflow = 'hidden';
}

function closeModal(event) {
  if (event && event.target !== event.currentTarget) return;

  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* ========================================
   ユーティリティ関数
======================================== */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.style.cssText = 'background: #fee; color: #c00; padding: 1rem; margin: 1rem; border-radius: 8px; text-align: center;';
  errorDiv.textContent = message;
  document.body.insertBefore(errorDiv, document.body.firstChild);
}

// グローバルに公開する関数
window.showSessionModal = showSessionModal;
window.showSpeakerModal = showSpeakerModal;
window.closeModal = closeModal;
window.appData = appData;
