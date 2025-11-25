import Foundation

actor AnalyticsService {
    static let shared = AnalyticsService()

    private init() {}

    func fetchAnalytics(range: Int?, from: Date?, to: Date?) async throws -> AnalyticsResponse {
        var query: [URLQueryItem] = []
        let formatter = DateFormatter.analyticsRequest

        if let from, let to {
            query.append(URLQueryItem(name: "from", value: formatter.string(from: from)))
            query.append(URLQueryItem(name: "to", value: formatter.string(from: to)))
        } else if let range {
            query.append(URLQueryItem(name: "range", value: String(range)))
        }

        return try await APIClient.shared.performRequest(
            "GET",
            path: "/api/admin/analytics",
            queryItems: query,
            decode: AnalyticsResponse.self
        )
    }
}

