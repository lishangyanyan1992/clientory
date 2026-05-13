import { useEffect, useState } from "react";

interface ScoreCircleProps {
  score: number;
  size?: number;
}

function getScoreColor(score: number): string {
  if (score < 30) return "hsl(var(--score-poor))";
  if (score < 60) return "hsl(var(--score-moderate))";
  if (score < 80) return "hsl(var(--score-good))";
  return "hsl(var(--score-excellent))";
}

function getScoreLabel(score: number): string {
  if (score < 30) return "Poor";
  if (score < 60) return "Moderate";
  if (score < 80) return "Good";
  return "Excellent";
}

const ScoreCircle = ({ score, size = 180 }: ScoreCircleProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const color = getScoreColor(score);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(score * eased);
      setAnimatedScore(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="transform -rotate-90" style={{ width: size, height: size }}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-foreground">{animatedScore}</span>
        <span className="text-xs font-medium text-muted-foreground mt-1">{getScoreLabel(score)}</span>
      </div>
    </div>
  );
};

export default ScoreCircle;
