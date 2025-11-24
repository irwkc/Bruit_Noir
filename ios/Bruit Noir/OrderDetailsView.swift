import SwiftUI

struct OrderDetailsView: View {
    let order: Order
    @EnvironmentObject var appModel: AppViewModel
    @State private var isUpdatingStatus = false
    @State private var showConfirmDialog = false

    var body: some View {
        List {
            Section("Клиент") {
                LabeledContent("Имя", value: order.customerName)
                LabeledContent("Email", value: order.customerEmail)
                LabeledContent("Телефон", value: order.customerPhone)
            }

            Section("Оплата") {
                LabeledContent("Статус", value: order.paymentStatus)
                LabeledContent("Метод", value: order.paymentMethod ?? "—")
                LabeledContent("Сумма", value: order.formattedTotal)
            }

            Section("Доставка") {
                LabeledContent("Метод", value: order.deliveryMethod.uppercased())
                if let point = order.deliveryPoint {
                    LabeledContent("ПВЗ", value: point.name)
                    LabeledContent("Адрес", value: point.address)
                    LabeledContent("Город", value: point.city)
                    LabeledContent("Телефон", value: point.phone ?? "—")
                }
                if let address = order.address, !address.isEmpty {
                    LabeledContent("Адрес", value: address)
                }
                if let postal = order.postalCode, !postal.isEmpty {
                    LabeledContent("Индекс", value: postal)
                }
            }

            Section("Товары") {
                ForEach(order.orderItems) { item in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(item.product?.name ?? "Товар")
                            .fontWeight(.semibold)
                        Text("Количество: \(item.quantity)")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                        Text("Размер: \(item.size) · Цвет: \(item.color)")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                        Text(Order.currencyFormatter.string(from: NSNumber(value: item.lineTotal)) ?? "")
                            .font(.headline)
                    }
                    .padding(.vertical, 4)
                }
            }

            Section("Служебное") {
                LabeledContent("ID заказа", value: order.id)
                LabeledContent("Статус", value: order.status)
                LabeledContent("Создан", value: order.createdAt.formatted(date: .abbreviated, time: .shortened))
                LabeledContent("Обновлен", value: order.updatedAt.formatted(date: .abbreviated, time: .shortened))
            }

            // Кнопка "Отправить" для заказов, которые еще не отправлены
            if order.status != "shipped" && order.status != "delivered" && order.status != "cancelled" {
                Section {
                    Button {
                        showConfirmDialog = true
                    } label: {
                        HStack {
                            Spacer()
                            if isUpdatingStatus {
                                ProgressView()
                                    .padding(.trailing, 8)
                            }
                            Text("Отправить заказ")
                                .fontWeight(.semibold)
                            Spacer()
                        }
                    }
                    .disabled(isUpdatingStatus)
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Заказ #" + order.id.prefix(8))
        .confirmationDialog("Отправить заказ?", isPresented: $showConfirmDialog) {
            Button("Отправить", role: .destructive) {
                Task {
                    isUpdatingStatus = true
                    await appModel.updateOrderStatus(orderId: order.id, status: "shipped")
                    isUpdatingStatus = false
                }
            }
            Button("Отмена", role: .cancel) {}
        } message: {
            Text("Заказ будет помечен как отправленный, и клиенту будет отправлено уведомление на email.")
        }
    }
}
