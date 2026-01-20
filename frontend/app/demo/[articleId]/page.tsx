import { redirect } from "next/navigation";
import ArticleDetailClient from "./ArticleDetailClient";
import { PREMIUM_ARTICLES } from "@/lib/articles";

interface ArticlePageProps {
  params: Promise<{ articleId: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { articleId } = await params;

  const article = PREMIUM_ARTICLES.find((a) => a.id === articleId);

  if (!article) {
    redirect("/demo");
  }

  return <ArticleDetailClient article={article} />;
}
