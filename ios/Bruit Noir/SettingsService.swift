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
    
    func fetchSiteLockStatus() async throws -> Bool {
        let response: SiteLockStatus = try await APIClient.shared.performRequest(
            "GET",
            path: "/api/admin/site-lock",
            decode: SiteLockStatus.self
        )
        return response.siteLocked
    }
    
    func updateSiteLock(locked: Bool, password: String?) async throws -> Bool {
        let response: SiteLockUpdateResponse = try await APIClient.shared.performRequest(
            "POST",
            path: "/api/admin/site-lock",
            body: SiteLockUpdateRequest(siteLocked: locked, password: password),
            decode: SiteLockUpdateResponse.self
        )
        return response.siteLocked
    }
}
