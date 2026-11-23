import { splitMarkdownFrontMatter } from "./front-matter";
import { Lexer, walkTokens } from "marked";
import type { MemoSummary } from "./types";

/** Count task-list items using the GFM block lexer, excluding prose and code. */
export const getTaskProgress = (markdown: string | null | undefined): MemoSummary["taskProgress"] => {
  if (!markdown?.includes("[")) return undefined;

  let checked = 0;
  let total = 0;
  const body = splitMarkdownFrontMatter(markdown)?.body ?? markdown;
  // Task state lives in block tokens; avoid parsing inline content for list summaries.
  const tokens = new Lexer({ gfm: true }).blockTokens(body.replace(/\r\n?/g, "\n"));
  walkTokens(tokens, (token) => {
    if (token.type === "list_item" && token.task) {
      total += 1;
      if (token.checked) checked += 1;
    }
  });
  return total > 0 ? { checked, total } : undefined;
};
