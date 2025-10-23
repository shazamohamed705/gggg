import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaSearch, 
  FaPlus,
  FaHome
} from 'react-icons/fa';
import './Dashboard.css';

// Import header component
import DashboardHeader from './Header';

// Import filter components
import HomeFilter from './Filters/HomeFilter';
import ProfileFilter from './Filters/ProfileFilter';
import ServicesFilter from './Filters/ServicesFilter';
import BookingsFilter from './Filters/BookingsFilter';
import NewBookingFilter from './Filters/NewBookingFilter';

const DashboardOptimized = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('الرئيسية');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: ''
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState(1);
  const [currentBookingStep, setCurrentBookingStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(11);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(10); // October
  const [currentYear, setCurrentYear] = useState(2025);

  // Calendar navigation functions
  const goToPreviousMonth = useCallback(() => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }, [currentMonth, currentYear]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }, [currentMonth, currentYear]);

  // Fetch user profile data from API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
          console.error('❌ No token found');
          return;
        }
        
        console.log('👤 Fetching user profile from API...');
        
        // Fetch profile data
        const profileResponse = await fetch('https://ghaimcenter.com/laravel/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          console.log('✅ Profile data:', profileResult);
          
          const user = profileResult.data;
          setUserData(user);
          setProfileData({
            fullName: user.fullname || '',
            phone: user.phone_number || '',
            email: user.email || '',
            address: '',
            city: ''
          });
          setUploadedImage(user.profile_image || null);
          
          // Fetch addresses
          const addressResponse = await fetch('https://ghaimcenter.com/laravel/api/user/addresses', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (addressResponse.ok) {
            const addressResult = await addressResponse.json();
            console.log('📍 Addresses data:', addressResult);
            
            // Set first address as default if available
            if (addressResult.data && addressResult.data.length > 0) {
              setProfileData(prev => ({
                ...prev,
                address: addressResult.data[0].address || '',
                city: addressResult.data[0].city || ''
              }));
            }
          }
        }
      } catch (error) {
        console.error('❌ Error fetching profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Get month name in Arabic
  const getMonthName = useCallback((month) => {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[month - 1];
  }, []);

  // Filter menu items with memoization for performance
  const filterItems = useMemo(() => [
    { id: 'الرئيسية', icon: FaHome, path: '/dashboard', color: '#3B82F6' },
    { id: 'البروفايل', icon: FaUser, path: '/dashboard/profile', color: '#10B981' },
    { id: 'حجوزاتي', icon: FaCalendarAlt, path: '/dashboard/bookings', color: '#F59E0B' },
    { id: 'الخدمات', icon: FaSearch, path: '/dashboard/services', color: '#8B5CF6' },
  ], []);

  // Handle logout with useCallback
  const handleLogout = useCallback(() => {
    // Clear user session and redirect to login
    localStorage.removeItem('userToken');
    navigate('/auth/login');
  }, [navigate]);

  // Handle home navigation
  const handleHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Handle new booking
  const handleNewBooking = useCallback(() => {
    setActiveFilter('حجز جديد');
  }, []);

  // Handle filter selection with useCallback for performance optimization
  const handleFilterSelect = useCallback((item) => {
    setActiveFilter(item.id);
  }, []);

  const handleEditToggle = useCallback(async () => {
    if (isEditing) {
      // Save changes
      try {
        const token = localStorage.getItem('userToken');
        
        console.log('💾 Saving profile changes...');
        console.log('📦 Data to send:', {
          fullname: profileData.fullName,
          phone_number: profileData.phone,
          profile_image: uploadedImage
        });
        
        const formData = new FormData();
        formData.append('fullname', profileData.fullName);
        formData.append('phone_number', profileData.phone);
        
        // If image is uploaded, add it
        if (uploadedImage && uploadedImage.startsWith('data:')) {
          // Convert base64 to blob
          const response = await fetch(uploadedImage);
          const blob = await response.blob();
          formData.append('profile_image', blob, 'profile.jpg');
        }
        
        const updateResponse = await fetch('https://ghaimcenter.com/laravel/api/user/update', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (updateResponse.ok) {
          const result = await updateResponse.json();
          console.log('✅ Profile updated:', result);
          alert('تم تحديث البروفايل بنجاح!');
          
          // Update local storage
          const updatedUser = result.data;
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUserData(updatedUser);
          
          // After profile updated, also send address to addresses endpoint
          try {
            const addressPayload = {
              name: profileData.fullName,
              mobile: profileData.phone,
              address: profileData.address,
              city: profileData.city || ''
            };
            const addressRes = await fetch('https://ghaimcenter.com/laravel/api/user/addresses', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(addressPayload)
            });
            if (!addressRes.ok) {
              const addrErr = await addressRes.json().catch(() => ({}));
              console.error('❌ Address save failed:', addrErr);
            }
          } catch (addrErr) {
            console.error('💥 Error saving address:', addrErr);
          }

          setIsEditing(false);
        } else {
          const errorData = await updateResponse.json().catch(() => ({}));
          console.error('❌ Update failed:', errorData);
          alert(errorData.message || 'فشل تحديث البروفايل');
        }
      } catch (error) {
        console.error('💥 Error updating profile:', error);
        alert('حدث خطأ أثناء التحديث');
      }
    } else {
      setIsEditing(true);
    }
  }, [isEditing, profileData, uploadedImage]);

  const handleCancelEdit = useCallback(() => {
    // Reset to original data
    if (userData) {
      setProfileData({
        fullName: userData.fullname || '',
        phone: userData.phone_number || '',
        email: userData.email || '',
        address: profileData.address
      });
      setUploadedImage(userData.profile_image || null);
    }
    setIsEditing(false);
  }, [userData, profileData.address]);

  const handleInputChange = useCallback((field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);


  return (
    <div className="cards-container ghym-dashboard-page">
      {/* Dashboard Header */}
      <DashboardHeader 
        onHomeClick={handleHome}
        onLogoutClick={handleLogout}
        onFilterSelect={handleFilterSelect}
        filterItems={filterItems}
        activeFilter={activeFilter}
      />

      {/* Combined Filter Card - Desktop Only */}
      <div className="separate-card combined-filter-card desktop-only">
        <div className="filter-buttons-grid">
          {filterItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeFilter === item.id;
            
            return (
              <button
                key={item.id}
                className={`filter-btn ${isActive ? 'filter-active' : ''}`}
                onClick={() => handleFilterSelect(item)}
                aria-label={item.id}
              >
                <IconComponent className="filter-icon" />
                <span className="filter-text">{item.id}</span>
              </button>
            );
          })}
          
          {/* New Booking Button */}
          <button
            className="filter-btn new-booking-filter-btn"
            onClick={handleNewBooking}
            aria-label="حجز جديد"
          >
            <FaPlus className="filter-icon" />
            <span className="filter-text">حجز جديد</span>
          </button>
        </div>
      </div>

      {/* Dynamic Content Based on Active Filter */}
      {activeFilter === 'الرئيسية' && <HomeFilter />}

      {activeFilter === 'البروفايل' && (
        <ProfileFilter 
          isEditing={isEditing}
          profileData={profileData}
          uploadedImage={uploadedImage}
          handleEditToggle={handleEditToggle}
          handleCancelEdit={handleCancelEdit}
          handleInputChange={handleInputChange}
          handleImageChange={handleImageChange}
        />
      )}

      {activeFilter === 'الخدمات' && <ServicesFilter />}

      {activeFilter === 'حجوزاتي' && <BookingsFilter />}

      {/* Removed products filter per request */}

      {activeFilter === 'حجز جديد' && (
        <NewBookingFilter
          currentBookingStep={currentBookingStep}
          setCurrentBookingStep={setCurrentBookingStep}
          selectedClinic={selectedClinic}
          setSelectedClinic={setSelectedClinic}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          currentMonth={currentMonth}
          currentYear={currentYear}
          goToPreviousMonth={goToPreviousMonth}
          goToNextMonth={goToNextMonth}
          getMonthName={getMonthName}
          showConfirmationModal={showConfirmationModal}
          setShowConfirmationModal={setShowConfirmationModal}
          setActiveFilter={setActiveFilter}
        />
      )}
    </div>
  );
};

export default DashboardOptimized;
