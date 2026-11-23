import Foundation
import Markdown

struct TaskProgress: Codable, Equatable, Sendable {
    var checked: Int
    var total: Int

    static func parse(_ markdown: String) -> TaskProgress? {
        guard markdown.contains("[") else { return nil }
        var body = markdown.replacingOccurrences(of: "\r\n", with: "\n")
            .replacingOccurrences(of: "\r", with: "\n")
        // Only closed leading properties are excluded; ordinary horizontal
        // rules and the Markdown between them remain part of the document.
        let pattern = #"\A\uFEFF?---[ \t]*\n([\s\S]*?)^(?:---|\.\.\.)[ \t]*(?:\n|$)"#
        if let expression = try? NSRegularExpression(pattern: pattern, options: .anchorsMatchLines),
           let match = expression.firstMatch(in: body, range: NSRange(body.startIndex..., in: body)),
           let sourceRange = Range(match.range(at: 1), in: body),
           body[sourceRange].contains(":"),
           let headerRange = Range(match.range, in: body) {
            body.removeSubrange(headerRange)
        }
        var progress = TaskProgress(checked: 0, total: 0)
        let lines = body.components(separatedBy: "\n")
        var pending: [any Markup] = [Document(parsing: body)]
        while let node = pending.popLast() {
            if let item = node as? ListItem, let checkbox = item.checkbox ?? sourceCheckbox(item, lines: lines) {
                progress.total += 1
                if checkbox == .checked { progress.checked += 1 }
            }
            pending.append(contentsOf: node.children)
        }
        return progress.total > 0 ? progress : nil
    }

    // swift-cmark can leave quoted task items as ordinary list items. Inspect
    // only the original marker of a parsed list item, never prose or code.
    private static func sourceCheckbox(_ item: ListItem, lines: [String]) -> Checkbox? {
        guard let start = item.range?.lowerBound, lines.indices.contains(start.line - 1) else { return nil }
        let source = String(decoding: lines[start.line - 1].utf8.dropFirst(start.column - 1), as: UTF8.self)
        let pattern = #"^(?:[-+*]|[0-9]{1,9}[.)])[ \t]+\[([ xX])\](?:[ \t]+|$)"#
        guard let expression = try? NSRegularExpression(pattern: pattern),
              let match = expression.firstMatch(in: source, range: NSRange(source.startIndex..., in: source)),
              let state = Range(match.range(at: 1), in: source) else { return nil }
        return source[state] == " " ? .unchecked : .checked
    }
}
