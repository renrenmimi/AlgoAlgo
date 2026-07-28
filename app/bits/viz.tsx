"use client";

// 第 4 章 · 位运算的三个专属交互实验室:
//  - BitLamps:招牌「32 盏位灯」。点任意一盏翻转该位,十进制/十六进制实时更新,
//    翻最高位(符号位)会亲眼看到数字掉进负数 —— 补码不再是抽象规则。
//  - OpLab:六大运算符游乐场。A、B 两排灯可点,选运算符看结果灯怎么亮
//    (& | ^ 双目,~ 单目,<< >> 带位移量)—— 「与或非异或就是拨开关」。
//  - SubsetLab:位运算表示集合。整数当集合,逐位表示元素在/不在,
//    一键遍历全部 2ⁿ 个子集 —— 这是第 10 章状压 DP 的地基。

import { useMemo, useState } from "react";

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
      aria-label={`第 ${n} 位,当前 ${on ? 1 : 0}`}
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

  const bits = useMemo(() => bitsOf(val, 32), [val]);
  const toggle = (idx: number) => setVal((v) => v ^ (1 << (31 - idx)));
  const hex = (val >>> 0).toString(16).toUpperCase().padStart(8, "0");
  const neg = val < 0;

  return (
    <div className="viz">
      <div className="viz-title">位灯实验室 —— 点任意一盏灯翻转该位(最高位是符号位)</div>
      <div className="viz-stage" style={{ overflowX: "auto" }}>
        <LampBank bits={bits} onToggle={toggle} signMsb />
      </div>
      <div className="bit-readout">
        <span>
          十进制 <b>{val}</b>
        </span>
        <span>
          十六进制 <b className="mono">0x{hex}</b>
        </span>
        <span className="mono bit-binline">{bin32(val)}</span>
      </div>
      <div className="viz-msg" aria-live="polite">
        {neg ? (
          <>
            最高位(第 31 位)亮了 → 这是个<b>负数</b>。它存的不是「绝对值 + 负号」,
            而是<b>补码</b>:−n 的补码 = (~n) + 1。此刻的 −{-val} 就是这么来的。
          </>
        ) : val === 0 ? (
          <>
            32 盏灯全灭 = <b>0</b>。试试只点亮第 0 位 → 1,第 3 位 → 8 ——
            每盏灯的「权重」是 2 的幂。
          </>
        ) : (
          <>
            当前 <b>{val}</b>。亮着的每一位贡献 2 的幂之和。
            点最左边那盏(第 31 位)看看 —— 数字会瞬间掉进负数,那就是补码的符号位。
          </>
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
          ×2 （&lt;&lt;1）
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setVal((v) => v >> 1)}>
          ÷2 （&gt;&gt;1）
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setVal((v) => ~v)}>
          取反 ~
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          预设：
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

const OPS: { op: Op; name: string }[] = [
  { op: "&", name: "与 AND" },
  { op: "|", name: "或 OR" },
  { op: "^", name: "异或 XOR" },
  { op: "~", name: "非 NOT" },
  { op: "<<", name: "左移 SHL" },
  { op: ">>", name: "右移 SHR" },
];

const OP_DESC: Record<Op, string> = {
  "&": "两盏都亮,结果才亮 —— 用来「保留感兴趣的位」(掩码)。",
  "|": "任意一盏亮,结果就亮 —— 用来「打开某些位」(置 1)。",
  "^": "两盏不同才亮 —— 用来「翻转某些位」,也让相同的数彼此抵消。",
  "~": "逐位取反,亮灭对调(单目,忽略 B)—— 配合 +1 就是取负。",
  "<<": "整体左移,右边补 0 —— 每移一位相当于 ×2。",
  ">>": "整体右移,左边(此处按无符号)补 0 —— 每移一位相当于 ÷2。",
};

const MASK8 = 0xff;

export function OpLab() {
  const [a, setA] = useState(0b11001010); // 202
  const [b, setB] = useState(0b01101100); // 108
  const [op, setOp] = useState<Op>("&");
  const [shift, setShift] = useState(2);

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
      ? `~${a} = ${res}  (取低 8 位)`
      : `${a} ${op} ${b} = ${res}`;

  return (
    <div className="viz">
      <div className="viz-title">运算符游乐场 —— 点 A、B 的灯,换运算符看结果(8 位演示)</div>

      <div className="bit-op-row" role="tablist" aria-label="选择运算符">
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
            <span className="bit-op-name">{name}</span>
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
            <span className="bit-oprow-lab mono">移 {shift} 位</span>
            <div className="bit-shift-ctl">
              <button
                type="button"
                className="btn btn-sm"
                disabled={shift <= 0}
                onClick={() => setShift((s) => Math.max(0, s - 1))}
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
              >
                +
              </button>
            </div>
          </div>
        )}

        {op === "~" && (
          <div className="bit-oprow">
            <span className="bit-oprow-lab mono dim">B 忽略</span>
            <span className="dim" style={{ fontSize: 12 }}>
              ~ 是单目运算,只作用在 A 上。
            </span>
          </div>
        )}

        <div className="bit-oprow bit-oprow-res">
          <span className="bit-oprow-lab mono">= {res}</span>
          <LampBank bits={bitsOf(res, 8)} res />
        </div>
      </div>

      <div className="viz-msg" aria-live="polite">
        <b className="mono">{expr}</b> —— {OP_DESC[op]}
      </div>
    </div>
  );
}

/* ---------------- SubsetLab:位运算表示集合 ---------------- */

const ELEMS = ["🍎", "🍌", "🍇", "🍑"]; // 4 个元素 → 16 个子集

export function SubsetLab() {
  const [mask, setMask] = useState(0b0101);
  const n = ELEMS.length;
  const full = (1 << n) - 1;

  const has = (i: number) => (mask >> i) & 1;
  const toggle = (i: number) => setMask((m) => m ^ (1 << i));
  const chosen = ELEMS.filter((_, i) => has(i));

  return (
    <div className="viz">
      <div className="viz-title">集合实验室 —— 一个整数 = 一个集合,第 i 位表示元素 i 在不在</div>

      <div className="viz-stage" style={{ flexDirection: "column", gap: 14 }}>
        <div className="bit-set-elems">
          {ELEMS.map((e, i) => (
            <button
              key={i}
              type="button"
              className={`bit-elem${has(i) ? " on" : ""}`}
              onClick={() => toggle(i)}
              aria-pressed={!!has(i)}
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
            掩码 s ={" "}
            <b>
              {mask.toString(2).padStart(n, "0")}
              <sub>2</sub>
            </b>{" "}
            = <b>{mask}</b>
          </span>
          <span>
            集合 = {"{ "}
            {chosen.length ? chosen.join(" , ") : "空集 ∅"}
            {" }"}
          </span>
        </div>

        <div className="bit-subset-grid">
          {Array.from({ length: 1 << n }, (_, s) => {
            const set = ELEMS.filter((_, i) => (s >> i) & 1).join("");
            return (
              <button
                key={s}
                type="button"
                className={`bit-subcell${s === mask ? " on" : ""}`}
                onClick={() => setMask(s)}
                data-tip={`${s} = { ${set || "∅"} }`}
                aria-label={`子集 ${s},${set || "空集"}`}
              >
                {s.toString(2).padStart(n, "0")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="viz-msg" aria-live="polite">
        {mask === 0 ? (
          <>空集(s = 0):一盏不亮。for (s = 0; s &lt; 2ⁿ; s++) 从这里开始遍历全部子集。</>
        ) : mask === full ? (
          <>全集(s = {full} = 2ⁿ−1):n 盏全亮。加入元素 s |= (1&lt;&lt;i)、删除 s &amp;= ~(1&lt;&lt;i)。</>
        ) : (
          <>
            共 2⁴ = <b>16</b> 个子集,上面 16 个格子逐一对应。点格子跳转,或点水果增删元素 ——
            「整数当集合」正是第 10 章状压 DP 的地基。
          </>
        )}
      </div>

      <div className="viz-ctl">
        <button type="button" className="btn btn-sm" onClick={() => setMask(0)}>
          空集 ∅
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setMask(full)}>
          全集
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => setMask((m) => (m + 1) & full)}
        >
          下一个子集 →
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          {chosen.length} / {n} 个元素
        </span>
      </div>
    </div>
  );
}
