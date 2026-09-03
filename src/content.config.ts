import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 「おすすめ〇選」「比較記事」など、紹介する作品を画像付きカードとして
// 自動整形するための構造化データ。検索意図(=作品を一覧比較したい)に
// そのまま応えられる形で記事末尾の本文とは別に描画される。
const workEntry = z.object({
  title: z.string(), // 作品名
  image: z.string().optional(), // 表紙画像のURL(Amazonアソシエイトの画像リンク等)
  imageAlt: z.string().optional(), // 画像のalt文(未指定時は作品名を使用)
  description: z.string(), // 2〜3文程度の紹介文
  platform: z.string().optional(), // 読める場所(Kindle、ebookjapan等)
  affiliateUrl: z.string().optional(), // アフィリエイトリンク(なければ通常リンクでも可)
});

// 「ファンタジー度」「対象読者の性別傾向」など、作品の傾向を軸ごとに
// 10段階で可視化するためのデータ。軸は固定せず自由に追加できる設計。
const scaleEntry = z.object({
  label: z.string(), // 例: "ファンタジー"
  oppositeLabel: z.string(), // 例: "リアリティ"(labelの対極にある概念)
  value: z.number().min(1).max(10), // 1=label側に極端、10=oppositeLabel側に極端
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    genre: z.string(), // 例: 異世界・悪役令嬢, 学園・日常 など
    tropes: z.array(z.string()).default([]), // 例: 護衛騎士ルート, 能力バトル など
    tone: z.string().optional(), // 例: ほのぼの・スローライフ寄り
    draft: z.boolean().default(false),
    coverImage: z.string().optional(), // 記事のアイキャッチ画像URL
    coverImageAlt: z.string().optional(),
    works: z.array(workEntry).optional(), // 紹介作品リスト(画像カードとして自動描画)
    scales: z.array(scaleEntry).optional(), // 作品傾向スケール(単一作品レビュー向け)
  }),
});

export const collections = { posts };
