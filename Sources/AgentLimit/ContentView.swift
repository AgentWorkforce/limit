import SwiftUI

/// The popover shown when the menu bar item is clicked.
struct ContentView: View {
    @ObservedObject var viewModel: UsageViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            header
            Divider()
            content
        }
        .padding(16)
        .frame(width: 380)
    }

    // MARK: Header

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                Text("Provider:")
                    .foregroundStyle(.secondary)

                Picker("Provider", selection: providerBinding) {
                    ForEach(ProviderName.allCases) { provider in
                        Text(provider.displayName).tag(provider)
                    }
                }
                .labelsHidden()
                .fixedSize()

                Spacer()

                Button {
                    Task { await viewModel.refresh() }
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
                .buttonStyle(.borderless)
                .help("Refresh now")

                Button {
                    NSApp.terminate(nil)
                } label: {
                    Image(systemName: "power")
                }
                .buttonStyle(.borderless)
                .help("Quit Agent Limit")
            }

            Text(subtitle)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }

    private var providerBinding: Binding<ProviderName> {
        Binding(
            get: { viewModel.selectedProvider },
            set: { viewModel.select($0) }
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
        VStack(alignment: .leading, spacing: 20) {
            if let plan {
                Text("\(plan) plan")
                    .font(.caption)
                    .foregroundStyle(.secondary)
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
