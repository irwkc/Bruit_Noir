import Foundation

actor SettingsService {
    static let shared = SettingsService()

    private init() {}

    func fetchNotificationEmail() async throws -> String? {
        let response: NotificationEmailResponse = try await APIClient.shared.performRequest(
            "GET",
            path: "/api/admin/settings/notification-email",
            decode: NotificationEmailResponse.self
        )
        return response.email
    }

    func updateNotificationEmail(_ email: String?) async throws -> String? {
        struct Payload: Encodable { let email: String? }
        let response: NotificationEmailResponse = try await APIClient.shared.performRequest(
            "POST",
            path: "/api/admin/settings/notification-email",
            body: Payload(email: email?.isEmpty == false ? email : nil),
            decode: NotificationEmailResponse.self
        )
        return response.email
    }
}
