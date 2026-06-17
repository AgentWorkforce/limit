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

/// The label shown in the menu bar: a flame that grows with the highest current
/// usage, fills (turns "hot") when that window is burning off its target pace,
/// and is colored by severity. The flame is rendered to a non-template image so
/// the menu bar preserves its color instead of flattening it to monochrome.
struct MenuBarLabel: View {
    @ObservedObject var viewModel: UsageViewModel

    var body: some View {
        HStack(spacing: 3) {
            Image(nsImage: flameImage)
                .renderingMode(.original)
            Text(text)
        }
    }

    private var text: String {
        guard let usage = viewModel.headlineUsage else { return "—" }
        return "\(usage)%"
    }

    /// Outline flame while on pace; a solid "hot" flame once over pace.
    private var symbol: String {
        viewModel.headlineOffTarget ? "flame.fill" : "flame"
    }

    /// The flame literally grows with usage: ~11pt empty → ~17pt near the limit.
    private var flameSize: CGFloat {
        let usage = Double(viewModel.headlineUsage ?? 0)
        return 11 + CGFloat(min(1, usage / 100)) * 6
    }

    /// Green when there's plenty of headroom, warming through yellow/orange as
    /// usage climbs, and red whenever the window is off its target pace.
    private var flameColor: Color {
        if viewModel.headlineOffTarget { return .red }
        switch viewModel.headlineUsage ?? 0 {
        case ..<50: return .green
        case ..<80: return .yellow
        default: return .orange
        }
    }

    /// Rasterizes the colored flame. `isTemplate = false` stops the menu bar from
    /// re-tinting it monochrome.
    private var flameImage: NSImage {
        let renderer = ImageRenderer(content:
            Image(systemName: symbol)
                .font(.system(size: flameSize, weight: .semibold))
                .foregroundStyle(flameColor)
                .padding(1)
        )
        renderer.scale = 2
        let image = renderer.nsImage ?? NSImage()
        image.isTemplate = false
        return image
    }
}
