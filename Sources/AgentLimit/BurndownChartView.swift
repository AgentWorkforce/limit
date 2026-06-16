import SwiftUI
import Charts

/// Renders one limit window as a burndown chart: a dashed ideal line, the real
/// usage curve, the shaded gap between them, and pace badges.
struct BurndownChartView: View {
    let title: String
    let data: BurndownData

    private var accent: Color { data.isOverPace ? .red : .green }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.title3.weight(.bold))

            chart
                .frame(height: 150)

            HStack {
                Text(data.windowStart, format: axisFormat)
                Spacer()
                Text(data.windowEnd, format: axisFormat)
            }
            .font(.caption)
            .foregroundStyle(.secondary)
        }
    }

    private var axisFormat: Date.FormatStyle {
        data.compact
            ? .dateTime.hour().minute()
            : .dateTime.month(.abbreviated).day().hour().minute()
    }

    private var chart: some View {
        Chart {
            // Shaded gap between the actual and ideal curves.
            ForEach(data.actualPoints) { point in
                AreaMark(
                    x: .value("Time", point.date),
                    yStart: .value("Ideal", point.ideal),
                    yEnd: .value("Actual", point.actual)
                )
                .foregroundStyle(accent.opacity(0.18))
                .interpolationMethod(.linear)
            }

            // Ideal burndown (dashed, full window).
            ForEach(data.idealLine) { point in
                LineMark(
                    x: .value("Time", point.date),
                    y: .value("Remaining", point.value),
                    series: .value("Series", "ideal")
                )
                .foregroundStyle(Color.accentColor.opacity(0.55))
                .lineStyle(StrokeStyle(lineWidth: 1.5, dash: [5, 4]))
                .interpolationMethod(.linear)
            }

            // Actual usage curve.
            ForEach(data.actualPoints) { point in
                LineMark(
                    x: .value("Time", point.date),
                    y: .value("Remaining", point.actual),
                    series: .value("Series", "actual")
                )
                .foregroundStyle(Color.blue)
                .lineStyle(StrokeStyle(lineWidth: 2.5, lineJoin: .round))
                .interpolationMethod(.linear)
            }

            // Vertical connector at "now" showing the pace gap.
            RuleMark(
                x: .value("Now", data.now),
                yStart: .value("Remaining", min(data.actualRemaining, data.idealRemaining)),
                yEnd: .value("Remaining", max(data.actualRemaining, data.idealRemaining))
            )
            .foregroundStyle(accent)
            .lineStyle(StrokeStyle(lineWidth: 2))

            // Current position marker.
            PointMark(
                x: .value("Now", data.now),
                y: .value("Remaining", data.actualRemaining)
            )
            .foregroundStyle(Color.blue)
            .symbolSize(70)
        }
        .chartYScale(domain: 0.0...100.0)
        .chartXScale(domain: data.windowStart...data.windowEnd)
        .chartXAxis(.hidden)
        .chartYAxis {
            AxisMarks(position: .leading, values: [0.0, 50.0, 100.0]) { value in
                AxisGridLine()
                AxisValueLabel {
                    if let v = value.as(Double.self) {
                        Text("\(Int(v))%")
                    }
                }
            }
        }
        .overlay(alignment: .topTrailing) { paceBadges }
    }

    private var paceBadges: some View {
        VStack(alignment: .trailing, spacing: 3) {
            Text("\(Int(data.actualRemaining.rounded()))%")
                .font(.caption.weight(.bold))
                .foregroundStyle(.white)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(Color.blue, in: RoundedRectangle(cornerRadius: 5))

            Text("\(abs(Int(data.paceDelta.rounded())))% \(data.isOverPace ? "Over pace" : "Under pace")")
                .font(.caption.weight(.bold))
                .foregroundStyle(accent)

            Text("\(Int(data.idealRemaining.rounded()))%")
                .font(.caption)
                .foregroundStyle(.secondary)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(Color(nsColor: .controlBackgroundColor), in: RoundedRectangle(cornerRadius: 5))
        }
        .padding(6)
    }
}
