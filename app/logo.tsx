// Brand mark: a "decision flow" that branches and then converges -- start from one point,
// pass through the branches, arrive at the answer. It stands for "an algorithm is a visible
// sequence of decisions". Pure SVG, inherits currentColor, sits inside the gradient-backed
// .brand-mark.

export function BrandMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="4" r="2.6" fill="currentColor" />
      <circle cx="5" cy="12" r="2.6" fill="currentColor" opacity="0.62" />
      <circle cx="19" cy="12" r="2.6" fill="currentColor" opacity="0.62" />
      <rect x="9.4" y="17.4" width="5.2" height="5.2" rx="1.6" fill="currentColor" />
      <path
        d="M10.6 5.9 6.5 9.8M13.4 5.9l4.1 3.9M6.3 14.3l4 3.8M17.7 14.3l-4 3.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}
