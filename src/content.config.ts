import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
  }),
});

export const collections = { posts };
