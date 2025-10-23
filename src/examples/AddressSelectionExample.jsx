import React, { useState, useEffect } from 'react';
import { FaMapPin, FaMapMarkerAlt } from 'react-icons/fa';
import './AddressCards.css';

// مثال على استخدام ميزة اختيار العناوين
const AddressSelectionExample = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);

  // بيانات تجريبية للعناوين
  const mockAddresses = [
    {
      id: 1,
      title: 'عنوان المنزل',
      address: 'شارع الملك فهد، حي النخيل، الرياض 12345',
      city: 'الرياض',
      phone: '0501234567'
    },
    {
      id: 2,
      title: 'عنوان العمل',
      address: 'مبنى الأعمال، شارع التحلية، جدة 21432',
      city: 'جدة',
      phone: '0507654321'
    },
    {
      id: 3,
      title: 'عنوان إضافي',
      address: 'حي العليا، شارع العليا العام، الرياض 12211',
      city: 'الرياض',
      phone: '0509876543'
    }
  ];

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => {
      setAddresses(mockAddresses);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    console.log('Selected address:', addressId);
  };

  const handleAddNewAddress = () => {
    console.log('Navigate to add new address page');
    // يمكن إضافة وظيفة الانتقال إلى صفحة إضافة عنوان
  };

  if (loading) {
    return (
      <div className="address-loading">
        <span>جاري تحميل العناوين...</span>
        <div className="address-loading-spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1f2937' }}>
        مثال على اختيار العناوين
      </h2>
      
      {addresses.length > 0 ? (
        <div className="address-cards-container">
          {addresses.map((address) => (
            <div 
              key={address.id}
              className={`address-card ${selectedAddressId === address.id ? 'selected' : ''}`}
              onClick={() => handleAddressSelect(address.id)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleAddressSelect(address.id);
                }
              }}
            >
              <div className="address-card-header">
                <div className="address-icon">
                  <FaMapPin />
                </div>
                <div className="address-info">
                  <h4 className="address-title">
                    {address.title}
                  </h4>
                  <p className="address-text">
                    {address.address}
                  </p>
                  <div className="address-details">
                    <div className="address-detail">
                      <FaMapMarkerAlt className="address-detail-icon" />
                      <span>{address.city}</span>
                    </div>
                    <div className="address-detail">
                      <span>📞</span>
                      <span>{address.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="address-radio">
                <input 
                  type="radio" 
                  name="address" 
                  checked={selectedAddressId === address.id}
                  onChange={() => handleAddressSelect(address.id)}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="address-empty-state">
          <FaMapPin className="address-empty-icon" />
          <h4 className="address-empty-title">
            لا توجد عناوين محفوظة
          </h4>
          <p className="address-empty-description">
            يرجى إضافة عنوان في الملف الشخصي أولاً<br />
            أو يمكنك إضافة عنوان جديد الآن
          </p>
          <button 
            className="address-add-btn"
            onClick={handleAddNewAddress}
          >
            إضافة عنوان جديد
          </button>
        </div>
      )}

      {selectedAddressId && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0ea5e9' }}>
            العنوان المختار:
          </h4>
          <p style={{ margin: '0', color: '#1f2937' }}>
            {addresses.find(addr => addr.id === selectedAddressId)?.title}
          </p>
        </div>
      )}
    </div>
  );
};

export default AddressSelectionExample;
