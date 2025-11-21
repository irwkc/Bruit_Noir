import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var appModel: AppViewModel
    @State private var isSavingEmail = false
    @State private var isSavingSiteLock = false
    @FocusState private var focusedField: Field?

    enum Field {
        case notificationEmail
        case siteLockPassword
    }

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
                        .focused($focusedField, equals: .notificationEmail)
                        .submitLabel(.done)
                        .onSubmit {
                            focusedField = nil
                        }

                    Button {
                        focusedField = nil
                        isSavingEmail = true
                        appModel.updateNotificationEmail()
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                            isSavingEmail = false
                        }
                    } label: {
                        if isSavingEmail {
                            ProgressView()
                                .frame(maxWidth: .infinity, alignment: .center)
                        } else {
                            Text("Сохранить")
                                .frame(maxWidth: .infinity, alignment: .center)
                        }
                    }
                    .disabled(isSavingEmail)
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
                            .focused($focusedField, equals: .siteLockPassword)
                            .submitLabel(.done)
                            .onSubmit {
                                focusedField = nil
                            }
                    }
                    
                    Button {
                        focusedField = nil
                        isSavingSiteLock = true
                        appModel.updateSiteLock()
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                            isSavingSiteLock = false
                        }
                    } label: {
                        if isSavingSiteLock {
                            ProgressView()
                                .frame(maxWidth: .infinity, alignment: .center)
                        } else {
                            Text("Сохранить")
                                .frame(maxWidth: .infinity, alignment: .center)
                        }
                    }
                    .disabled(isSavingSiteLock)
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
