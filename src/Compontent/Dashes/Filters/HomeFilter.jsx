import React, { useState, useEffect } from "react";
import {
  FaChartLine,
  FaClock,
  FaStethoscope,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarAlt,
  FaSync,
  FaUser,
  FaTimes,
} from "react-icons/fa";

// OTP Verification Popup Component
const OTPVerificationPopup = ({ isOpen, onClose, onVerify, bookingId }) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onVerify(bookingId, otp);
      setOtp("");
      onClose();
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("خطأ في التحقق من OTP");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="otp-popup-overlay">
      <div className="otp-popup-content">
        <div className="otp-popup-header">
          <h3>تحقق من OTP</h3>
          <button onClick={onClose} className="otp-popup-close">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="otp-popup-form">
          <div className="otp-input-group">
            <label>أدخل كود التحقق:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="أدخل OTP"
              required
              maxLength="6"
            />
          </div>

          <div className="otp-popup-buttons">
            <button type="button" onClick={onClose} className="otp-cancel-btn">
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="otp-verify-btn"
            >
              {isLoading ? "جاري التحقق..." : "تحقق"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Home filter component - Main dashboard view
const HomeFilter = () => {
  const [bookings, setBookings] = useState([]);
  const [staffData, setStaffData] = useState({}); // Store staff data by ID
  const [stats, setStats] = useState({
    service_count: 0,
    count: 0,
    completed: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  // Fetch staff data by clinic ID (since individual staff API doesn't exist)
  const fetchStaffData = async (clinicId) => {
    try {
      console.log("👨‍⚕️ Fetching staff data for clinic ID:", clinicId);
      const token = localStorage.getItem("userToken");
      if (!token || !clinicId) {
        console.log("👨‍⚕️ No token or clinicId, returning null");
        return null;
      }

      console.log(
        "👨‍⚕️ Making request to:",
        `https://ghaimcenter.com/laravel/api/clinics/${clinicId}`
      );
      const response = await fetch(
        `https://ghaimcenter.com/laravel/api/clinics/${clinicId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("👨‍⚕️ Clinic API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("👨‍⚕️ Clinic data fetched successfully:", data);
        return data.data || data;
      } else {
        console.log("👨‍⚕️ Clinic API error response:", response.status);
        const errorData = await response.json().catch(() => ({}));
        console.log("👨‍⚕️ Clinic API error details:", errorData);
      }
    } catch (error) {
      console.error("👨‍⚕️ Error fetching clinic data:", error);
    }
    return null;
  };

  // Fetch bookings data
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        console.error("No user token found");
        return;
      }

      const response = await fetch(
        "https://ghaimcenter.com/laravel/api/user/bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Bookings data:", data);
        console.log("📊 Raw bookings array:", data.data?.bookings);
        console.log("📊 Bookings count:", data.data?.bookings?.length || 0);

        const bookingsArray = data.data?.bookings || [];
        console.log(
          "🔄 Setting bookings state with:",
          bookingsArray.length,
          "bookings"
        );
        console.log(
          "🔄 New bookings IDs:",
          bookingsArray.map((b) => b.id)
        );

        // Get unique clinic IDs from bookings
        const clinicIds = [
          ...new Set(bookingsArray.map((b) => b.clinic_id).filter((id) => id)),
        ];
        console.log("🏥 Unique clinic IDs:", clinicIds);

        // Fetch clinic data for all unique clinic IDs
        console.log("🏥 Starting to fetch clinic data for IDs:", clinicIds);
        const clinicPromises = clinicIds.map((clinicId) =>
          fetchStaffData(clinicId)
        );
        const clinicResults = await Promise.all(clinicPromises);
        console.log("🏥 Clinic results from Promise.all:", clinicResults);

        // Create clinic data object
        const newClinicData = {};
        clinicIds.forEach((clinicId, index) => {
          console.log(
            `🏥 Processing clinic ${clinicId}:`,
            clinicResults[index]
          );
          if (clinicResults[index]) {
            newClinicData[clinicId] = clinicResults[index];
          }
        });

        console.log("🏥 Final clinic data object:", newClinicData);
        setStaffData(newClinicData);

        setBookings(bookingsArray);
        setStats(
          data.data.stats || {
            service_count: 0,
            count: 0,
            completed: 0,
            pending: 0,
          }
        );

        console.log(
          "✅ Bookings state updated with:",
          bookingsArray.length,
          "bookings"
        );
      } else {
        console.error("Failed to fetch bookings, status:", response.status);
        const errorData = await response.json().catch(() => ({}));
        console.error("Error details:", errorData);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  // Handle OTP verification
  const handleVerifyOTP = async (bookingId, otp) => {
    try {
      const token = localStorage.getItem("userToken");

      console.log("🔐 Verifying booking:", { bookingId, otp });

      // Try the completion endpoint based on API structure
      const response = await fetch(
        `https://ghaimcenter.com/laravel/api/user/bookings/complete-book`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking_id: bookingId,
            completion_otp: otp,
          }),
        }
      );

      console.log("📡 Verification response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Verification successful:", result);
        // Refresh bookings after successful verification
        await fetchBookings();
        alert("تم تأكيد الحجز بنجاح!");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Verification failed:", errorData);
        throw new Error(errorData.message || "فشل التحقق من OTP");
      }
    } catch (error) {
      console.error("💥 Verification error:", error);
      throw error;
    }
  };

  // Get upcoming confirmed appointments
  const getUpcomingAppointments = () => {
    console.log("🔄 Loading upcoming bookings...");
    console.log("🔄 All bookings:", bookings);
    console.log("🔄 Bookings count:", bookings.length);

    const today = new Date().toISOString().split("T")[0];
    console.log("🔄 Today date:", today);

    const confirmed = bookings.filter((booking) => {
      console.log(
        "🔄 Checking booking:",
        booking.id,
        "status:",
        booking.status,
        "date:",
        booking.date
      );
      return booking.status === 1 && booking.date >= today;
    });
    console.log("✅ Confirmed upcoming bookings:", confirmed);

    const sorted = confirmed.sort(
      (a, b) =>
        new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time)
    );

    const processed = sorted.map((booking) => {
      console.log("🔍 Processing booking:", booking.id);
      console.log("🔍 Booking data:", booking);
      console.log("🔍 Clinic ID:", booking.clinic_id);
      console.log("🔍 Staff ID:", booking.staff_id);
      console.log("🔍 Clinic data from state:", staffData[booking.clinic_id]);

      const clinicInfo = staffData[booking.clinic_id];
      let doctorName = "الطبيب";

      // Try to get staff name from clinic staff array
      if (
        clinicInfo?.staff &&
        Array.isArray(clinicInfo.staff) &&
        booking.staff_id
      ) {
        const selectedStaff = clinicInfo.staff.find(
          (s) => s.id === booking.staff_id
        );
        if (selectedStaff) {
          doctorName =
            selectedStaff.name ||
            selectedStaff.staff_name ||
            selectedStaff.full_name ||
            "الطبيب";
          console.log("🔍 Found staff in clinic data:", selectedStaff);
          console.log("🔍 Using staff name:", doctorName);
        } else {
          console.log("🔍 Staff not found in clinic data, using owner name");
          doctorName = clinicInfo?.owner_name || "الطبيب";
        }
      } else {
        console.log("🔍 No staff data available, using owner name");
        doctorName = clinicInfo?.owner_name || "الطبيب";
      }

      console.log("🔍 Final doctor name determined:", doctorName);

      return {
        id: booking.id,
        serviceName: getServiceName(booking),
        doctor: doctorName,
        date: booking.date,
        time: booking.time,
        status: booking.status,
      };
    });

    console.log("📅 Processed upcoming bookings:", processed);
    console.log(
      "📅 Returning processed bookings with length:",
      processed.length
    );

    return processed;
  };

  // Get recent bookings (last 3)
  const getRecentBookings = () => {
    console.log("🔄 Processing recent bookings...");
    const recent = bookings
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);

    console.log("📅 Recent bookings raw:", recent);

    // Process recent bookings to include doctor names
    const processedRecent = recent.map((booking) => {
      console.log("🔍 Processing recent booking:", booking.id);
      console.log("🔍 Recent booking data:", booking);
      console.log("🔍 Recent clinic ID:", booking.clinic_id);
      console.log("🔍 Recent staff ID:", booking.staff_id);
      console.log(
        "🔍 Recent clinic data from state:",
        staffData[booking.clinic_id]
      );

      const clinicInfo = staffData[booking.clinic_id];
      let doctorName = "الطبيب";

      // Try to get staff name from clinic staff array
      if (
        clinicInfo?.staff &&
        Array.isArray(clinicInfo.staff) &&
        booking.staff_id
      ) {
        const selectedStaff = clinicInfo.staff.find(
          (s) => s.id === booking.staff_id
        );
        if (selectedStaff) {
          doctorName =
            selectedStaff.name ||
            selectedStaff.staff_name ||
            selectedStaff.full_name ||
            "الطبيب";
          console.log("🔍 Found recent staff in clinic data:", selectedStaff);
          console.log("🔍 Using recent staff name:", doctorName);
        } else {
          console.log(
            "🔍 Recent staff not found in clinic data, using owner name"
          );
          doctorName = clinicInfo?.owner_name || "الطبيب";
        }
      } else {
        console.log("🔍 No recent staff data available, using owner name");
        doctorName = clinicInfo?.owner_name || "الطبيب";
      }

      console.log("🔍 Recent doctor name determined:", doctorName);

      return {
        ...booking,
        doctor: doctorName,
      };
    });

    console.log("📅 Processed recent bookings:", processedRecent);
    return processedRecent;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "غير محدد";

    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get status text and color
  const getStatusInfo = (status) => {
    if (status === 1) {
      return { text: "مؤكد", color: "green" };
    } else {
      return { text: "معلق", color: "yellow" };
    }
  };

  // Resolve service name from booking using clinic services by ID
  // Prefer Arabic title, fallback to other name fields
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

  // Handle verify button click
  const handleVerifyClick = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowOTPPopup(true);
  };

  useEffect(() => {
    fetchBookings();

    // Listen for new booking creation events
    const handleBookingCreated = () => {
      console.log("🔄 New booking created, refreshing bookings...");
      fetchBookings();
    };

    window.addEventListener("bookingCreated", handleBookingCreated);

    return () => {
      window.removeEventListener("bookingCreated", handleBookingCreated);
    };
  }, []);

  return (
    <>
      {/* Main Dashboard Header */}
      <div className="ios-main-header">
        <h1 className="ios-main-title">
          <FaChartLine className="ios-wave-icon" />
          لوحة التحكم الرئيسية
        </h1>
        <div className="ios-last-update">
          <FaClock className="ios-clock-icon" />
          آخر تحديث: ١٤٤٧/٤/٢٠ هـ
        </div>
      </div>

      {/* Summary Cards Row (services moved to last) */}
      <div className="ios-summary-cards">
        <div className="ios-summary-card card-purple">
          <div className="card-number">{stats.count}</div>
          <div className="card-content-row">
            <div className="card-icon-wrapper">
              <FaCalendarAlt className="card-main-icon" />
            </div>
            <div className="card-label one-line">إجمالي الحجوزات</div>
          </div>
          <div className="card-change">
            <span>+{stats.count}</span>
          </div>
        </div>

        <div className="ios-summary-card card-green">
          <div className="card-number">{stats.completed}</div>
          <div className="card-content-row">
            <div className="card-icon-wrapper">
              <FaCheckCircle className="card-main-icon" />
            </div>
            <div className="card-label one-line">الحجوزات المؤكدة</div>
          </div>
          <div className="card-change">
            <span>{stats.completed > 0 ? "مؤكدة" : "لا توجد"}</span>
          </div>
        </div>

        <div className="ios-summary-card card-yellow">
          <div className="card-number">{stats.pending}</div>
          <div className="card-content-row">
            <div className="card-icon-wrapper">
              <FaExclamationTriangle className="card-main-icon" />
            </div>
            <div className="card-label one-line">الحجوزات المعلقة</div>
          </div>
          <div className="card-change">
            <span>{stats.pending > 0 ? "تحتاج تحقق" : "لا توجد"}</span>
          </div>
        </div>

        {/* Services last */}
        <div className="ios-summary-card card-blue">
          <div className="card-number">{stats.service_count}</div>
          <div className="card-content-row">
            <div className="card-icon-wrapper">
              <FaStethoscope className="card-main-icon" />
            </div>
            <div className="card-label one-line">الخدمات المتاحة</div>
          </div>
          <div className="card-change">
            <span>+{stats.service_count}</span>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="ios-content-sections">
        {/* Recent Bookings - Now on the right */}
        <div className="ios-content-card bookings-table-card">
          <div className="ios-content-header">
            <div className="ios-content-title">
              <FaCalendarAlt className="ios-title-icon" />
              الحجوزات الأخيرة
            </div>
            <div className="ios-booking-count">
              {getRecentBookings().length} حجز
            </div>
          </div>

          {loading ? (
            <div className="ios-loading-content">
              <div className="ios-loading-spinner"></div>
              <div className="ios-loading-text">جاري تحميل البيانات...</div>
            </div>
          ) : (() => {
              const recent = getRecentBookings();
              console.log("🎯 Rendering recent bookings section...");
              console.log("🎯 recent.length:", recent.length);
              console.log("🎯 recent:", recent);
              return recent.length > 0;
            })() ? (
            <div className="bookings-table-container">
              <div className="bookings-table">
                <div className="bookings-table-header">
                  <div className="bookings-header-cell">الخدمة</div>
                  <div className="bookings-header-cell">الطبيب</div>
                  <div className="bookings-header-cell">التاريخ</div>
                  <div className="bookings-header-cell">الوقت</div>
                  <div className="bookings-header-cell">الحالة</div>
                  <div className="bookings-header-cell">الإجراءات</div>
                </div>

                <div className="bookings-table-body">
                  {getRecentBookings().map((booking) => (
                    <div key={booking.id} className="bookings-table-row">
                      <div className="bookings-table-cell" data-label="الخدمة">
                        <FaStethoscope className="bookings-cell-icon" />
                        <span>{getServiceName(booking)}</span>
                      </div>
                      <div className="bookings-table-cell" data-label="الطبيب">
                        <FaUser className="bookings-cell-icon" />
                        <span>{booking.doctor}</span>
                      </div>
                      <div className="bookings-table-cell" data-label="التاريخ">
                        <FaCalendarAlt className="bookings-cell-icon" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="bookings-table-cell" data-label="الوقت">
                        <FaClock className="bookings-cell-icon" />
                        <span>{formatTime(booking.time)}</span>
                      </div>
                      <div className="bookings-table-cell" data-label="الحالة">
                        <span
                          className={`bookings-status-badge bookings-status-${getStatusInfo(booking.status).color}`}
                        >
                          {getStatusInfo(booking.status).text}
                        </span>
                      </div>
                      <div
                        className="bookings-table-cell"
                        data-label="الإجراءات"
                      >
                        {booking.status === 0 && (
                          <button
                            className="bookings-verify-btn"
                            onClick={() => handleVerifyClick(booking.id)}
                            title={`تحقق من الحجز - ID: ${booking.id}`}
                          >
                            <svg
                              data-prefix="fas"
                              data-icon="shield-halved"
                              className="bookings-verify-icon"
                              role="img"
                              viewBox="0 0 512 512"
                              aria-hidden="true"
                              style={{ transform: "scaleX(-1)" }}
                            >
                              <path
                                fill="currentColor"
                                d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"
                              ></path>
                            </svg>
                            تحقق
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="ios-empty-content">
              <FaCalendarAlt className="ios-empty-icon" />
              <div className="ios-empty-text">
                <div className="ios-empty-title">لا توجد حجوزات حالياً</div>
                <div className="ios-empty-subtitle">
                  ستظهر حجوزاتك هنا عند إنشائها
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Appointments - Now on the left */}
        <div className="ios-content-card appointments-card">
          <div className="ios-content-header">
            <div className="ios-content-title">
              <FaClock className="ios-title-icon" />
              المواعيد المؤكدة القادمة
            </div>
            <button
              className="ios-refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FaSync
                className={`ios-refresh-icon ${refreshing ? "spinning" : ""}`}
              />
              {refreshing ? "جاري التحديث..." : "تحديث"}
            </button>
          </div>

          {loading ? (
            <div className="ios-loading-content">
              <div className="ios-loading-spinner"></div>
              <div className="ios-loading-text">جاري تحميل البيانات...</div>
            </div>
          ) : (() => {
              const appointments = getUpcomingAppointments();
              console.log("🎯 Rendering appointments section...");
              console.log("🎯 appointments.length:", appointments.length);
              console.log("🎯 appointments:", appointments);
              return appointments.length > 0;
            })() ? (
            <div className="ios-appointments-list">
              {getUpcomingAppointments().map((appointment) => (
                <div key={appointment.id} className="ios-appointment-item">
                  <div className="appointment-date-service">
                    <FaCalendarAlt className="appointment-icon" />
                    <span className="one-line">
                      {appointment.serviceName} - {formatDate(appointment.date)}
                    </span>
                  </div>
                  <div className="appointment-doctor">
                    <FaUser className="appointment-icon" />
                    <span className="one-line">{appointment.doctor}</span>
                  </div>
                  <div className="appointment-time">
                    <FaClock className="appointment-icon" />
                    <span className="one-line">
                      {formatTime(appointment.time)}
                    </span>
                  </div>
                  <div className="appointment-status">
                    <span
                      className={`status-badge status-${getStatusInfo(appointment.status).color}`}
                    >
                      {getStatusInfo(appointment.status).text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ios-empty-content">
              <FaClock className="ios-empty-icon" />
              <div className="ios-empty-text">
                <div className="ios-empty-title">لا توجد مواعيد قادمة</div>
                <div className="ios-empty-subtitle">
                  ستظهر مواعيدك المؤكدة القادمة هنا
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OTP Verification Popup */}
      <OTPVerificationPopup
        isOpen={showOTPPopup}
        onClose={() => {
          setShowOTPPopup(false);
          setSelectedBookingId(null);
        }}
        onVerify={handleVerifyOTP}
        bookingId={selectedBookingId}
      />
    </>
  );
};

export default HomeFilter;
