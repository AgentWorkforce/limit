import SwiftUI

/// Drives data loading and exposes view state to SwiftUI. Refreshes on a timer
/// so the menu bar label stays current even while the popover is closed.
@MainActor
final class UsageViewModel: ObservableObject {
    @Published private(set) var selectedProvider: ProviderName
    @Published private(set) var status: ProviderStatus?
    @Published private(set) var charts: [(metric: UsageMetric, data: BurndownData?)] = []
    @Published private(set) var lastUpdated: Date?
    @Published private(set) var isLoading = false
    /// Transient banner (e.g. rate-limit notice) shown alongside stale data.
    @Published private(set) var notice: String?

    let refreshInterval: TimeInterval = 60

    private var timer: Timer?
    /// While set, scheduled (non-forced) refreshes are skipped to let a 429 clear.
    private var backoffUntil: Date?
    private var consecutiveRateLimits = 0
    private let providers: [ProviderName: UsageProvider] = [
        .claude: ClaudeProvider(),
        .codex: CodexProvider(),
    ]

    init() {
        if let raw = UserDefaults.standard.string(forKey: "selectedProvider"),
           let provider = ProviderName(rawValue: raw) {
            selectedProvider = provider
        } else {
            selectedProvider = .codex
        }
        start()
    }

    private func start() {
        Task { await refresh(force: true) }
        timer = Timer.scheduledTimer(withTimeInterval: refreshInterval, repeats: true) { [weak self] _ in
            Task { await self?.refresh() }
        }
    }

    func select(_ provider: ProviderName) {
        guard provider != selectedProvider else { return }
        selectedProvider = provider
        UserDefaults.standard.set(provider.rawValue, forKey: "selectedProvider")
        status = nil
        charts = []
        notice = nil
        // New provider has its own rate-limit budget; clear any pending backoff.
        backoffUntil = nil
        consecutiveRateLimits = 0
        Task { await refresh(force: true) }
    }

    /// - Parameter force: bypass the rate-limit backoff (user-initiated refresh).
    func refresh(force: Bool = false) async {
        guard let provider = providers[selectedProvider] else { return }
        if !force, let until = backoffUntil, Date() < until { return }
        isLoading = true
        let result = await provider.fetch()
        let now = Date()

        // Ignore results for a provider the user switched away from mid-flight.
        guard result.provider == selectedProvider else {
            isLoading = false
            return
        }

        // Rate-limited: keep the last good reading on screen and back off so we
        // stop hammering the endpoint while the limit clears.
        if result.status == .rateLimited {
            consecutiveRateLimits += 1
            let delay = min(15 * 60, refreshInterval * pow(2, Double(consecutiveRateLimits)))
            backoffUntil = now.addingTimeInterval(delay)
            if status == nil || (status?.metrics.isEmpty ?? true) {
                status = result   // nothing prior to show; surface the notice itself
            } else {
                notice = result.message
            }
            isLoading = false
            return
        }

        backoffUntil = nil
        consecutiveRateLimits = 0
        notice = nil

        var built: [(metric: UsageMetric, data: BurndownData?)] = []
        if result.status == .ok || result.status == .warning {
            for metric in result.metrics {
                let samples = UsageHistoryStore.shared.record(provider: result.provider, metric: metric, at: now)
                let data = BurndownBuilder.build(metric: metric, samples: samples, now: now)
                built.append((metric, data))
            }
        }

        status = result
        charts = built
        lastUpdated = now
        isLoading = false
    }

    /// The busiest window (highest used percentage), driving the menu bar label.
    private var headlineMetric: UsageMetric? {
        status?.metrics.max(by: { $0.percentage < $1.percentage })
    }

    /// Highest used percentage across windows, for the menu bar label.
    var headlineUsage: Int? {
        guard let metric = headlineMetric else { return nil }
        return Int(metric.percentage.rounded())
    }

    /// True when the busiest window is burning faster than its ideal pace
    /// ("off target"). Falls back to a high-usage threshold when the window has
    /// no burndown data (no known reset time).
    var headlineOffTarget: Bool {
        guard let metric = headlineMetric else { return false }
        if let data = charts.first(where: { $0.metric.id == metric.id })?.data {
            return data.isOverPace
        }
        return metric.percentage >= 80
    }
}
