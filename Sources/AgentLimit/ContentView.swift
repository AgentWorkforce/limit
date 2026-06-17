import SwiftUI

/// The popover shown when the menu bar item is clicked.
struct ContentView: View {
    @ObservedObject var viewModel: UsageViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            header
            Divider()
            content
            Divider()
            footer
        }
        .padding(16)
        .frame(width: 380)
    }

    /// A low-key footer with the only quit affordance (the app is menu-bar-only,
    /// so there's no Dock icon or app menu to quit from).
    private var footer: some View {
        HStack {
            Spacer()
            Button("Quit") { NSApp.terminate(nil) }
                .buttonStyle(.plain)
                .font(.caption)
                .foregroundStyle(.secondary)
                .keyboardShortcut("q")
                .help("Quit Agent Limit")
        }
    }

    // MARK: Header

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            providerPicker

            Text(subtitle)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }

    /// Segmented control of brand icons, one per provider.
    private var providerPicker: some View {
        HStack(spacing: 4) {
            ForEach(ProviderName.allCases) { provider in
                let isSelected = provider == viewModel.selectedProvider
                Button {
                    viewModel.select(provider)
                } label: {
                    ProviderIcon(provider: provider, size: 17)
                        .opacity(isSelected ? 1 : 0.55)
                        .frame(width: 30, height: 26)
                        .background(
                            RoundedRectangle(cornerRadius: 7, style: .continuous)
                                .fill(isSelected ? provider.brandColor.opacity(0.16) : .clear)
                        )
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .help(provider.displayName)
            }
        }
        .padding(3)
        .background(
            Capsule(style: .continuous)
                .fill(Color.primary.opacity(0.06))
        )
    }

    private var subtitle: String {
        let updated: String
        if let last = viewModel.lastUpdated {
            let seconds = Int(Date().timeIntervalSince(last))
            switch seconds {
            case ..<5: updated = "just now"
            case ..<60: updated = "\(seconds)s ago"
            default: updated = "\(seconds / 60)m ago"
            }
        } else {
            updated = viewModel.isLoading ? "loading…" : "never"
        }
        return "Updated \(updated) · Source: \(viewModel.selectedProvider.sourceLabel)"
    }

    // MARK: Content

    @ViewBuilder
    private var content: some View {
        if let status = viewModel.status {
            switch status.status {
            case .unavailable, .error:
                messageView(status.message ?? "Usage is unavailable.")
            case .rateLimited:
                noticeView(status.message ?? "Rate-limited. Retrying shortly.")
            default:
                if status.metrics.isEmpty {
                    messageView("No active limit windows reported.")
                } else {
                    chartsView(plan: status.plan)
                }
            }
        } else {
            ProgressView()
                .frame(maxWidth: .infinity)
                .padding(.vertical, 36)
        }
    }

    private func chartsView(plan: String?) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            if let notice = viewModel.notice {
                noticeView(notice)
            }
            if let plan, !plan.isEmpty {
                Text("\(plan.prefix(1).capitalized + plan.dropFirst()) plan")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(Color.primary.opacity(0.06)))
            }
            ForEach(Array(viewModel.charts.enumerated()), id: \.offset) { _, item in
                if let data = item.data {
                    BurndownChartView(title: item.metric.name, data: data)
                } else {
                    SimpleUsageRow(metric: item.metric)
                }
            }
        }
    }

    private func messageView(_ message: String) -> some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.orange)
            Text(message)
                .font(.callout)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, 24)
    }

    /// A low-key, informational banner (e.g. transient rate-limit notice).
    private func noticeView(_ message: String) -> some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: "clock.arrow.circlepath")
                .foregroundStyle(.secondary)
            Text(message)
                .font(.caption)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(10)
        .background(RoundedRectangle(cornerRadius: 8, style: .continuous).fill(Color.primary.opacity(0.05)))
    }
}

/// Fallback row for windows that don't report a reset time (no burndown).
struct SimpleUsageRow: View {
    let metric: UsageMetric

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(metric.name)
                .font(.title3.weight(.bold))
            ProgressView(value: min(metric.percentage, 100), total: 100)
            Text("\(Int(metric.percentage.rounded()))% used")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }
}
