import { useEffect, useState } from 'react';

function ProductForm({ onSave, editingProduct, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: ''
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        quantity: editingProduct.quantity
      });
    } else {
      setFormData({ name: '', price: '', quantity: '' });
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity, 10)
    });
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">
        {editingProduct ? 'Edit Product' : 'Add Product'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-2"
          required
        />

        <input
          type="text"
          name="description"
          placeholder="product description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-2"
          required
        />

        <input
          type="number"
          step="0.01"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-2"
          required
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-2"
          required
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            {editingProduct ? 'Update' : 'Save'}
          </button>

          {editingProduct && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ProductForm;