import SwiftUI

@main
struct AgentLimitApp: App {
    @StateObject private var viewModel = UsageViewModel()

    var body: some Scene {
        MenuBarExtra {
            ContentView(viewModel: viewModel)
        } label: {
            MenuBarLabel(viewModel: viewModel)
        }
        .menuBarExtraStyle(.window)
    }
}

/// The label shown in the menu bar: a gauge icon plus the highest current usage.
struct MenuBarLabel: View {
    @ObservedObject var viewModel: UsageViewModel

    var body: some View {
        Label(text, systemImage: symbol)
    }

    private var text: String {
        guard let usage = viewModel.headlineUsage else { return "—" }
        return "\(usage)%"
    }

    private var symbol: String {
        guard let status = viewModel.status else { return "gauge.with.dots.needle.0percent" }
        switch status.status {
        case .warning: return "gauge.with.dots.needle.67percent"
        case .ok: return "gauge.with.dots.needle.33percent"
        default: return "gauge.with.dots.needle.0percent"
        }
    }
}
