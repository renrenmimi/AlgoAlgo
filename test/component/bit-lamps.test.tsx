import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LangProvider } from "@/lib/i18n";
import { BitLamps } from "@/app/bits/viz";

// The bit-lamp lab (chapter 04, §01) must behave like a 32-bit int register:
// +1 past the largest int and −1 past the smallest one wrap around, and the
// decimal reading, the sign lamp and the explanation agree with the lamps.

function renderLamps() {
  const { container } = render(
    <LangProvider>
      <BitLamps />
    </LangProvider>,
  );
  const decimal = () => container.querySelector(".bit-readout b")?.textContent;
  const hex = () => container.querySelector(".bit-readout b.mono")?.textContent;
  const message = () => container.querySelector(".viz-msg")?.textContent ?? "";
  const signLamp = () => container.querySelector(".bit-lamp.sign")?.getAttribute("aria-pressed");
  return { decimal, hex, message, signLamp };
}

describe("bit lamps", () => {
  it("wraps 2147483647 + 1 to −2147483648 and says so", async () => {
    const user = userEvent.setup();
    const lab = renderLamps();
    await user.click(screen.getByRole("button", { name: "2³¹−1" }));
    expect(lab.decimal()).toBe("2147483647");

    await user.click(screen.getByRole("button", { name: "+1" }));
    expect(lab.decimal()).toBe("-2147483648");
    expect(lab.hex()).toBe("0x80000000");
    expect(lab.signLamp()).toBe("true");
    expect(lab.message()).toContain("2147483647 + 1 wraps around to −2147483648");

    // The next step is ordinary arithmetic again.
    await user.click(screen.getByRole("button", { name: "+1" }));
    expect(lab.decimal()).toBe("-2147483647");
    expect(lab.message()).not.toContain("wraps around");
    expect(lab.message()).toContain("negative");
  });

  it("wraps −2147483648 − 1 to 2147483647 and says so", async () => {
    const user = userEvent.setup();
    const lab = renderLamps();
    await user.click(screen.getByRole("button", { name: "−2³¹" }));
    // Two buttons read "−1": the step comes first, the preset value −1 later.
    await user.click(screen.getAllByRole("button", { name: "−1" })[0]);
    expect(lab.decimal()).toBe("2147483647");
    expect(lab.hex()).toBe("0x7FFFFFFF");
    expect(lab.signLamp()).toBe("false");
    expect(lab.message()).toContain("−2147483648 − 1 wraps around to 2147483647");
    expect(lab.message()).not.toContain("negative");
  });

  it("keeps every other operation inside 32 bits", async () => {
    const user = userEvent.setup();
    const lab = renderLamps();
    await user.click(screen.getByRole("button", { name: "2³¹−1" }));
    await user.click(screen.getByRole("button", { name: "<<1" }));
    expect(lab.decimal()).toBe(String((2147483647 << 1) | 0)); // -2
    expect(lab.message()).not.toContain("wraps around");
  });
});
