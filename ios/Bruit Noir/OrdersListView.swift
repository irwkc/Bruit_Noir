import SwiftUI

struct OrdersListView: View {
    @EnvironmentObject var appModel: AppViewModel
    
    private var pendingOrders: [Order] {
        appModel.orders.filter { !$0.isShipped }
    }
    
    private var shippedOrders: [Order] {
        appModel.orders.filter(\.isShipped)
    }

    var body: some View {
        NavigationStack {
            Group {
                if appModel.orders.isEmpty && appModel.ordersLoading {
                    ProgressView("Загружаем заказы…")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if appModel.orders.isEmpty {
                    ContentUnavailableView(
                        "Заказы отсутствуют",
                        systemImage: "shippingbox",
                        description: Text("Новые заказы появятся здесь автоматически")
                    )
                } else {
                    List {
                        if !pendingOrders.isEmpty {
                            Section("Не отправленные") {
                                ForEach(pendingOrders) { order in
                                    NavigationLink(value: order) {
                                        OrderRowView(order: order)
                                    }
                                }
                            }
                        }

                        if !shippedOrders.isEmpty {
                            Section("Отправленные") {
                                ForEach(shippedOrders) { order in
                                    NavigationLink(value: order) {
                                        OrderRowView(order: order)
                                    }
                                }
                            }
                        }

                        if let nextCursor = appModel.nextCursor, !appModel.orders.isEmpty {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                                .task {
                                    await appModel.fetchOrders(reset: false)
                                }
                                .id(nextCursor)
                        }
                    }
                    .listStyle(.insetGrouped)
                }
            }
        .navigationTitle("Заказы")
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button {
                    Task { await appModel.fetchOrders(reset: true) }
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
                .disabled(appModel.ordersLoading)
            }
        }
        .task {
            if appModel.orders.isEmpty {
                await appModel.fetchOrders(reset: true)
            }
        }
        .refreshable {
            await appModel.fetchOrders(reset: true)
        }
        .navigationDestination(for: Order.self) { order in
            OrderDetailsView(order: order)
        }
    }
    }
}

private struct OrderRowView: View {
    let order: Order

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("Заказ #" + order.id.prefix(8))
                    .fontWeight(.semibold)
                Spacer()
                Text(order.formattedTotal)
                    .font(.headline)
            }

            Text(order.customerName)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            HStack(spacing: 8) {
                BadgeView(text: order.status.localizedUppercase, tint: .blue)
                BadgeView(text: order.paymentStatus.localizedUppercase, tint: order.paymentStatus.lowercased() == "paid" ? .green : .orange)
                BadgeView(text: order.deliveryMethod.uppercased(), tint: .gray)
            }
            .font(.caption2)
            .foregroundStyle(.white)

            Text(order.createdAt.formatted(date: .abbreviated, time: .shortened))
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, 6)
    }
}

private struct BadgeView: View {
    let text: String
    let tint: Color

    var body: some View {
        Text(text)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(tint.opacity(0.9), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}
