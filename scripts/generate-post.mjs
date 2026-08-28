// scripts/generate-post.mjs
//
// マンガ紹介記事の下書きをClaude(Web検索つき)で生成するスクリプト。
// - 手動実行(workflow_dispatch): 入力されたgenre/tropes/tone/notesを使う
// - 将来のスケジュール実行: src/data/topics-queue.yml の先頭から1件取り出して使う
//
// 生成した記事は直接publicには公開せず、ファイルとして書き出すだけ。
// 公開はワークフロー側でPull Requestを作ることで行われ、人がレビューしてマージするまで
// サイトには反映されない(=文面チェック工程を強制する安全弁)。

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import Anthropic from '@anthropic-ai/sdk';

const ROOT = process.cwd();
const QUEUE_PATH = path.join(ROOT, 'src/data/topics-queue.yml');
const POSTS_DIR = path.join(ROOT, 'src/content/posts');

function getTopicFromInputsOrQueue() {
  const genre = process.env.INPUT_GENRE?.trim();
  const tropesRaw = process.env.INPUT_TROPES?.trim();
  const tone = process.env.INPUT_TONE?.trim();
  const notes = process.env.INPUT_NOTES?.trim();

  if (genre) {
    // 手動実行: ワークフローの入力値を使う
    return {
      genre,
      tropes: tropesRaw ? tropesRaw.split(',').map((s) => s.trim()).filter(Boolean) : [],
      tone: tone || '',
      notes: notes || '',
      fromQueue: false,
    };
  }

  // 自動実行: キューの先頭を使う
  const raw = fs.readFileSync(QUEUE_PATH, 'utf8');
  const queue = yaml.load(raw) || [];
  if (queue.length === 0) {
    throw new Error('トピックのキューが空です。src/data/topics-queue.yml にネタを追加してください。');
  }
  const topic = queue[0];
  return { ...topic, fromQueue: true, remainingQueue: queue.slice(1) };
}

function popQueueIfNeeded(topic) {
  if (!topic.fromQueue) return;
  const header = `# 記事ネタのキュー
#
# 手動実行のとき: ワークフロー実行時に入力した内容が優先され、このキューは使われません。
# 自動実行(将来のスケジュール実行)のとき: 一番上の項目を1つ取り出して記事化し、
#   使い終わったらこのファイルから自動的に削除されます。
#
# 「作品検索 | 小説」などで見つけたネタは、ここに追記しておくと自動化後もそのまま使われます。
# genre / tropes / tone は src/content.config.ts のスキーマに合わせてください。
`;
  const body = yaml.dump(topic.remainingQueue, { lineWidth: -1 });
  fs.writeFileSync(QUEUE_PATH, header + '\n' + body, 'utf8');
}

function sanitizeSlug(rawSlug) {
  // 半角英小文字・数字・ハイフンのみに正規化し、万一空になったらフォールバックを付ける
  const cleaned = (rawSlug || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || `post-${Date.now().toString(36)}`;
}

function uniqueSlugPath(slug) {
  // 同名スラッグが既にある場合は末尾に -2, -3 ... を付けて重複を避ける
  let candidate = slug;
  let n = 2;
  while (fs.existsSync(path.join(POSTS_DIR, `${candidate}.md`))) {
    candidate = `${slug}-${n}`;
    n += 1;
  }
  return candidate;
}

const SYSTEM_PROMPT = `あなたは匿名運用の日本語マンガ紹介ブログのライターです。
指定されたジャンル・トロープに合致する実在のマンガ作品を、必ずWeb検索で調べてから紹介記事を書いてください。

# 絶対に守るルール
1. 実在しない作品やエピソードを創作しない。Web検索で確認できた事実のみを書く。
2. 巻数・完結状況・あらすじなど、検索結果で確認が取れなかった情報は書かない。
   どうしても不確実な情報を含める必要がある場合は、本文中に
