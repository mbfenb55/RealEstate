import { notFound } from "next/navigation";

import { getAppUrl } from "@/lib/env";
import { blogPosts, formatDate, getBlogPostBySlug } from "@/lib/utils";

const appUrl = getAppUrl();

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Blog | Parselim",
      description: "Parselim blog yazilari"
    };
  }

  return {
    title: `${post.title} | Parselim`,
    description: post.excerpt,
    alternates: { canonical: `${appUrl}/blog/${post.slug}` }
  };
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="container py-16">
      <article className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">{post.category}</p>
          <h1 className="section-heading">{post.title}</h1>
          <p className="text-sm text-muted-foreground">
            {post.author} · {formatDate(post.publishedAt)} · {post.readingTime}
          </p>
        </div>
        <div className="space-y-6 rounded-[2rem] border bg-card p-8">
          {post.content.map((paragraph) => (
            <p key={paragraph} className="text-base leading-8 text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
