import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createTracer, runRace } from "@/lib/race-core";
import { POW_ALGOS, POW_SHAPES, pow2Floor, powRecursive } from "@/app/divide/race-pow";
import { POW_RACE_SIZES, powVerdict } from "@/app/divide/viz";

// The verdict under the fast-power race (app/divide/page.tsx, §03) must describe the
// exponent that was actually raced, for every shape and size a reader can pick.

const CAP = 3_000_000; // AlgoRace's default operation cap

function text(node: ReactNode): string {
  return renderToStaticMarkup(<>{node}</>)
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const numbersIn = (s: string): number[] =>
  (s.match(/\d[\d,]*/g) ?? []).map((x) => Number(x.replace(/,/g, "")));

const recursiveCost = (n: number) => {
  const t = createTracer();
  powRecursive(n, t);
  return t.counts.cmp;
};

describe("fast-power race verdict", () => {
  for (const shape of POW_SHAPES) {
    for (const size of POW_RACE_SIZES) {
      it(`matches the numbers for ${shape.id}, n = ${size}`, () => {
        const e = shape.make(size, 7);
        const r = runRace(POW_ALGOS, e, (v) => v, CAP);
        const c = (id: string) => r.find((x) => x.id === id)!.counts;
        const nv = c("pow-naive");
        const rc = c("pow-rec");
        const it = c("pow-iter");
        const v = powVerdict(r, { size, inputId: shape.id }) as { en: ReactNode; zh: ReactNode };
        const en = text(v.en);
        const zh = text(v.zh);

        const bin = e.toString(2);
        const lg = bin.length - 1;
        const ones = [...bin].filter((b) => b === "1").length;

        // The counts the text explains.
        expect(rc.cmp).toBe(lg + ones - 1);
        expect(it.cmp).toBe(rc.cmp + 1); // "behind by exactly one"
        expect(nv.cmp).toBe(e - 1);
        expect(rc.space).toBe(lg + 1);
        expect(en).toContain(`Exponent n = ${e}`);
        expect(en).not.toContain("1 × x");

        const full = 2 * e - 1;
        const allowed = new Set([
          nv.cmp, nv.space, rc.cmp, rc.space, it.cmp, it.space,
          e, Number(bin), lg, lg + 1, ones - 1, 2 * lg, full, Number(full.toString(2)),
          Math.round(nv.cmp / Math.max(1, rc.cmp)), 0, 1, 2, 4, 8,
        ]);
        for (const [lang, s] of [["en", en], ["zh", zh]] as const) {
          for (const n of numbersIn(s)) {
            expect(allowed.has(n), `${lang} prints ${n}: ${s}`).toBe(true);
          }
        }

        if (shape.id === "pow2") {
          expect(e).toBe(pow2Floor(size));
          // The all-ones exponent of the same bit-length really costs 2·lg.
          expect(recursiveCost(full)).toBe(2 * lg);
          expect(en).toContain(`${full} = (${full.toString(2)})₂`);
          expect(en).toContain(`fast power needs ${2 * lg} there`);
          expect(zh).toContain(`快速幂要 ${2 * lg} 次`);
          expect(en.includes(`pick General and ${full}`)).toBe(POW_RACE_SIZES.includes(full));
        } else {
          const extra = ones - 1;
          if (extra === 1) expect(en).toContain("= 1 extra multiplication, for the remaining 1 bit");
          else expect(en).toContain(`= ${extra} extra multiplications, one for each remaining 1 bit`);
          expect(zh).toContain(`popcount(n) − 1 = ${extra} 次补乘`);
        }
      });
    }
  }
});
