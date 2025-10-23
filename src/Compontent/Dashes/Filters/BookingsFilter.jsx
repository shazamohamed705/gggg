import React, { useState, useEffect } from "react";
import {
  FaStethoscope,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaEye,
  FaTrash,
  FaSync,
} from "react-icons/fa";

// Bookings filter component - User's bookings history
const BookingsFilter = () => {
  const [bookings, setBookings] = useState([]);
  const [staffData, setStaffData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // OTP state for verification
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [bookingToVerify, setBookingToVerify] = useState(null);

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(
        "https://ghaimcenter.com/laravel/api/user/bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        setBookings(data.data.bookings);
        // Fetch staff data for each unique clinic in parallel for performance
        const uniqueClinicIds = [
          ...new Set(
            data.data.bookings
              .map((booking) => booking.clinic_id)
              .filter(Boolean)
          ),
        ];
        const fetches = uniqueClinicIds.map((clinicId) =>
          fetchStaffData(clinicId)
        );
        await Promise.all(fetches);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff data by clinic ID
  const fetchStaffData = async (clinicId) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token || !clinicId) return;

      const response = await fetch(
        `https://ghaimcenter.com/laravel/api/clinics/${clinicId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const clinicData = await response.json();
        setStaffData((prev) => ({
          ...prev,
          [clinicId]: clinicData.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching staff data:", error);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  // Handle view booking details
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  // Delete booking
  const handleDeleteBooking = async (booking) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!booking?.id) return;
      const res = await fetch(
        `https://ghaimcenter.com/laravel/api/user/bookings/${booking.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        // Update UI optimistically
        setBookings((prev) => prev.filter((b) => b.id !== booking.id));
        if (selectedBooking?.id === booking.id) {
          setShowModal(false);
          setSelectedBooking(null);
        }
      } else {
        console.error("Failed to delete booking");
      }
    } catch (e) {
      console.error("Error deleting booking:", e);
    }
  };

  // Open OTP popup for verification
  const handleOpenVerify = (booking) => {
    setBookingToVerify(booking);
    setOtpCode("");
    setOtpError("");
    setShowOtpPopup(true);
  };

  const handleCloseVerify = () => {
    setShowOtpPopup(false);
    setOtpCode("");
    setOtpError("");
    setBookingToVerify(null);
  };

  const handleSubmitVerify = async () => {
    if (!otpCode || !bookingToVerify) {
      setOtpError("يرجى إدخال كود التحقق");
      return;
    }
    try {
      setOtpSubmitting(true);
      setOtpError("");
      const token = localStorage.getItem("userToken");
      const response = await fetch(
        "https://ghaimcenter.com/laravel/api/user/bookings/complete-book",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking_id: bookingToVerify.id,
            completion_otp: otpCode,
          }),
        }
      );

      if (response.ok) {
        await fetchBookings();
        handleCloseVerify();
      } else {
        const data = await response.json().catch(() => ({}));
        setOtpError(data?.message || "فشل التحقق من الكود");
      }
    } catch (error) {
      console.error("Error submitting verify:", error);
      setOtpError("حدث خطأ أثناء التحقق. حاول مرة أخرى");
    } finally {
      setOtpSubmitting(false);
    }
  };

  // Get doctor name from staff data
  const getDoctorName = (booking) => {
    const clinicInfo = staffData[booking.clinic_id];
    if (!clinicInfo) return "الطبيب";

    if (
      clinicInfo.staff &&
      Array.isArray(clinicInfo.staff) &&
      booking.staff_id
    ) {
      const selectedStaff = clinicInfo.staff.find(
        (s) => s.id === booking.staff_id
      );
      if (selectedStaff) {
        return (
          selectedStaff.name ||
          selectedStaff.staff_name ||
          selectedStaff.full_name ||
          "الطبيب"
        );
      }
    }

    return clinicInfo.owner_name || "الطبيب";
  };

  // Get clinic name
  const getClinicName = (clinicId) => {
    const clinicInfo = staffData[clinicId];
    return clinicInfo?.name || clinicInfo?.clinic_name || "عيادة غير محددة";
  };

  // Resolve service name from booking using clinic services by ID
  const getServiceName = (booking) => {
    const clinicInfo = staffData[booking.clinic_id];
    const serviceId = booking.service_id || booking.serviceId;
    if (
      clinicInfo?.services &&
      Array.isArray(clinicInfo.services) &&
      serviceId
    ) {
      const svc = clinicInfo.services.find((s) => s.id === serviceId);
      if (svc) return svc.title_ar || svc.title || svc.name || "الخدمة";
    }
    return booking.services || booking.service_name || "الخدمة";
  };

  // Get status info
  const getStatusInfo = (status) => {
    if (status === 1) {
      return { text: "مؤكد", color: "green" };
    } else {
      return { text: "معلق", color: "yellow" };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return "غير محدد";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="bookings-container">
        <div className="bookings-header">
          <h2 className="bookings-title">حجوزاتي</h2>
        </div>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>جاري تحميل الحجوزات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      {/* Header */}
      <div className="bookings-header">
        <div className="bookings-title-section">
          <h2 className="bookings-title">حجوزاتي</h2>
          <span className="bookings-count">{bookings.length} حجز</span>
        </div>
        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <FaSync className={`refresh-icon ${refreshing ? "spinning" : ""}`} />
          {refreshing ? "جاري التحديث..." : "تحديث"}
        </button>
      </div>

      {/* Bookings Cards */}
      <div className="bookings-cards-list">
        {bookings.length > 0 ? (
          bookings.map((booking) => {
            return (
              <div key={booking.id} className="booking-card">
                <div className="booking-card-content">
                  <div className="booking-service-section">
                    <div className="service-icon">
                      <FaStethoscope />
                    </div>
                    <div className="service-details">
                      <h4 className="clinic-name">
                        {getClinicName(booking.clinic_id)}
                      </h4>
                      <p className="service-name">{getServiceName(booking)}</p>
                    </div>
                  </div>

                  <div className="booking-datetime">
                    <div className="date-info">
                      <FaCalendarAlt className="date-icon" />
                      <span className="date-text">
                        {formatDate(booking.date)}
                      </span>
                    </div>
                    <div className="time-info">
                      <FaClock className="time-icon" />
                      <span className="time-text">
                        {formatTime(booking.time)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="booking-actions">
                  <button
                    className="view-btn-white"
                    onClick={() => handleViewBooking(booking)}
                  >
                    <FaEye />
                    عرض
                  </button>
                  <button
                    className="verify-btn-dashboard"
                    onClick={() => handleOpenVerify(booking)}
                  >
                    <FaCheckCircle />
                    تحقق
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteBooking(booking)}
                  >
                    <FaTrash />
                    حذف
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-content">
            <FaCalendarAlt className="empty-icon" />
            <div className="empty-text">
              <div className="empty-title">لا توجد حجوزات حالياً</div>
              <div className="empty-subtitle">
                ستظهر حجوزاتك هنا عند إنشائها
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="booking-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">تفاصيل الحجز</h3>
            </div>

            <div className="modal-content">
              <div className="details-grid">
                <div className="detail-card">
                  <div className="detail-icon">
                    <FaStethoscope />
                  </div>
                  <div className="detail-info">
                    <span className="detail-label">الخدمة</span>
                    <span className="detail-value">
                      {selectedBooking.services}
                    </span>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-icon">
                    <FaUser />
                  </div>
                  <div className="detail-info">
                    <span className="detail-label">الطبيب</span>
                    <span className="detail-value">
                      {getDoctorName(selectedBooking)}
                    </span>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-icon">
                    <FaStethoscope />
                  </div>
                  <div className="detail-info">
                    <span className="detail-label">العيادة</span>
                    <span className="detail-value">
                      {getClinicName(selectedBooking.clinic_id)}
                    </span>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="detail-info">
                    <span className="detail-label">التاريخ</span>
                    <span className="detail-value">
                      {formatDate(selectedBooking.date)}
                    </span>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-icon">
                    <FaClock />
                  </div>
                  <div className="detail-info">
                    <span className="detail-label">الوقت</span>
                    <span className="detail-value">
                      {formatTime(selectedBooking.time)}
                    </span>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-icon">
                    <FaCheckCircle />
                  </div>
                  <div className="detail-info">
                    <span className="detail-label">الحالة</span>
                    <span
                      className={`detail-value status-${getStatusInfo(selectedBooking.status).color}`}
                    >
                      {getStatusInfo(selectedBooking.status).text}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="close-btn" onClick={handleCloseModal}>
                إغلاق
              </button>
              <button
                className="delete-booking-btn"
                onClick={() => handleDeleteBooking(selectedBooking)}
              >
                <FaTrash />
                حذف الحجز
              </button>
            </div>
          </div>
        </div>
      )}

      {showOtpPopup && (
        <div className="otp-popup-overlay" onClick={handleCloseVerify}>
          <div
            className="otp-popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="otp-popup-header">
              <h3>إدخال كود التحقق</h3>
              <button className="otp-popup-close" onClick={handleCloseVerify}>
                ×
              </button>
            </div>
            <div className="otp-popup-form">
              <div className="otp-input-group">
                <label>الرجاء إدخال كود التحقق المرسل إليك</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="أدخل الكود هنا"
                  dir="ltr"
                />
                {otpError && (
                  <div
                    style={{
                      color: "#EF4444",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    {otpError}
                  </div>
                )}
              </div>
              <div className="otp-popup-buttons">
                <button
                  className="otp-cancel-btn"
                  onClick={handleCloseVerify}
                  disabled={otpSubmitting}
                >
                  إلغاء
                </button>
                <button
                  className="otp-verify-btn"
                  onClick={handleSubmitVerify}
                  disabled={otpSubmitting || !otpCode}
                >
                  {otpSubmitting ? "جاري التحقق..." : "تحقق"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsFilter;
