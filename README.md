# マンガ分類ノート(GitHub Pages + Astro 雛形)

匿名でマンガ紹介ブログを運用するための、Astro製の静的サイト雛形です。
GitHub Pagesで完全無料・独自ドメイン対応・SEO/AI検索を意識した構成になっています。

## 含まれる機能

- Markdownで記事を書くだけで自動的にページ生成(`src/content/posts/`)
- ジャンル別アーカイブページを自動生成(`/genre/ジャンル名/`)
- SEO対策済みメタタグ・OGP・構造化データ(JSON-LD)
- サイトマップ自動生成(`/sitemap-index.xml`)
- RSSフィード(`/rss.xml`)
- GitHub Actionsによる自動デプロイ(mainブランチにpushするだけで公開)

## セットアップ手順

### 1. リポジトリ: 作成済み ✅

`mangacomicrecommend.github.io` として作成済みです。
公開URLは `https://mangacomicrecommend.github.io/` になります。

### 2. このフォルダの中身をリポジトリにアップロード

GitHubのリポジトリ画面で「Add file」→「Upload files」から、
このフォルダの中身(`.github`フォルダを含む)をすべてドラッグ&ドロップし、
「Commit changes」で反映してください。

### 3. `site` の設定: 設定済み ✅

`astro.config.mjs` はすでに `https://mangacomicrecommend.github.io` に設定済みです。
`public/robots.txt` の sitemap URL も設定済みです。

### 4. GitHub PagesをActions経由で有効化

リポジトリの Settings → Pages → Build and deployment → Source で
**「GitHub Actions」** を選択してください。

これで、`main` ブランチにpushするたびに自動でビルド・公開されます。

## 記事の書き方

`src/content/posts/` に `.md` ファイルを追加するだけです。

```md
---
title: "記事タイトル"
description: "検索結果に表示される説明文(120字前後推奨)"
pubDate: 2026-08-26
genre: "異世界・悪役令儿"
tropes: ["護衛騎士ルート"]
tone: "ほのぼの・スローライフ寄り"
draft: false
---

ここに本文をMarkdownで書きます。
```

保存してpushすれば、自動的に:
- `/blog/ファイル名/` に記事ページが生成
- `/genre/ジャンル名/` にジャンル別ページが自動追加
- サイトマップ・RSSにも自動反映

されます。

## ローカルで確認する場合

```bash
npm install
npm run dev
```

`http://localhost:4321` で確認できます。

## GA4 / Search Console の導入

`src/layouts/BaseLayout.astro` の `<head>` 内(`<slot name="head" />` の付近)に、
GA4のトラッキングタグを追記してください。Search Consoleは「HTMLタグ」認証方式を使い、
発行されたmetaタグを同様に追記すれば所有権確認ができます。
