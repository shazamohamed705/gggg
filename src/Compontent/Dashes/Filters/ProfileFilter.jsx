import React from 'react';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCamera, FaEdit } from 'react-icons/fa';
import profileImage from '../../../assets/photo/service.png';

// Profile filter component - User profile management
const ProfileFilter = ({ 
  isEditing, 
  profileData, 
  uploadedImage, 
  handleEditToggle, 
  handleCancelEdit, 
  handleInputChange, 
  handleImageChange 
}) => {
  return (
    <div className="ios-profile-card">
      {/* Header */}
      <div className="ios-header">
        <h2 className="ios-title">
          <FaUser className="ios-title-icon" />
          البروفايل الشخصي
        </h2>
      </div>

      {/* Main Card */}
      <div className="ios-main-card">
        {/* Profile Picture Card */}
        <div className="ios-picture-card">
          <div className="ios-profile-picture">
            <img src={uploadedImage || profileImage} alt="Profile" />
          </div>
          <input
            type="file"
            id="profile-image-upload"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          <button 
            className="ios-change-btn"
            onClick={() => document.getElementById('profile-image-upload').click()}
          >
            <FaCamera className="ios-btn-icon" />
            تغيير الصورة
          </button>
        </div>

        {/* Info Card */}
        <div className="ios-info-card">
          <div className="ios-info-header">
            <FaUser className="ios-info-icon" />
            <h3 className="ios-info-title">المعلومات الشخصية</h3>
          </div>
          
          <div className="ios-info-list">
            <div className="ios-info-item">
              <div className="ios-item-label">
                <FaUser className="ios-icon" />
                الاسم الكامل
              </div>
              {isEditing ? (
                <input
                  type="text"
                  className="ios-item-input"
                  placeholder="اكتب الاسم الكامل"
                  value={profileData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              ) : (
                <div className="ios-item-value">{profileData.fullName || 'غير محدد'}</div>
              )}
            </div>
            
            <div className="ios-info-item">
              <div className="ios-item-label">
                <FaPhone className="ios-icon" />
                رقم الهاتف
              </div>
              {isEditing ? (
                <input
                  type="tel"
                  className="ios-item-input"
                  placeholder="اكتب رقم الهاتف"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              ) : (
                <div className="ios-item-value">{profileData.phone || 'غير محدد'}</div>
              )}
            </div>
            
            <div className="ios-info-item">
              <div className="ios-item-label">
                <FaEnvelope className="ios-icon" />
                البريد الإلكتروني
              </div>
              <div className="ios-item-value ios-item-readonly">{profileData.email || 'غير محدد'}</div>
            </div>
            
            <div className="ios-info-item">
              <div className="ios-item-label">
                <FaMapMarkerAlt className="ios-icon" />
                العنوان
              </div>
              {isEditing ? (
                <input
                  type="text"
                  className="ios-item-input"
                  placeholder="اكتب العنوان"
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              ) : (
                <div className="ios-item-value">{profileData.address || 'غير محدد'}</div>
              )}
            </div>
            <div className="ios-info-item">
              <div className="ios-item-label">
                <FaMapMarkerAlt className="ios-icon" />
                المدينة
              </div>
              {isEditing ? (
                <input
                  type="text"
                  className="ios-item-input"
                  placeholder="اكتب المدينة"
                  value={profileData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              ) : (
                <div className="ios-item-value">{profileData.city || 'غير محدد'}</div>
              )}
            </div>
          </div>
          
          <div className="ios-btn-wrapper">
            <div className="ios-btn-divider"></div>
            <div className="ios-btn-group">
              {isEditing ? (
                <>
                  <button className="ios-cancel-btn" onClick={handleCancelEdit}>
                    <span className="ios-cancel-icon">✕</span>
                    إلغاء
                  </button>
                  <button className="ios-save-btn" onClick={handleEditToggle}>
                    <FaEdit className="ios-btn-icon" />
                    حفظ التغييرات
                  </button>
                </>
              ) : (
                <button className="ios-edit-btn" onClick={handleEditToggle}>
                  <FaEdit className="ios-btn-icon" />
                  تعديل البروفايل
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileFilter;

