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
    @Published var notificationEmail: String = ""
    @Published var notificationMessage: String?
    @Published var showError: Bool = false
    @Published var errorMessage: String?

    private let authService = AuthService.shared
    private let ordersService = OrdersService.shared
    private let settingsService = SettingsService.shared

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
                await fetchOrders(reset: true)
                await fetchNotificationEmail()
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
                    await fetchOrders(reset: true)
                    await fetchNotificationEmail()
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
        notificationEmail = ""
        authState = .needCredentials
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
        }
    }

    private func handle(_ error: Error) {
        errorMessage = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
        showError = true
    }
}
