import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            OrdersListView()
                .tabItem {
                    Label("Заказы", systemImage: "list.bullet")
                }

            SettingsView()
                .tabItem {
                    Label("Настройки", systemImage: "gear")
                }
        }
    }
}
