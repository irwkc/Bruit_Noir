import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            AnalyticsView()
                .tabItem {
                    Label("Аналитика", systemImage: "chart.bar.xaxis")
                }

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
