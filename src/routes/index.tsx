import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { DailyGoalCard } from "@/components/DailyGoalCard";
import { JourneyPath, type Lesson } from "@/components/JourneyPath";
import { GameModeHub } from "@/components/GameModeHub";
import { getPsalmByDay, getChapters, TOTAL_DAYS } from "@/data/psalms";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen — Aprenda inglês com os Salmos" },
      { name: "description", content: "Aprenda inglês todos os dias com os Salmos. Vocabulário, pronúncia e versículos memorizados em uma jornada bíblica diária." },
      { property: "og:title", content: "Lumen — Inglês com os Salmos" },
      { property: "og:description", content: "Jornada bíblica diária para aprender inglês com os Salmos." },
    ],
  }),
  component: Index,
});

/** Currently unlocked day. Bump this once persistence is wired up. */
const CURRENT_DAY = 1;

const CHAPTERS = getChapters();

function Index() {
  const today = getPsalmByDay(CURRENT_DAY);
  const v1 = today.verses[0];
  // Open the chapter that contains the current day by default.
  const initialChapter = CHAPTERS.findIndex((c) => c.lessons.some((l) => l.day === CURRENT_DAY));
  const [chapterIdx, setChapterIdx] = useState(Math.max(0, initialChapter));
  const chapter = CHAPTERS[chapterIdx];

  const lessons: Lesson[] = chapter.lessons.map((p) => ({
    day: p.day,
    title: p.title.replace(/^Psalm \d+ — /, "").replace(/ • Revisão.*$/, ""),
    // Until persistence is wired up, leave all future days unlocked so users
    // can freely explore the 365-day journey.
    state: p.day < CURRENT_DAY ? "done" : p.day === CURRENT_DAY ? "current" : "done",
    kind: "verse",
  }));

  return (
    <div className="min-h-screen bg-gradient-sky pb-12">
      <AppHeader streak={3} gold={42} hearts={5} />
      <main className="max-w-md mx-auto px-4 pt-5 space-y-6">
        <DailyGoalCard
          day={CURRENT_DAY}
          totalDays={TOTAL_DAYS}
          xp={15}
          goal={30}
          verseRef={v1.ref}
          verseEn={v1.en}
          versePt={v1.pt}
        />

        <GameModeHub />

        <section>
          <div className="flex items-center justify-between px-1 gap-2">
            <button
              onClick={() => setChapterIdx(Math.max(0, chapterIdx - 1))}
              disabled={chapterIdx === 0}
              aria-label="Capítulo anterior"
              className="size-9 rounded-full bg-card border border-border flex items-center justify-center disabled:opacity-30"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="flex-1 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Capítulo {chapter.number} de {CHAPTERS.length}
              </p>
              <h2 className="font-display text-xl font-bold">{chapter.title}</h2>
              <p className="text-[10px] text-muted-foreground">
                Dias {chapter.lessons[0].day}–{chapter.lessons[chapter.lessons.length - 1].day}
              </p>
            </div>
            <button
              onClick={() => setChapterIdx(Math.min(CHAPTERS.length - 1, chapterIdx + 1))}
              disabled={chapterIdx === CHAPTERS.length - 1}
              aria-label="Próximo capítulo"
              className="size-9 rounded-full bg-card border border-border flex items-center justify-center disabled:opacity-30"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
          <JourneyPath lessons={lessons} />
        </section>

        <p className="text-center text-xs text-muted-foreground italic px-8">
          "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho." — Salmo 119:105
        </p>
      </main>
    </div>
  );
}
