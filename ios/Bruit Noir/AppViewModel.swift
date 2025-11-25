import Foundation
import SwiftUI

@MainActor
final class AppViewModel: ObservableObject {
    enum AuthState {
        case loading
        case needCredentials
        case needTotp(TotpSetupResponse, PendingCredentials)
        case authenticated(session: AdminSession)
    }

    enum PasscodeFlow: Equatable {
        case hidden
        case setup
        case confirm
        case locked
    }

    struct PendingCredentials {
        let email: String
        let password: String
    }

    struct AdminSession {
        let user: AdminUser
        let tokens: AuthTokens
    }

    @Published private(set) var authState: AuthState = .loading
    @Published private(set) var orders: [Order] = []
    @Published private(set) var ordersLoading = false
    @Published private(set) var nextCursor: String?
    @Published private(set) var products: [Product] = []
    @Published private(set) var productsLoading = false
    @Published private(set) var productSaving = false
    @Published private(set) var deletingProductIDs: Set<String> = []
    @Published private(set) var analyticsRange: Int = 30
    @Published private(set) var analyticsData: AnalyticsResponse?
    @Published private(set) var analyticsLoading = false
    @Published var notificationEmail: String = ""
    @Published var notificationMessage: String?
    @Published var showError: Bool = false
    @Published var errorMessage: String?
    @Published var passcodeFlow: PasscodeFlow = .hidden
    @Published var passcodeError: String?
    @Published private(set) var admins: [AdminUser] = []
    @Published private(set) var adminsLoading = false

    private let authService = AuthService.shared
    private let ordersService = OrdersService.shared
    private let settingsService = SettingsService.shared
    private let productsService = ProductsService.shared
    private let adminsService = AdminsService.shared
    private let analyticsService = AnalyticsService.shared
    private let keychain = KeychainStorage.shared
    private let passcodeStorageKey = "admin.passcode.code"
    private var pendingPasscode: String?

    func bootstrap() {
        Task {
            await loadExistingSession()
        }
    }

    private func loadExistingSession() async {
        authState = .loading
        if let (_, tokens) = await authService.restoreSession() {
            do {
                let (refreshedUser, refreshedTokens) = try await authService.refresh(tokens: tokens)
                authState = .authenticated(session: AdminSession(user: refreshedUser, tokens: refreshedTokens))
                await APIClient.shared.updateTokens(refreshedTokens)
                preparePasscodeFlow()
                await fetchOrders(reset: true)
                await fetchProducts(force: true)
                await fetchNotificationEmail()
                await fetchAnalytics(range: analyticsRange, force: true)
            } catch {
                await authService.clearSession()
                authState = .needCredentials
            }
        } else {
            authState = .needCredentials
        }
    }

    func login(email: String, password: String, code: String?) {
        Task {
            do {
                let outcome = try await authService.login(email: email.lowercased(), password: password, code: code)
                switch outcome {
                case let .success(user, tokens):
                    authState = .authenticated(session: AdminSession(user: user, tokens: tokens))
                    await APIClient.shared.updateTokens(tokens)
                    preparePasscodeFlow()
                    await fetchOrders(reset: true)
                    await fetchProducts(force: true)
                    await fetchNotificationEmail()
                    await fetchAnalytics(range: analyticsRange, force: true)
                case let .requiresTotp(info):
                    authState = .needTotp(info, PendingCredentials(email: email, password: password))
                }
            } catch {
                handle(error)
            }
        }
    }

    func submitTotp(code: String) {
        guard case let .needTotp(_, credentials) = authState else { return }
        login(email: credentials.email, password: credentials.password, code: code)
    }

    func logout() {
        Task { await authService.clearSession() }
        orders = []
        nextCursor = nil
        products = []
        notificationEmail = ""
        analyticsData = nil
        analyticsRange = 30
        authState = .needCredentials
        passcodeFlow = .hidden
        passcodeError = nil
        pendingPasscode = nil
    }

    func fetchAnalytics(range: Int? = nil, force: Bool = false) async {
        guard case .authenticated = authState else { return }
        if analyticsLoading { return }
        let targetRange = range ?? analyticsRange
        if !force, let analyticsData, analyticsData.rangeDays == targetRange {
            return
        }
        analyticsLoading = true
        defer { analyticsLoading = false }

        do {
            let result = try await analyticsService.fetchAnalytics(range: targetRange)
            analyticsRange = targetRange
            analyticsData = result
        } catch APIClientError.unauthorized {
            await handleUnauthorized()
        } catch {
            handle(error)
        }
    }

    func updateAnalyticsRange(_ range: Int) {
        Task { await fetchAnalytics(range: range, force: true) }
    }

    func productViewCount(for productId: String) -> Int {
        analyticsData?.productViews.first(where: { $0.productId == productId })?.views ?? 0
    }

    func fetchOrders(reset: Bool) async {
        guard case .authenticated = authState else { return }
        if ordersLoading { return }
        ordersLoading = true
        defer { ordersLoading = false }

        do {
            let cursor = reset ? nil : nextCursor
            let response = try await ordersService.fetchOrders(limit: 50, cursor: cursor)
            if reset {
                orders = response.data
            } else {
                orders.append(contentsOf: response.data)
            }
            nextCursor = response.nextCursor
        } catch APIClientError.unauthorized {
            await handleUnauthorized()
        } catch {
            handle(error)
        }
    }

    func updateOrderStatus(orderId: String, status: String) async {
        guard case .authenticated = authState else { return }
        do {
            let updatedOrder = try await ordersService.updateOrderStatus(orderId: orderId, status: status)
            // Обновляем заказ в списке
            if let index = orders.firstIndex(where: { $0.id == orderId }) {
                orders[index] = updatedOrder
            }
        } catch APIClientError.unauthorized {
            await handleUnauthorized()
        } catch {
            handle(error)
        }
    }

    func fetchProducts(force: Bool = false) async {
        guard case .authenticated = authState else { return }
        if productsLoading { return }
        if !force && !products.isEmpty { return }
        productsLoading = true
        defer { productsLoading = false }

        do {
            products = try await productsService.fetchProducts()
        } catch APIClientError.unauthorized {
            await handleUnauthorized()
        } catch {
            handle(error)
        }
    }

    func deleteProduct(_ product: Product) {
        guard case .authenticated = authState else { return }
        Task {
            deletingProductIDs.insert(product.id)
            defer { deletingProductIDs.remove(product.id) }
            do {
                try await productsService.deleteProduct(id: product.id)
                products.removeAll { $0.id == product.id }
            } catch APIClientError.unauthorized {
                await handleUnauthorized()
            } catch {
                handle(error)
            }
        }
    }

    func saveProduct(draft: ProductDraft, productID: String?) async -> Product? {
        guard case .authenticated = authState else { return nil }
        if productSaving { return nil }
        productSaving = true
        defer { productSaving = false }

        do {
            let product: Product
            if let productID {
                product = try await productsService.updateProduct(id: productID, draft: draft)
                if let index = products.firstIndex(where: { $0.id == productID }) {
                    products[index] = product
                } else {
                    products.insert(product, at: 0)
                }
            } else {
                product = try await productsService.createProduct(draft)
                products.insert(product, at: 0)
            }
            return product
        } catch APIClientError.unauthorized {
            await handleUnauthorized()
            return nil
        } catch {
            handle(error)
            return nil
        }
    }

    func uploadImage(data: Data, fileName: String, mimeType: String) async -> String? {
        do {
            return try await productsService.uploadImage(data: data, fileName: fileName, mimeType: mimeType)
        } catch APIClientError.unauthorized {
            await handleUnauthorized()
            return nil
        } catch {
            handle(error)
            return nil
        }
    }

    func fetchNotificationEmail() async {
        guard case .authenticated = authState else { return }
        do {
            if let email = try await settingsService.fetchNotificationEmail() {
                notificationEmail = email
            } else {
                notificationEmail = ""
            }
        } catch APIClientError.unauthorized {
            await handleUnauthorized()
        } catch {
            handle(error)
        }
    }

    func updateNotificationEmail() {
        guard case .authenticated = authState else { return }
        Task {
            do {
                let saved = try await settingsService.updateNotificationEmail(notificationEmail)
                notificationEmail = saved ?? ""
                notificationMessage = saved == nil ? "Уведомления отключены" : "Email обновлён"
            } catch APIClientError.unauthorized {
                await handleUnauthorized()
            } catch {
                handle(error)
            }
        }
    }

    private func handleUnauthorized() async {
        await authService.clearSession()
        await MainActor.run {
            authState = .needCredentials
            passcodeFlow = .hidden
        }
    }

    private func handle(_ error: Error) {
        errorMessage = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
        showError = true
    }

    func preparePasscodeFlow() {
        guard case .authenticated = authState else {
            passcodeFlow = .hidden
            return
        }

        passcodeError = nil
        pendingPasscode = nil
        if keychain.string(for: passcodeStorageKey) == nil {
            passcodeFlow = .setup
        } else {
            passcodeFlow = .locked
        }
    }

    func processPasscodeInput(_ code: String) {
        guard code.count == 4 else { return }
        passcodeError = nil

        switch passcodeFlow {
        case .setup:
            pendingPasscode = code
            passcodeFlow = .confirm
        case .confirm:
            guard let pending = pendingPasscode else {
                restartPasscodeSetup()
                return
            }
            if constantTimeCompare(pending, code) {
                do {
                    try keychain.set(code, for: passcodeStorageKey)
                    pendingPasscode = nil
                    passcodeFlow = .hidden
                } catch {
                    passcodeError = "Не удалось сохранить код"
                    passcodeFlow = .setup
                }
            } else {
                passcodeError = "Коды не совпадают"
                restartPasscodeSetup()
            }
        case .locked:
            guard let stored = keychain.string(for: passcodeStorageKey) else {
                restartPasscodeSetup()
                return
            }
            if constantTimeCompare(stored, code) {
                passcodeFlow = .hidden
                passcodeError = nil
            } else {
                passcodeError = "Неверный код"
            }
        case .hidden:
            break
        }
    }

    func restartPasscodeSetup() {
        pendingPasscode = nil
        passcodeFlow = .setup
    }

    private func constantTimeCompare(_ lhs: String, _ rhs: String) -> Bool {
        guard lhs.count == rhs.count else { return false }
        var result: UInt8 = 0
        for (a, b) in zip(lhs.utf8, rhs.utf8) {
            result |= a ^ b
        }
        return result == 0
    }
    
    // MARK: - Admins Management
    
    var isSuperAdmin: Bool {
        guard case let .authenticated(session) = authState else { return false }
        return session.user.isSuperAdmin ?? false
    }
    
    func fetchAdmins() async {
        guard case .authenticated = authState, isSuperAdmin else { return }
        if adminsLoading { return }
        adminsLoading = true
        defer { adminsLoading = false }
        
        do {
            admins = try await adminsService.fetchAdmins()
        } catch APIClientError.unauthorized {
            await handleUnauthorized()
        } catch {
            handle(error)
        }
    }
    
    func createAdmin(email: String, password: String, name: String?) async -> Bool {
        guard case .authenticated = authState, isSuperAdmin else { return false }
        do {
            let newAdmin = try await adminsService.createAdmin(email: email, password: password, name: name)
            admins.append(newAdmin)
            return true
        } catch APIClientError.unauthorized {
            await handleUnauthorized()
            return false
        } catch {
            handle(error)
            return false
        }
    }
    
    func deleteAdmin(_ admin: AdminUser) async -> Bool {
        guard case .authenticated = authState, isSuperAdmin else { return false }
        do {
            try await adminsService.deleteAdmin(id: admin.id)
            admins.removeAll { $0.id == admin.id }
            return true
        } catch APIClientError.unauthorized {
            await handleUnauthorized()
            return false
        } catch {
            handle(error)
            return false
        }
    }
    
}
