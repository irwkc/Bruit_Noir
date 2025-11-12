import Foundation

struct AdminUser: Codable, Identifiable {
    let id: String
    let email: String
    let name: String?
    let role: String
}

struct AuthTokens: Codable {
    let accessToken: String
    let refreshToken: String
}

struct AdminLoginSuccessResponse: Codable {
    let accessToken: String
    let refreshToken: String
    let user: AdminUser
}

struct TotpSetupResponse: Codable {
    let requiresTotpSetup: Bool
    let qrCodeDataUrl: String?
    let otpauthUrl: String?
    let message: String?
}

struct AdminOrdersResponse: Codable {
    let data: [Order]
    let nextCursor: String?
}

struct Order: Codable, Identifiable, Hashable {
    let id: String
    let status: String
    let total: Double
    let deliveryMethod: String
    let deliveryPointId: String?
    let address: String?
    let postalCode: String?
    let paymentStatus: String
    let paymentMethod: String?
    let customerName: String
    let customerEmail: String
    let customerPhone: String
    let createdAt: Date
    let updatedAt: Date
    let orderItems: [OrderItem]
    let deliveryPoint: DeliveryPoint?

    var formattedTotal: String {
        Order.currencyFormatter.string(from: NSNumber(value: total)) ?? "—"
    }

    static let currencyFormatter: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "RUB"
        formatter.locale = Locale(identifier: "ru_RU")
        return formatter
    }()
}

extension Order {
    static func == (lhs: Order, rhs: Order) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

struct OrderItem: Codable, Identifiable, Hashable {
    let id: String
    let productId: String
    let quantity: Int
    let price: Double
    let size: String
    let color: String
    let product: Product?

    var lineTotal: Double {
        Double(quantity) * price
    }
}

extension OrderItem {
    static func == (lhs: OrderItem, rhs: OrderItem) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

struct Product: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let price: Double
    let images: [String]?
    let category: String
}

struct DeliveryPoint: Codable, Identifiable {
    let id: String
    let name: String
    let address: String
    let city: String
    let country: String
    let phone: String?
    let workingHours: String?
}

struct NotificationEmailResponse: Codable {
    let email: String?
}

extension JSONDecoder {
    static var apiDecoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }
}

extension JSONEncoder {
    static var apiEncoder: JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.withoutEscapingSlashes]
        return encoder
    }
}
