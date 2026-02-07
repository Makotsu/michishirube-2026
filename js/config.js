/**
 * ミチシルベ2026 - 設定定数
 */
const CONFIG = {
  // タイムスロット順序（正しい順序に統一）
  TIME_SLOT_ORDER: ['O', '1', '2', 'L', '3', 'C'],

  // localStorage キー
  STORAGE_KEYS: {
    FONT_SIZE: 'michishirube-font-size'
  },

  // デフォルト値
  DEFAULTS: {
    FONT_SIZE: 'medium',
    SPEAKER_PHOTO: 'images/speakers/default.svg'
  },

  // UI設定
  UI: {
    DEBOUNCE_DELAY: 300,
    SCROLL_THRESHOLD: 300
  },

  /**
   * ローカル環境かどうかを判定
   * ローカルサーバー（localhost, 127.0.0.1, file://）ではtrue
   */
  isLocalEnvironment() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    return protocol === 'file:' ||
           hostname === 'localhost' ||
           hostname === '127.0.0.1' ||
           hostname.startsWith('192.168.') ||
           hostname.endsWith('.local');
  },

  /**
   * HTMLページへのURLを取得（ローカル環境では.html付き）
   */
  getPageUrl(basePath, pagePath) {
    const extension = this.isLocalEnvironment() ? '.html' : '';
    return `${basePath}${pagePath}${extension}`;
  }
};
