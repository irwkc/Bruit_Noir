//
//  ContentView.swift
//  Bruit Noir
//
//  Created by irwkc on 12.11.2025.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appModel: AppViewModel

    var body: some View {
        Group {
            switch appModel.authState {
            case .loading:
                ZStack {
                    Color.black.ignoresSafeArea()
                    ProgressView()
                        .progressViewStyle(.circular)
                        .tint(.white)
                }
            case .needCredentials:
                LoginView()
            case let .needTotp(info, credentials):
                TotpVerificationView(info: info, credentials: credentials)
            case .authenticated:
                MainTabView()
            }
        }
        .animation(.easeInOut(duration: 0.25), value: appModel.authStateDescription)
        .alert(isPresented: Binding(
            get: { appModel.showError },
            set: { appModel.showError = $0 }
        )) {
            Alert(
                title: Text("Ошибка"),
                message: Text(appModel.errorMessage ?? "Попробуйте позже"),
                dismissButton: .default(Text("Ок"))
            )
        }
    }
}

private extension AppViewModel {
    var authStateDescription: String {
        switch authState {
        case .loading: return "loading"
        case .needCredentials: return "credentials"
        case .needTotp: return "totp"
        case .authenticated: return "auth"
        }
    }
}

#Preview {
    ContentView()
}
