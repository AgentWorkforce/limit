import SwiftUI
import AppKit

extension ProviderName {
    /// Brand accent color used for the provider's selected icon.
    var brandColor: Color {
        switch self {
        case .claude: return Color(red: 0.85, green: 0.47, blue: 0.34)   // Claude coral #D97757
        case .codex: return Color(red: 0.06, green: 0.64, blue: 0.50)    // OpenAI green #10A37F
        }
    }

    /// Resource name of the bundled lobe-icons SVG.
    private var iconResource: String {
        switch self {
        case .claude: return "claude"
        case .codex: return "codex"
        }
    }

    /// Loads the brand SVG as a template image so it can be tinted. Falls back to
    /// `nil` if the asset can't be loaded (the view substitutes an SF Symbol).
    var brandImage: NSImage? {
        BrandIconCache.shared.image(named: iconResource)
    }

    /// SF Symbol fallback when the SVG can't be rendered.
    var fallbackSymbol: String {
        switch self {
        case .claude: return "sparkle"
        case .codex: return "chevron.left.forwardslash.chevron.right"
        }
    }
}

/// Caches tinted-template `NSImage`s loaded from the bundled SVG resources.
private final class BrandIconCache {
    static let shared = BrandIconCache()
    private var cache: [String: NSImage] = [:]

    func image(named name: String) -> NSImage? {
        if let cached = cache[name] { return cached }
        guard let url = Bundle.module.url(forResource: name, withExtension: "svg"),
              let image = NSImage(contentsOf: url) else {
            return nil
        }
        image.isTemplate = true
        cache[name] = image
        return image
    }
}

/// Renders a provider's brand icon, tinted to the given color, with an SF Symbol
/// fallback if the SVG can't be loaded.
struct ProviderIcon: View {
    let provider: ProviderName
    var size: CGFloat = 18

    var body: some View {
        Group {
            if let image = provider.brandImage {
                Image(nsImage: image)
                    .resizable()
                    .renderingMode(.template)
                    .interpolation(.high)
            } else {
                Image(systemName: provider.fallbackSymbol)
                    .resizable()
            }
        }
        .scaledToFit()
        .frame(width: size, height: size)
    }
}
