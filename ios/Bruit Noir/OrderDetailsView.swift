import SwiftUI

struct OrderDetailsView: View {
    let order: Order

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
                LabeledContent("Создан", value: order.createdAt.formatted(date: .abbreviated, time: .shortened))
                LabeledContent("Обновлен", value: order.updatedAt.formatted(date: .abbreviated, time: .shortened))
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Заказ #" + order.id.prefix(8))
    }
}
