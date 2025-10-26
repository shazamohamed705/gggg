import React, { useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaStethoscope,
  FaHeadphones,
  FaUser,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClock,
  FaMapPin,
  FaStar,
  FaCheck,
  FaArrowLeft,
  FaArrowRight,
  FaUserMd,
} from "react-icons/fa";
import profileImage from "../../../assets/photo/service.png";
import { hasAvailableStaff } from "../../../utils/clinicChecker";
import "./AddressCards.css";
import "./SimpleProgressBar.css";
import "./ResponsiveGrid.css";

// New booking filter component - Multi-step booking process
const NewBookingFilter = ({
  currentBookingStep,
  setCurrentBookingStep,
  selectedClinic,
  setSelectedClinic,
  selectedDate,
  setSelectedDate,
  currentMonth,
  currentYear,
  goToPreviousMonth,
  goToNextMonth,
  getMonthName,
  setActiveFilter,
}) => {
  // Clinics data fetched from API
  const [clinics, setClinics] = useState([]);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [clinicStaff, setClinicStaff] = useState([]);
  const [clinicData, setClinicData] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [timesLoading, setTimesLoading] = useState(false);
  const [availableDays, setAvailableDays] = useState({}); // Store availability for each day
  const [daysLoading, setDaysLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [completionOtp, setCompletionOtp] = useState("");
  const [selectedDoctorName, setSelectedDoctorName] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchClinics = async () => {
      try {
        const res = await fetch("https://ghaimcenter.com/laravel/api/clinics");
        const json = await res.json();
        if (
          isMounted &&
          json &&
          json.status === "success" &&
          Array.isArray(json.data)
        ) {
          // Map clinics to clinics structure used by UI
          const mapped = json.data.map((clinic) => ({
            // Use clinic_name as the selection key as requested
            id: clinic.clinic_name,
            name: clinic.clinic_name,
            nameEn: clinic.owner_name,
            location: clinic.clinic_address,
            // Keep numeric id for future payload mapping if needed
            clinicId: clinic.id,
          }));
          setClinics(mapped);
        }
      } catch (e) {
        // Silent fail keeps UI functional with empty list
        console.error("Failed to load clinic", e);
      }
    };
    fetchClinics();
    return () => {
      isMounted = false;
    };
  }, []);

  // Resolve selected clinic name -> numeric clinicId
  const selectedClinicId = useMemo(() => {
    if (!selectedClinic) {
      console.log("🔍 No selectedClinic");
      return null;
    }
    const match = clinics.find((c) => c.id === selectedClinic);
    console.log("🔍 Looking for clinic:", selectedClinic);
    console.log("🔍 Available clinics:", clinics.map(c => ({ id: c.id, clinicId: c.clinicId })));
    console.log("🔍 Found match:", match);
    return match ? match.clinicId : null;
  }, [selectedClinic, clinics]);

  // Track selectedClinic changes
  useEffect(() => {
    console.log("🏥 selectedClinic changed to:", selectedClinic);
    console.log("🏥 selectedClinic type:", typeof selectedClinic);
  }, [selectedClinic]);

  const completeBooking = async () => {
    try {
      const token = localStorage.getItem("userToken");
      console.log("🔑 Token found:", token ? "Yes" : "No");

      if (!token) {
        alert("يرجى تسجيل الدخول أولاً");
        return;
      }

      // Validate all required fields
      console.log("🔍 Validation - selectedClinic:", selectedClinic);
      console.log("🔍 Validation - selectedClinicId:", selectedClinicId);
      console.log("🔍 Validation - clinics array:", clinics);
      
      if (!selectedClinic) {
        console.log("❌ No clinic selected");
        alert("يرجى اختيار العيادة أولاً");
        return;
      }

      if (!selectedClinicId) {
        console.log("❌ No clinic ID found for selected clinic:", selectedClinic);
        console.log("❌ Available clinics:", clinics.map(c => ({ id: c.id, clinicId: c.clinicId })));
        alert("خطأ في بيانات العيادة المحددة");
        return;
      }

      if (!selectedServiceId) {
        alert("يرجى اختيار الخدمة أولاً");
        return;
      }

      if (!selectedDoctorId) {
        alert("يرجى اختيار الطبيب أولاً");
        return;
      }

      if (!selectedAddressId) {
        alert("يرجى اختيار العنوان أولاً");
        return;
      }

      if (!selectedDate) {
        alert("يرجى اختيار التاريخ أولاً");
        return;
      }

      if (!selectedTime) {
        alert("يرجى اختيار الوقت أولاً");
        return;
      }

      // First, create the booking
      const bookingData = {
        clinic_id: selectedClinicId,
        service_id: selectedServiceId,
        staff_id: selectedDoctorId,
        address_id: selectedAddressId,
        date: `2025-10-${selectedDate}`,
        time: selectedTime,
        notes: "حجز من التطبيق",
      };

      console.log("📤 Creating booking with:", bookingData);
      console.log("🔍 Debug info:");
      console.log("🔍 selectedClinic:", selectedClinic);
      console.log("🔍 selectedClinicId:", selectedClinicId);
      console.log("🔍 selectedServiceId:", selectedServiceId);
      console.log("🔍 selectedDoctorId:", selectedDoctorId);
      console.log("🔍 selectedAddressId:", selectedAddressId);
      console.log("🔍 selectedDate:", selectedDate);
      console.log("🔍 selectedTime:", selectedTime);

      const createResponse = await fetch(
        "https://ghaimcenter.com/laravel/api/user/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bookingData),
        }
      );

      console.log("📥 Create booking response status:", createResponse.status);

      if (!createResponse.ok) {
        const error = await createResponse.json();
        alert(`خطأ في إنشاء الحجز: ${error.message || "حدث خطأ غير متوقع"}`);
        return;
      }

      const createResult = await createResponse.json();
      const bookingId = createResult.data?.id || createResult.booking_id;

      if (!bookingId) {
        alert("لم يتم إنشاء رقم الحجز بشكل صحيح");
        return;
      }

      // Booking created successfully, show success screen
      console.log("✅ Booking created successfully with ID:", bookingId);

      // Store doctor name before resetting
      console.log("🔍 Debugging doctor name retrieval:");
      console.log("🔍 selectedDoctorId:", selectedDoctorId);
      console.log("🔍 selectedDoctorId type:", typeof selectedDoctorId);
      console.log("🔍 clinicStaff array:", clinicStaff);
      console.log("🔍 clinicStaff length:", clinicStaff.length);
      console.log("🔍 clinicData:", clinicData);

      // Try to find selected staff with different approaches
      let selectedStaff = null;

      if (clinicStaff.length > 0 && selectedDoctorId) {
        // Try exact match first
        selectedStaff = clinicStaff.find((s) => s.id === selectedDoctorId);
        console.log("🔍 Exact match result:", selectedStaff);

        // If no exact match, try string comparison
        if (!selectedStaff) {
          selectedStaff = clinicStaff.find((s) => s.id == selectedDoctorId);
          console.log("🔍 String comparison result:", selectedStaff);
        }

        // If still no match, try with different field names
        if (!selectedStaff) {
          selectedStaff = clinicStaff.find(
            (s) => s.staff_id === selectedDoctorId
          );
          console.log("🔍 staff_id field result:", selectedStaff);
        }
      }

      console.log("🔍 Final selectedStaff found:", selectedStaff);

      // Determine doctor name
      let doctorName = "الطبيب";

      if (selectedStaff) {
        // Doctor was selected from staff list
        doctorName =
          selectedStaff.name ||
          selectedStaff.staff_name ||
          selectedStaff.full_name ||
          "الطبيب";
        console.log("👨‍⚕️ Using selected staff name:", doctorName);
      } else if (clinicData?.owner_name) {
        // No staff available, use owner name
        doctorName = clinicData.owner_name;
        console.log("👨‍⚕️ Using owner name as fallback:", doctorName);
      } else {
        console.log("👨‍⚕️ Using default name");
      }

      console.log("👨‍⚕️ Final doctor name determined:", doctorName);

      setBookingId(bookingId);
      setSelectedDoctorName(doctorName);
      setBookingSuccess(true);

      // Reset all booking data except clinic selection
      setCurrentBookingStep(1);
      // Keep clinic selected for potential new bookings
      // setSelectedClinic(null);
      setSelectedServiceId(null);
      setSelectedDoctorId(null);
      setSelectedAddressId(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setAvailableTimes([]);
      setAvailableDays({});
    } catch (error) {
      console.error("Error completing booking:", error);
      alert("حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.");
    }
  };

  // Fetch services and staff when clinic (clinic) changes
  useEffect(() => {
    const loadClinicData = async () => {
      if (!selectedClinicId) {
        setServices([]);
        return;
      }
      try {
        setServicesLoading(true);

        // Fetch clinic data with services and staff in one call
        const res = await fetch(
          `https://ghaimcenter.com/laravel/api/clinics/${selectedClinicId}`
        );
        const json = await res.json();

        if (json && json.status === "success" && json.data) {
          const clinicData = json.data;
          setClinicData(clinicData);

          // Set services from clinic data
          if (clinicData.services && Array.isArray(clinicData.services)) {
            setServices(clinicData.services);
          } else {
            setServices([]);
          }

          // Set staff data
          if (clinicData.staff && Array.isArray(clinicData.staff)) {
            setClinicStaff(clinicData.staff);
            console.log(`Clinic ${selectedClinicId} staff:`, clinicData.staff);
          } else {
            setClinicStaff([]);
            console.log(`Clinic ${selectedClinicId} has no staff members`);
          }
        } else {
          setServices([]);
          setClinicData(null);
        }
      } catch (e) {
        console.error("Failed to load clinic data", e);
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };
    loadClinicData();
  }, [selectedClinicId]);

  // Fetch user addresses
  useEffect(() => {
    const fetchUserAddresses = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          console.log("No user token found, skipping addresses fetch");
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

        if (response.ok) {
          const result = await response.json();
          if (result.status === "success" && result.data) {
            setUserAddresses(result.data);
            console.log("User addresses loaded:", result.data);
          }
        }
      } catch (error) {
        console.error("Error fetching user addresses:", error);
      }
    };

    fetchUserAddresses();
  }, []);

  // Function to check availability for a specific day
  const checkDayAvailability = async (
    day,
    month,
    year,
    clinicId,
    doctorId,
    serviceId
  ) => {
    try {
      const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const url = `https://ghaimcenter.com/laravel/api/clinics/available_times/${clinicId}?staff_id=${doctorId}&date=${dateString}&service_id=${serviceId}`;

      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        if (
          result.status === "success" &&
          result.data &&
          Object.keys(result.data).length > 0
        ) {
          console.log(
            `Day ${day} (${dateString}) has ${Object.keys(result.data).length} available times`
          );
          return true; // Day has available times
        }
      } else if (response.status === 422) {
        // 422 means the date is invalid or not available - treat as unavailable
        console.log(`Day ${day} (${dateString}) is not available (422)`);
        return false;
      } else {
        console.log(
          `Day ${day} (${dateString}) returned status ${response.status}`
        );
        return false;
      }
      return false; // Day has no available times
    } catch (error) {
      console.error(`Error checking availability for day ${day}:`, error);
      return false;
    }
  };

  // Fetch availability for all days in current month when doctor and service are selected
  useEffect(() => {
    const fetchMonthAvailability = async () => {
      if (!selectedDoctorId || !selectedServiceId || !selectedClinic) {
        setAvailableDays({});
        return;
      }

      setDaysLoading(true);
      try {
        const selectedClinicId = clinics.find(
          (clinic) => clinic.id === selectedClinic
        )?.clinicId;
        if (!selectedClinicId) {
          setAvailableDays({});
          return;
        }

        // Check availability only for valid days in current month
        const availabilityPromises = [];
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate(); // Get actual days in month
        const today = new Date();

        for (let day = 1; day <= daysInMonth; day++) {
          const checkDate = new Date(currentYear, currentMonth - 1, day);

          // Skip past dates (before today)
          if (checkDate < today) {
            availabilityPromises.push(Promise.resolve(false));
            continue;
          }

          availabilityPromises.push(
            checkDayAvailability(
              day,
              currentMonth,
              currentYear,
              selectedClinicId,
              selectedDoctorId,
              selectedServiceId
            )
          );
        }

        const results = await Promise.all(availabilityPromises);
        const availabilityMap = {};

        results.forEach((isAvailable, index) => {
          const day = index + 1;
          availabilityMap[day] = isAvailable;
        });

        setAvailableDays(availabilityMap);
        console.log("Month availability loaded:", availabilityMap);
      } catch (error) {
        console.error("Error fetching month availability:", error);
        setAvailableDays({});
      } finally {
        setDaysLoading(false);
      }
    };

    fetchMonthAvailability();
  }, [
    selectedDoctorId,
    selectedServiceId,
    selectedClinic,
    currentMonth,
    currentYear,
    clinics,
  ]);

  // Fetch available times when date, doctor, and service are selected
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      // Check if all required data is available
      if (
        !selectedDate ||
        !selectedDoctorId ||
        !selectedServiceId ||
        !selectedClinic
      ) {
        setAvailableTimes([]);
        setSelectedTime(null);
        return;
      }

      setTimesLoading(true);
      try {
        // Format date as YYYY-MM-DD
        const dateString = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`;

        // Build API URL with dynamic values
        console.log(
          "selectedClinic value:",
          selectedClinic,
          "type:",
          typeof selectedClinic
        );
        console.log(
          "selectedDoctorId:",
          selectedDoctorId,
          "type:",
          typeof selectedDoctorId
        );
        console.log(
          "selectedServiceId:",
          selectedServiceId,
          "type:",
          typeof selectedServiceId
        );
        console.log("dateString:", dateString);

        // Get the numeric clinic ID from the selected clinic name
        const selectedClinicId = clinics.find(
          (clinic) => clinic.id === selectedClinic
        )?.clinicId;
        console.log("selectedClinicId:", selectedClinicId);

        if (!selectedClinicId) {
          console.log(
            "No clinic ID found for selected clinic:",
            selectedClinic
          );
          setAvailableTimes([]);
          return;
        }

        const url = `https://ghaimcenter.com/laravel/api/clinics/available_times/${selectedClinicId}?staff_id=${selectedDoctorId}&date=${dateString}&service_id=${selectedServiceId}`;

        console.log("Fetching available times from:", url);
        const response = await fetch(url);

        if (response.ok) {
          const result = await response.json();
          console.log("Available times response:", result);

          if (result.status === "success" && result.data) {
            // Convert the times object to array format
            const timesArray = Object.entries(result.data).map(
              ([time, value]) => ({
                time: time,
                value: value,
              })
            );
            setAvailableTimes(timesArray);
            console.log("Available times loaded:", timesArray);
          } else {
            setAvailableTimes([]);
          }
        } else {
          console.log("Failed to fetch available times");
          setAvailableTimes([]);
        }
      } catch (error) {
        console.error("Error fetching available times:", error);
        setAvailableTimes([]);
      } finally {
        setTimesLoading(false);
      }
    };

    fetchAvailableTimes();
  }, [
    selectedDate,
    selectedDoctorId,
    selectedServiceId,
    selectedClinic,
    currentMonth,
    currentYear,
    clinics,
  ]);

  // Map fetched services to the original card shape to preserve UI
  const bookingServicesFromApi = useMemo(() => {
    if (!services || services.length === 0) return [];
    return services.map((srv) => ({
      id: srv.id,
      name: srv.title_ar || srv.title || "خدمة",
      subtitle: srv.title_en || "",
      description: srv.about_ar || srv.about || "",
      price: srv.price > 0 ? `${srv.price} ر.س` : "السعر غير متوفر",
      duration: srv.service_time ? `${srv.service_time} دقيقة` : "غير محدد",
      clinic: selectedClinic || "العيادة",
      rating: 4.5,
      discount: srv.discount ? `خصم ${srv.discount}%` : undefined,
    }));
  }, [services, selectedClinic]);

  // Services data
  const bookingServices = [
    {
      id: 1,
      name: "حشو الأسنان",
      subtitle: "علاج الأسنان",
      description: "حشو تجويف الأسنان بمادة الكومبوزيت",
      price: "200 ر.س",
      duration: "60 دقيقة",
      clinic: "عيادة 5",
      rating: 4.5,
    },
    {
      id: 2,
      name: "تبييض الأسنان",
      subtitle: "تقويم الأسنان",
      description: "علاج تبييض الأسنان الاحترافي",
      price: "300 ر.س",
      duration: "45 دقيقة",
      clinic: "عيادة 5",
      rating: 4.5,
    },
    {
      id: 3,
      name: "تنظيف الأسنان",
      subtitle: "علاج الأسنان",
      description: "تنظيف احترافي للأسنان وإزالة الجير",
      price: "150 ر.س",
      duration: "30 دقيقة",
      clinic: "عيادة 3",
      rating: 4.5,
      discount: "خصم 25%",
    },
  ];

  // Doctors data
  const doctors = [
    {
      id: 1,
      name: "Dr. Test Clinic",
      specialty: "علاج الأسنان، تقويم الأسنان",
      location: "Egypt",
      priceRange: "إلى 300 - 200",
      rating: 4.0,
      image: profileImage,
    },
    {
      id: 2,
      name: "Dr. Sarah Ahmed",
      specialty: "أخصائية تقويم الأسنان",
      location: "Cairo",
      priceRange: "إلى 400 - 250",
      rating: 4.5,
      image: profileImage,
    },
    {
      id: 3,
      name: "Dr. Mohamed Said",
      specialty: "أخصائي جراحة الأسنان",
      location: "Alexandria",
      priceRange: "إلى 500 - 300",
      rating: 4.8,
      image: profileImage,
    },
    {
      id: 4,
      name: "Dr. Nour Ahmed",
      specialty: "أخصائية تجميل الأسنان",
      location: "Giza",
      priceRange: "إلى 600 - 350",
      rating: 4.9,
      image: profileImage,
    },
    {
      id: 5,
      name: "Dr. Youssef Hassan",
      specialty: "أخصائي علاج الجذور",
      location: "Port Said",
      priceRange: "إلى 450 - 280",
      rating: 4.6,
      image: profileImage,
    },
    {
      id: 6,
      name: "Dr. Mariam Ali",
      specialty: "أخصائية أسنان الأطفال",
      location: "Sharm El Sheikh",
      priceRange: "إلى 380 - 220",
      rating: 4.7,
      image: profileImage,
    },
  ];

  // Render stars based on rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="booking-star filled" />);
    }
    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="booking-star partial" />);
    }

    return stars;
  };

  return (
    <div className="new-booking-section">
      {/* Header */}
      <div className="booking-header">
        <div className="booking-title-container">
          <h2 className="booking-title">
            <FaCalendarAlt className="booking-icon" />
            حجز موعد جديد
          </h2>
        </div>

        {/* Simple Step Icons Only */}
        <div className="simple-progress-section">
          <div className="simple-step-icons">
            <div
              className={`simple-step-icon ${currentBookingStep > 1 ? "completed" : currentBookingStep === 1 ? "active" : "inactive"}`}
            >
              <div className="simple-step-icon-circle">
                {currentBookingStep > 1 ? (
                  <FaCheck className="simple-step-icon-svg" />
                ) : (
                  <FaStethoscope className="simple-step-icon-svg" />
                )}
              </div>
              <span className="simple-step-name">العيادة</span>
            </div>
            <div
              className={`simple-step-icon ${currentBookingStep > 2 ? "completed" : currentBookingStep === 2 ? "active" : "inactive"}`}
            >
              <div className="simple-step-icon-circle">
                {currentBookingStep > 2 ? (
                  <FaCheck className="simple-step-icon-svg" />
                ) : (
                  <FaUserMd className="simple-step-icon-svg" />
                )}
              </div>
              <span className="simple-step-name">الخدمة</span>
            </div>
            <div
              className={`simple-step-icon ${currentBookingStep > 3 ? "completed" : currentBookingStep === 3 ? "active" : "inactive"}`}
            >
              <div className="simple-step-icon-circle">
                {currentBookingStep > 3 ? (
                  <FaCheck className="simple-step-icon-svg" />
                ) : (
                  <FaUser className="simple-step-icon-svg" />
                )}
              </div>
              <span className="simple-step-name">الطبيب</span>
            </div>
            <div
              className={`simple-step-icon ${currentBookingStep > 4 ? "completed" : currentBookingStep === 4 ? "active" : "inactive"}`}
            >
              <div className="simple-step-icon-circle">
                {currentBookingStep > 4 ? (
                  <FaCheck className="simple-step-icon-svg" />
                ) : (
                  <FaMapMarkerAlt className="simple-step-icon-svg" />
                )}
              </div>
              <span className="simple-step-name">العنوان</span>
            </div>
            <div
              className={`simple-step-icon ${currentBookingStep > 5 ? "completed" : currentBookingStep === 5 ? "active" : "inactive"}`}
            >
              <div className="simple-step-icon-circle">
                {currentBookingStep > 5 ? (
                  <FaCheck className="simple-step-icon-svg" />
                ) : (
                  <FaCalendarAlt className="simple-step-icon-svg" />
                )}
              </div>
              <span className="simple-step-name">الموعد</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="booking-content">
        {/* Step 1: Choose Clinic */}
        {currentBookingStep === 1 && !bookingSuccess && (
          <>
            <h3 className="content-title">اختر العيادة</h3>
            <div className="clinics-list">
              {clinics.map((clinic) => {
                // Check if this is the currently selected clinic and has data
                const isSelected = selectedClinic === clinic.id;
                const currentClinicData = isSelected ? clinicData : null;
                const hasStaff = currentClinicData
                  ? hasAvailableStaff(currentClinicData)
                  : null;

                return (
                  <div
                    key={clinic.id}
                    className={`clinic-card ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      console.log("🏥 Clinic clicked:", clinic.id);
                      console.log("🏥 Setting selectedClinic to:", clinic.id);
                      setSelectedClinic(clinic.id);
                      console.log("🏥 selectedClinic after set:", clinic.id);
                    }}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "16px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      border: isSelected
                        ? "2px solid #3b82f6"
                        : "1px solid #e5e7eb",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      minHeight: "80px",
                      position: "relative",
                      marginBottom: "8px",
                    }}
                  >
                    {/* Status indicator */}
                    {isSelected && hasStaff !== null && (
                      <div
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: hasStaff ? "#10b981" : "#f59e0b",
                        }}
                      />
                    )}

                    <div
                      className="clinic-info"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "#f0f9ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#3b82f6",
                          fontSize: "16px",
                        }}
                      >
                        <FaMapMarkerAlt />
                      </div>
                      <div className="clinic-details" style={{ flex: 1 }}>
                        <h4
                          className="clinic-name"
                          style={{
                            margin: "0 0 4px 0",
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#1f2937",
                          }}
                        >
                          {clinic.name}
                        </h4>
                        <p
                          className="clinic-location"
                          style={{
                            margin: "0",
                            fontSize: "14px",
                            color: "#6b7280",
                          }}
                        >
                          {clinic.location}
                        </p>
                        {isSelected && hasStaff === true && (
                          <p
                            style={{
                              margin: "2px 0 0 0",
                              fontSize: "10px",
                              color: "#10b981",
                            }}
                          >
                            أطباء متاحون
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="clinic-radio" style={{ marginLeft: "8px" }}>
                      <input
                        type="radio"
                        name="clinic"
                        checked={isSelected}
                        onChange={() => setSelectedClinic(clinic.id)}
                        style={{ width: "16px", height: "16px" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Booking Success Card */}
        {bookingSuccess && (
          <div className="booking-success-card-inline">
            <div className="booking-success-icon">
              <FaCheck />
            </div>
            <h2 className="booking-success-title">تم الحجز بنجاح!</h2>
            <p className="booking-success-subtitle">مع {selectedDoctorName}</p>
            <div className="booking-success-id">
              <div className="booking-id-icon">
                <FaCheck />
              </div>
              <span className="booking-id-text">رقم الحجز: #{bookingId}</span>
            </div>
            <button
              className="booking-success-btn"
              onClick={() => {
                setBookingSuccess(false);
                setBookingId(null);
                setCompletionOtp("");
                setSelectedDoctorName("");
                setActiveFilter("الرئيسية");
              }}
            >
              العودة للرئيسية
            </button>
          </div>
        )}

        {/* Step 2: Choose Service */}
        {currentBookingStep === 2 && (
          <>
            <div className="ghym-srv-scope-1">
              <h3 className="content-title ghym-srv-title">اختر الخدمة</h3>
              <div className="clinics-list ghym-srv-services-list">
                {(bookingServicesFromApi.length > 0
                  ? bookingServicesFromApi
                  : bookingServices
                ).map((service) => (
                  <div
                    key={service.id}
                    className={`clinic-card ghym-srv-card ${selectedServiceId === service.id ? "selected" : ""}`}
                    onClick={() => setSelectedServiceId(service.id)}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "20px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      border: selectedServiceId === service.id ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      minHeight: "120px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      className="clinic-info"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          background: "#f0f9ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#3b82f6",
                          fontSize: "20px",
                        }}
                      >
                        <FaStethoscope />
                      </div>
                      <div className="clinic-details" style={{ flex: 1 }}>
                        <h4
                          className="clinic-name"
                          style={{
                            margin: "0 0 4px 0",
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#1f2937",
                          }}
                        >
                          {service.name}
                        </h4>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "14px",
                            color: "#6b7280",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <FaClock />
                            <span>{service.duration}</span>
                          </span>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <FaMoneyBillWave />
                            <span>{service.price}</span>
                          </span>
                        </p>
                      </div>
                    </div>
                    <div
                      className="clinic-radio"
                      style={{ marginLeft: "16px" }}
                    >
                      <input
                        type="radio"
                        name="service"
                        checked={selectedServiceId === service.id}
                        onChange={() => setSelectedServiceId(service.id)}
                        style={{ width: "20px", height: "20px" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 3: Choose Doctor */}
        {currentBookingStep === 3 && (
          <>
            <h3 className="content-title">اختر الطبيب</h3>
            {clinicStaff.length > 0 ? (
              <div className="clinics-list">
                {clinicStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className={`clinic-card ${selectedDoctorId === staff.id ? "selected" : ""}`}
                    onClick={() => {
                      console.log("🔘 Doctor selected:", staff);
                      console.log("🔘 Setting selectedDoctorId to:", staff.id);
                      setSelectedDoctorId(staff.id);
                    }}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "16px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      border:
                        selectedDoctorId === staff.id
                          ? "2px solid #3b82f6"
                          : "1px solid #e5e7eb",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      minHeight: "80px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      className="clinic-info"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "#f0f9ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#3b82f6",
                          fontSize: "16px",
                        }}
                      >
                        <FaStethoscope />
                      </div>
                      <div className="clinic-details" style={{ flex: 1 }}>
                        <h4
                          className="clinic-name"
                          style={{
                            margin: "0 0 4px 0",
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#1f2937",
                          }}
                        >
                          {staff.name || staff.name_ar || "طبيب"}
                        </h4>
                        <p
                          className="clinic-location"
                          style={{
                            margin: "0",
                            fontSize: "14px",
                            color: "#6b7280",
                          }}
                        >
                          {staff.specialty ||
                            staff.specialty_ar ||
                            "تخصص غير محدد"}
                        </p>
                      </div>
                    </div>
                    <div className="clinic-radio" style={{ marginLeft: "8px" }}>
                      <input
                        type="radio"
                        name="doctor"
                        checked={selectedDoctorId === staff.id}
                        onChange={() => {
                          console.log(
                            "🔘 Radio button clicked for doctor:",
                            staff
                          );
                          console.log(
                            "🔘 Setting selectedDoctorId to:",
                            staff.id
                          );
                          setSelectedDoctorId(staff.id);
                        }}
                        style={{ width: "16px", height: "16px" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#6b7280",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  margin: "16px 0",
                }}
              >
                <FaStethoscope
                  style={{
                    fontSize: "2rem",
                    marginBottom: "1rem",
                    color: "#d1d5db",
                  }}
                />
                <p style={{ margin: "0", fontSize: "16px" }}>
                  لا يوجد أطباء متاحين في هذه العيادة حالياً
                </p>
                <p
                  style={{
                    margin: "0.5rem 0 0 0",
                    fontSize: "14px",
                    color: "#9ca3af",
                  }}
                >
                  يرجى اختيار عيادة أخرى أو المحاولة لاحقاً
                </p>
              </div>
            )}
          </>
        )}

        {/* Step 4: Choose Address */}
        {currentBookingStep === 4 && (
          <>
            <h3 className="content-title">اختر العنوان</h3>
            {userAddresses.length > 0 ? (
              <div className="address-cards-container">
                {userAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`address-card ${selectedAddressId === address.id ? "selected" : ""}`}
                    onClick={() => setSelectedAddressId(address.id)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedAddressId(address.id);
                      }
                    }}
                  >
                    <div className="address-card-header">
                      <div className="address-icon">
                        <FaMapMarkerAlt />
                      </div>
                      <div className="address-info">
                        <h4 className="address-title">
                          {address.address ||
                            address.title ||
                            address.name ||
                            "عنوان"}
                        </h4>
                      </div>
                      <div className="address-radio">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="address-empty-state">
                <FaMapPin className="address-empty-icon" />
                <h4 className="address-empty-title">لا توجد عناوين محفوظة</h4>
                <p className="address-empty-description">
                  يرجى إضافة عنوان في الملف الشخصي أولاً
                  <br />
                  أو يمكنك إضافة عنوان جديد الآن
                </p>
                <button
                  className="address-add-btn"
                  onClick={() => {
                    // يمكن إضافة وظيفة الانتقال إلى صفحة إضافة عنوان
                    console.log("Navigate to add address page");
                  }}
                >
                  إضافة عنوان جديد
                </button>
              </div>
            )}
          </>
        )}

        {/* Step 5: Choose Date and Time */}
        {currentBookingStep === 5 && (
          <>
            <h3 className="content-title">اختر التاريخ والوقت</h3>
            <div className="booking-date-time-content">
              {/* Calendar Card */}
              <div className="booking-calendar-card">
                <div className="booking-calendar-header" style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                  padding: "0 4px"
                }}>
                  <button
                    className="booking-calendar-nav-btn-small"
                    onClick={goToPreviousMonth}
                    style={{
                      background: "#f3f4f6",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#374151",
                      fontSize: "14px"
                    }}
                  >
                    <FaArrowLeft />
                  </button>
                  <h4 className="booking-calendar-month" style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1f2937",
                    margin: "0",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    {getMonthName(currentMonth)} {currentYear}
                    {daysLoading && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FaClock
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                        جاري التحميل...
                      </span>
                    )}
                  </h4>
                  <button
                    className="booking-calendar-nav-btn-small"
                    onClick={goToNextMonth}
                    style={{
                      background: "#f3f4f6",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#374151",
                      fontSize: "14px"
                    }}
                  >
                    <FaArrowRight />
                  </button>
                </div>
                <div className="booking-calendar-weekdays" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "4px",
                  marginBottom: "12px"
                }}>
                  <div className="booking-weekday" style={{
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6b7280",
                    padding: "8px 4px"
                  }}>Sa</div>
                  <div className="booking-weekday" style={{
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6b7280",
                    padding: "8px 4px"
                  }}>Su</div>
                  <div className="booking-weekday" style={{
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6b7280",
                    padding: "8px 4px"
                  }}>Mo</div>
                  <div className="booking-weekday" style={{
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6b7280",
                    padding: "8px 4px"
                  }}>Tu</div>
                  <div className="booking-weekday" style={{
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6b7280",
                    padding: "8px 4px"
                  }}>We</div>
                  <div className="booking-weekday" style={{
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6b7280",
                    padding: "8px 4px"
                  }}>Th</div>
                  <div className="booking-weekday" style={{
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6b7280",
                    padding: "8px 4px"
                  }}>Fr</div>
                </div>
                <div className="booking-calendar-grid" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "6px"
                }}>
                  {(() => {
                    // Generate array of days for current month
                    const daysInMonth = new Date(
                      currentYear,
                      currentMonth,
                      0
                    ).getDate();
                    const days = [];
                    for (let i = 1; i <= daysInMonth; i++) {
                      days.push(i);
                    }
                    return days;
                  })().map((day) => {
                    // Check if we have availability data for this day
                    const hasAvailabilityData =
                      Object.prototype.hasOwnProperty.call(availableDays, day);
                    const isAvailable =
                      hasAvailabilityData && availableDays[day] === true;
                    const isUnavailable =
                      hasAvailabilityData && availableDays[day] === false;
                    const isSelected = day === selectedDate;

                    // Check if this is a past date
                    const checkDate = new Date(
                      currentYear,
                      currentMonth - 1,
                      day
                    );
                    const today = new Date();
                    const isPastDate = checkDate < today;

                    // If we don't have availability data yet, treat as unavailable
                    const isActuallyAvailable = isAvailable && !isPastDate;
                    const isActuallyUnavailable =
                      isUnavailable || !hasAvailabilityData || isPastDate;

                    return (
                      <div
                        key={day}
                        className={`booking-calendar-day ${
                          isSelected ? "selected" : ""
                        } ${isPastDate ? "past-date" : ""} ${
                          isActuallyUnavailable ? "unavailable" : ""
                        } ${isActuallyAvailable ? "available" : ""}`}
                        onClick={() => {
                          // Only allow selection of confirmed available days
                          if (isActuallyAvailable) {
                            setSelectedDate(day);
                          } else {
                            // Show warning for unavailable days
                            console.log(
                              `Day ${day} is not available for booking`
                            );
                            // You can add a toast notification here if needed
                          }
                        }}
                        style={{
                          cursor: isActuallyAvailable
                            ? "pointer"
                            : "not-allowed",
                          opacity: isActuallyUnavailable ? 0.4 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "40px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: "500",
                          transition: "all 0.2s ease",
                          background: isSelected 
                            ? "#3b82f6" 
                            : isActuallyAvailable 
                              ? "#f0f9ff" 
                              : "#f9fafb",
                          color: isSelected 
                            ? "white" 
                            : isActuallyAvailable 
                              ? "#1e40af" 
                              : "#9ca3af",
                          border: isSelected 
                            ? "2px solid #3b82f6" 
                            : isActuallyAvailable 
                              ? "1px solid #3b82f6" 
                              : "1px solid #e5e7eb"
                        }}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Available Times Card */}
              <div className="booking-times-card">
                <div className="booking-times-card-header" style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  padding: "0 4px"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <div className="booking-times-card-icon" style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#f0f9ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#3b82f6",
                      fontSize: "16px"
                    }}>
                      <FaClock />
                    </div>
                    <h4 className="booking-times-card-title" style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#1f2937",
                      margin: "0"
                    }}>المواعيد المتاحة</h4>
                  </div>
                  <div className="booking-times-card-badge" style={{
                    background: "#3b82f6",
                    color: "white",
                    borderRadius: "12px",
                    padding: "4px 12px",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}>
                    {availableTimes.length > 0 ? availableTimes.length : 0}
                  </div>
                </div>
                <div className="booking-times-card-content">
                  {timesLoading ? (
                    <div className="booking-loading-times" style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "40px 20px",
                      textAlign: "center"
                    }}>
                      <FaClock className="booking-loading-icon" style={{
                        fontSize: "32px",
                        color: "#3b82f6",
                        marginBottom: "12px",
                        animation: "spin 1s linear infinite"
                      }} />
                      <p className="booking-loading-text" style={{
                        fontSize: "16px",
                        color: "#6b7280",
                        margin: "0"
                      }}>
                        جاري تحميل المواعيد...
                      </p>
                    </div>
                  ) : availableTimes.length > 0 ? (
                    <div className="booking-times-grid" style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "8px"
                    }}>
                      {availableTimes.map((timeSlot) => (
                        <div
                          key={timeSlot.value}
                          className={`booking-time-slot ${selectedTime === timeSlot.value ? "selected" : ""}`}
                          onClick={() => setSelectedTime(timeSlot.value)}
                          style={{
                            background: selectedTime === timeSlot.value ? "#3b82f6" : "#f9fafb",
                            color: selectedTime === timeSlot.value ? "white" : "#374151",
                            border: selectedTime === timeSlot.value ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                            borderRadius: "8px",
                            padding: "8px 6px",
                            textAlign: "center",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            minHeight: "36px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          {timeSlot.time}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="booking-no-appointments" style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "40px 20px",
                      textAlign: "center"
                    }}>
                      <FaClock className="booking-no-appointments-icon" style={{
                        fontSize: "32px",
                        color: "#d1d5db",
                        marginBottom: "12px"
                      }} />
                      <p className="booking-no-appointments-text" style={{
                        fontSize: "16px",
                        color: "#6b7280",
                        margin: "0"
                      }}>
                        {selectedDate && selectedDoctorId && selectedServiceId
                          ? availableDays[selectedDate] === false
                            ? `لا توجد مواعيد متاحة في ${selectedDate} أكتوبر`
                            : "جاري تحميل المواعيد..."
                          : "يرجى اختيار التاريخ والطبيب والخدمة أولاً"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="booking-footer" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 0",
        gap: "12px"
      }}>
        {currentBookingStep > 1 && (
          <button
            className="booking-previous-btn"
            onClick={() => setCurrentBookingStep(currentBookingStep - 1)}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
              minHeight: "36px"
            }}
          >
            السابق <FaArrowRight className="booking-previous-icon" style={{ fontSize: "12px" }} />
          </button>
        )}
        {currentBookingStep < 5 && (
          <button
            className="next-btn"
            onClick={() => setCurrentBookingStep(currentBookingStep + 1)}
            disabled={
              (currentBookingStep === 1 && !selectedClinic) ||
              (currentBookingStep === 2 && !selectedServiceId) ||
              (currentBookingStep === 3 &&
                clinicStaff.length > 0 &&
                !selectedDoctorId) ||
              (currentBookingStep === 4 && !selectedAddressId)
            }
            style={{
              background: "#3b82f6",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
              minHeight: "36px",
              opacity:
                (currentBookingStep === 1 && !selectedClinic) ||
                (currentBookingStep === 2 && !selectedServiceId) ||
                (currentBookingStep === 3 &&
                  clinicStaff.length > 0 &&
                  !selectedDoctorId) ||
                (currentBookingStep === 4 && !selectedAddressId)
                  ? 0.5
                  : 1,
              cursor:
                (currentBookingStep === 1 && !selectedClinic) ||
                (currentBookingStep === 2 && !selectedServiceId) ||
                (currentBookingStep === 3 &&
                  clinicStaff.length > 0 &&
                  !selectedDoctorId) ||
                (currentBookingStep === 4 && !selectedAddressId)
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            التالي <FaArrowLeft className="next-icon" style={{ fontSize: "12px" }} />
          </button>
        )}
        {currentBookingStep === 5 && (
          <button
            className="confirm-btn"
            onClick={completeBooking}
            disabled={!selectedDate || !selectedTime}
            style={{
              background: "#10b981",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
              minHeight: "36px",
              opacity: selectedDate && selectedTime ? 1 : 0.5,
              cursor: selectedDate && selectedTime ? "pointer" : "not-allowed",
            }}
          >
            تأكيد الحجز <FaCheck className="confirm-icon" style={{ fontSize: "12px" }} />
          </button>
        )}
      </div>
    </div>
  );
};

export default NewBookingFilter;
