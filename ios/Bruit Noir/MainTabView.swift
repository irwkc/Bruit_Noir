import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            ProductsListView()
                .tabItem {
                    Label("Товары", systemImage: "bag")
                }

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
