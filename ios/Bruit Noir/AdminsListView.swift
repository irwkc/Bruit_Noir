import SwiftUI

struct AdminsListView: View {
    @EnvironmentObject var appModel: AppViewModel
    @State private var showingAddAdmin = false
    @State private var newAdminEmail = ""
    @State private var newAdminPassword = ""
    @State private var newAdminName = ""
    @State private var isCreating = false
    
    var body: some View {
        List {
            ForEach(appModel.admins) { admin in
                AdminRow(admin: admin)
            }
            .onDelete(perform: deleteAdmins)
        }
        .navigationTitle("Админы")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    showingAddAdmin = true
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .task {
            await appModel.fetchAdmins()
        }
        .refreshable {
            await appModel.fetchAdmins()
        }
        .sheet(isPresented: $showingAddAdmin) {
            AddAdminView(
                email: $newAdminEmail,
                password: $newAdminPassword,
                name: $newAdminName,
                isCreating: $isCreating,
                onSave: {
                    await createAdmin()
                }
            )
        }
    }
    
    private func deleteAdmins(at offsets: IndexSet) {
        Task {
            for index in offsets {
                let admin = appModel.admins[index]
                // Нельзя удалить самого себя
                if case let .authenticated(session) = appModel.authState,
                   admin.id == session.user.id {
                    continue
                }
                await appModel.deleteAdmin(admin)
            }
        }
    }
    
    private func createAdmin() async {
        guard !newAdminEmail.isEmpty, !newAdminPassword.isEmpty else { return }
        isCreating = true
        defer { isCreating = false }
        
        let success = await appModel.createAdmin(
            email: newAdminEmail,
            password: newAdminPassword,
            name: newAdminName.isEmpty ? nil : newAdminName
        )
        
        if success {
            newAdminEmail = ""
            newAdminPassword = ""
            newAdminName = ""
            showingAddAdmin = false
        }
    }
}

struct AdminRow: View {
    let admin: AdminUser
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(admin.email)
                .font(.headline)
            if let name = admin.name, !name.isEmpty {
                Text(name)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            HStack {
                if admin.isSuperAdmin == true {
                    Label("Главный админ", systemImage: "star.fill")
                        .font(.caption)
                        .foregroundColor(.orange)
                }
                if admin.totpEnabled == true {
                    Label("2FA", systemImage: "lock.shield.fill")
                        .font(.caption)
                        .foregroundColor(.green)
                }
            }
        }
    }
}

struct AddAdminView: View {
    @Binding var email: String
    @Binding var password: String
    @Binding var name: String
    @Binding var isCreating: Bool
    let onSave: () async -> Void
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Новый админ") {
                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                    
                    SecureField("Пароль", text: $password)
                        .textContentType(.newPassword)
                    
                    TextField("Имя (необязательно)", text: $name)
                }
            }
            .navigationTitle("Добавить админа")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Отмена") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Сохранить") {
                        Task {
                            await onSave()
                        }
                    }
                    .disabled(email.isEmpty || password.isEmpty || isCreating)
                }
            }
        }
    }
}

