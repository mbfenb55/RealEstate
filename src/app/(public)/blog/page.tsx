export const metadata = {
  title: "Blog | Terramony",
  description: "Emlak sektöründe yapay zeka, sanal tur ve dijital pazarlama hakkında güncel yazılar.",
  alternates: { canonical: "https://terramony.com/blog" }
};

import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { blogPosts, formatDate } from "@/lib/utils";

export default function BlogPage() {
  return (
    <main className="container py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Blog</p>
        <h1 className="section-heading">Drone, arsa analizi ve satış operasyonu üzerine içerikler</h1>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="h-full rounded-[2rem] transition hover:-translate-y-1">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{post.category}</span>
                  <span>{post.readingTime}</span>
                </div>
                <h2 className="text-2xl font-semibold">{post.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
                <p className="text-sm text-muted-foreground">{formatDate(post.publishedAt)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
