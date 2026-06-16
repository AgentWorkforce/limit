import Foundation

/// Supported usage providers.
enum ProviderName: String, CaseIterable, Identifiable {
    case codex
    case claude

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .claude: return "Claude"
        case .codex: return "Codex"
        }
    }

    /// Short description of where the data comes from (shown in the header).
    var sourceLabel: String {
        switch self {
        case .claude: return "Anthropic OAuth"
        case .codex: return "Codex RPC"
        }
    }
}

enum ProviderStatusType {
    case ok
    case warning
    case error
    case unavailable
    case loading
}

/// A single usage window (e.g. the 5-hour or weekly limit).
struct UsageMetric: Identifiable {
    let id = UUID()
    /// Human readable window name, e.g. "5-hour" or "Weekly".
    let name: String
    /// Percentage of the limit that has been *used* (0...100).
    let percentage: Double
    /// When this window resets, if known.
    let resetsAt: Date?
    /// Total duration of the window in seconds.
    let periodSeconds: Double
}

struct ProviderStatus {
    let provider: ProviderName
    let status: ProviderStatusType
    var plan: String?
    var metrics: [UsageMetric]
    var message: String?

    static func unavailable(_ provider: ProviderName, _ message: String) -> ProviderStatus {
        ProviderStatus(provider: provider, status: .unavailable, plan: nil, metrics: [], message: message)
    }

    static func failure(_ provider: ProviderName, _ message: String) -> ProviderStatus {
        ProviderStatus(provider: provider, status: .error, plan: nil, metrics: [], message: message)
    }
}

/// ISO-8601 parsing that tolerates fractional seconds (Anthropic) and plain
/// internet date-time strings.
enum DateParsing {
    private static let fractional: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()

    private static let plain: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime]
        return f
    }()

    static func date(from string: String) -> Date? {
        fractional.date(from: string) ?? plain.date(from: string)
    }
}
