import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser } from 'react-icons/fa';
import './GhymAuthStyles.css';

const GhymAuthRegister = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input changes with optimized performance
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to check if text contains Arabic characters
  const isArabicText = (text) => {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  // Handle form submission with API integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate name is in Arabic
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    if (!isArabicText(fullName)) {
      alert('يجب كتابة الاسم باللغة العربية فقط');
      return;
    }
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      alert('كلمة المرور غير متطابقة');
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare data for API
      const fullname = `${formData.firstName} ${formData.lastName}`.trim();
      const apiData = {
        email: formData.email,
        fullname: fullname,
        password: formData.password,
        phone_number: formData.phone
      };

      // Send POST request to API
      const response = await fetch('https://ghaimcenter.com/laravel/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      const result = await response.json();

      if (response.ok) {
        // Success - show message and navigate to login
        alert('تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن');
        navigate('/auth/login');
      } else {
        // API returned error
        const errorMessage = result.message || 'حدث خطأ أثناء إنشاء الحساب';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ghym-auth-container">
      {/* Header Section */}
      <header className="ghym-auth-header">
        <div className="ghym-auth-header-content">
          {/* Logo Section */}
          <div className="ghym-auth-logo-section">
            <img 
              src="/logoo.png" 
              alt="مجمع غيم الطبي" 
              className="ghym-auth-logo-img"
            />
          </div>

          {/* Back Button */}
          <button 
            className="ghym-auth-back-btn"
            onClick={() => navigate(-1)}
            aria-label="العودة"
          >
            <FaArrowLeft className="ghym-auth-back-icon" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="ghym-auth-main">
        <div className="ghym-auth-card">
          {/* Register Form */}
          <form className="ghym-auth-form" onSubmit={handleSubmit}>
            <h2 className="ghym-auth-title">إنشاء حساب جديد</h2>

            {/* Full Name Input */}
            <input
              type="text"
              name="fullName"
              value={`${formData.firstName} ${formData.lastName}`.trim()}
              onChange={(e) => {
                const fullName = e.target.value;
                const nameParts = fullName.split(' ');
                setFormData(prev => ({
                  ...prev,
                  firstName: nameParts[0] || '',
                  lastName: nameParts.slice(1).join(' ') || ''
                }));
              }}
              placeholder="الاسم الكامل"
              className="ghym-auth-input"
              required
            />

            {/* Email Input */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="البريد الإلكتروني"
              className="ghym-auth-input"
              required
              autoComplete="email"
              dir="ltr"
            />

            {/* Phone Input */}
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="05XXXXXXXX"
              className="ghym-auth-input"
              required
              dir="ltr"
            />

            {/* Password Input */}
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="كلمة المرور"
              className="ghym-auth-input"
              required
              autoComplete="new-password"
              dir="ltr"
            />

            {/* Confirm Password Input */}
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="تأكيد كلمة المرور"
              className="ghym-auth-input"
              required
              autoComplete="new-password"
              dir="ltr"
            />

            {/* Register Button */}
            <button 
              type="submit" 
              className={`ghym-auth-submit-btn ${isLoading ? 'ghym-auth-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
            </button>

            {/* Login Link */}
            <div className="ghym-auth-link-section">
              <span className="ghym-auth-text">هل لديك حساب؟</span>
              <Link to="/auth/login" className="ghym-auth-link">
                تسجيل الدخول
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default GhymAuthRegister;
