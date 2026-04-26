import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { DailyGoalCard } from "@/components/DailyGoalCard";
import { JourneyPath, type Lesson } from "@/components/JourneyPath";
import { GameModeHub } from "@/components/GameModeHub";
import { getPsalmByDay, getChapters, TOTAL_DAYS } from "@/data/psalms";
import { disableDailyReminder, registerForPushNotifications, scheduleDailyReminder } from "@/lib/nativeNotifications";
import { getReminderSettings, isMissionCompletedToday, saveOfflineMission, syncOfflineMissions } from "@/lib/offlineMission";
import { Bell, BookOpenCheck, CheckCircle2, ChevronLeft, ChevronRight, Flame, Music, Target, WifiOff } from "lucide-react";

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
    kind: p.day % 30 === 0 ? "milestone" : p.day % 7 === 0 ? "praise" : p.day % 5 === 0 ? "speak" : "verse",
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

        <MissionControl day={CURRENT_DAY} />

        <ProgressQuest />

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

function MissionControl({ day }: { day: number }) {
  const [done, setDone] = useState(false);
  const [online, setOnline] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [message, setMessage] = useState("Pronto para salvar seu progresso mesmo sem internet.");

  useEffect(() => {
    const settings = getReminderSettings();
    setReminderEnabled(settings.enabled);
    setReminderTime(settings.time);
    setDone(isMissionCompletedToday(day));
    setOnline(typeof navigator === "undefined" ? true : navigator.onLine);

    const onOnline = () => {
      setOnline(true);
      syncOfflineMissions().then((result) => {
        if (result.synced > 0) setMessage("Missão offline sincronizada com sua conta.");
      });
    };
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    syncOfflineMissions();

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [day]);

  const completeMission = async () => {
    saveOfflineMission(day, 30);
    setDone(true);
    setMessage(online ? "Missão concluída. Sincronizando quando sua conta estiver conectada." : "Missão salva offline. Vamos sincronizar quando a internet voltar.");
    if (online) await syncOfflineMissions();
  };

  const toggleReminder = async () => {
    if (reminderEnabled) {
      await disableDailyReminder();
      setReminderEnabled(false);
      setMessage("Lembrete diário desativado.");
      return;
    }

    await scheduleDailyReminder(reminderTime);
    const push = await registerForPushNotifications();
    setReminderEnabled(true);
    setMessage(push.registered ? "Lembrete e push ativados para este dispositivo." : "Lembrete local ativado. Push completo será finalizado no app nativo publicado.");
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Missão e lembrete</p>
          <h2 className="font-display text-xl font-bold">Não perca o dia</h2>
        </div>
        <div className={`flex size-10 items-center justify-center rounded-xl ${online ? "bg-success/10 text-success" : "bg-streak/10 text-streak"}`}>
          {online ? <CheckCircle2 className="size-5" /> : <WifiOff className="size-5" />}
        </div>
      </div>

      <p className="mt-2 text-sm font-semibold text-muted-foreground">{message}</p>

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <label className="rounded-xl border border-border bg-background px-3 py-2">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Horário</span>
          <input
            type="time"
            value={reminderTime}
            onChange={(event) => setReminderTime(event.target.value)}
            className="mt-1 w-full bg-transparent font-bold text-foreground outline-none"
          />
        </label>
        <button
          onClick={toggleReminder}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold shadow-sm active:translate-y-0.5 ${reminderEnabled ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"}`}
        >
          <Bell className="size-4" />
          {reminderEnabled ? "Ativo" : "Ativar"}
        </button>
      </div>

      <button
        onClick={completeMission}
        disabled={done}
        className="mt-3 w-full rounded-2xl bg-gradient-gold py-3 font-display text-lg font-bold text-primary-foreground shadow-chunky-gold active:translate-y-1 active:shadow-none disabled:opacity-70"
      >
        {done ? "Missão concluída hoje" : "Concluir missão offline"}
      </button>
    </section>
  );
}

function ProgressQuest() {
  return (
    <section className="grid grid-cols-3 gap-3">
      <QuestStat icon={<Target className="size-4" />} label="Meta" value="30 XP" tone="bg-primary/10 text-primary" />
      <QuestStat icon={<Flame className="size-4" />} label="Sequência" value="3 dias" tone="bg-streak/10 text-streak" />
      <QuestStat icon={<BookOpenCheck className="size-4" />} label="Trilha" value="365" tone="bg-success/10 text-success" />
      <div className="col-span-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Próxima recompensa</p>
            <h2 className="font-display text-xl font-bold">Baú de louvor no dia 7</h2>
          </div>
          <div className="size-11 rounded-xl bg-gradient-gold text-primary-foreground flex items-center justify-center shadow-chunky-gold">
            <Music className="size-5" />
          </div>
        </div>
        <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-[14%] rounded-full bg-gradient-gold" />
        </div>
        <p className="mt-2 text-xs font-semibold text-muted-foreground">Complete Salmos, pronúncia e louvor para avançar mais rápido.</p>
      </div>
    </section>
  );
}

function QuestStat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
      <div className={`mx-auto flex size-8 items-center justify-center rounded-xl ${tone}`}>{icon}</div>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-base font-bold leading-tight">{value}</p>
    </div>
  );
}
