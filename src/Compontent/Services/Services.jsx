import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Services.css";

const Services = React.memo(() => {
  const [servicesData, setServicesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const clinicId = searchParams.get("clinic_id");

        // If clinic_id is provided, fetch specific clinic services
        if (clinicId) {
          console.log(`Fetching services for clinic ${clinicId}...`);

          // Use the specific clinic API endpoint instead
          const response = await fetch(
            `https://ghaimcenter.com/laravel/api/clinics/${clinicId}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          if (result.status === "success" && result.data) {
            const clinic = result.data;
            if (clinic.services && Array.isArray(clinic.services)) {
              // Map services to include clinic info
              const clinicServices = clinic.services.map((service) => ({
                ...service,
                clinic_id: clinic.id,
                clinics_id: clinic.id, // Ensure both fields are available
                clinic_name: clinic.clinic_name,
                owner_photo: clinic.owner_photo,
              }));
              setServicesData(clinicServices);
              console.log(
                "✅ clinic services loaded:",
                clinicServices.length,
                "services"
              );
            } else {
              setServicesData([]);
              console.log("⚠️ No services found for this clinic");
            }
          }
        } else {
          // Fetch categories using the new API endpoint
          console.log("Fetching categories...");
          const response = await fetch(
            "https://ghaimcenter.com/laravel/api/clinics/categories"
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          if (result.status === "success" && result.data) {
            // Filter out deleted categories and process the data
            const activeCategories = result.data.filter(category => category.is_deleted === 0);
            console.log("✅ Categories data loaded:", activeCategories.length, "active categories");
            setServicesData(activeCategories);
          } else {
            const errorMsg = "البيانات المستلمة غير صحيحة";
            setError(errorMsg);
            console.error("❌ API returned unsuccessful status");
          }
        }
      } catch (error) {
        const errorMsg = "فشل تحميل الخدمات. يرجى المحاولة مرة أخرى";
        setError(errorMsg);
        console.error("❌ Error fetching services:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [searchParams]);

  // Process services data based on structure (categories vs direct services) - optimized
  const processedServicesData = useMemo(() => {
    // If servicesData is an array (clinic-specific or categories), return as is
    if (Array.isArray(servicesData)) {
      return servicesData;
    }
    
    // If servicesData is an object (old categories structure), extract all services with category info
    if (servicesData && typeof servicesData === 'object') {
      const allServices = [];
      Object.values(servicesData).forEach(category => {
        if (category.services && Array.isArray(category.services)) {
          // Add category info to each service for better performance
          const servicesWithCategory = category.services.map(service => ({
            ...service,
            category_title: category.category_info?.title_ar || category.category_info?.title || 'غير محدد'
          }));
          allServices.push(...servicesWithCategory);
        }
      });
      return allServices;
    }
    
    return [];
  }, [servicesData]);

  // Use processed services data directly
  const sortedServices = useMemo(() => {
    return processedServicesData;
  }, [processedServicesData]);


  // Handle service details navigation - optimized with useCallback
  const handleServiceDetails = useCallback((service) => {
    console.log("Navigating to service details:", service);
    
    // Check if this is a category (has icon field) or a service
    if (service.icon) {
      // This is a category, navigate to category services page
      console.log(`Navigating to category services: ${service.id}`);
      navigate(`/category-services?category=${service.id}`);
    } else {
      // This is a service, use existing logic
      console.log("Service clinics_id:", service.clinics_id);
      console.log("Service clinic_id:", service.clinic_id);

      // Use clinics_id if available, otherwise fallback to clinic_id
      const clinicId = service.clinics_id || service.clinic_id;
      console.log("Final clinicId:", clinicId);

      if (!clinicId || clinicId === "undefined" || clinicId === undefined) {
        console.error("No valid clinic ID found in service data:", service);
        alert("خطأ: لم يتم العثور على معرف العيادة");
        return;
      }

      if (!service.id) {
        console.error("No service ID found:", service);
        alert("خطأ: لم يتم العثور على معرف الخدمة");
        return;
      }

      console.log(`Navigating to: /service/${clinicId}/${service.id}`);
      navigate(`/service/${clinicId}/${service.id}`);
    }
  }, [navigate]);

  // Saudi Riyal SVG Component
  const SaudiRiyalIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1124.14 1256.39"
      width="14"
      height="15"
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

  // Render service card component - optimized with useCallback and memoization
  const renderServiceCard = useCallback((service, categoryTitle = null) => {
    // For categories, use the icon field; for services, use existing logic
    const serviceImage = service.icon ? 
      `https://ghaimcenter.com/laravel/storage/app/public/${service.icon}` :
      service.owner_photo || 
      (service.images?.[0]?.image) || 
      "/imge.png";

    // Optimized title selection - use title_ar for categories
    const displayTitle = categoryTitle || service.title_ar || service.title || 'خدمة غير محددة';

    // Handle touch events for mobile - prevent click when showing button
    let touchStartTime = 0;
    let touchMoved = false;

    const handleTouchStart = (e) => {
      touchStartTime = Date.now();
      touchMoved = false;
      e.currentTarget.classList.add('gym-service-card-touch');
    };

    const handleTouchMove = (e) => {
      touchMoved = true;
    };

    const handleTouchEnd = (e) => {
      const touchDuration = Date.now() - touchStartTime;
      
      // If touch was too short or moved, it's a scroll, not a click
      if (touchDuration < 200 || touchMoved) {
        e.currentTarget.classList.add('gym-service-card-scroll');
        setTimeout(() => {
          e.currentTarget.classList.remove('gym-service-card-touch');
          e.currentTarget.classList.remove('gym-service-card-scroll');
        }, 300);
      } else {
        // It's a click, remove touch class immediately
        e.currentTarget.classList.remove('gym-service-card-touch');
      }
    };

    const handleCardClick = (e) => {
      // Check if it was a scroll (not a click)
      if (e.currentTarget.classList.contains('gym-service-card-scroll')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      handleServiceDetails(service);
    };

    return (
      <div
        key={`${service.id}-${service.clinics_id || service.clinic_id || 'category'}`}
        className="gym-service-card"
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: "pointer" }}
      >
        <img
          src={serviceImage}
          alt={displayTitle}
          className="gym-service-image"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/imge.png";
          }}
        />
        <div className="gym-service-overlay">
          <button
            className="gym-service-details-btn-unique"
            onClick={(e) => {
              e.stopPropagation();
              handleServiceDetails(service);
            }}
          >
            {service.icon ? 'عرض الخدمات' : 'عرض التفاصيل'}
          </button>
        </div>
        <div className="gym-service-content">
          <h3 className="gym-service-title">
            {displayTitle}
          </h3>
          {service.clinic?.clinic_name && (
            <p className="gym-service-clinic">
              {service.clinic.clinic_name}
            </p>
          )}
        </div>
      </div>
    );
  }, [handleServiceDetails]);

  // Debug log
  if (typeof window !== "undefined") {
    console.log(
      "Current State - isLoading:",
      isLoading,
      "servicesData type:",
      typeof servicesData,
      "servicesData length:",
      Array.isArray(servicesData) ? servicesData.length : Object.keys(servicesData).length,
      "processedServicesData length:",
      processedServicesData.length,
      "sortedServices length:",
      sortedServices.length
    );
  }

  return (
    <div className="gym-services-page">
      <div className="gym-services-main-container" dir="rtl">
        {/* Header Section */}
        <div className="gym-services-top-header">
          <div className="gym-services-count-display">
            {isLoading
              ? "جاري التحميل..."
              : Array.isArray(servicesData) 
                ? `تم إيجاد ${servicesData.length} فئة`
                : `تم إيجاد ${processedServicesData.length} خدمة في ${Object.keys(servicesData).length} فئة`}
          </div>

        </div>

        {/* Services by Categories */}
        {isLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              fontSize: "18px",
              color: "#0171BD",
            }}
          >
            جاري تحميل الخدمات...
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              fontSize: "18px",
              color: "#dc3545",
            }}
          >
            {error}
            <br />
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1.5rem",
                backgroundColor: "#0171BD",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <div className="gym-services-categories-container">
            {/* Check if we have categories data or direct services */}
            {Array.isArray(servicesData) && servicesData.length > 0 && servicesData[0].icon ? (
              // Categories display (for main services page) - Simplified without category headers
              <div className="gym-services-cards-grid">
                {sortedServices.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      gridColumn: "1 / -1",
                      fontSize: "18px",
                    }}
                  >
                    لا توجد خدمات متاحة حالياً
                  </div>
                ) : (
                  sortedServices.map((category) => 
                    renderServiceCard(category, category.title_ar)
                  )
                )}
              </div>
            ) : (
              // Direct services display (for clinic-specific pages)
              <div className="gym-services-cards-grid">
                {sortedServices.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      gridColumn: "1 / -1",
                      fontSize: "18px",
                    }}
                  >
                    لا توجد خدمات متاحة حالياً
                  </div>
                ) : (
                  sortedServices.map((service) => renderServiceCard(service))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default Services;
