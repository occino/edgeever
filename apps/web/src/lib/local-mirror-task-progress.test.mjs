import "fake-indexeddb/auto";
import { afterEach, expect, test } from "bun:test";
import { markdownToDoc } from "@edgeever/shared";
const { localDb } = await import("./local-db.ts");
const { listLocalMemos } = await import("./local-mirror.ts");

const scope = "task-progress-test";
afterEach(async () => {
  await localDb.memos.where("scope").equals(scope).delete();
});

test("offline list counts tasks and reflects checking or removing them", async () => {
  const contentMarkdown = "- [x] done\n- [ ] pending";
  await localDb.memos.put({
    id: "task-progress-local", scope, notebookId: "nb", title: "Tasks", excerpt: "Tasks", tags: [],
    contentMarkdown, contentJson: markdownToDoc(contentMarkdown), contentText: "done pending", contentHash: "test",
    isPinned: false, isArchived: false, isDeleted: false, revision: 1,
    createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z", deletedAt: null,
    sourceMemoIds: [], mergeSourceCount: 0, mergedIntoMemoId: null,
  });
  const progress = async () => (await listLocalMemos(scope, {})).memos[0].taskProgress;
  expect(await progress()).toEqual({ checked: 1, total: 2 });
  await localDb.memos.update([scope, "task-progress-local"], { contentMarkdown: "- [x] done\n- [x] pending" });
  expect(await progress()).toEqual({ checked: 2, total: 2 });
  await localDb.memos.update([scope, "task-progress-local"], { contentMarkdown: "No tasks" });
  expect(await progress()).toBeUndefined();
});
