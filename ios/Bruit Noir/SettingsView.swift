import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var appModel: AppViewModel
    @State private var isSavingEmail = false
    @State private var isSavingDelivery = false
    @State private var deliveryPriceInput: String = ""
    @FocusState private var focusedField: Field?

    enum Field {
        case notificationEmail
        case deliveryPrice
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

                Section("Стоимость доставки") {
                    TextField("0", text: $deliveryPriceInput)
                        .keyboardType(.decimalPad)
                        .focused($focusedField, equals: .deliveryPrice)
                        .onAppear {
                            if deliveryPriceInput.isEmpty {
                                deliveryPriceInput = appModel.deliveryPrice == 0
                                    ? ""
                                    : String(format: "%.0f", appModel.deliveryPrice)
                            }
                        }

                    Button {
                        focusedField = nil
                        isSavingDelivery = true
                        let normalized = Double(deliveryPriceInput.replacingOccurrences(of: ",", with: ".")) ?? 0
                        appModel.updateDeliveryPrice(normalized)
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                            isSavingDelivery = false
                        }
                    } label: {
                        if isSavingDelivery {
                            ProgressView()
                                .frame(maxWidth: .infinity, alignment: .center)
                        } else {
                            Text("Сохранить стоимость доставки")
                                .frame(maxWidth: .infinity, alignment: .center)
                        }
                    }
                    .disabled(isSavingDelivery)
                    .footer {
                        Text("Эта сумма будет добавляться к стоимости товаров в заказе.")
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
