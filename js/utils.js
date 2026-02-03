/**
 * ミチシルベ2026 - ユーティリティ関数
 */
const Utils = {
  /**
   * XSS対策のためHTMLエスケープ
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * デバウンス処理
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * ベースパスを取得（venue/ページ用）
   */
  getBasePath() {
    const path = window.location.pathname;
    return path.includes('/venue/') ? '../' : '';
  },

  /**
   * タイムスロット順にソート
   */
  sortByTimeSlot(sessions) {
    return [...sessions].sort((a, b) => {
      return CONFIG.TIME_SLOT_ORDER.indexOf(a.timeSlot)
           - CONFIG.TIME_SLOT_ORDER.indexOf(b.timeSlot);
    });
  }
};
