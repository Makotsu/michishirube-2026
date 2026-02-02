# ミチシルベ2026 デザインガイドライン

> **バージョン**: 3.0 | **更新日**: 2026年2月2日 | **参照**: https://michishirube.okinawa/

---

## 目次

1. [クイックリファレンス](#1-クイックリファレンス)
2. [ブランドコンセプト](#2-ブランドコンセプト)
3. [カラーシステム](#3-カラーシステム)
4. [タイポグラフィ](#4-タイポグラフィ)
5. [スペーシング](#5-スペーシング)
6. [コンポーネント](#6-コンポーネント)
7. [アニメーション](#7-アニメーション)
8. [レスポンシブ設計](#8-レスポンシブ設計)
9. [アクセシビリティ](#9-アクセシビリティ)
10. [CSS変数一覧](#10-css変数一覧)

---

## 1. クイックリファレンス

開発時にすぐ参照できる主要な値です。

### カラー（よく使う順）

| 用途 | 変数名 | 値 |
|:-----|:-------|:---|
| メインカラー | `--color-sea` | `#427bbf` |
| アクセント | `--color-culture` | `#eca25d` |
| 本文テキスト | `--color-text` | `#333333` |
| サブテキスト | `--color-text-sub` | `#666666` |
| 背景（白） | `--color-bg` | `#ffffff` |
| 背景（薄） | `--color-bg-alt` | `#f8f9fa` |
| 境界線 | `--color-border` | `#dee2e6` |

### サイズ（コピペ用）

```css
/* 角丸 */
--radius-s: 8px;    /* 入力欄 */
--radius-m: 16px;   /* カード */
--radius-l: 40px;   /* ボタン */

/* 余白 */
--space-xs: 8px;
--space-s: 16px;
--space-m: 24px;
--space-l: 40px;
--space-xl: 80px;

/* トランジション */
--ease-default: .4s cubic-bezier(.4,.4,0,1);
--ease-fast: .3s ease;
```

---

## 2. ブランドコンセプト

### テーマ

**「集い、響きあい、踏み出す。心地よい未来へ。」**

心と体の全部で、沖縄のいまと未来を感じる複合型イベント。

### デザイン原則

| 原則 | 説明 | 具体例 |
|:-----|:-----|:-------|
| **多様性** | 7色で多様な価値観を表現 | テーマカラーの使い分け |
| **調和** | 色同士が心地よく響き合う | 補色を避け、隣接色を組合せ |
| **沖縄らしさ** | 空・海・大地・文化を体現 | 青・緑を基調に暖色でアクセント |
| **温かみ** | 人のつながりを感じる | 丸みのある形状、柔らかいシャドウ |
| **洗練** | シンプルで品のある | 余白を活かし、要素を絞る |

---

## 3. カラーシステム

### 3.1 テーマカラー（7色）

沖縄の要素を象徴する7つの色です。

```
┌─────────────────────────────────────────────────────────────────┐
│  Sky      Sea       Land     Culture   Heart     Star    Spirit │
│ #74b5e4  #427bbf   #6cbc64   #eca25d  #e6786a  #f0ea30  #b077b0 │
│   空       海        大地      文化      心        星       精神   │
└─────────────────────────────────────────────────────────────────┘
```

| 名称 | コード | RGB | 用途・イメージ |
|:-----|:-------|:----|:---------------|
| **Sky** | `#74b5e4` | 116, 181, 228 | 澄んだ空、開放感、サブカラー |
| **Sea** | `#427bbf` | 66, 123, 191 | 深い海、信頼、**メインカラー** |
| **Land** | `#6cbc64` | 108, 188, 100 | 自然、成長、成功表示 |
| **Culture** | `#eca25d` | 236, 162, 93 | 伝統、温かみ、**アクセント** |
| **Heart** | `#e6786a` | 230, 120, 106 | 情熱、愛、警告表示 |
| **Star** | `#f0ea30` | 240, 234, 48 | 輝き、注目、ハイライト |
| **Spirit** | `#b077b0` | 176, 119, 176 | 神秘、深み、特別要素 |

### 3.2 ベースカラー

| 用途 | 変数名 | コード | 使用場面 |
|:-----|:-------|:-------|:---------|
| 背景（白） | `--color-bg` | `#ffffff` | ページ背景 |
| 背景（薄） | `--color-bg-alt` | `#f8f9fa` | セクション、カード背景 |
| テキスト（主） | `--color-text` | `#333333` | 見出し、本文 |
| テキスト（副） | `--color-text-sub` | `#666666` | 説明文、補足 |
| テキスト（薄） | `--color-text-muted` | `#999999` | ふりがな、注釈 |
| 境界線 | `--color-border` | `#dee2e6` | 区切り線、入力欄 |

### 3.3 カラー使用ルール

```
┌──────────────────────────────────────────────────────────────┐
│ 要素                     │ 使用カラー                        │
├──────────────────────────────────────────────────────────────┤
│ ヘッダー/フッター        │ Sea → 濃いSea のグラデーション    │
│ プライマリボタン         │ Sea (#427bbf)                     │
│ アクセントボタン         │ Culture (#eca25d)                 │
│ テキストリンク           │ Sea (#427bbf)                     │
│ 成功メッセージ           │ Land (#6cbc64)                    │
│ エラーメッセージ         │ Heart (#e6786a)                   │
│ 警告メッセージ           │ Star (#f0ea30) + 暗いテキスト     │
└──────────────────────────────────────────────────────────────┘
```

### 3.4 会場別カラー割り当て

各会場に固有のカラーとテーマを設定し、視覚的な識別を容易にします。

| 会場 | 日本語名 | テーマ | メイン | サブ | CSS変数名 |
|:-----|:---------|:-------|:-------|:-----|:----------|
| A | 礎（いしずえ） | ひらく。〜自分をひらき、人とつながり、世界を広げる〜 | Sky `#74b5e4` | Sea | `--venue-a` |
| B | 芽（めばえ） | 共育の島、沖縄 〜人・地域・産業を育む、共創の挑戦〜 | Sea `#427bbf` | Sky | `--venue-b` |
| C | 結（むすび） | みんなでつくる こどもまんなか社会 | Land `#6cbc64` | Sky | `--venue-c` |
| D | 輪（わ） | 人と地域を育てるということ 〜暮らし・経済・文化・世代を編みなおす〜 | Culture `#eca25d` | Heart | `--venue-d` |
| E | 杜（もり） | 地方共創が育む日本の未来構想 | Heart `#e6786a` | Culture | `--venue-e` |
| F | 稔（みのり） | ローカル・ゼブラという可能性 〜沖縄の企業と地域が自分らしく輝くために〜 | Spirit `#b077b0` | Sea | `--venue-f` |
| G | 誉（ほまれ） | 地域と育つファイナンスの未来 | Star `#f0ea30` | Culture | `--venue-g` |
| H | 雅（みやび） | 沖縄アトツギ 〜つぎんちゅがつなぐ！地域のミライ〜 | Land `#6cbc64` | Spirit | `--venue-h` |
| J | 洋（わだつみ） | 海でつながる世界 〜境界を越えて共につくる未来〜 | Sea `#427bbf` | Land | `--venue-j` |
| K | 凪（なぎ） | 平和の種をまこう。平和の芽を育てよう。 | Heart `#e6786a` | Spirit | `--venue-k` |
| L | 暁（あかつき） | 校友会・後援会 × ミチシルベ共創プログラム | Culture `#eca25d` | Land | `--venue-l` |

### 3.5 タイムスロット表示

セッションの時間帯に応じたスタイルを定義します。

| スロット | 時間 | 用途 |
|:---------|:-----|:-----|
| 1 | 10:30-11:30 | 午前セッション |
| 2 | 12:00-13:00 | 昼セッション |
| L | 13:30-14:00 | ランチセッション（30分） |
| 3 | 14:15-15:15 | 午後セッション |

```css
/* ランチセッションのスタイル（短縮版） */
.session-lunch {
  background-color: var(--color-bg-alt);
  border-left: 4px solid var(--color-culture);
}

/* セッション時間帯バッジ */
.time-badge {
  display: inline-block;
  padding: 4px 12px;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  border-radius: var(--radius-l);
  background-color: var(--color-bg-alt);
  color: var(--color-text-sub);
}
```

---

## 4. タイポグラフィ

### 4.1 フォントスタック

```css
/* 見出し（和文） - 明朝系 */
--font-heading: "A1明朝", "Noto Serif JP", "Yu Mincho", serif;

/* 見出し（英文） */
--font-heading-en: "EB Garamond", "Times New Roman", serif;

/* 本文（和文） - ゴシック系 */
--font-body: "Tsukushi Gothic", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif;

/* 本文（英数字） */
--font-body-en: "Inter", "Noto Sans JP", sans-serif;
```

### 4.2 フォントサイズ一覧

| 要素 | 変数名 | PC | Tablet | Mobile |
|:-----|:-------|:---|:-------|:-------|
| H1（ページタイトル） | `--text-4xl` | 48px | 36px | 28px |
| H2（セクション） | `--text-3xl` | 32px | 28px | 24px |
| H3（カードタイトル） | `--text-2xl` | 24px | 20px | 18px |
| H4（サブタイトル） | `--text-xl` | 20px | 18px | 16px |
| 本文 | `--text-base` | 16px | 16px | 14px |
| 小テキスト | `--text-sm` | 14px | 14px | 12px |
| キャプション | `--text-xs` | 12px | 12px | 11px |

### 4.3 行間・文字間

```css
/* 見出し */
h1, h2, h3, h4 {
  line-height: 1.4;
  letter-spacing: 0.02em;
}

/* 本文 */
p, li, td {
  line-height: 1.8;
  letter-spacing: 0.04em;
}
```

### 4.4 タイポグラフィ使用例

```css
/* ページタイトル */
.page-title {
  font-family: var(--font-heading);
  font-size: var(--text-4xl);
  font-weight: 400;        /* 明朝体は細めに */
  color: var(--color-text);
}

/* セクションタイトル */
.section-title {
  font-family: var(--font-heading);
  font-size: var(--text-3xl);
  font-weight: 400;
  color: var(--color-sea);
}

/* 本文 */
.body-text {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--color-text);
}
```

---

## 5. スペーシング

### 5.1 スペーシングスケール

一貫した余白のために8pxベースのスケールを使用します。

| 変数名 | 値 | 用途 |
|:-------|:---|:-----|
| `--space-xs` | 8px | 要素内の最小余白 |
| `--space-s` | 16px | コンポーネント内余白 |
| `--space-m` | 24px | カード間、グリッドギャップ |
| `--space-l` | 40px | セクション内余白 |
| `--space-xl` | 80px | セクション間余白（PC） |

### 5.2 グリッドシステム

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-l);  /* 40px */
}

/* タブレット */
@media (max-width: 1023px) {
  .container { padding: 0 var(--space-m); }  /* 24px */
}

/* モバイル */
@media (max-width: 767px) {
  .container { padding: 0 var(--space-s); }  /* 16px */
}
```

### 5.3 セクション余白

```css
.section {
  padding: var(--space-xl) 0;  /* PC: 80px */
}

@media (max-width: 1023px) {
  .section { padding: 60px 0; }  /* Tablet */
}

@media (max-width: 767px) {
  .section { padding: var(--space-l) 0; }  /* Mobile: 40px */
}
```

---

## 6. コンポーネント

### 6.1 ボタン

```css
/* ━━━ プライマリボタン ━━━ */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 32px;
  background-color: var(--color-sea);
  color: #ffffff;
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 500;
  border: none;
  border-radius: var(--radius-l);  /* 40px - 丸みのある形状 */
  cursor: pointer;
  transition: var(--ease-default);
}

.btn-primary:hover {
  background-color: #365f99;       /* Sea を20%暗く */
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(0);
}

/* ━━━ セカンダリボタン（アウトライン） ━━━ */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 30px;
  background-color: transparent;
  color: var(--color-sea);
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 500;
  border: 2px solid var(--color-sea);
  border-radius: var(--radius-l);
  cursor: pointer;
  transition: var(--ease-default);
}

.btn-secondary:hover {
  background-color: var(--color-sea);
  color: #ffffff;
}

/* ━━━ アクセントボタン ━━━ */
.btn-accent {
  /* btn-primary と同じ構造 */
  background-color: var(--color-culture);
}

.btn-accent:hover {
  background-color: #d08a47;       /* Culture を20%暗く */
}
```

### 6.2 カード

```css
.card {
  background-color: var(--color-bg);
  border-radius: var(--radius-m);  /* 16px */
  box-shadow: var(--shadow-m);
  overflow: hidden;
  transition: var(--ease-default);
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-l);
}

/* カード内のコンテンツ */
.card-body {
  padding: var(--space-m);  /* 24px */
}

.card-title {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  margin-bottom: var(--space-xs);
}

.card-text {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text-sub);
}
```

### 6.3 タブ

```css
.tab-list {
  display: flex;
  gap: var(--space-xs);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tab {
  padding: 12px 24px;
  background-color: transparent;
  color: var(--color-text-sub);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  border: none;
  border-radius: var(--radius-l);
  cursor: pointer;
  white-space: nowrap;
  transition: var(--ease-fast);
}

.tab:hover:not(.is-active) {
  background-color: rgba(66, 123, 191, 0.1);
}

.tab.is-active {
  background-color: var(--color-sea);
  color: #ffffff;
}

/* 会場別タブの色変更例 */
.tab[data-venue="a"].is-active { background-color: var(--color-sky); }
.tab[data-venue="d"].is-active { background-color: var(--color-culture); }
```

### 6.4 入力フィールド

```css
.input {
  width: 100%;
  padding: 12px 16px;
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-s);  /* 8px */
  transition: var(--ease-fast);
}

.input::placeholder {
  color: var(--color-text-muted);
}

.input:focus {
  border-color: var(--color-sea);
  box-shadow: 0 0 0 4px rgba(66, 123, 191, 0.1);
  outline: none;
}

/* エラー状態 */
.input.is-error {
  border-color: var(--color-heart);
}

.input.is-error:focus {
  box-shadow: 0 0 0 4px rgba(230, 120, 106, 0.1);
}
```

### 6.5 登壇者写真

```css
/* 丸形（プロフィール用） */
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar--large {
  width: 120px;
  height: 120px;
}

/* カード内（上部角丸） */
.card-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

/* プレースホルダー（写真なし） */
.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-alt);
  color: var(--color-text-muted);
}
```

---

## 7. アニメーション

### 7.1 トランジション

```css
/* 標準（ボタン、カード等） */
--ease-default: .4s cubic-bezier(.4,.4,0,1);

/* 高速（ホバー、マイクロインタラクション） */
--ease-fast: .3s ease;

/* ページ遷移 Enter */
--ease-enter: .6s cubic-bezier(.4,.4,0,1);

/* ページ遷移 Leave */
--ease-leave: .3s cubic-bezier(.4,.4,0,1);
```

### 7.2 ホバーエフェクト

| 要素 | エフェクト |
|:-----|:-----------|
| カード | `translateY(-8px)` + シャドウ強化 |
| ボタン | `translateY(-2px)` + 色変化 |
| リンク | 色変化のみ（0.3s） |
| 画像 | `scale(1.05)` + overlay |

### 7.3 スクロールアニメーション

```css
/* フェードイン（下から） */
.fade-in-up {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity .6s ease, transform .6s ease;
}

.fade-in-up.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* 連続要素の遅延 */
.stagger-item:nth-child(1) { transition-delay: 0s; }
.stagger-item:nth-child(2) { transition-delay: 0.1s; }
.stagger-item:nth-child(3) { transition-delay: 0.2s; }
.stagger-item:nth-child(4) { transition-delay: 0.3s; }
```

---

## 8. レスポンシブ設計

### 8.1 ブレークポイント

```css
/* モバイルファースト */

/* Small (モバイル横 〜 小型タブレット) */
@media (min-width: 480px) { }

/* Medium (タブレット) */
@media (min-width: 768px) { }

/* Large (デスクトップ) */
@media (min-width: 1024px) { }

/* XLarge (ワイドスクリーン) */
@media (min-width: 1280px) { }
```

| 名称 | 範囲 | 対象 |
|:-----|:-----|:-----|
| Mobile | 〜479px | スマホ縦 |
| Small | 480〜767px | スマホ横、小型タブレット |
| Medium | 768〜1023px | タブレット |
| Large | 1024〜1279px | PC |
| XLarge | 1280px〜 | ワイドPC |

### 8.2 グリッドカラム

```css
.grid {
  display: grid;
  gap: var(--space-m);
}

/* 2カラム（タブレット以上） */
@media (min-width: 768px) {
  .grid--2 { grid-template-columns: repeat(2, 1fr); }
}

/* 3カラム（デスクトップ以上） */
@media (min-width: 1024px) {
  .grid--3 { grid-template-columns: repeat(3, 1fr); }
}

/* 4カラム（ワイド以上） */
@media (min-width: 1280px) {
  .grid--4 { grid-template-columns: repeat(4, 1fr); }
}
```

### 8.3 タッチターゲット

```css
/* 最小タッチ領域: 44px × 44px */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* ボタン・リンク間隔: 最低8px */
.btn + .btn {
  margin-left: var(--space-xs);
}
```

---

## 9. アクセシビリティ

### 9.1 コントラスト比

| 組み合わせ | 比率 | 判定 |
|:-----------|:-----|:-----|
| `#333333` on `#ffffff` | 12.6:1 | ✅ AAA |
| `#666666` on `#ffffff` | 5.7:1 | ✅ AA |
| `#427bbf` on `#ffffff` | 4.5:1 | ✅ AA |
| `#ffffff` on `#427bbf` | 4.5:1 | ✅ AA |
| `#f0ea30` on `#333333` | 11.2:1 | ✅ AAA |

### 9.2 フォーカス表示

```css
/* キーボードフォーカス時のみ表示 */
:focus-visible {
  outline: 2px solid var(--color-sea);
  outline-offset: 2px;
}

/* マウスクリック時は非表示 */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 9.3 スクリーンリーダー対応

```css
/* 視覚的に非表示、スクリーンリーダーには読み上げ */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 9.4 チェックリスト

- [ ] すべての画像に適切な `alt` 属性
- [ ] 装飾画像は `alt=""`
- [ ] フォームにラベル（`<label>`）を紐付け
- [ ] カラーだけでなくアイコン・テキストでも情報伝達
- [ ] キーボードだけで全機能操作可能
- [ ] `prefers-reduced-motion` 対応

---

## 10. CSS変数一覧

コピペしてすぐ使えるCSS変数の完全版です。

```css
:root {
  /* ========================================
     カラー
     ======================================== */

  /* テーマカラー（7色） */
  --color-sky: #74b5e4;
  --color-sea: #427bbf;
  --color-land: #6cbc64;
  --color-culture: #eca25d;
  --color-heart: #e6786a;
  --color-star: #f0ea30;
  --color-spirit: #b077b0;

  /* ベースカラー */
  --color-bg: #ffffff;
  --color-bg-alt: #f8f9fa;
  --color-text: #333333;
  --color-text-sub: #666666;
  --color-text-muted: #999999;
  --color-border: #dee2e6;

  /* 会場別カラー（日本語名・テーマ付き） */
  --venue-a: var(--color-sky);     /* 礎（いしずえ）: ひらく。 */
  --venue-b: var(--color-sea);     /* 芽（めばえ）: 共育の島、沖縄 */
  --venue-c: var(--color-land);    /* 結（むすび）: こどもまんなか社会 */
  --venue-d: var(--color-culture); /* 輪（わ）: 人と地域を育てる */
  --venue-e: var(--color-heart);   /* 杜（もり）: 地方共創 */
  --venue-f: var(--color-spirit);  /* 稔（みのり）: ローカル・ゼブラ */
  --venue-g: var(--color-star);    /* 誉（ほまれ）: ファイナンスの未来 */
  --venue-h: var(--color-land);    /* 雅（みやび）: 沖縄アトツギ */
  --venue-j: var(--color-sea);     /* 洋（わだつみ）: 海でつながる世界 */
  --venue-k: var(--color-heart);   /* 凪（なぎ）: 平和の種をまこう */
  --venue-l: var(--color-culture); /* 暁（あかつき）: 校友会・後援会 */

  /* ========================================
     フォント
     ======================================== */
  --font-heading: "A1明朝", "Noto Serif JP", "Yu Mincho", serif;
  --font-heading-en: "EB Garamond", "Times New Roman", serif;
  --font-body: "Tsukushi Gothic", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif;
  --font-body-en: "Inter", "Noto Sans JP", sans-serif;

  /* フォントサイズ */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;
  --text-4xl: 48px;

  /* ========================================
     スペーシング
     ======================================== */
  --space-xs: 8px;
  --space-s: 16px;
  --space-m: 24px;
  --space-l: 40px;
  --space-xl: 80px;

  /* ========================================
     角丸
     ======================================== */
  --radius-s: 8px;     /* 入力欄 */
  --radius-m: 16px;    /* カード */
  --radius-l: 40px;    /* ボタン */
  --radius-full: 50%;  /* 円形 */

  /* ========================================
     シャドウ
     ======================================== */
  --shadow-s: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-m: 0 4px 20px rgba(0, 0, 0, 0.08);
  --shadow-l: 0 12px 40px rgba(0, 0, 0, 0.12);

  /* ========================================
     トランジション
     ======================================== */
  --ease-default: .4s cubic-bezier(.4,.4,0,1);
  --ease-fast: .3s ease;
  --ease-enter: .6s cubic-bezier(.4,.4,0,1);
  --ease-leave: .3s cubic-bezier(.4,.4,0,1);

  /* ========================================
     レイアウト
     ======================================== */
  --container-max: 1280px;
  --header-height: 64px;
}
```

---

## 付録: 命名規則

### CSS クラス命名

```
【コンポーネント】
.card, .btn, .tab, .input, .avatar

【コンポーネント + 修飾子】
.btn-primary, .btn-secondary, .avatar--large

【状態】
.is-active, .is-visible, .is-error, .is-loading

【ユーティリティ】
.sr-only, .text-center, .mt-s, .mb-m
```

### 変数命名

```
【カラー】--color-{name}
【サイズ】--space-{size}, --radius-{size}
【フォント】--font-{usage}, --text-{size}
【その他】--shadow-{size}, --ease-{name}
```

---

*本ガイドラインは michishirube.okinawa のデザインを基に、開発効率と一貫性を重視して設計されています。*
