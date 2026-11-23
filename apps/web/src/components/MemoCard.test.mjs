import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { enUS } from "../../../../packages/shared/src/i18n/en-US.ts";
import { TooltipProvider } from "./ui/tooltip.tsx";
import { MemoCard } from "./MemoCard.tsx";

async function render(listDensity, taskProgress, selected = false) {
  const i18n = createInstance();
  await i18n.init({ lng: "en-US", resources: { "en-US": { translation: enUS } } });
  const noop = () => {};
  return renderToStaticMarkup(createElement(I18nextProvider, { i18n },
    createElement(TooltipProvider, null, createElement(MemoCard, {
      memo: {
        id: "tasks", notebookId: "nb", title: "A very long note title ".repeat(10), excerpt: "Preview",
        tags: ["tag"], taskProgress, isPinned: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
      },
      listDensity, selected, checked: false, selectionMode: false, multiSelectKeyDown: false,
      isTrashView: false, dragMemoIds: [], sortMode: "updated-desc",
      onOpen: noop, onRestore: noop, onDelete: noop, onOpenContextMenu: noop,
      onOpenSelectionContextMenu: noop, onOpenSelectionKeyboardContextMenu: noop,
      onOpenKeyboardContextMenu: noop, onToggle: noop,
    }))));
}

for (const density of ["preview", "compact"]) {
  describe(`${density} task progress`, () => {
    test("renders progress and its accessible description in the expected position", async () => {
      const html = await render(density, { checked: 4, total: 5 }, true);
      expect(html).toContain("☑ 4/5");
      expect(html).toContain('aria-label="4 of 5 tasks completed"');
      expect(html).toContain("shrink-0 whitespace-nowrap");
      expect(html).toContain("<time");
      expect(html).toContain("Preview");
      expect(html).toContain("#tag");
      if (density === "preview") {
        expect(html.indexOf("☑ 4/5")).toBeGreaterThan(html.indexOf("</time>"));
        expect(html.indexOf("☑ 4/5")).toBeLessThan(html.indexOf("#tag"));
      } else {
        expect(html.indexOf("☑ 4/5")).toBeLessThan(html.indexOf("<time"));
      }
    });
    test("shows zero and fully completed tasks", async () => {
      expect(await render(density, { checked: 0, total: 5 })).toContain("☑ 0/5");
      expect(await render(density, { checked: 5, total: 5 })).toContain("☑ 5/5");
    });
    test("omits the indicator for notes without tasks and older summaries", async () => {
      expect(await render(density)).not.toContain("☑");
      expect(await render(density, { checked: 0, total: 0 })).not.toContain("☑");
    });
  });
}
