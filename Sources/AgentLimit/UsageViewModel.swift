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

    let refreshInterval: TimeInterval = 60

    private var timer: Timer?
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
        Task { await refresh() }
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
        Task { await refresh() }
    }

    func refresh() async {
        guard let provider = providers[selectedProvider] else { return }
        isLoading = true
        let result = await provider.fetch()
        let now = Date()

        var built: [(metric: UsageMetric, data: BurndownData?)] = []
        if result.status == .ok || result.status == .warning {
            for metric in result.metrics {
                let samples = UsageHistoryStore.shared.record(provider: result.provider, metric: metric, at: now)
                let data = BurndownBuilder.build(metric: metric, samples: samples, now: now)
                built.append((metric, data))
            }
        }

        // Ignore results for a provider the user switched away from mid-flight.
        guard result.provider == selectedProvider else {
            isLoading = false
            return
        }

        status = result
        charts = built
        lastUpdated = now
        isLoading = false
    }

    /// Highest used percentage across windows, for the menu bar label.
    var headlineUsage: Int? {
        guard let metrics = status?.metrics, let max = metrics.map(\.percentage).max() else { return nil }
        return Int(max.rounded())
    }
}
