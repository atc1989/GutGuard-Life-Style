"use client";

export function Confetti({ fire }: { fire: boolean }) {
  if (!fire) return null;

  const bits = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    left: `${8 + ((i * 17) % 84)}%`,
    delay: `${(i % 8) * 0.05}s`,
    color: i % 3 === 0 ? "#0608A9" : i % 3 === 1 ? "#B08D5B" : "#F4F1EA",
  }));

  return (
    <div className="gg-confetti" aria-hidden>
      {bits.map((bit) => (
        <i
          key={bit.id}
          style={{
            left: bit.left,
            animationDelay: bit.delay,
            background: bit.color,
          }}
        />
      ))}
    </div>
  );
}
