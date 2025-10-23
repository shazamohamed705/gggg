import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../Compontent/Services/Services.css";

const CategoryServices = () => {
  const [servicesData, setServicesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortKey, setSortKey] = useState("all"); // all | male | female
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");

  // Fetch services for specific category
  useEffect(() => {
    const fetchCategoryServices = async () => {
      if (!categoryId) {
        setError("معرف الفئة غير محدد");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log(`Fetching services for category ${categoryId}...`);
        const response = await fetch(
          `https://ghaimcenter.com/laravel/api/clinics/services?category_id=${categoryId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === "success" && result.data && result.data.services) {
          setServicesData(result.data.services);
          console.log("✅ Category services loaded:", result.data.services.length, "services");
        } else {
          setServicesData([]);
          console.log("⚠️ No services found for this category");
        }
      } catch (error) {
        const errorMsg = "فشل تحميل الخدمات. يرجى المحاولة مرة أخرى";
        setError(errorMsg);
        console.error("❌ Error fetching category services:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryServices();
  }, [categoryId]);

  // Derived filtered services (by gender) - optimized
  const sortedServices = useMemo(() => {
    const list = [...servicesData];
    
    // Gender filtering for services
    if (sortKey === "male") {
      return list.filter((service) => service.gender === 0);
    }
    if (sortKey === "female") {
      return list.filter((service) => service.gender === 1);
    }
    // Default to all (للجنسين)
    return list.filter((service) => service.gender === 2);
  }, [servicesData, sortKey]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!sortOpen) return;
    const onClick = (e) => {
      const el = document.querySelector(".gym-services-sort-dropdown");
      if (el && !el.contains(e.target)) setSortOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [sortOpen]);

  // Handle service details navigation - optimized with useCallback
  const handleServiceDetails = useCallback((service) => {
    console.log("Navigating to service details:", service);
    console.log("Service clinics_id:", service.clinics_id);

    const clinicId = service.clinics_id;
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
  const renderServiceCard = useCallback((service) => {
    // Optimized image selection with fallback
    const serviceImage = service.images && service.images.length > 0
      ? service.images[0].image
      : "/imge.png";

    // Optimized title selection
    const displayTitle = service.title_ar || service.title || 'خدمة غير محددة';

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
        key={`${service.id}-${service.clinics_id}`}
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
            عرض التفاصيل
          </button>
        </div>
        <div className="gym-service-content">
          <h3 className="gym-service-title">
            {displayTitle}
          </h3>
          {service.price && (
            <div className="gym-service-price">
              {service.discount ? (
                <span>
                  <span style={{ textDecoration: 'line-through', color: '#999', marginLeft: '8px' }}>
                    {service.price}
                  </span>
                  {service.price - service.discount}
                </span>
              ) : (
                service.price
              )}
              <span style={{ marginLeft: '4px' }}>
                <SaudiRiyalIcon />
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }, [handleServiceDetails]);

  return (
    <div className="gym-services-page">
      <div className="gym-services-main-container" dir="rtl">
        {/* Header Section */}
        <div className="gym-services-top-header">
          <div className="gym-services-count-display">
            {isLoading
              ? "جاري التحميل..."
              : `تم إيجاد ${servicesData.length} خدمة`}
          </div>

          <div className="gym-services-filter-bar">
            <button className="gym-services-sort-button gym-services-sort-btn">
              ترتيب حسب
            </button>

            <div style={{ position: "relative" }}>
              <button
                className="gym-services-filter-button gym-services-filter-default"
                onClick={() => setSortOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={sortOpen}
              >
                <span className="gym-services-sort-icon">↕</span>
                {sortKey === "male"
                  ? "رجالي"
                  : sortKey === "female"
                    ? "نسائي"
                    : "الكل"}
              </button>
              {sortOpen && (
                <ul
                  className="gym-services-sort-dropdown"
                  role="listbox"
                  style={{
                    position: window.innerWidth <= 768 ? "fixed" : "absolute",
                    top: window.innerWidth <= 768 ? "60px" : "110%",
                    right: window.innerWidth <= 768 ? "15px" : 0,
                    left: window.innerWidth <= 768 ? "15px" : "auto",
                    background: "#fff",
                    border: "1px solid rgba(2,6,23,.12)",
                    boxShadow: "0 10px 20px rgba(15,23,42,.12)",
                    borderRadius: 10,
                    minWidth: window.innerWidth <= 768 ? "auto" : 160,
                    padding: ".35rem 0",
                    zIndex: 9999,
                  }}
                >
                  <li
                    role="option"
                    onClick={() => {
                      setSortKey("all");
                      setSortOpen(false);
                    }}
                    style={{ padding: ".5rem .9rem", cursor: "pointer" }}
                  >
                    الكل
                  </li>
                  <li
                    role="option"
                    onClick={() => {
                      setSortKey("male");
                      setSortOpen(false);
                    }}
                    style={{ padding: ".5rem .9rem", cursor: "pointer" }}
                  >
                    رجالي
                  </li>
                  <li
                    role="option"
                    onClick={() => {
                      setSortKey("female");
                      setSortOpen(false);
                    }}
                    style={{ padding: ".5rem .9rem", cursor: "pointer" }}
                  >
                    نسائي
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Services Display */}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryServices;
