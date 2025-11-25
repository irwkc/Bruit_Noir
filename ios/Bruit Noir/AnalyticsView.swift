import SwiftUI

struct AnalyticsView: View {
    @EnvironmentObject private var appModel: AppViewModel
    private let ranges = [7, 30, 90]

    private var summary: AnalyticsResponse.Summary? {
        appModel.analyticsData?.summary
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    rangePicker

                    summarySection

                    productViewsSection
                }
                .padding()
            }
            .navigationTitle("Аналитика")
            .background(Color(.systemGroupedBackground))
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        Task { await appModel.fetchAnalytics(range: appModel.analyticsRange, force: true) }
                    } label: {
                        if appModel.analyticsLoading {
                            ProgressView()
                        } else {
                            Image(systemName: "arrow.clockwise")
                        }
                    }
                }
            }
            .task {
                if appModel.analyticsData == nil {
                    await appModel.fetchAnalytics(range: appModel.analyticsRange, force: true)
                }
            }
            .refreshable {
                await appModel.fetchAnalytics(range: appModel.analyticsRange, force: true)
            }
        }
    }

    private var rangePicker: some View {
        HStack(spacing: 12) {
            ForEach(ranges, id: \.self) { value in
                Button {
                    appModel.updateAnalyticsRange(value)
                } label: {
                    Text("\(value) дн.")
                        .font(.subheadline)
                        .fontWeight(appModel.analyticsRange == value ? .bold : .regular)
                        .padding(.vertical, 8)
                        .padding(.horizontal, 14)
                        .background(
                            Capsule()
                                .fill(appModel.analyticsRange == value ? Color.black : Color(.secondarySystemBackground))
                        )
                        .foregroundColor(appModel.analyticsRange == value ? .white : .primary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var summarySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Общее")
                .font(.headline)

            HStack(spacing: 16) {
                summaryCard(title: "Визитов", value: summary?.visits ?? 0)
                summaryCard(title: "Уникальные", value: summary?.uniqueVisitors ?? 0)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func summaryCard(title: String, value: Int) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text("\(value)")
                .font(.title)
                .bold()
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.08), radius: 10, y: 4)
        )
    }

    private var productViewsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Просмотры товаров")
                .font(.headline)

            if let stats = appModel.analyticsData?.productViews, !stats.isEmpty {
                VStack(spacing: 12) {
                    ForEach(stats) { stat in
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(stat.productName)
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.primary)
                                if let productId = stat.productId {
                                    Text(productId)
                                        .font(.caption2)
                                        .foregroundStyle(.secondary)
                                }
                            }

                            Spacer()
                            Text("\(stat.views)")
                                .font(.headline)
                                .foregroundColor(.primary)
                        }
                        .padding(.vertical, 4)
                    }
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(Color.white)
                        .shadow(color: .black.opacity(0.08), radius: 10, y: 4)
                )
            } else if appModel.analyticsLoading {
                ProgressView("Загружаем данные…")
                    .frame(maxWidth: .infinity, alignment: .leading)
            } else {
                Text("Нет данных за выбранный период.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

