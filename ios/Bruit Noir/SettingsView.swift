import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var appModel: AppViewModel
    @State private var isSaving = false

    var body: some View {
        NavigationStack {
            Form {
                if case let .authenticated(session) = appModel.authState {
                    Section("Профиль") {
                        LabeledContent("Email", value: session.user.email)
                        LabeledContent("Роль", value: session.user.role)
                    }
                }

                Section("Email для уведомлений") {
                    TextField("admin@example.com", text: $appModel.notificationEmail)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)

                    Button {
                        isSaving = true
                        appModel.updateNotificationEmail()
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                            isSaving = false
                        }
                    } label: {
                        if isSaving {
                            ProgressView()
                                .frame(maxWidth: .infinity, alignment: .center)
                        } else {
                            Text("Сохранить")
                                .frame(maxWidth: .infinity, alignment: .center)
                        }
                    }
                }
                
                if appModel.isSuperAdmin {
                    Section("Управление админами") {
                        NavigationLink {
                            AdminsListView()
                                .environmentObject(appModel)
                        } label: {
                            Text("Админы")
                        }
                    }
                }
                
                Section("Закрытый режим сайта") {
                    Toggle("Включить закрытый режим", isOn: $appModel.siteLocked)
                    
                    if appModel.siteLocked {
                        SecureField("Пароль для доступа", text: $appModel.siteLockPassword)
                            .textContentType(.password)
                    }
                    
                    Button {
                        isSaving = true
                        appModel.updateSiteLock()
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                            isSaving = false
                        }
                    } label: {
                        if isSaving {
                            ProgressView()
                                .frame(maxWidth: .infinity, alignment: .center)
                        } else {
                            Text("Сохранить")
                                .frame(maxWidth: .infinity, alignment: .center)
                        }
                    }
                }

                Section {
                    Button(role: .destructive) {
                        appModel.logout()
                    } label: {
                        Text("Выйти")
                            .frame(maxWidth: .infinity, alignment: .center)
                    }
                }
            }
            .navigationTitle("Настройки")
            .alert(isPresented: Binding(get: {
                appModel.notificationMessage != nil || appModel.siteLockMessage != nil
            }, set: { newValue in
                if !newValue {
                    appModel.notificationMessage = nil
                    appModel.siteLockMessage = nil
                }
            })) {
                Alert(title: Text(appModel.notificationMessage ?? appModel.siteLockMessage ?? ""))
            }
        }
    }
}
