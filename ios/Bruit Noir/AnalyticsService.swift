import Foundation

actor AnalyticsService {
    static let shared = AnalyticsService()

    private init() {}

    func fetchAnalytics(range: Int) async throws -> AnalyticsResponse {
        let query = [URLQueryItem(name: "range", value: String(range))]
        return try await APIClient.shared.performRequest(
            "GET",
            path: "/api/admin/analytics",
            queryItems: query,
            decode: AnalyticsResponse.self
        )
    }
}

