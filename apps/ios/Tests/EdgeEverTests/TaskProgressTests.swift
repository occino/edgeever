import XCTest
@testable import EdgeEver

final class TaskProgressTests: XCTestCase {
    func testNestedAndQuotedTasks() {
        XCTAssertEqual(TaskProgress.parse("- [x] parent\n  - [ ] child\n  - [x] child\n- [ ] sibling\n- [X] uppercase"), TaskProgress(checked: 3, total: 5))
        XCTAssertEqual(TaskProgress.parse("> - [x] quoted\n\n- [ ] real\n\n```md\n- [x] example\n```"), TaskProgress(checked: 1, total: 2))
        XCTAssertEqual(TaskProgress.parse("1. [ ] first\n2. [X] second"), TaskProgress(checked: 1, total: 2))
    }

    func testCodeProseAndPropertiesAreExcluded() {
        for text in ["", "text [x] inline", "`- [x] inline code`", "    - [x] indented code", "~~~md\n- [x] fenced\n~~~", "<!--\n- [x] hidden\n-->"] {
            XCTAssertNil(TaskProgress.parse(text), text)
        }
        for text in [
            "---\nexample:\n  - [x] metadata\n---\n- [ ] real\r\n- [X] done",
            "\u{feff}---\nexample:\n  - [x] metadata\n...\n- [ ] real\n- [X] done",
            "```edgeever-frontmatter\nexample:\n  - [x] metadata\n```\n- [ ] real\n- [X] done",
            "---\n- [x] real\n\n---\n- [ ] real"
        ] {
            XCTAssertEqual(TaskProgress.parse(text), TaskProgress(checked: 1, total: 2), text)
        }
    }

    func testLocalSummariesRecomputeAfterEditsAndSupportLegacyResponses() throws {
        var memo = MemoDetail.localPlaceholder(id: "task-note", notebookId: "inbox", title: "Tasks", contentMarkdown: "- [ ] first\n- [ ] second", tags: [], createdAt: "2026-11-23T00:00:00Z")
        XCTAssertEqual(memo.asSummary().taskProgress, TaskProgress(checked: 0, total: 2))
        memo.contentMarkdown = "- [x] first\n- [x] second"
        XCTAssertEqual(memo.asSummary().taskProgress, TaskProgress(checked: 2, total: 2))
        let data = try JSONEncoder().encode(memo.asSummary())
        XCTAssertEqual(try JSONDecoder().decode(MemoSummary.self, from: data).taskProgress, TaskProgress(checked: 2, total: 2))
        memo.contentMarkdown = "No tasks remain"
        let legacyData = try JSONEncoder().encode(memo.asSummary())
        XCTAssertNil(try JSONDecoder().decode(MemoSummary.self, from: legacyData).taskProgress)
    }
}
