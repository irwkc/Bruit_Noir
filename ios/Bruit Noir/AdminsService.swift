import Foundation

actor AdminsService {
    static let shared = AdminsService()
    
    private init() {}
    
    func fetchAdmins() async throws -> [AdminUser] {
        let response: AdminListResponse = try await APIClient.shared.performRequest(
            "GET",
            path: "/api/admin/admins",
            decode: AdminListResponse.self
        )
        return response.admins
    }
    
    func createAdmin(email: String, password: String, name: String?) async throws -> AdminUser {
        struct CreateRequest: Encodable {
            let email: String
            let password: String
            let name: String?
        }
        
        struct CreateResponse: Decodable {
            let admin: AdminUser
            let message: String?
        }
        
        let response: CreateResponse = try await APIClient.shared.performRequest(
            "POST",
            path: "/api/admin/admins",
            body: CreateRequest(email: email, password: password, name: name),
            decode: CreateResponse.self
        )
        return response.admin
    }
    
    func deleteAdmin(id: String) async throws {
        struct DeleteResponse: Decodable {
            let message: String?
        }
        
        let _: DeleteResponse = try await APIClient.shared.performRequest(
            "DELETE",
            path: "/api/admin/admins",
            queryItems: [URLQueryItem(name: "id", value: id)],
            decode: DeleteResponse.self
        )
    }
}

