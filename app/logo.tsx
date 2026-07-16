// 品牌标:一个分叉又汇合的「决策流」—— 从一个起点出发,走过分支,抵达答案。
// 寓意「算法 = 一串看得见的决策」。纯 SVG,继承 currentColor,放在渐变底的 .brand-mark 里。

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
