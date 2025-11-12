import Foundation

enum APIClientError: LocalizedError {
    case invalidURL
    case invalidResponse
    case unauthorized
    case decodingFailed
    case serverError(message: String?, statusCode: Int)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Неверный адрес запроса"
        case .invalidResponse:
            return "Неверный ответ сервера"
        case .unauthorized:
            return "Требуется авторизация"
        case .decodingFailed:
            return "Не удалось обработать ответ сервера"
        case let .serverError(message, status):
            return message ?? "Ошибка сервера (\(status))"
        }
    }
}

actor APIClient {
    static let shared = APIClient()

    private let baseURL = URL(string: "https://bruitnoir.ru")!
    private var tokens: AuthTokens?

    private init() {}

    func updateTokens(_ tokens: AuthTokens?) {
        self.tokens = tokens
    }

    func performRequest<T: Decodable>(_ method: String,
                                      path: String,
                                      queryItems: [URLQueryItem]? = nil,
                                      body: Encodable? = nil,
                                      decode type: T.Type) async throws -> T {
        var components = URLComponents(url: baseURL.appendingPathComponent(path), resolvingAgainstBaseURL: false)
        components?.queryItems = queryItems?.isEmpty == true ? nil : queryItems

        guard let url = components?.url else {
            throw APIClientError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let body {
            request.httpBody = try JSONEncoder.apiEncoder.encode(AnyEncodable(body))
        }

        if let accessToken = tokens?.accessToken {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIClientError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200...299:
            do {
                if T.self == EmptyResponse.self || data.isEmpty {
                    return EmptyResponse() as! T
                }
                return try JSONDecoder.apiDecoder.decode(T.self, from: data)
            } catch {
                throw APIClientError.decodingFailed
            }
        case 401:
            throw APIClientError.unauthorized
        default:
            let message = try? JSONDecoder.apiDecoder.decode(ErrorResponse.self, from: data)
            throw APIClientError.serverError(message: message?.message, statusCode: httpResponse.statusCode)
        }
    }
}

private struct ErrorResponse: Decodable {
    let message: String?
    let error: String?
}

struct EmptyResponse: Decodable {}

private struct AnyEncodable: Encodable {
    private let encoder: (Encoder) throws -> Void

    init(_ value: Encodable) {
        self.encoder = value.encode
    }

    func encode(to encoder: Encoder) throws {
        try self.encoder(encoder)
    }
}
