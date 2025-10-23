import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./ServiceDetails.css";

const ServiceDetails = () => {
  const { clinicId, serviceId } = useParams();
  const navigate = useNavigate();
  const [serviceData, setServiceData] = useState(null);
  const [clinicData, setClinicData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Choose Doctor, 2: Date & Time
  const [staffData, setStaffData] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [availableTimes, setAvailableTimes] = useState({});
  const [availableTimesError, setAvailableTimesError] = useState("");

  // Normalize any date-like input to YYYY-MM-DD (hoisted as function to be usable before declarations)
  function normalizeDateYMD(dateInput) {
    if (!dateInput) return "";
    if (typeof dateInput === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) return dateInput; // already YYYY-MM-DD
      const m = dateInput.match(/^\s*(\d{2})[\/-](\d{2})[\/-](\d{4})\s*$/);
      if (m) {
        const [, dd, mm, yyyy] = m;
        return `${yyyy}-${mm}-${dd}`;
      }
      const digitsOnly = dateInput.replace(/[^0-9]/g, "");
      if (digitsOnly.length === 8) {
        let yyyy, mm, dd;
        if (/^(19|20)/.test(digitsOnly)) {
          yyyy = digitsOnly.slice(0, 4);
          mm = digitsOnly.slice(4, 6);
          dd = digitsOnly.slice(6, 8);
        } else {
          dd = digitsOnly.slice(0, 2);
          mm = digitsOnly.slice(2, 4);
          yyyy = digitsOnly.slice(4, 8);
        }
        return `${yyyy}-${mm}-${dd}`;
      }
    }
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(d)) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // Format date for UI as MM-DD-YYYY (month first)
  function formatDateMDY(dateInput) {
    const ymd = normalizeDateYMD(dateInput);
    if (!ymd) return "";
    const [yyyy, mm, dd] = ymd.split("-");
    return `${mm}-${dd}-${yyyy}`;
  }

  const minDate = useMemo(() => normalizeDateYMD(new Date()), []);

  const [addresses, setAddresses] = useState([]);
  const [bookingData, setBookingData] = useState({
    staff_id: null,
    date: "",
    time: "", // legacy field (not used for POST)
    timeCode: "", // HHmm format required by API
    timeLabel: "", // HH:MM for UI
    address: "",
    notes: "",
  });
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccessId, setBookingSuccessId] = useState(null);

  // Saudi Riyal SVG Component
  const SaudiRiyalIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1124.14 1256.39"
      width="16"
      height="18"
      aria-label="Saudi Riyal"
      title="Saudi Riyal"
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        marginRight: "4px",
      }}
    >
      <path
        fill="currentColor"
        d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"
      ></path>
      <path
        fill="currentColor"
        d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"
      ></path>
    </svg>
  );

  // Fetch service and clinic details
  useEffect(() => {
    const fetchServiceDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(
          `Fetching service details for clinic ${clinicId}, service ${serviceId}`
        );
        const response = await fetch(
          `https://ghaimcenter.com/laravel/api/clinics/${clinicId}/services`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Clinic Services Response:", result);

        if (result.status === "success" && result.data) {
          setClinicData(result.data);

          // Find the specific service
          const service = result.data.services?.find((s) => s.id == serviceId);
          if (service) {
            setServiceData(service);
            console.log("✅ Service found:", service);
          } else {
            setError("الخدمة المطلوبة غير موجودة");
            console.error("❌ Service not found");
          }
        } else {
          setError("فشل تحميل بيانات الخدمة");
        }
      } catch (error) {
        setError("حدث خطأ في الاتصال بالخادم");
        console.error("❌ Error fetching service details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (clinicId && serviceId) {
      fetchServiceDetails();
    }
  }, [clinicId, serviceId]);

  // Fetch staff data
  const fetchStaffData = async () => {
    try {
      const response = await fetch(
        `https://ghaimcenter.com/laravel/api/clinics/${clinicId}/staff`
      );
      const result = await response.json();
      if (result.status === "success") {
        setStaffData(result.data.staff || []);
        console.log(`Staff data for clinic ${clinicId}:`, result.data.staff);
      } else {
        console.log(`No staff found for clinic ${clinicId}`);
        setStaffData([]);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      setStaffData([]);
    }
  };

  // Fetch available times
  const fetchAvailableTimes = async (staffId, date) => {
    try {
      const safeDate = normalizeDateYMD(date);
      const url = `https://ghaimcenter.com/laravel/api/clinics/available_times/${clinicId}?staff_id=${staffId}&date=${safeDate}&service_id=${serviceId}`;
      console.log("⏰ Fetching available times...", {
        staffId,
        date,
        safeDate,
        serviceId,
        url,
      });
      const response = await fetch(url);
      console.log("⏰ Available times response status:", response.status);
      const rawText = await response
        .clone()
        .text()
        .catch(() => "");
      let result = {};
      try {
        result = await response.json();
      } catch (e) {
        console.warn("⏰ Failed to parse JSON, raw:", rawText);
      }
      console.log("⏰ Available times JSON:", result);
      if (!response.ok) {
        if (response.status === 422) {
          console.warn("⏰ 422 Unprocessable Entity for available_times", {
            staffId,
            safeDate,
            serviceId,
            url,
            rawText,
            result,
          });
          setAvailableTimesError(
            result?.message || "لا توجد أوقات متاحة لهذا اليوم"
          );
        }
        setAvailableTimes({});
        return;
      }
      if (result && result.status === "success") {
        setAvailableTimes(result.data || {});
        setAvailableTimesError("");
      } else {
        setAvailableTimes({});
        setAvailableTimesError(
          result?.message || "لا توجد أوقات متاحة لهذا اليوم"
        );
      }
    } catch (error) {
      console.error("Error fetching available times:", error);
      setAvailableTimes({});
      setAvailableTimesError("تعذر جلب الأوقات. حاول مرة أخرى.");
    }
  };

  // Fetch user addresses (requires auth token)
  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        console.warn("No user token found, skipping user addresses fetch");
        setAddresses([]);
        return;
      }

      const response = await fetch(
        "https://ghaimcenter.com/laravel/api/user/addresses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      if (result && result.status === "success" && Array.isArray(result.data)) {
        const normalized = result.data.map((addr, idx) => {
          const label =
            addr.full_address ||
            addr.address ||
            [addr.city, addr.district, addr.street].filter(Boolean).join(" - ");
          return { id: addr.id ?? idx, label };
        });
        setAddresses(normalized);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error("Error fetching user addresses:", error);
      setAddresses([]);
    }
  };

  const handleBookNow = () => {
    setShowBookingForm(true);
    setBookingStep(1);
    fetchStaffData();
    fetchAddresses();
  };

  const handleStaffSelect = (staff) => {
    setSelectedStaff(staff);
    setBookingData((prev) => ({ ...prev, staff_id: staff.id }));
  };

  const handleNextStep = () => {
    if (bookingStep === 1 && selectedStaff) {
      setBookingStep(2);
    }
  };

  const handleDateChange = (date) => {
    const safeDate = normalizeDateYMD(date);
    setBookingData((prev) => ({ ...prev, date: safeDate }));
    if (selectedStaff && safeDate) {
      setAvailableTimes({});
      setAvailableTimesError("");
      fetchAvailableTimes(selectedStaff.id, safeDate);
    }
  };

  const handleTimeSelect = (label, code) => {
    setBookingData((prev) => ({
      ...prev,
      time: label,
      timeLabel: label,
      timeCode: String(code),
    }));
  };

  const handleConfirmBooking = async () => {
    try {
      setBookingError("");
      setIsSubmittingBooking(true);

      const token = localStorage.getItem("userToken");
      if (!token) {
        setBookingError("يرجى تسجيل الدخول أولاً");
        setIsSubmittingBooking(false);
        return;
      }

      const payload = {
        clinic_id: Number(clinicId),
        service_id: Number(serviceId),
        staff_id: Number(bookingData.staff_id || selectedStaff?.id),
        address_id: bookingData.address
          ? Number(bookingData.address)
          : undefined,
        date: normalizeDateYMD(bookingData.date),
        time: bookingData.timeCode,
        notes: bookingData.notes || "حجز من صفحة تفاصيل الخدمة",
      };

      // Basic validation
      if (
        !payload.clinic_id ||
        !payload.service_id ||
        !payload.staff_id ||
        !payload.date ||
        !payload.time
      ) {
        setBookingError(
          "يرجى اختيار الطبيب، التاريخ، والوقت، ثم العنوان إن لزم."
        );
        setIsSubmittingBooking(false);
        return;
      }

      console.log("📝 Creating booking with payload:", payload);
      const res = await fetch(
        "https://ghaimcenter.com/laravel/api/user/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const raw = await res
        .clone()
        .text()
        .catch(() => "");
      let json = {};
      try {
        json = await res.json();
      } catch {}
      console.log(
        "📝 Create booking status:",
        res.status,
        "json:",
        json,
        "raw:",
        raw
      );

      if (!res.ok) {
        setBookingError(json?.message || "فشل إنشاء الحجز");
        setIsSubmittingBooking(false);
        return;
      }

      const createdId = json?.data?.id || json?.booking_id;
      setBookingSuccessId(createdId || null);
      // Navigate to dashboard bookings after success
      navigate("/dashboard/bookings");
    } catch (e) {
      console.error("Create booking error:", e);
      setBookingError("حدث خطأ أثناء إنشاء الحجز. حاول مرة أخرى.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="service-details-page">
        <div className="service-details-container">
          <div className="service-details-loading">
            <div className="loading-spinner"></div>
            <p>جاري تحميل تفاصيل الخدمة...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !serviceData) {
    return (
      <div className="service-details-page">
        <div className="service-details-container">
          <div className="service-details-error">
            <h2>خطأ في تحميل الخدمة</h2>
            <p>{error || "الخدمة غير موجودة"}</p>
            <button
              onClick={() => navigate("/services")}
              className="back-to-services-btn"
            >
              العودة للخدمات
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use owner_photo as the main service image (fallback to service images)
  const serviceImage =
    clinicData?.owner_photo ||
    (serviceData.images && serviceData.images.length > 0
      ? serviceData.images[0].image
      : "/imge.png");

  const hasPrice = serviceData.price && Number(serviceData.price) > 0;

  return (
    <div className="service-details-page">
      <div className="service-details-container">
        {/* Header with Back Button */}
        <div className="service-details-header">
          <Link to="/services" className="back-to-services-link">
            ← العودة للخدمات
          </Link>
        </div>

        <div className="service-details-content">
          {/* Left Side - Service Information */}
          <div className="service-details-info">
            {/* Service Title */}
            <h1 className="service-details-title">
              {serviceData.title_ar || serviceData.title}
            </h1>

            {/* Service Description */}
            <p className="service-details-description">
              {serviceData.about_ar ||
                serviceData.about ||
                "خدمة متميزة بأحدث التقنيات"}
            </p>

            {/* Service Details Boxes */}
            <div className="service-details-boxes">
              {/* Duration Box */}
              <div className="service-detail-box compact-duration">
                <div className="service-detail-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                </div>
                <div className="service-detail-content">
                  <span className="service-detail-inline">
                    <span className="service-detail-unit">دقيقة</span>

                    <span className="service-detail-value">
                      {serviceData.service_time}
                    </span>
                  </span>
                </div>
              </div>

              {/* Price Box */}
              <div className="service-detail-box vertical-price">
                <div className="service-detail-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className="service-detail-content">
                  <span className="service-detail-inline">
                    <span className="service-detail-label">السعر</span>
                    <span className="service-detail-value">
                      {hasPrice ? serviceData.price : "0"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Book Now Button */}
            <button className="service-book-btn" onClick={handleBookNow}>
              احجز الآن ←
            </button>
          </div>

          {/* Right Side - Service Image with Overlay */}
          <div className="service-details-image">
            <div className="service-image-container">
              <img
                src={serviceImage}
                alt={serviceData.title_ar || serviceData.title}
                className="service-main-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/imge.png";
                }}
              />
              {/* Clinic Name Overlay */}
              <div className="clinic-name-overlay">
                <div className="clinic-name-content">
                  <h2 className="overlay-clinic-name">
                    {clinicData?.clinic_name || "اسم العيادة"}
                  </h2>
                  <div className="overlay-clinic-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clinic Information or Booking Form */}
        {!showBookingForm && clinicData && (
          <div className="clinic-info-section">
            <h3 className="clinic-info-title">معلومات العيادة</h3>
            <div className="clinic-info-content">
              {/* Clinic Basic Info without large photo */}
              <div className="clinic-header">
                <div className="clinic-basic-info">
                  <h4 className="clinic-name">{clinicData.clinic_name}</h4>
                  <p className="clinic-owner">{clinicData.owner_name}</p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                    }}
                  >
                    <div className="clinic-rating"></div>
                    <div className="clinic-price-inline">
                      {serviceData.price && Number(serviceData.price) > 0 ? (
                        <>
                          <span>{serviceData.price}</span>
                          <SaudiRiyalIcon />
                        </>
                      ) : (
                        <span>اتصل للسعر</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinic Details */}
              <div className="clinic-details">
                <div className="clinic-info-item">
                  <strong>العنوان:</strong> {clinicData.clinic_address}
                </div>
                <div className="clinic-info-item">
                  <strong>الهاتف:</strong> {clinicData.clinic_phone}
                </div>
                <div className="clinic-info-item">
                  <strong>ساعات العمل:</strong>
                  <div className="clinic-hours">
                    <span>
                      الأحد - الخميس: {clinicData.mon_fri_from?.slice(0, 2)}:
                      {clinicData.mon_fri_from?.slice(2, 4)} -{" "}
                      {clinicData.mon_fri_to?.slice(0, 2)}:
                      {clinicData.mon_fri_to?.slice(2, 4)}
                    </span>
                    <span>
                      الجمعة - السبت: {clinicData.sat_sun_from?.slice(0, 2)}:
                      {clinicData.sat_sun_from?.slice(2, 4)} -{" "}
                      {clinicData.sat_sun_to?.slice(0, 2)}:
                      {clinicData.sat_sun_to?.slice(2, 4)}
                    </span>
                  </div>
                </div>
                {clinicData.clinic_about && (
                  <div className="clinic-info-item">
                    <strong>عن العيادة:</strong>
                    <p className="clinic-about">{clinicData.clinic_about}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Booking Form Section */}
        {showBookingForm && (
          <div className="booking-form-section">
            {/* Progress Indicator */}
            <div className="booking-progress" dir="rtl">
              <div
                className={`progress-step ${bookingStep >= 1 ? "active" : ""}`}
              >
                <div className="step-number">1</div>
                <div className="step-label">الطبيب</div>
              </div>
              <div className="progress-line"></div>
              <div
                className={`progress-step ${bookingStep >= 2 ? "active" : ""}`}
              >
                <div className="step-number">2</div>
                <div className="step-label">التاريخ والوقت</div>
              </div>
            </div>

            {/* Step 1: Choose Doctor */}
            {bookingStep === 1 && (
              <div className="booking-step-content" dir="rtl">
                <div className="step-header">
                  <h3>اختر الطبيب</h3>
                </div>

                <div className="staff-list" dir="rtl">
                  {staffData.map((staff) => (
                    <div
                      key={staff.id}
                      className={`staff-card ${selectedStaff?.id === staff.id ? "selected" : ""}`}
                      onClick={() => handleStaffSelect(staff)}
                      dir="rtl"
                    >
                      <img
                        src={staff.photo || "/imge.png"}
                        alt={staff.name}
                        className="staff-photo"
                      />
                      <div className="staff-info">
                        <h4>{staff.name}</h4>
                        <p>طبيب عام</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="step-actions" dir="rtl">
                  <button
                    className="next-btn"
                    onClick={handleNextStep}
                    disabled={!selectedStaff}
                  >
                    ← التالي
                  </button>
                  <button
                    className="back-btn"
                    onClick={() => setShowBookingForm(false)}
                  >
                    رجوع ←
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {bookingStep === 2 && (
              <div className="booking-step-content" dir="rtl">
                {/* Selected Doctor Info */}
                <div className="selected-doctor-info">
                  <div className="doctor-info-card">
                    <img
                      src={selectedStaff?.photo || "/imge.png"}
                      alt={selectedStaff?.name}
                      className="doctor-photo"
                    />
                    <div className="doctor-details">
                      <div className="doctor-label">الطبيب</div>
                      <div className="doctor-name">{selectedStaff?.name}</div>
                    </div>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="date-selection">
                  <label className="section-label">
                    التاريخ
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </label>
                  <input
                    type="date"
                    dir="ltr"
                    value={bookingData.date}
                    min={minDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="date-input"
                  />
                  {bookingData.date && (
                    <div className="date-display-mdy">
                      {formatDateMDY(bookingData.date)}
                    </div>
                  )}
                  {/* Quick date chips removed as requested */}
                </div>

                {/* Available Times */}
                {bookingData.date && (
                  <div className="available-times">
                    <label className="section-label">
                      الأوقات المتاحة
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                    </label>
                    {availableTimesError ? (
                      <div
                        style={{
                          color: "#b91c1c",
                          background: "#fee2e2",
                          border: "1px solid #fecaca",
                          padding: "0.75rem",
                          borderRadius: "8px",
                          fontSize: "0.9rem",
                        }}
                      >
                        {availableTimesError}
                      </div>
                    ) : (
                      <div className="time-slots">
                        {Object.entries(availableTimes)
                          .sort((a, b) => Number(a[1]) - Number(b[1]))
                          .map(([label, code]) => (
                            <button
                              key={code}
                              className={`time-slot ${bookingData.timeLabel === label ? "selected" : ""}`}
                              onClick={() => handleTimeSelect(label, code)}
                            >
                              {label}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Address Selection */}
                <div className="address-selection">
                  <label className="section-label">
                    العنوان
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </label>
                  <select
                    value={bookingData.address}
                    onChange={(e) =>
                      setBookingData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="address-select"
                  >
                    <option value="">اختر العنوان</option>
                    {addresses.map((addr, idx) => (
                      <option key={`${addr.id}-${idx}`} value={addr.id}>
                        {addr.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div className="notes-section">
                  <label className="section-label">ملاحظات (اختياري)</label>
                  <textarea
                    value={bookingData.notes}
                    onChange={(e) =>
                      setBookingData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="أضف أي ملاحظات...."
                    className="notes-textarea"
                  />
                </div>

                {bookingError && (
                  <div
                    style={{
                      color: "#b91c1c",
                      background: "#fee2e2",
                      border: "1px solid #fecaca",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {bookingError}
                  </div>
                )}
                <div className="step-actions" dir="rtl">
                  <button
                    className="confirm-btn"
                    disabled={isSubmittingBooking}
                    onClick={handleConfirmBooking}
                  >
                    {isSubmittingBooking
                      ? "... جاري إنشاء الحجز"
                      : "✓ تأكيد الحجز"}
                  </button>
                  <button
                    className="back-btn"
                    onClick={() => setBookingStep(1)}
                  >
                    رجوع ←
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetails;
