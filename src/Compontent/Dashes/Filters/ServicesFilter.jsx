import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTooth,
  FaMoneyBillWave,
  FaClock,
  FaMapPin,
  FaStar,
  FaPlus,
  FaStethoscope,
} from "react-icons/fa";

// Services filter component - Available services list
const ServicesFilter = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log("🔄 Fetching services from API...");

        const response = await fetch(
          "https://ghaimcenter.com/laravel/api/clinics/services"
        );

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Services data:", result);

          // Handle the API response structure properly
          const servicesData = result.data?.services || result.data || [];
          console.log("📋 Services array:", servicesData);
          setServices(Array.isArray(servicesData) ? servicesData : []);
        } else {
          console.error("❌ Failed to fetch services");
        }
      } catch (error) {
        console.error("💥 Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filter services based on search and category
  const filteredServices = Array.isArray(services) ? services.filter((service) => {
    const matchesSearch =
      (service.title_ar || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.about_ar || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      (service.category_id || '').toString() === selectedCategory;

    return matchesSearch && matchesCategory;
  }) : [];

  // Handle view service details
  const handleViewServiceDetails = (service) => {
    console.log("🎯 Viewing service details:", service);
    
    // Navigate to service details page with clinic ID and service ID
    const clinicId = service.clinic_id || service.clinics_id;
    if (!clinicId) {
      console.error("No clinic ID found for service:", service);
      alert("خطأ: لم يتم العثور على معرف العيادة");
      return;
    }
    
    navigate(`/service/${clinicId}/${service.id}`);
  };

  return (
    <div className="services-section">
      {/* Services Header */}
      <div className="services-header">
        <h2 className="services-title">الخدمات المتاحة</h2>
      </div>

      {/* Filter and Search Bar */}
      <div className="services-filter-bar">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="البحث في الخدمات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">جميع الخدمات</option>
            <option value="1">علاج الأسنان</option>
            <option value="2">تقويم الأسنان</option>
          </select>
          <span className="dropdown-arrow">▼</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="ios-loading-content">
          <div className="ios-loading-spinner"></div>
          <div className="ios-loading-text">جاري تحميل الخدمات...</div>
        </div>
      )}

      {/* Services Grid */}
      {!loading && (
        <>
          {filteredServices.length > 0 ? (
            <div className="services-grid">
              {filteredServices.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-header">
                <div
                  className="service-icon"
                  style={{
                    width: 48,
                    height: 48,
                    background: "#0171BD",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FaTooth
                    className="icon-tooth"
                    style={{
                      color: "#FFFFFF",
                      fontSize: 28,
                      lineHeight: 1,
                      display: "inline-block",
                    }}
                  />
                </div>
                <div className="service-info">
                  <h3 className="service-title">{service.title_ar}</h3>
                  <p className="service-subtitle">#{service.service_number}</p>
                </div>
              </div>

              <p className="service-description">{service.about_ar}</p>

              <div className="service-details">
                <div className="detail-item">
                  <FaMoneyBillWave className="detail-icon" />
                  <span className="detail-text">
                    {service.discount ? (
                      <>
                        <span className="old-price">{service.price} ر.س</span>
                        <span className="new-price">
                          {service.price -
                            (service.price * service.discount) / 100}{" "}
                          ر.س
                        </span>
                        <span className="discount">
                          (خصم {service.discount}%)
                        </span>
                      </>
                    ) : (
                      <span>
                        {service.price > 0
                          ? `${service.price} ر.س`
                          : "اتصل للسعر"}
                      </span>
                    )}
                  </span>
                </div>

                <div className="detail-item">
                  <FaClock className="detail-icon" />
                  <span className="detail-text">
                    {service.service_time} دقيقة
                  </span>
                </div>

                <div className="detail-item">
                  <FaMapPin className="detail-icon" />
                  <span className="detail-text">عيادة {service.clinic_id}</span>
                </div>

                <div className="detail-item">
                  <FaStar className="detail-icon" />
                  <span className="detail-text">
                    {service.status === 1 ? "متاح" : "غير متاح"}
                  </span>
                </div>
              </div>

              <button 
                className="book-service-btn"
                onClick={() => handleViewServiceDetails(service)}
              >
                <FaPlus className="btn-icon" />
                حجز الخدمة
              </button>
            </div>
          ))}
            </div>
          ) : (
            <div className="ios-empty-content">
              <FaStethoscope className="ios-empty-icon" />
              <div className="ios-empty-text">
                <div className="ios-empty-title">لا توجد خدمات متاحة</div>
                <div className="ios-empty-subtitle">
                  لم يتم العثور على خدمات تطابق البحث
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ServicesFilter;
