// Utility functions for checking clinic and staff status
// دالة مساعدة لفحص حالة الصالونات والأطباء

/**
 * Check if a clinic has available staff
 * فحص ما إذا كان الصالون يحتوي على أطباء متاحين
 * @param {Object} clinic - Clinic data object
 * @returns {boolean} - True if clinic has staff, false otherwise
 */
export const hasAvailableStaff = (clinic) => {
  return (
    clinic &&
    clinic.staff &&
    Array.isArray(clinic.staff) &&
    clinic.staff.length > 0
  );
};

/**
 * Get staff count for a clinic
 * الحصول على عدد الأطباء في الصالون
 * @param {Object} clinic - Clinic data object
 * @returns {number} - Number of staff members
 */
export const getStaffCount = (clinic) => {
  if (!hasAvailableStaff(clinic)) return 0;
  return clinic.staff.length;
};

/**
 * Check if a clinic has services
 * فحص ما إذا كان الصالون يحتوي على خدمات
 * @param {Object} clinic - Clinic data object
 * @returns {boolean} - True if clinic has services, false otherwise
 */
export const hasServices = (clinic) => {
  return (
    clinic &&
    clinic.services &&
    Array.isArray(clinic.services) &&
    clinic.services.length > 0
  );
};

/**
 * Get clinic status message
 * الحصول على رسالة حالة الصالون
 * @param {Object} clinic - Clinic data object
 * @returns {string} - Status message in Arabic
 */
export const getClinicStatusMessage = (clinic) => {
  if (!clinic) return "البيانات غير متوفرة";

  const staffCount = getStaffCount(clinic);
  const hasServicesAvailable = hasServices(clinic);

  if (staffCount === 0 && !hasServicesAvailable) {
    return "لا يوجد أطباء أو خدمات متاحة";
  } else if (staffCount === 0) {
    return "لا يوجد أطباء متاحين حالياً";
  } else if (!hasServicesAvailable) {
    return "لا توجد خدمات متاحة";
  } else {
    return `متاح - ${staffCount} طبيب، ${clinic.services.length} خدمة`;
  }
};

/**
 * Validate clinic for booking
 * التحقق من صحة الصالون للحجز
 * @param {Object} clinic - Clinic data object
 * @returns {Object} - Validation result with isValid and message
 */
export const validateClinicForBooking = (clinic) => {
  if (!clinic) {
    return {
      isValid: false,
      message: "البيانات غير متوفرة",
    };
  }

  if (!hasAvailableStaff(clinic)) {
    return {
      isValid: false,
      message: "لا يمكن الحجز - لا يوجد أطباء متاحين",
    };
  }

  if (!hasServices(clinic)) {
    return {
      isValid: false,
      message: "لا يمكن الحجز - لا توجد خدمات متاحة",
    };
  }

  return {
    isValid: true,
    message: "يمكن الحجز",
  };
};

/**
 * Format clinic data for display
 * تنسيق بيانات الصالون للعرض
 * @param {Object} clinic - Raw clinic data
 * @returns {Object} - Formatted clinic data
 */
export const formatClinicData = (clinic) => {
  if (!clinic) return null;

  return {
    ...clinic,
    staffCount: getStaffCount(clinic),
    hasStaff: hasAvailableStaff(clinic),
    hasServices: hasServices(clinic),
    statusMessage: getClinicStatusMessage(clinic),
    validation: validateClinicForBooking(clinic),
  };
};
