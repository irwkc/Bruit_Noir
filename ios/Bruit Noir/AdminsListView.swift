import SwiftUI

struct AdminsListView: View {
    @EnvironmentObject var appModel: AppViewModel
    @State private var showingAddAdmin = false
    @State private var newAdminEmail = ""
    @State private var newAdminPassword = ""
    @State private var newAdminName = ""
    @State private var isCreating = false
    @State private var adminToDelete: AdminUser?
    @State private var showingDeleteConfirmation = false
    
    var body: some View {
        List {
            ForEach(appModel.admins) { admin in
                AdminRow(admin: admin)
            }
            .onDelete { offsets in
                deleteAdmins(at: offsets)
            }
        }
        .navigationTitle("Админы")
        .toolbar {
            if appModel.isSuperAdmin {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingAddAdmin = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
        }
        .task {
            if appModel.isSuperAdmin {
                await appModel.fetchAdmins()
            }
        }
        .refreshable {
            if appModel.isSuperAdmin {
                await appModel.fetchAdmins()
            }
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
        .confirmationDialog(
            "Удалить админа?",
            isPresented: $showingDeleteConfirmation,
            presenting: adminToDelete
        ) { admin in
            Button("Удалить", role: .destructive) {
                Task {
                    await appModel.deleteAdmin(admin)
                }
            }
            Button("Отмена", role: .cancel) {
                adminToDelete = nil
            }
        } message: { admin in
            Text("Админ \(admin.email) будет удалён. Это действие нельзя отменить.")
        }
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
    
    private func deleteAdmins(at offsets: IndexSet) {
        guard appModel.isSuperAdmin else { return }
        
        guard let firstIndex = offsets.first else { return }
        let admin = appModel.admins[firstIndex]
        
        // Нельзя удалить самого себя
        if case let .authenticated(session) = appModel.authState,
           admin.id == session.user.id {
            appModel.errorMessage = "Нельзя удалить самого себя"
            appModel.showError = true
            return
        }
        
        // Нельзя удалить другого суперадмина
        if admin.isSuperAdmin == true {
            appModel.errorMessage = "Нельзя удалить главного админа"
            appModel.showError = true
            return
        }
        
        adminToDelete = admin
        showingDeleteConfirmation = true
    }
    
    private func createAdmin() async {
        guard appModel.isSuperAdmin else { return }
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
            await appModel.fetchAdmins()
        }
    }
}

struct AdminRow: View {
    let admin: AdminUser
    @EnvironmentObject var appModel: AppViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(admin.email)
                    .font(.headline)
                Spacer()
                if admin.isSuperAdmin == true {
                    Label("Главный админ", systemImage: "star.fill")
                        .font(.caption)
                        .foregroundColor(.orange)
                }
            }
            
            if let name = admin.name, !name.isEmpty {
                Text(name)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            HStack(spacing: 8) {
                if admin.totpEnabled == true {
                    Label("2FA", systemImage: "lock.shield.fill")
                        .font(.caption)
                        .foregroundColor(.green)
                }
                
                if case let .authenticated(session) = appModel.authState,
                   admin.id == session.user.id {
                    Text("Вы")
                        .font(.caption)
                        .foregroundColor(.blue)
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

