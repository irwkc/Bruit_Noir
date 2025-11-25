import SwiftUI

struct AnalyticsView: View {
    @EnvironmentObject private var appModel: AppViewModel
    private let ranges = [7, 30, 90]
    @State private var showingDateSheet = false
    @State private var tempFromDate = Date()
    @State private var tempToDate = Date()

    private var summary: AnalyticsResponse.Summary? {
        appModel.analyticsData?.summary
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        rangePicker
                        summarySection
                        productViewsSection
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 32)
                }
            }
            .navigationTitle("Аналитика")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        Task { await refreshAnalytics() }
                    } label: {
                        if appModel.analyticsLoading {
                            ProgressView()
                                .tint(.white)
                        } else {
                            Image(systemName: "arrow.clockwise")
                                .foregroundColor(.white)
                        }
                    }
                }
            }
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarBackground(Color.black, for: .navigationBar)
            .task {
                if appModel.analyticsData == nil {
                    await refreshAnalytics()
                }
            }
            .refreshable {
                await refreshAnalytics()
            }
        }
    }

    private var rangePicker: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                ForEach(ranges, id: \.self) { value in
                    Button {
                        appModel.updateAnalyticsRange(value)
                    } label: {
                        Text("\(value) дн.")
                            .font(.subheadline)
                            .fontWeight(!appModel.analyticsUsesCustomRange && appModel.analyticsRange == value ? .bold : .regular)
                            .padding(.vertical, 8)
                            .padding(.horizontal, 14)
                            .background(
                                Capsule()
                                    .fill(Color.white.opacity(!appModel.analyticsUsesCustomRange && appModel.analyticsRange == value ? 0.25 : 0.1))
                                    .overlay(
                                        Capsule()
                                            .stroke(Color.white.opacity(0.25), lineWidth: 1)
                                    )
                            )
                            .foregroundColor(.white)
                    }
                }
            }

            Button {
                tempFromDate = appModel.analyticsFromDate ?? Calendar.current.date(byAdding: .day, value: -6, to: Date()) ?? Date()
                tempToDate = appModel.analyticsToDate ?? Date()
                showingDateSheet = true
            } label: {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Выбрать даты")
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(.white)
                        Text(customRangeLabel)
                            .font(.footnote)
                            .foregroundStyle(Color.white.opacity(0.7))
                    }
                    Spacer()
                    Image(systemName: "calendar")
                        .foregroundColor(.white)
                }
                .padding(14)
                .background(glassBackground)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .sheet(isPresented: $showingDateSheet) {
            NavigationStack {
                Form {
                    DatePicker("Дата начала", selection: $tempFromDate, displayedComponents: .date)
                    DatePicker("Дата окончания", selection: $tempToDate, displayedComponents: .date)
                }
                .navigationTitle("Период")
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Отмена") { showingDateSheet = false }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Готово") {
                            showingDateSheet = false
                            appModel.setAnalyticsCustomRange(from: tempFromDate, to: tempToDate)
                        }
                    }
                }
            }
        }
    }

    private func refreshAnalytics() async {
        await appModel.fetchAnalytics(
            range: appModel.analyticsUsesCustomRange ? nil : appModel.analyticsRange,
            from: appModel.analyticsUsesCustomRange ? appModel.analyticsFromDate : nil,
            to: appModel.analyticsUsesCustomRange ? appModel.analyticsToDate : nil,
            force: true
        )
    }

    private var customRangeLabel: String {
        guard let from = appModel.analyticsFromDate, let to = appModel.analyticsToDate else {
            return "Например, 28 янв — 29 янв"
        }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        formatter.locale = Locale(identifier: "ru_RU")
        return "\(formatter.string(from: from)) — \(formatter.string(from: to))"
    }

    private var summarySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Общее")
                .font(.title3.bold())
                .foregroundColor(.white)

            VStack(spacing: 14) {
                summaryCard(title: "Визитов", value: summary?.visits ?? 0)
                summaryCard(title: "Уникальные посетители", value: summary?.uniqueVisitors ?? 0)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func summaryCard(title: String, value: Int) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.footnote)
                .foregroundStyle(Color.white.opacity(0.7))
            Text("\(value)")
                .font(.system(size: 28, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(glassBackground)
    }

    private var productViewsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Просмотры товаров")
                .font(.title3.bold())
                .foregroundColor(.white)

            if let stats = appModel.analyticsData?.productViews, !stats.isEmpty {
                VStack(spacing: 12) {
                    ForEach(stats) { stat in
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(stat.productName)
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundColor(.white)
                                if let productId = stat.productId {
                                    Text(productId)
                                        .font(.caption2)
                                        .foregroundStyle(Color.white.opacity(0.5))
                                }
                            }

                            Spacer()
                            Text("\(stat.views)")
                                .font(.headline)
                                .foregroundColor(.white)
                        }
                        .padding(.vertical, 4)
                    }
                }
                .padding(18)
                .background(glassBackground)
            } else if appModel.analyticsLoading {
                ProgressView("Загружаем данные…")
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .tint(.white)
            } else {
                Text("Нет данных за выбранный период.")
                    .font(.subheadline)
                    .foregroundStyle(Color.white.opacity(0.6))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var glassBackground: some View {
        RoundedRectangle(cornerRadius: 24, style: .continuous)
            .fill(Color.white.opacity(0.08))
            .overlay(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.4), radius: 20, y: 10)
    }
}

