import Foundation

struct AdminUser: Codable, Identifiable {
    let id: String
    let email: String
    let name: String?
    let role: String?
    let isSuperAdmin: Bool?
    let totpEnabled: Bool?
    let createdAt: Date?
}

struct AdminListResponse: Codable {
    let admins: [AdminUser]
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
    
    var isShipped: Bool {
        let normalized = status.lowercased()
        return normalized == "shipped" || normalized == "delivered"
    }
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

struct Product: Codable, Identifiable, Hashable {
    let id: String
    var name: String
    var description: String
    var price: Double
    var images: [String]
    var category: String
    var sizes: [String]
    var colors: [String]
    var stock: Int
    var featured: Bool
    var available: Bool
    var createdAt: Date?
    var updatedAt: Date?

    var formattedPrice: String {
        Product.currencyFormatter.string(from: NSNumber(value: price)) ?? "—"
    }

    static let currencyFormatter: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "RUB"
        formatter.locale = Locale(identifier: "ru_RU")
        return formatter
    }()
}

struct ProductsListResponse: Decodable {
    struct Pagination: Decodable {
        let page: Int?
        let limit: Int?
        let total: Int?
        let totalPages: Int?
    }

    let data: [Product]
    let pagination: Pagination?

    init(from decoder: Decoder) throws {
        if let singleValueContainer = try? decoder.singleValueContainer(),
           let array = try? singleValueContainer.decode([Product].self) {
            data = array
            pagination = nil
        } else {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            data = try container.decode([Product].self, forKey: .data)
            pagination = try container.decodeIfPresent(Pagination.self, forKey: .pagination)
        }
    }

    private enum CodingKeys: String, CodingKey {
        case data
        case pagination
    }
}

struct ProductDraft: Encodable {
    var name: String
    var description: String
    var price: Double
    var images: [String]
    var category: String
    var sizes: [String]
    var colors: [String]
    var stock: Int
    var featured: Bool
    var available: Bool
}

struct UploadResponse: Decodable {
    let url: String?
}

// MARK: - Analytics

struct AnalyticsResponse: Codable {
    struct Summary: Codable {
        let visits: Int
        let uniqueVisitors: Int
    }

    struct DailyStat: Codable, Identifiable {
        let date: String
        let visits: Int
        let uniques: Int

        var id: String { date }
    }

    struct PathStat: Codable, Identifiable {
        let path: String
        let visits: Int

        var id: String { path }
    }

    struct ReferrerStat: Codable, Identifiable {
        let referrer: String
        let visits: Int

        var id: String { referrer }
    }

    struct DeviceStat: Codable, Identifiable {
        let deviceType: String
        let count: Int

        var id: String { deviceType }
    }

    struct ProductViewStat: Codable, Identifiable {
        let productId: String?
        let productName: String
        let views: Int

        var id: String { productId ?? productName }
    }

    let rangeDays: Int?
    let fromDate: Date?
    let toDate: Date?
    let summary: Summary
    let dailyStats: [DailyStat]
    let topPages: [PathStat]
    let topReferrers: [ReferrerStat]
    let devices: [DeviceStat]
    let productViews: [ProductViewStat]
}

extension Product {
    static func resolveImageURL(from value: String) -> URL? {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return nil }

        if let url = URL(string: trimmed), url.scheme != nil {
            return url
        }

        let normalized = trimmed.hasPrefix("/") ? String(trimmed.dropFirst()) : trimmed
        return URL(string: "https://bruitnoir.ru/\(normalized)")
    }

    var imageURLs: [URL] {
        images.compactMap { Product.resolveImageURL(from: $0) }
    }

    var primaryImageURL: URL? {
        imageURLs.first
    }
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
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let value = try container.decode(String.self)

            if let date = ISO8601DateFormatter.withFractional.date(from: value) {
                return date
            }

            if let date = ISO8601DateFormatter.withoutFractional.date(from: value) {
                return date
            }

            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Invalid ISO8601 date: \(value)")
        }
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

extension DateFormatter {
    static let analyticsRequest: DateFormatter = {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()
}

private extension ISO8601DateFormatter {
    static let withFractional: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        return formatter
    }()

    static let withoutFractional: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        return formatter
    }()
}
