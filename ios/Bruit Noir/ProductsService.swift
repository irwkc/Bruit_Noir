import Foundation

actor ProductsService {
    static let shared = ProductsService()

    private init() {}

    func fetchProducts() async throws -> [Product] {
        let response: ProductsListResponse = try await APIClient.shared.performRequest(
            "GET",
            path: "/api/products",
            decode: ProductsListResponse.self
        )
        return response.data
    }

    func createProduct(_ draft: ProductDraft) async throws -> Product {
        try await APIClient.shared.performRequest(
            "POST",
            path: "/api/products",
            body: draft,
            decode: Product.self
        )
    }

    func updateProduct(id: String, draft: ProductDraft) async throws -> Product {
        try await APIClient.shared.performRequest(
            "PUT",
            path: "/api/products/\(id)",
            body: draft,
            decode: Product.self
        )
    }

    func deleteProduct(id: String) async throws {
        _ = try await APIClient.shared.performRequest(
            "DELETE",
            path: "/api/products/\(id)",
            decode: EmptyResponse.self
        )
    }

    func uploadImage(data: Data, fileName: String, mimeType: String) async throws -> String {
        let boundary = UUID().uuidString
        var request = URLRequest(url: URL(string: "https://bruitnoir.ru/api/upload")!)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()
        body.append("--\(boundary)\r\n")
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(fileName)\"\r\n")
        body.append("Content-Type: \(mimeType)\r\n\r\n")
        body.append(data)
        body.append("\r\n")
        body.append("--\(boundary)--\r\n")

        request.httpBody = body

        let (responseData, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIClientError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            let message = try? JSONDecoder.apiDecoder.decode(UploadErrorResponse.self, from: responseData)
            throw APIClientError.serverError(message: message?.message, statusCode: httpResponse.statusCode)
        }

        let upload = try JSONDecoder.apiDecoder.decode(UploadResponse.self, from: responseData)
        guard let url = upload.url else {
            throw APIClientError.invalidResponse
        }
        return url
    }
}

private struct UploadErrorResponse: Decodable {
    let message: String?
    let error: String?
}

private extension Data {
    mutating func append(_ string: String) {
        if let data = string.data(using: .utf8) {
            append(data)
        }
    }
}

