import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaEdit, FaArrowLeft } from 'react-icons/fa';
import '../Compontent/Dashes/Dashboard.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    discount: 0,
    price: 0.00,
    stock: 0,
    category: '',
    imageLink: ''
  });

  const handleInputChange = (field, value) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProduct = () => {
    // Here you would typically save the product to your backend
    console.log('Saving product:', newProduct);
    navigate('/dashboard');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="add-product-page" dir="rtl">
      {/* Page Title with Back Button */}
      <div className="page-header">
        <h1 className="add-product-page-title">
          <FaBox className="form-title-icon" />
          إضافة منتج جديد
        </h1>
        <button className="back-to-dashboard" onClick={handleBack}>
          <FaArrowLeft className="back-icon" />
          العودة
        </button>
      </div>

      {/* Add Product Form */}
      <div className="add-product-container">
        {/* Form Content */}
        <div className="form-content">
          {/* Product Name */}
          <div className="form-group">
            <label className="form-label">
              اسم المنتج <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="أدخل اسم المنتج"
              value={newProduct.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">الوصف</label>
            <textarea
              className="form-textarea"
              placeholder="أدخل وصف المنتج"
              value={newProduct.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          {/* Discount */}
          <div className="form-group">
            <label className="form-label">نسبة الخصم (%)</label>
            <input
              type="number"
              className="form-input"
              value={newProduct.discount}
              onChange={(e) => handleInputChange('discount', parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Price */}
          <div className="form-group">
            <label className="form-label">
              السعر ( ) <span className="required-asterisk">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              className="form-input"
              value={newProduct.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0.00)}
            />
          </div>

          {/* Stock */}
          <div className="form-group">
            <label className="form-label">المخزون</label>
            <input
              type="number"
              className="form-input"
              value={newProduct.stock}
              onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">
              التصنيف <span className="required-asterisk">*</span>
            </label>
            <select
              className="form-select"
              value={newProduct.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              <option value="">اختر التصنيف</option>
              <option value="عناية بالبشرة">عناية بالبشرة</option>
              <option value="مكياج">مكياج</option>
              <option value="عطور">عطور</option>
              <option value="منتجات طبيعية">منتجات طبيعية</option>
            </select>
          </div>

          {/* Image Link */}
          <div className="form-group">
            <label className="form-label">
              رابط الصورة
              <FaBox className="form-label-icon" />
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://example.com/image.jpg"
              value={newProduct.imageLink}
              onChange={(e) => handleInputChange('imageLink', e.target.value)}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button className="cancel-btn" onClick={handleBack}>
            إلغاء
          </button>
          <button className="save-btn" onClick={handleSaveProduct}>
            حفظ المنتج
            <FaEdit className="btn-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
