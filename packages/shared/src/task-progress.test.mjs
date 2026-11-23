import { describe, expect, test } from "bun:test";
import { getTaskProgress } from "./task-progress.ts";

describe("task progress", () => {
  test("omits notes without tasks, including checkbox-like prose and code", () => {
    for (const text of [undefined, null, "", "ordinary note", "☑ 4/5", "text [x] inline", "`- [x] inline code`", "```md\n- [x] fenced code\n```", "    - [x] indented code"]) {
      expect(getTaskProgress(text)).toBeUndefined();
    }
  });

  test("counts checked, unchecked and nested tasks exactly once", () => {
    expect(getTaskProgress("- [x] parent\n  - [ ] child\n  - [x] child\n- [ ] sibling\n- [X] uppercase")).toEqual({ checked: 3, total: 5 });
  });

  test("includes tasks in block quotes but ignores tasks inside fenced code", () => {
    expect(getTaskProgress("> - [x] quoted\n\n- [ ] real\n\n```\n- [x] example\n```"))
      .toEqual({ checked: 1, total: 2 });
  });

  test("ignores front matter and handles Windows line endings", () => {
    expect(getTaskProgress("---\nexample:\n  - [x] metadata\n---\n\n- [ ] real\r\n- [X] done"))
      .toEqual({ checked: 1, total: 2 });
  });

  test("retains zero and fully completed progress", () => {
    expect(getTaskProgress("- [ ] first\n- [ ] second")).toEqual({ checked: 0, total: 2 });
    expect(getTaskProgress("- [x] first\n- [x] second")).toEqual({ checked: 2, total: 2 });
  });
});
