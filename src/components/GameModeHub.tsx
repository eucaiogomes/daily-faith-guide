import { Link } from "@tanstack/react-router";
import { BookOpen, Music, Mic, HandHeart, Sparkles, Headphones, Zap } from "lucide-react";

type Mode = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  shadow: string;
  to: string;
  params?: Record<string, string>;
  badge?: string;
};

const MODES: Mode[] = [
  {
    id: "rush",
    title: "Match Rush",
    subtitle: "Hordas rápidas 🔥",
    icon: <Zap className="size-7" />,
    gradient: "bg-gradient-flame",
    shadow: "shadow-chunky",
    to: "/rush",
    badge: "Novo",
  },
  {
    id: "psalm",
    title: "Salmo do Dia",
    subtitle: "Ordene o versículo",
    icon: <BookOpen className="size-7" />,
    gradient: "bg-gradient-hero",
    shadow: "shadow-chunky",
    to: "/lesson/$day",
    params: { day: "4" },
  },
  {
    id: "praise",
    title: "Karaokê de Louvor",
    subtitle: "Cante Amazing Grace",
    icon: <Music className="size-7" />,
    gradient: "bg-gradient-flame",
    shadow: "shadow-chunky",
    to: "/devotional/$id",
    params: { id: "amazing-grace" },
  },
  {
    id: "prayer",
    title: "Oração Guiada",
    subtitle: "Pai Nosso em inglês",
    icon: <HandHeart className="size-7" />,
    gradient: "bg-gradient-gold",
    shadow: "shadow-chunky-gold",
    to: "/devotional/$id",
    params: { id: "lords-prayer" },
  },
  {
    id: "match",
    title: "Pareamento",
    subtitle: "Conecte EN ↔ PT",
    icon: <Sparkles className="size-7" />,
    gradient: "bg-success",
    shadow: "shadow-chunky-success",
    to: "/lesson/$day",
    params: { day: "4" },
  },
  {
    id: "speak",
    title: "Pronúncia",
    subtitle: "Repita versículos",
    icon: <Mic className="size-7" />,
    gradient: "bg-gradient-hero",
    shadow: "shadow-chunky",
    to: "/lesson/$day",
    params: { day: "4" },
  },
  {
    id: "listen",
    title: "Escuta Devocional",
    subtitle: "Ouça e entenda",
    icon: <Headphones className="size-7" />,
    gradient: "bg-accent",
    shadow: "shadow-chunky",
    to: "/lesson/$day",
    params: { day: "4" },
  },
];

export function GameModeHub() {
  return (
    <section>
      <div className="flex items-end justify-between px-1 mb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Modos de prática
          </p>
          <h2 className="font-display text-2xl font-bold">Jogue & Ore</h2>
        </div>
        <span className="text-2xl">✨</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MODES.map((m) => (
          <Link
            key={m.id}
            to={m.to}
            params={m.params as never}
            className={`relative ${m.gradient} text-white rounded-2xl p-4 ${m.shadow} active:translate-y-1 active:shadow-none transition`}
          >
            {m.badge && (
              <span className="absolute -top-2 -right-2 bg-card text-[10px] font-extrabold px-2 py-0.5 rounded-full text-streak border border-border shadow">
                {m.badge}
              </span>
            )}
            <div className="size-11 rounded-xl bg-white/20 flex items-center justify-center">
              {m.icon}
            </div>
            <p className="mt-3 font-display text-base font-bold leading-tight">
              {m.title}
            </p>
            <p className="text-[11px] opacity-90 font-semibold mt-0.5">
              {m.subtitle}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
