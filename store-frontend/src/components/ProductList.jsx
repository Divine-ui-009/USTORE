function ProductList({ products, onEdit, onDelete }) {
  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4">Products</h2>

      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md rounded-2xl p-5 border hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm font-thin mt-0 ml-2">
                {product.description}
              </p>

              <p className="text-gray-600 mt-2">
                💰 Price: <span className="font-medium">{product.price}</span>
              </p>

              <p className="text-gray-600">
                📦 Quantity: <span className="font-medium">{product.quantity}</span>
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => onEdit(product)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(product.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;