import SwiftUI

struct LoginView: View {
    @EnvironmentObject var appModel: AppViewModel

    @State private var email: String = ""
    @State private var password: String = ""
    @State private var code: String = ""
    @State private var isSubmitting = false

    var body: some View {
        VStack(spacing: 24) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Bruit Noir Admin")
                    .font(.largeTitle)
                    .fontWeight(.bold)

                Text("Войдите в аккаунт администратора")
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            VStack(spacing: 16) {
                TextField("Email", text: $email)
                    .textContentType(.username)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
                    .padding()
                    .background(.thickMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))

                SecureField("Пароль", text: $password)
                    .textContentType(.password)
                    .padding()
                    .background(.thickMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))

                TextField("Код 2FA (если уже подключили)", text: $code)
                    .keyboardType(.numberPad)
                    .textContentType(.oneTimeCode)
                    .padding()
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            }

            Button {
                guard !email.isEmpty, !password.isEmpty else { return }
                isSubmitting = true
                appModel.login(email: email, password: password, code: code.isEmpty ? nil : code)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
                    isSubmitting = false
                }
            } label: {
                HStack {
                    if isSubmitting { ProgressView().tint(.black) }
                    Text(isSubmitting ? "Входим…" : "Войти")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.white)
                .foregroundColor(.black)
                .cornerRadius(16)
            }
            .disabled(isSubmitting)

            Spacer()
        }
        .padding(28)
        .frame(maxWidth: 500)
        .background(
            LinearGradient(colors: [.black, .black.opacity(0.8)], startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()
        )
    }
}
