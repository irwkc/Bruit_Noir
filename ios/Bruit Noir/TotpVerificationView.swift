import SwiftUI
import UIKit

struct TotpVerificationView: View {
    @EnvironmentObject var appModel: AppViewModel
    let info: TotpSetupResponse
    let credentials: AppViewModel.PendingCredentials

    @State private var code: String = ""
    @State private var isSubmitting = false

    private var qrImage: Image? {
        guard let dataUrl = info.qrCodeDataUrl,
              let data = Data(base64Encoded: dataUrl.components(separatedBy: ",").last ?? ""),
              let uiImage = UIImage(data: data) else {
            return nil
        }
        return Image(uiImage: uiImage)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Text("Подтверждение 2FA")
                    .font(.largeTitle.bold())
                    .frame(maxWidth: .infinity, alignment: .leading)

                Text(info.message ?? "Отсканируйте QR-код в приложении Google Authenticator и введите шестизначный код.")
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)

                if let qrImage {
                    qrImage
                        .resizable()
                        .interpolation(.none)
                        .scaledToFit()
                        .frame(width: 220, height: 220)
                        .background(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                        .shadow(radius: 10)
                }

                if let otpauth = info.otpauthUrl, let url = URL(string: otpauth) {
                    Button {
                        UIApplication.shared.open(url)
                    } label: {
                        Label("Открыть в Google Authenticator", systemImage: "arrow.up.right")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                    }
                }

                VStack(alignment: .leading, spacing: 12) {
                    Text("Введите код из приложения")
                        .fontWeight(.semibold)
                    TextField("123456", text: $code)
                        .keyboardType(.numberPad)
                        .textContentType(.oneTimeCode)
                        .padding()
                        .background(.thickMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                }

                Button {
                    guard code.count == 6 else { return }
                    isSubmitting = true
                    appModel.submitTotp(code: code)
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                        isSubmitting = false
                    }
                } label: {
                    HStack {
                        if isSubmitting { ProgressView().tint(.black) }
                        Text(isSubmitting ? "Подтверждаем…" : "Подтвердить")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.white)
                    .foregroundColor(.black)
                    .cornerRadius(16)
                }
                .disabled(code.count != 6 || isSubmitting)
            }
            .padding(28)
            .frame(maxWidth: 520)
        }
        .background(
            LinearGradient(colors: [.black, .black.opacity(0.85)], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()
        )
    }
}
