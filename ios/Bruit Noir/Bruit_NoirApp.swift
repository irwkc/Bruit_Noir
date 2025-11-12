//
//  Bruit_NoirApp.swift
//  Bruit Noir
//
//  Created by Никита Огнев on 12.11.2025.
//

import SwiftUI

@main
struct Bruit_NoirApp: App {
    @StateObject private var appModel = AppViewModel()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appModel)
                .onAppear {
                    if case .loading = appModel.authState {
                        appModel.bootstrap()
                    }
                }
        }
    }
}
