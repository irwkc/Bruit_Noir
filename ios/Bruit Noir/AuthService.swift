import Foundation

actor AuthService {
    static let shared = AuthService()

    private let keychain = KeychainStorage.shared
    private let accessKey = "admin.access"
    private let refreshKey = "admin.refresh"
    private let userKey = "admin.user"

    private init() {}

    func restoreSession() async -> (AdminUser, AuthTokens)? {
        guard let access = keychain.string(for: accessKey),
              let refresh = keychain.string(for: refreshKey),
              let userData = keychain.data(for: userKey),
              let user = try? JSONDecoder().decode(AdminUser.self, from: userData) else {
            return nil
        }

        let tokens = AuthTokens(accessToken: access, refreshToken: refresh)
        await APIClient.shared.updateTokens(tokens)
        return (user, tokens)
    }

    func persistSession(user: AdminUser, tokens: AuthTokens) throws {
        try keychain.set(tokens.accessToken, for: accessKey)
        try keychain.set(tokens.refreshToken, for: refreshKey)
        let data = try JSONEncoder().encode(user)
        try keychain.set(data, for: userKey)
        Task { await APIClient.shared.updateTokens(tokens) }
    }

    func clearSession() async {
        keychain.remove(accessKey)
        keychain.remove(refreshKey)
        keychain.remove(userKey)
        await APIClient.shared.updateTokens(nil)
    }

    func login(email: String, password: String, code: String?) async throws -> AdminLoginOutcome {
        struct Payload: Encodable {
            let email: String
            let password: String
            let code: String?
        }

        let payload = Payload(email: email, password: password, code: code)
        let encoder = JSONEncoder.apiEncoder
        var request = URLRequest(url: URL(string: "https://bruitnoir.ru/api/admin/login")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.httpBody = try encoder.encode(payload)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIClientError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200:
            let success = try JSONDecoder.apiDecoder.decode(AdminLoginSuccessResponse.self, from: data)
            let tokens = AuthTokens(accessToken: success.accessToken, refreshToken: success.refreshToken)
            try persistSession(user: success.user, tokens: tokens)
            await APIClient.shared.updateTokens(tokens)
            return .success(user: success.user, tokens: tokens)
        case 202:
            let totp = try JSONDecoder.apiDecoder.decode(TotpSetupResponse.self, from: data)
            return .requiresTotp(info: totp)
        case 400:
            let message = (try? JSONDecoder.apiDecoder.decode(ErrorResponse.self, from: data))?.message
            throw APIClientError.serverError(message: message, statusCode: 400)
        case 401:
            throw APIClientError.unauthorized
        default:
            let message = (try? JSONDecoder.apiDecoder.decode(ErrorResponse.self, from: data))?.message
            throw APIClientError.serverError(message: message, statusCode: httpResponse.statusCode)
        }
    }

    func refresh(tokens: AuthTokens) async throws -> (AdminUser, AuthTokens) {
        struct Payload: Encodable { let refreshToken: String }
        let response: AdminLoginSuccessResponse = try await APIClient.shared.performRequest(
            "POST",
            path: "/api/admin/token/refresh",
            body: Payload(refreshToken: tokens.refreshToken),
            decode: AdminLoginSuccessResponse.self
        )

        let newTokens = AuthTokens(accessToken: response.accessToken, refreshToken: response.refreshToken)
        try persistSession(user: response.user, tokens: newTokens)
        return (response.user, newTokens)
    }
}

enum AdminLoginOutcome {
    case success(user: AdminUser, tokens: AuthTokens)
    case requiresTotp(info: TotpSetupResponse)
}

private struct ErrorResponse: Decodable {
    let message: String?
    let error: String?
}
