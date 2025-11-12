import Foundation

actor OrdersService {
    static let shared = OrdersService()

    private init() {}

    func fetchOrders(limit: Int = 50, cursor: String? = nil) async throws -> AdminOrdersResponse {
        var items = [URLQueryItem(name: "limit", value: String(limit))]
        if let cursor {
            items.append(URLQueryItem(name: "cursor", value: cursor))
        }

        return try await APIClient.shared.performRequest(
            "GET",
            path: "/api/admin/orders",
            queryItems: items,
            decode: AdminOrdersResponse.self
        )
    }
}
