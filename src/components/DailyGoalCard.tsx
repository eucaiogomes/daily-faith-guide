import doveMascot from "@/assets/dove-mascot.png";

interface DailyGoalCardProps {
  day: number;
  totalDays: number;
  xp: number;
  goal: number;
  verseRef: string;
  verseEn: string;
  versePt: string;
}

export function DailyGoalCard({ day, totalDays, xp, goal, verseRef, verseEn, versePt }: DailyGoalCardProps) {
  const progress = Math.min(100, (xp / goal) * 100);
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-hero text-primary-foreground p-5 shadow-soft">
      <div className="absolute -right-4 -bottom-4 opacity-90 animate-float-slow">
        <img src={doveMascot} alt="Mascote pomba Lumen" width={140} height={140} className="size-32" />
      </div>
      <div className="relative max-w-[60%]">
        <p className="text-xs uppercase tracking-widest opacity-80 font-bold">
          Dia {day} de {totalDays}
        </p>
        <h2 className="font-display text-2xl font-bold mt-1 leading-tight">
          Sua meta diária
        </h2>
        <p className="text-sm mt-2 opacity-90 italic">"{verseEn}"</p>
        <p className="text-xs mt-1 opacity-70">{versePt}</p>
        <p className="text-xs mt-2 font-bold opacity-90">— {verseRef}</p>

        <div className="mt-4">
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-gold rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs mt-1.5 font-bold opacity-90">{xp} / {goal} XP hoje</p>
        </div>
      </div>
    </section>
  );
}
