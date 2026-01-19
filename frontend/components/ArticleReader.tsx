"use client";

import { Lock, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { ArticleSection } from "@/lib/article-content";

interface ArticleReaderProps {
  isStreaming: boolean;
  elapsedTime: number;
  articleContent: ArticleSection[];
  articleTitle: string;
}

export function ArticleReader({
  isStreaming,
  elapsedTime,
  articleContent,
  articleTitle,
}: ArticleReaderProps) {
  const [unlockedSections, setUnlockedSections] = useState(1);

  useEffect(() => {
    if (isStreaming) {
      const unlocked = articleContent.filter(
        (section) => elapsedTime >= section.unlockAt
      ).length;
      setUnlockedSections(unlocked);
    }
  }, [isStreaming, elapsedTime, articleContent]);

  const totalSections = articleContent.length;
  const progress = (unlockedSections / totalSections) * 100;

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      <div className="border-b border-zinc-800 p-6 bg-linear-to-r from-mint-500/5 to-transparent">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{articleTitle}</h2>
            <p className="text-sm text-zinc-400">
              Premium Content • Pay Per Second
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="px-3 py-1 bg-mint-500/10 border border-mint-500/20 rounded-full">
              <span className="text-xs font-semibold text-mint-400">
                {unlockedSections}/{totalSections} sections unlocked
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-mint-500 to-mint-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-6 max-h-150 overflow-y-auto space-y-6">
        {articleContent.map((section, index) => {
          const isUnlocked =
            elapsedTime >= section.unlockAt || index < unlockedSections;
          const isNextToUnlock = index === unlockedSections && isStreaming;
          const timeToUnlock = section.unlockAt - elapsedTime;

          return (
            <div key={index} className="relative">
              {isUnlocked ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-mint-400" />
                    <h3 className="text-lg font-semibold text-mint-400">
                      {section.section}
                    </h3>
                  </div>
                  <div className="prose prose-invert prose-zinc max-w-none">
                    <p className="text-zinc-300 whitespace-pre-line leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 backdrop-blur-sm bg-zinc-900/50 rounded-lg flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                      {isNextToUnlock && timeToUnlock > 0 ? (
                        <p className="text-sm text-zinc-500">
                          Unlocks in {Math.ceil(timeToUnlock)} seconds...
                        </p>
                      ) : (
                        <p className="text-sm text-zinc-500">
                          Start streaming to unlock
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="opacity-20 pointer-events-none select-none">
                    <h3 className="text-lg font-semibold mb-2">
                      {section.section}
                    </h3>
                    <p className="text-zinc-400">Content locked...</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-zinc-800 p-6 bg-zinc-900/50">
        <div className="text-center text-sm text-zinc-400">
          {isStreaming ? (
            <p className="flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-mint-400 rounded-full animate-pulse"></span>
              Content unlocking as you stream • Use the widget to control your
              stream
            </p>
          ) : (
            <p>
              Start streaming to unlock premium content • Pay only for what you
              read
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
