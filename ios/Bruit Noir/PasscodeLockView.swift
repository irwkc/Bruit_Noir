import SwiftUI

struct PasscodeOverlayView: View {
    @EnvironmentObject private var appModel: AppViewModel
    @State private var input: String = ""

    var body: some View {
        if appModel.passcodeFlow == .hidden {
            EmptyView()
        } else {
            ZStack {
                Color.black
                    .ignoresSafeArea()

                VStack(spacing: 28) {
                    Spacer()

                    VStack(spacing: 10) {
                        Text(title)
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)

                        if let description = description {
                            Text(description)
                                .font(.system(size: 16, weight: .medium, design: .rounded))
                                .foregroundStyle(.white.opacity(0.7))
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 28)
                        }

                        if let error = appModel.passcodeError {
                            Text(error)
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundStyle(.red)
                                .multilineTextAlignment(.center)
                                .padding(.top, 4)
                        }
                    }

                    PasscodeDotsView(count: input.count)
                        .padding(.top, 4)

                    Spacer(minLength: 24)

                    PasscodeKeypadView(
                        onDigitTap: appendDigit(_:),
                        onDelete: deleteDigit
                    )
                    .padding(.horizontal, 24)

                    if appModel.passcodeFlow == .confirm {
                        Button("Начать заново") {
                            input.removeAll()
                            appModel.restartPasscodeSetup()
                        }
                        .font(.system(size: 15, weight: .regular))
                        .foregroundStyle(.white.opacity(0.7))
                        .padding(.top, 12)
                    }

                    Spacer(minLength: 36)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .transition(.opacity)
            .onChange(of: appModel.passcodeFlow) { _, _ in
                input.removeAll()
            }
            .allowsHitTesting(true)
        }
    }

    private var title: String {
        switch appModel.passcodeFlow {
        case .setup:
            return "Придумай PIN"
        case .confirm:
            return "Подтверди PIN"
        case .locked:
            return "Введите PIN"
        case .hidden:
            return ""
        }
    }

    private var description: String? {
        switch appModel.passcodeFlow {
        case .setup:
            return "Придумай 4-значный код для защиты админки."
        case .confirm:
            return "Введи тот же 4-значный код ещё раз."
        case .locked:
            return "Разблокируй админку, введя 4-значный код."
        case .hidden:
            return nil
        }
    }

    private func appendDigit(_ digit: String) {
        guard input.count < 4 else { return }
        input.append(contentsOf: digit)
        if input.count == 4 {
            let code = input
            Task { @MainActor in
                appModel.processPasscodeInput(code)
                input.removeAll()
            }
        }
    }

    private func deleteDigit() {
        guard !input.isEmpty else { return }
        input.removeLast()
    }
}

private struct PasscodeDotsView: View {
    let count: Int

    var body: some View {
        HStack(spacing: 18) {
            ForEach(0..<4, id: \.self) { index in
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(index < count ? Color.white : Color.white.opacity(0.18))
                    .frame(width: 18, height: 18)
            }
        }
        .padding(.vertical, 6)
    }
}

private struct PasscodeKeypadView: View {
    let onDigitTap: (String) -> Void
    let onDelete: () -> Void

    private let layout: [[PasscodeKey]] = [
        [.digit("1"), .digit("2"), .digit("3")],
        [.digit("4"), .digit("5"), .digit("6")],
        [.digit("7"), .digit("8"), .digit("9")],
        [.empty, .digit("0"), .delete]
    ]

    var body: some View {
        VStack(spacing: 18) {
            ForEach(layout, id: \.self) { row in
                HStack(spacing: 18) {
                    ForEach(row, id: \.self) { key in
                        switch key {
                        case let .digit(value):
                            PasscodeButton(title: value) {
                                onDigitTap(value)
                            }
                        case .delete:
                            PasscodeGlyphButton(systemName: "delete.left") {
                                onDelete()
                            }
                        case .empty:
                            Spacer()
                                .frame(width: 76, height: 76)
                        }
                    }
                }
            }
        }
        .padding(.bottom, 32)
    }
}

private enum PasscodeKey: Hashable {
    case digit(String)
    case delete
    case empty
}

private struct PasscodeButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.title)
                .frame(width: 76, height: 76)
                .background(
                    Circle()
                        .fill(Color.white.opacity(0.12))
                )
                .foregroundStyle(.white)
        }
        .buttonStyle(.plain)
    }
}

private struct PasscodeGlyphButton: View {
    let systemName: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.title2)
                .frame(width: 76, height: 76)
                .background(
                    Circle()
                        .fill(Color.white.opacity(0.12))
                )
                .foregroundStyle(.white)
        }
        .buttonStyle(.plain)
    }
}

