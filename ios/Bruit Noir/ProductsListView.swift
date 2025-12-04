import SwiftUI

struct ProductsListView: View {
    @EnvironmentObject private var appModel: AppViewModel
    @State private var editorMode: ProductEditorMode?

    var body: some View {
        NavigationStack {
            Group {
                if appModel.productsLoading && appModel.products.isEmpty {
                    ProgressView("Загружаем товары…")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if appModel.products.isEmpty {
                    ContentUnavailableView(
                        "Товары отсутствуют",
                        systemImage: "shippingbox",
                        description: Text("Добавьте первый товар, чтобы он появился в магазине.")
                    )
                } else {
                    List {
                        ForEach(appModel.products) { product in
                            Button {
                                editorMode = .edit(product)
                            } label: {
                                ProductRowView(
                                    product: product,
                                    isDeleting: appModel.deletingProductIDs.contains(product.id),
                                    viewCount: appModel.productViewCount(for: product.id)
                                )
                            }
                            .buttonStyle(.plain)
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                Button(role: .destructive) {
                                    appModel.deleteProduct(product)
                                } label: {
                                    if appModel.deletingProductIDs.contains(product.id) {
                                        ProgressView()
                                    } else {
                                        Label("Удалить", systemImage: "trash")
                                    }
                                }
                                .disabled(appModel.deletingProductIDs.contains(product.id))
                            }
                        }
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .navigationTitle("Товары")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        Task { await appModel.fetchProducts(force: true) }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                    .disabled(appModel.productsLoading)
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        editorMode = .create
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(item: $editorMode) { mode in
                ProductEditorView(mode: mode)
                    .environmentObject(appModel)
            }
            .task {
                if appModel.products.isEmpty {
                    await appModel.fetchProducts(force: true)
                }
            }
            .refreshable {
                await appModel.fetchProducts(force: true)
            }
        }
    }
}

private struct ProductRowView: View {
    let product: Product
    let isDeleting: Bool
    let viewCount: Int

    var body: some View {
        HStack(spacing: 16) {
            if let url = product.primaryImageURL {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .empty:
                        ProgressView()
                            .frame(width: 60, height: 60)
                            .background(Color.gray.opacity(0.15))
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    case let .success(image):
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(width: 60, height: 60)
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    case .failure:
                        PlaceholderImageView()
                    @unknown default:
                        PlaceholderImageView()
                    }
                }
            } else {
                PlaceholderImageView()
            }

            VStack(alignment: .leading, spacing: 6) {
                Text(product.name)
                    .font(.headline)
                    .foregroundStyle(.primary)

                Text(product.category.uppercased())
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Text(product.formattedPrice)
                    .font(.subheadline)
                    .bold()
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 6) {
                if product.featured {
                    Badge(text: "На главной", tint: .black, textColor: .white)
                }
                if product.preOrder == true {
                    Badge(text: "pre-order", tint: .yellow.opacity(0.15), textColor: .yellow)
                }
                Badge(
                    text: product.available ? "Активен" : "Нет в наличии",
                    tint: product.available ? .green.opacity(0.15) : .red.opacity(0.15),
                    textColor: product.available ? .green : .red
                )
                Text("\(product.stock) шт.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                if viewCount > 0 {
                    Text("\(viewCount) просм.")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }

            if isDeleting {
                ProgressView()
                    .progressViewStyle(.circular)
                    .frame(width: 20, height: 20)
            } else {
                Image(systemName: "chevron.right")
                    .font(.footnote)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(.vertical, 6)
    }
}

private struct PlaceholderImageView: View {
    var body: some View {
        RoundedRectangle(cornerRadius: 12, style: .continuous)
            .fill(Color.gray.opacity(0.15))
            .frame(width: 60, height: 60)
            .overlay {
                Image(systemName: "photo")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
    }
}

private struct Badge: View {
    let text: String
    let tint: Color
    let textColor: Color

    init(text: String, tint: Color, textColor: Color = .white) {
        self.text = text
        self.tint = tint
        self.textColor = textColor
    }

    var body: some View {
        Text(text)
            .font(.caption2)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(tint, in: Capsule())
            .foregroundStyle(textColor)
    }
}

