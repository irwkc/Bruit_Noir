import PhotosUI
import SwiftUI

enum ProductEditorMode: Identifiable, Equatable {
    case create
    case edit(Product)

    var id: String {
        switch self {
        case .create:
            return "create"
        case let .edit(product):
            return product.id
        }
    }

    var title: String {
        switch self {
        case .create:
            return "Новый товар"
        case .edit:
            return "Редактирование"
        }
    }
}

struct ProductEditorView: View {
    @EnvironmentObject private var appModel: AppViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var formState: ProductFormState
    @State private var isSaving = false
    @State private var selectedItems: [PhotosPickerItem] = []
    @State private var isUploadingImages = false
    @State private var newImageURL: String = ""

    private let mode: ProductEditorMode

    init(mode: ProductEditorMode) {
        self.mode = mode
        switch mode {
        case .create:
            _formState = State(initialValue: ProductFormState())
        case let .edit(product):
            _formState = State(initialValue: ProductFormState(product: product))
        }
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Основное") {
                    TextField("Название", text: $formState.name)
                        .autocapitalization(.sentences)

                    TextField("Описание", text: $formState.description, axis: .vertical)
                        .lineLimit(3...6)

                    TextField("Цена", text: $formState.price)
                        .keyboardType(.decimalPad)

                    Picker("Категория", selection: $formState.category) {
                        ForEach(ProductFormState.categories, id: \.self) { category in
                            Text(category.title).tag(category.id)
                        }
                    }
                }

                Section("Наличие") {
                    Toggle("Нет в наличии", isOn: $formState.outOfStock)
                        .toggleStyle(SwitchToggleStyle(tint: .black))

                    TextField("Количество, шт.", text: $formState.stock)
                        .keyboardType(.numberPad)
                        .disabled(formState.outOfStock)
                        .opacity(formState.outOfStock ? 0.5 : 1)

                    Toggle("Показывать на главной", isOn: $formState.featured)
                        .toggleStyle(SwitchToggleStyle(tint: .black))
                }

                Section("Изображения") {
                    if !formState.images.isEmpty {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                ForEach(Array(formState.images.enumerated()), id: \.offset) { index, urlString in
                                    ProductImagePreview(
                                        urlString: urlString,
                                        removeAction: {
                                            formState.images.remove(at: index)
                                        }
                                    )
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    } else {
                        Text("Добавьте фотографии товара, чтобы они отображались в магазине.")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }

                    PhotosPicker(selection: $selectedItems, matching: .images, photoLibrary: .shared()) {
                        HStack {
                            Image(systemName: "photo.on.rectangle.angled")
                            Text(isUploadingImages ? "Загрузка…" : "Загрузить из Фото")
                        }
                    }
                    .disabled(isUploadingImages)

                    HStack {
                        TextField("Вставьте ссылку на изображение", text: $newImageURL)
                            .keyboardType(.URL)
                            .autocorrectionDisabled(true)
                            .textInputAutocapitalization(.never)

                        Button("Добавить") {
                            addImageURL()
                        }
                        .disabled(newImageURL.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                }

                Section("Параметры") {
                    TextField("Размеры (через запятую)", text: $formState.sizesText)
                        .autocorrectionDisabled(true)

                    TextField("Цвета (через запятую)", text: $formState.colorsText)
                        .autocorrectionDisabled(true)
                }
            }
            .navigationTitle(mode.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Отмена") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button {
                        saveProduct()
                    } label: {
                        if isSaving {
                            ProgressView()
                        } else {
                            Text("Сохранить")
                        }
                    }
                    .disabled(isSaving || !formState.isValid)
                }
            }
            .onChange(of: selectedItems) { _, newItems in
                guard !newItems.isEmpty else { return }
                Task { await uploadSelectedImages(items: newItems) }
            }
        }
    }

    private func addImageURL() {
        let trimmed = newImageURL.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        formState.images.append(trimmed)
        newImageURL = ""
    }

    private func uploadSelectedImages(items: [PhotosPickerItem]) async {
        isUploadingImages = true
        defer {
            selectedItems.removeAll()
            isUploadingImages = false
        }

        for item in items {
            guard let data = try? await item.loadTransferable(type: Data.self) else { continue }
            let contentType = item.supportedContentTypes.first
            let ext = contentType?.preferredFilenameExtension ?? "jpg"
            let mimeType = contentType?.preferredMIMEType ?? "image/jpeg"
            let fileName = "\(UUID().uuidString).\(ext)"

            if let urlString = await appModel.uploadImage(data: data, fileName: fileName, mimeType: mimeType) {
                formState.images.append(urlString)
            }
        }
    }

    private func saveProduct() {
        guard !isSaving else { return }
        isSaving = true

        Task {
            let draft = formState.makeDraft()
            let productID: String?
            switch mode {
            case .create:
                productID = nil
            case let .edit(product):
                productID = product.id
            }

            let result = await appModel.saveProduct(draft: draft, productID: productID)
            await MainActor.run {
                isSaving = false
                if result != nil {
                    dismiss()
                }
            }
        }
    }
}

private struct ProductFormState {
    struct CategoryDescriptor: Hashable {
        let id: String
        let title: String
    }

    static let categories: [CategoryDescriptor] = [
        .init(id: "hoodies", title: "Худи"),
        .init(id: "t-shirts", title: "Футболки"),
        .init(id: "pants", title: "Штаны"),
        .init(id: "accessories", title: "Аксессуары")
    ]

    var name: String = ""
    var description: String = ""
    var price: String = ""
    var category: String = categories.first?.id ?? "hoodies"
    var stock: String = ""
    var images: [String] = []
    var sizesText: String = "S, M, L"
    var colorsText: String = "black"
    var featured: Bool = false
    var outOfStock: Bool = false

    var isValid: Bool {
        !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        Double(price.replacingOccurrences(of: ",", with: ".")) != nil
    }

    init() {}

    init(product: Product) {
        name = product.name
        description = product.description
        price = product.price == 0 ? "" : String(product.price)
        category = product.category
        stock = product.stock == 0 ? "" : String(product.stock)
        images = product.images
        sizesText = product.sizes.joined(separator: ", ")
        colorsText = product.colors.joined(separator: ", ")
        featured = product.featured
        outOfStock = !product.available
    }

    func makeDraft() -> ProductDraft {
        let priceValue = Double(price.replacingOccurrences(of: ",", with: ".")) ?? 0
        let stockValue = outOfStock ? 0 : Int(stock) ?? 0
        let sizesArray = sizesText
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
        let colorsArray = colorsText
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
        let imageArray = images.map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }

        return ProductDraft(
            name: name.trimmingCharacters(in: .whitespacesAndNewlines),
            description: description.trimmingCharacters(in: .whitespacesAndNewlines),
            price: priceValue,
            images: imageArray,
            category: category,
            sizes: sizesArray,
            colors: colorsArray,
            stock: stockValue,
            featured: featured,
            available: !outOfStock
        )
    }
}

private struct ProductImagePreview: View {
    let urlString: String
    let removeAction: () -> Void

    var body: some View {
        ZStack(alignment: .topTrailing) {
            if let url = Product.resolveImageURL(from: urlString) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .empty:
                        ProgressView()
                            .frame(width: 90, height: 90)
                            .background(Color.gray.opacity(0.1))
                            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    case let .success(image):
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(width: 90, height: 90)
                            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    case .failure:
                        placeholder
                    @unknown default:
                        placeholder
                    }
                }
            } else {
                placeholder
            }

            Button {
                removeAction()
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .foregroundStyle(.white, .black.opacity(0.7))
                    .background(Circle().fill(Color.black.opacity(0.4)))
            }
            .offset(x: 6, y: -6)
        }
    }

    private var placeholder: some View {
        RoundedRectangle(cornerRadius: 16, style: .continuous)
            .fill(Color.gray.opacity(0.1))
            .frame(width: 90, height: 90)
            .overlay {
                Image(systemName: "photo")
                    .font(.title3)
                    .foregroundStyle(.secondary)
            }
    }
}

