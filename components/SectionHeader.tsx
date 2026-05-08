// En-tête réutilisable : eyebrow (label discret en majuscules) + titre + petit dot animé optionnel.

type Props = {
  eyebrow: string;
  title: string;
  dotColor?: string; // tailwind color class, e.g. "bg-neon-pink"
  className?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  dotColor,
  className,
}: Props) {
  return (
    <div className={className}>
      <div className="mb-3 flex items-center gap-2.5">
        {dotColor ? (
          <span
            className={`h-1.5 w-1.5 rounded-full ${dotColor} animate-pulse`}
          />
        ) : null}
        <span className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.28em] text-white/45">
          {eyebrow}
        </span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
        {title}
      </h2>
    </div>
  );
}
