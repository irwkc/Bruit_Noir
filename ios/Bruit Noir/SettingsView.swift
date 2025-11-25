import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var appModel: AppViewModel
    @State private var isSavingEmail = false
    @FocusState private var focusedField: Field?

    enum Field {
        case notificationEmail
    }

    var body: some View {
        NavigationStack {
            Form {
                if case let .authenticated(session) = appModel.authState {
                    Section("Профиль") {
                        LabeledContent("Email", value: session.user.email)
                        LabeledContent("Роль", value: session.user.role ?? "Админ")
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
                appModel.notificationMessage != nil
            }, set: { newValue in
                if !newValue {
                    appModel.notificationMessage = nil
                }
            })) {
                Alert(title: Text(appModel.notificationMessage ?? ""))
            }
        }
    }
}
