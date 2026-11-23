import { getTaskProgress, type MemoDetail, type MemoSummary } from "@edgeever/shared";

export const toMemoSummary = (memo: MemoDetail): MemoSummary => ({
  id: memo.id,
  notebookId: memo.notebookId,
  title: memo.title,
  excerpt: memo.excerpt,
  taskProgress: getTaskProgress(memo.contentMarkdown),
  tags: memo.tags,
  isPinned: memo.isPinned,
  isArchived: memo.isArchived,
  isDeleted: memo.isDeleted,
  revision: memo.revision,
  createdAt: memo.createdAt,
  updatedAt: memo.updatedAt,
  deletedAt: memo.deletedAt,
});
