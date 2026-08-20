"use client";

// 第 4 章 · 位运算的三个专属交互实验室:
//  - BitLamps:招牌「32 盏位灯」。点任意一盏翻转该位,十进制/十六进制实时更新,
//    翻最高位(符号位)会亲眼看到数字掉进负数 —— 补码不再是抽象规则。
//  - OpLab:六大运算符游乐场。A、B 两排灯可点,选运算符看结果灯怎么亮
//    (& | ^ 双目,~ 单目,<< >> 带位移量)。
//  - SubsetLab:位运算表示集合。整数当集合,逐位表示元素在/不在,
//    一键遍历全部 2ⁿ 个子集 —— 这是第 10 章状压 DP 的地基。
//
// 双语:JSX 旁白直接写 <T en zh />;字符串型标签用 useL() 解析 Loc<string>。

import { useMemo, useState } from "react";
import { T, useL, type Loc } from "@/lib/i18n";

/* ---------------- 通用:一盏灯 + 一排灯 ---------------- */

type LampKind = "sign" | "res";

function Lamp({
  on,
  n,
  kind,
  onClick,
}: {
  on: boolean;
  n: number;
  kind?: LampKind;
  onClick?: () => void;
}) {
  const L = useL();
  const cls = `bit-lamp${on ? " on" : ""}${kind ? ` ${kind}` : ""}`;
  const inner = (
    <>
      <span className="bit-lamp-v">{on ? 1 : 0}</span>
      <span className="bit-lamp-n">{n}</span>
    </>
  );
  if (!onClick) {
    return (
      <div className={`${cls} bit-lamp-static`} aria-hidden>
        {inner}
      </div>
    );
  }
  return (
    <button
      type="button"
      className={cls}
      onClick={onClick}
      aria-pressed={on}
      aria-label={L({
        en: `Bit ${n}, currently ${on ? 1 : 0}`,
        zh: `第 ${n} 位,当前 ${on ? 1 : 0}`,
      })}
    >
      {inner}
    </button>
  );
}

/** bits[0] 是最高位(MSB);按 4 位一组(nibble)分块渲染,便于读十六进制。 */
function LampBank({
  bits,
  onToggle,
  res = false,
  signMsb = false,
}: {
  bits: number[];
  onToggle?: (idx: number) => void;
  res?: boolean;
  signMsb?: boolean;
}) {
  const W = bits.length;
  const groups: { b: number; idx: number }[][] = [];
  for (let g = 0; g * 4 < W; g++) {
    groups.push(
      bits.slice(g * 4, g * 4 + 4).map((b, j) => ({ b, idx: g * 4 + j })),
    );
  }
  return (
    <div className="bit-lamps">
      {groups.map((grp, gi) => (
        <div className="bit-grp" key={gi}>
          {grp.map(({ b, idx }) => {
            const bitNo = W - 1 - idx;
            const kind: LampKind | undefined = res
              ? "res"
              : signMsb && idx === 0
                ? "sign"
                : undefined;
            return (
              <Lamp
                key={idx}
                on={!!b}
                n={bitNo}
                kind={kind}
                onClick={onToggle ? () => onToggle(idx) : undefined}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** 取 v 的低 W 位,返回「最高位在前」的 0/1 数组。 */
function bitsOf(v: number, W: number): number[] {
  return Array.from({ length: W }, (_, i) => (v >> (W - 1 - i)) & 1);
}

/** 32 位二进制字符串(按 nibble 加空格),v 按无符号看待。 */
function bin32(v: number): string {
  const u = v >>> 0;
  const s = u.toString(2).padStart(32, "0");
  return s.replace(/(.{4})(?=.)/g, "$1 ");
}

/* ---------------- BitLamps:32 盏位灯 ---------------- */

const PRESETS: { label: string; v: number }[] = [
  { label: "0", v: 0 },
  { label: "1", v: 1 },
  { label: "42", v: 42 },
  { label: "−1", v: -1 },
  { label: "−5", v: -5 },
  { label: "2³¹−1", v: 2147483647 },
  { label: "−2³¹", v: -2147483648 },
];

export function BitLamps() {
  const [val, setVal] = useState(42);
  const L = useL();

  const bits = useMemo(() => bitsOf(val, 32), [val]);
  const toggle = (idx: number) => setVal((v) => v ^ (1 << (31 - idx)));
  const hex = (val >>> 0).toString(16).toUpperCase().padStart(8, "0");
  const neg = val < 0;

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en={<>Bit lamps — click any lamp to flip that bit (bit 31 is the sign bit)</>}
          zh={<>位灯实验室 —— 点任意一盏灯翻转该位(第 31 位是符号位)</>}
        />
      </div>
      <div className="viz-stage" style={{ overflowX: "auto" }}>
        <LampBank bits={bits} onToggle={toggle} signMsb />
      </div>
      <div className="bit-readout">
        <span>
          <T en={<>Decimal</>} zh={<>十进制</>} /> <b>{val}</b>
        </span>
        <span>
          <T en={<>Hex</>} zh={<>十六进制</>} />{" "}
          <b className="mono">0x{hex}</b>
        </span>
        <span className="mono bit-binline">{bin32(val)}</span>
      </div>
      <div className="viz-msg" aria-live="polite">
        {neg ? (
          <T
            en={
              <>
                Bit 31 is on, so the value is <b>negative</b>. The bits do not
                store a magnitude plus a minus sign. They store the{" "}
                <b>two&apos;s complement</b>: the pattern for −n is (~n) + 1.
                That is where this −{-val} comes from.
              </>
            }
            zh={
              <>
                第 31 位亮了 → 这是个<b>负数</b>。这些位存的不是「绝对值 + 负号」,
                而是<b>补码</b>:−n 的位模式 = (~n) + 1。此刻的 −{-val} 就是这么来的。
              </>
            }
          />
        ) : val === 0 ? (
          <T
            en={
              <>
                All 32 lamps are off, so the value is <b>0</b>. Turn on only bit
                0 to get 1, or only bit 3 to get 8. Each lamp is worth a power of
                two: bit i is worth 2ⁱ.
              </>
            }
            zh={
              <>
                32 盏灯全灭 = <b>0</b>。只点亮第 0 位 → 1,只点亮第 3 位 → 8 ——
                每盏灯的权值是 2 的幂:第 i 位值 2ⁱ。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                The value is <b>{val}</b>. It is the sum of the powers of two for
                every lamp that is on. Click the leftmost lamp (bit 31) and the
                value jumps to a negative number. That lamp is the sign bit of
                two&apos;s complement.
              </>
            }
            zh={
              <>
                当前 <b>{val}</b>,等于所有亮着的位对应的 2 的幂之和。
                点最左边那盏(第 31 位),数字会立刻变成负数 —— 那就是补码的符号位。
              </>
            }
          />
        )}
      </div>
      <div className="viz-ctl">
        <button type="button" className="btn btn-sm" onClick={() => setVal((v) => v + 1)}>
          +1
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setVal((v) => v - 1)}>
          −1
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setVal((v) => v << 1)}>
          &lt;&lt;1
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setVal((v) => v >> 1)}>
          &gt;&gt;1
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setVal((v) => ~v)}>
          ~
        </button>
        <span className="mono dim bit-preset-lab">
          {L({ en: "Presets:", zh: "预设:" })}
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={`btn btn-sm${val === p.v ? " btn-primary" : ""}`}
            onClick={() => setVal(p.v)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- OpLab:六大运算符游乐场 ---------------- */

type Op = "&" | "|" | "^" | "~" | "<<" | ">>";

const OPS: { op: Op; name: Loc<string> }[] = [
  { op: "&", name: { en: "AND", zh: "与 AND" } },
  { op: "|", name: { en: "OR", zh: "或 OR" } },
  { op: "^", name: { en: "XOR", zh: "异或 XOR" } },
  { op: "~", name: { en: "NOT", zh: "非 NOT" } },
  { op: "<<", name: { en: "Shift left", zh: "左移 SHL" } },
  { op: ">>", name: { en: "Shift right", zh: "右移 SHR" } },
];

const OP_DESC: Record<Op, Loc<string>> = {
  "&": {
    en: "A result bit is 1 only when both input bits are 1. Use it to keep the bits you care about and clear the rest (a mask).",
    zh: "两个输入位都是 1,结果位才是 1。用来保留感兴趣的位、清掉其余位(掩码)。",
  },
  "|": {
    en: "A result bit is 1 when either input bit is 1. Use it to turn bits on without touching the others.",
    zh: "任意一个输入位是 1,结果位就是 1。用来把某些位置成 1,不影响其他位。",
  },
  "^": {
    en: "A result bit is 1 only when the two input bits differ. Use it to flip selected bits, and note that a value XORed with itself becomes 0.",
    zh: "两个输入位不同,结果位才是 1。用来翻转选定的位;而且一个数和自己异或会变成 0。",
  },
  "~": {
    en: "Flips every bit of A; B is ignored because ~ takes one operand. On a fixed-width signed integer, ~x + 1 equals -x.",
    zh: "把 A 的每一位取反;~ 是单目运算,忽略 B。在固定位宽的有符号整数里,~x + 1 就等于 −x。",
  },
  "<<": {
    en: "Shifts every bit left and fills with 0 on the right. Each step doubles the value, until a 1 is pushed past the top bit and lost. This demo is 8 bits wide, so anything above bit 7 is dropped.",
    zh: "所有位整体左移,右边补 0。每移一位相当于 ×2,直到有 1 被顶出最高位而丢失。本演示只有 8 位宽,超出第 7 位的部分被丢掉。",
  },
  ">>": {
    en: "Shifts every bit right. A here is always between 0 and 255, so 0 comes in on the left and each step halves the value. For a negative value the languages differ: Java and JavaScript copy the sign bit with >> and shift in 0 with >>>, while Python has no >>> at all.",
    zh: "所有位整体右移。这里的 A 始终在 0..255 之间,所以左边补 0,每移一位相当于 ÷2。负数上各语言不同:Java 和 JavaScript 的 >> 补符号位、>>> 补 0,而 Python 根本没有 >>>。",
  },
};

const MASK8 = 0xff;

export function OpLab() {
  const [a, setA] = useState(0b11001010); // 202
  const [b, setB] = useState(0b01101100); // 108
  const [op, setOp] = useState<Op>("&");
  const [shift, setShift] = useState(2);
  const L = useL();

  const binary = op === "&" || op === "|" || op === "^";
  const isShift = op === "<<" || op === ">>";

  const res = useMemo(() => {
    switch (op) {
      case "&":
        return a & b;
      case "|":
        return a | b;
      case "^":
        return a ^ b;
      case "~":
        return ~a & MASK8;
      case "<<":
        return (a << shift) & MASK8;
      case ">>":
        return a >> shift;
    }
  }, [a, b, op, shift]);

  const expr = isShift
    ? `${a} ${op} ${shift} = ${res}`
    : op === "~"
      ? `~${a} = ${res}  ${L({ en: "(low 8 bits)", zh: "(取低 8 位)" })}`
      : `${a} ${op} ${b} = ${res}`;

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en={
            <>
              Operator playground — click the lamps of A and B, then switch
              operator to see the result (8-bit demo)
            </>
          }
          zh={<>运算符游乐场 —— 点 A、B 的灯,换运算符看结果(8 位演示)</>}
        />
      </div>

      <div
        className="bit-op-row"
        role="tablist"
        aria-label={L({ en: "Choose an operator", zh: "选择运算符" })}
      >
        {OPS.map(({ op: o, name }) => (
          <button
            key={o}
            type="button"
            role="tab"
            aria-selected={op === o}
            className={`bit-op${op === o ? " on" : ""}`}
            onClick={() => setOp(o)}
          >
            <span className="mono">{o}</span>
            <span className="bit-op-name">{L(name)}</span>
          </button>
        ))}
      </div>

      <div className="viz-stage" style={{ flexDirection: "column", gap: 12, overflowX: "auto" }}>
        <div className="bit-oprow">
          <span className="bit-oprow-lab mono">A = {a}</span>
          <LampBank bits={bitsOf(a, 8)} onToggle={(i) => setA((x) => x ^ (1 << (7 - i)))} />
        </div>

        {binary && (
          <div className="bit-oprow">
            <span className="bit-oprow-lab mono">B = {b}</span>
            <LampBank bits={bitsOf(b, 8)} onToggle={(i) => setB((x) => x ^ (1 << (7 - i)))} />
          </div>
        )}

        {isShift && (
          <div className="bit-oprow">
            <span className="bit-oprow-lab mono">
              {L({ en: `shift ${shift}`, zh: `移 ${shift} 位` })}
            </span>
            <div className="bit-shift-ctl">
              <button
                type="button"
                className="btn btn-sm"
                disabled={shift <= 0}
                onClick={() => setShift((s) => Math.max(0, s - 1))}
                aria-label={L({ en: "Decrease shift", zh: "减少位移量" })}
              >
                −
              </button>
              <span className="mono" style={{ minWidth: 22, textAlign: "center" }}>
                {shift}
              </span>
              <button
                type="button"
                className="btn btn-sm"
                disabled={shift >= 7}
                onClick={() => setShift((s) => Math.min(7, s + 1))}
                aria-label={L({ en: "Increase shift", zh: "增加位移量" })}
              >
                +
              </button>
            </div>
          </div>
        )}

        {op === "~" && (
          <div className="bit-oprow">
            <span className="bit-oprow-lab mono dim">
              {L({ en: "B unused", zh: "B 忽略" })}
            </span>
            <span className="dim" style={{ fontSize: 12 }}>
              <T
                en={<>~ takes one operand, so it only acts on A.</>}
                zh={<>~ 是单目运算,只作用在 A 上。</>}
              />
            </span>
          </div>
        )}

        <div className="bit-oprow bit-oprow-res">
          <span className="bit-oprow-lab mono">= {res}</span>
          <LampBank bits={bitsOf(res, 8)} res />
        </div>
      </div>

      <div className="viz-msg" aria-live="polite">
        <b className="mono">{expr}</b> — {L(OP_DESC[op])}
      </div>
    </div>
  );
}

/* ---------------- SubsetLab:位运算表示集合 ---------------- */

const ELEMS = ["🍎", "🍌", "🍇", "🍑"]; // 4 个元素 → 16 个子集

export function SubsetLab() {
  const [mask, setMask] = useState(0b0101);
  const L = useL();
  const n = ELEMS.length;
  const full = (1 << n) - 1;

  const has = (i: number) => (mask >> i) & 1;
  const toggle = (i: number) => setMask((m) => m ^ (1 << i));
  const chosen = ELEMS.filter((_, i) => has(i));

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en={
            <>
              Set lab — one integer is one set, and bit i says whether element i
              is in it
            </>
          }
          zh={<>集合实验室 —— 一个整数 = 一个集合,第 i 位表示元素 i 在不在</>}
        />
      </div>

      <div className="viz-stage" style={{ flexDirection: "column", gap: 14 }}>
        <div className="bit-set-elems">
          {ELEMS.map((e, i) => (
            <button
              key={i}
              type="button"
              className={`bit-elem${has(i) ? " on" : ""}`}
              onClick={() => toggle(i)}
              aria-pressed={!!has(i)}
              aria-label={L({
                en: `Element ${i}, bit ${i} is ${has(i) ? 1 : 0}`,
                zh: `元素 ${i},第 ${i} 位是 ${has(i) ? 1 : 0}`,
              })}
            >
              <span className="bit-elem-face">{e}</span>
              <span className="bit-elem-tag mono">
                bit {i} · {has(i) ? "1" : "0"}
              </span>
            </button>
          ))}
        </div>

        <div className="bit-set-readout mono">
          <span>
            {L({ en: "mask s =", zh: "掩码 s =" })}{" "}
            <b>
              {mask.toString(2).padStart(n, "0")}
              <sub>2</sub>
            </b>{" "}
            = <b>{mask}</b>
          </span>
          <span>
            {L({ en: "set =", zh: "集合 =" })} {"{ "}
            {chosen.length
              ? chosen.join(" , ")
              : L({ en: "empty set ∅", zh: "空集 ∅" })}
            {" }"}
          </span>
        </div>

        <div className="bit-subset-grid">
          {Array.from({ length: 1 << n }, (_, s) => {
            const set = ELEMS.filter((_, i) => (s >> i) & 1).join("");
            const empty = L({ en: "empty set", zh: "空集" });
            return (
              <button
                key={s}
                type="button"
                className={`bit-subcell${s === mask ? " on" : ""}`}
                onClick={() => setMask(s)}
                data-tip={`${s} = { ${set || "∅"} }`}
                aria-label={L({
                  en: `Subset ${s}, ${set || empty}`,
                  zh: `子集 ${s},${set || empty}`,
                })}
              >
                {s.toString(2).padStart(n, "0")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="viz-msg" aria-live="polite">
        {mask === 0 ? (
          <T
            en={
              <>
                The empty set (s = 0): no lamp is on. The loop{" "}
                for (s = 0; s &lt; 2ⁿ; s++) starts here and visits every subset
                of the full set exactly once.
              </>
            }
            zh={
              <>
                空集(s = 0):一盏不亮。循环 for (s = 0; s &lt; 2ⁿ; s++)
                从这里开始,把全集的每个子集恰好访问一次。
              </>
            }
          />
        ) : mask === full ? (
          <T
            en={
              <>
                The full set (s = {full} = 2ⁿ−1): all n lamps are on. Add an
                element with s |= (1&lt;&lt;i) and remove one with
                s &amp;= ~(1&lt;&lt;i).
              </>
            }
            zh={
              <>
                全集(s = {full} = 2ⁿ−1):n 盏全亮。加入元素 s |= (1&lt;&lt;i),
                删除元素 s &amp;= ~(1&lt;&lt;i)。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                Four elements give 2⁴ = <b>16</b> subsets, one per cell above.
                Click a cell to jump to that subset, or click a fruit to add or
                remove one element. Using an integer as a set is the foundation
                of state compression DP in chapter 10.
              </>
            }
            zh={
              <>
                4 个元素共有 2⁴ = <b>16</b> 个子集,上面 16 个格子逐一对应。
                点格子跳到该子集,或点水果增删一个元素。
                「整数当集合」正是第 10 章状压 DP 的地基。
              </>
            }
          />
        )}
      </div>

      <div className="viz-ctl">
        <button type="button" className="btn btn-sm" onClick={() => setMask(0)}>
          {L({ en: "Empty set ∅", zh: "空集 ∅" })}
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setMask(full)}>
          {L({ en: "Full set", zh: "全集" })}
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => setMask((m) => (m + 1) & full)}
        >
          {L({ en: "Next subset →", zh: "下一个子集 →" })}
        </button>
        <span className="mono dim bit-count-lab">
          {L({
            en: `${chosen.length} / ${n} elements`,
            zh: `${chosen.length} / ${n} 个元素`,
          })}
        </span>
      </div>
    </div>
  );
}
