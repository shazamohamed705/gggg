import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import bannerImage from "../assets/photo/baner1.webp";
import banner2Image from "../assets/photo/bamer 2.webp";
import { fetchHomePageData } from "../utils/apis/fetchHomePageData";
import {
  FaInstagram,
  FaSnapchatGhost,
  FaTwitter,
  FaTiktok,
  FaMapMarkerAlt,
  FaStar,
  FaCalendarAlt,
  FaFilter,
  FaMapMarker,
  FaBuilding,
  FaUser,
  FaUserMd,
  FaMoneyBillWave,
  FaStarHalfAlt,
  FaMedal,
  FaStethoscope,
} from "react-icons/fa";
import "./Book.css";

const ITEMS_PER_PAGE = 6;

// Helper function to safely extract data from API response
const extractDataFromResponse = (responseData) => {
  if (!responseData || typeof responseData !== 'object') return [];
  
  // Handle different response structures
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData.data)) return responseData.data;
  if (Array.isArray(responseData.data?.data)) return responseData.data.data;
  
  return [];
};

const Book = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [HOME_DATA, setHOME_DATA] = useState({ banners: [] });
  const [clinics, setClinics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [doctorNames, setDoctorNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchName, setSearchName] = useState("");
  const [debouncedSearchName, setDebouncedSearchName] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [availableDoctorIds, setAvailableDoctorIds] = useState([]);

  // Check if user is logged in
  const isUserLoggedIn = () => {
    // Check localStorage for user token or user data
    const token = localStorage.getItem("userToken");
    const user = localStorage.getItem("user");
    return !!(token || user);
  };

  // Handle book now button click
  const handleBookNow = (doctor) => {
    if (isUserLoggedIn()) {
      // If logged in, navigate to dashboard bookings page
      navigate("/dashboard/bookings", { state: { selectedDoctor: doctor } });
    } else {
      // If not logged in, navigate to login page
      navigate("/auth/login", {
        state: { returnUrl: "/book", selectedDoctor: doctor },
      });
    }
  };

  // Fetch home page data for banners
  useEffect(() => {
    const fetchHomePageDataApi = async () => {
      try {
        const data = await fetchHomePageData();
        if (data?.data) {
          setHOME_DATA(data.data);
        }
      } catch (error) {
        console.error("Error fetching home page data:", error);
        // Set fallback data structure
        setHOME_DATA({ banners: [] });
      }
    };
    fetchHomePageDataApi();
  }, []);

  // Fetch clinics, categories, and doctor names on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel for better performance with timeout
        const fetchWithTimeout = (url, timeout = 10000) => {
          return Promise.race([
            fetch(url),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
          ]);
        };

        const [clinicsResponse, categoriesResponse, doctorsResponse] =
          await Promise.allSettled([
            fetchWithTimeout("https://ghaimcenter.com/laravel/api/clinics"),
            fetchWithTimeout("https://ghaimcenter.com/laravel/api/clinics/categories"),
            fetchWithTimeout("https://ghaimcenter.com/laravel/api/clinics/doctors"),
          ]);

        // Process clinics data
        if (clinicsResponse.status === 'fulfilled' && clinicsResponse.value.ok) {
          const clinicsData = await clinicsResponse.value.json();
          if (clinicsData.status === "success") {
            const clinicsArray = extractDataFromResponse(clinicsData);
            setClinics(clinicsArray);
            console.log(`Loaded ${clinicsArray.length} clinics`);
          } else {
            console.warn("Invalid clinics response status:", clinicsData);
            setClinics([]);
          }
        } else {
          console.warn("Failed to fetch clinics:", clinicsResponse.reason);
          setClinics([]);
        }

        // Process categories data
        if (categoriesResponse.status === 'fulfilled' && categoriesResponse.value.ok) {
          const categoriesData = await categoriesResponse.value.json();
          if (categoriesData.status === "success") {
            const categoriesArray = extractDataFromResponse(categoriesData);
            setCategories(categoriesArray);
            console.log(`Loaded ${categoriesArray.length} categories`);
          } else {
            console.warn("Invalid categories response status:", categoriesData);
            setCategories([]);
          }
        } else {
          console.warn("Failed to fetch categories:", categoriesResponse.reason);
          setCategories([]);
        }

        // Process doctor names data
        if (doctorsResponse.status === 'fulfilled' && doctorsResponse.value.ok) {
          const doctorsData = await doctorsResponse.value.json();
          if (doctorsData.status === "success") {
            const doctorsArray = extractDataFromResponse(doctorsData);
            setDoctorNames(doctorsArray);
            console.log(`Loaded ${doctorsArray.length} doctor names`);
          } else {
            console.warn("Invalid doctor names response status:", doctorsData);
            setDoctorNames([]);
          }
        } else {
          console.warn("Failed to fetch doctor names:", doctorsResponse.reason);
          setDoctorNames([]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set fallback empty arrays to prevent crashes
        setClinics([]);
        setCategories([]);
        setDoctorNames([]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Debounce search input for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchName(searchName);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchName]);

  // Use clinics as doctors directly
  useEffect(() => {
    if (Array.isArray(clinics) && clinics.length > 0) {
      // Transform clinics into doctors format
      const doctorsList = clinics
        .filter((clinic) => {
          // Validate clinic data structure
          if (!clinic || typeof clinic !== 'object') return false;
          
          // Only include clinics whose owner_name is in the approved doctors list
          return (
            doctorNames.length === 0 || 
            (Array.isArray(doctorNames) && doctorNames.includes(clinic.owner_name))
          );
        })
        .map((clinic) => {
          // Calculate min and max price from services
          let minPrice = 0;
          let maxPrice = 0;

          if (clinic.services && Array.isArray(clinic.services) && clinic.services.length > 0) {
            const prices = clinic.services
              .map((service) => service?.price || 0)
              .filter((price) => price > 0);

            if (prices.length > 0) {
              minPrice = Math.min(...prices);
              maxPrice = Math.max(...prices);
            }
          }

          return {
            id: clinic.id || 0,
            name: clinic.owner_name || "غير محدد", // Doctor name from owner_name
            photo: clinic.owner_photo || "/imge.png",
            rating: clinic.rating || clinic.reviews_avg_rating || 0,
            clinic_id: clinic.id || 0,
            clinic_name: clinic.clinic_name || "غير محدد",
            clinic_address: clinic.clinic_address || "غير محدد",
            clinic_categories: clinic.clinic_categories || "", // Specialty from categories
            top_rated: clinic.top_rated || 0,
            phone: clinic.clinic_phone || "",
            gender: clinic.gender_served || 0,
            min_price: minPrice,
            max_price: maxPrice,
            created_at: clinic.created_at || "",
            updated_at: clinic.updated_at || ""
          };
        });

      setAllDoctors(doctorsList);
      setDoctors(doctorsList);
    } else {
      // Reset doctors if no clinics data
      setAllDoctors([]);
      setDoctors([]);
    }
  }, [clinics, doctorNames]);

  // Check available doctors for selected date
  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedDate || allDoctors.length === 0) {
        setAvailableDoctorIds([]);
        return;
      }

      setIsFiltering(true);
      const availableIds = [];

      // Process doctors in batches to avoid overwhelming the server
      const batchSize = 5;
      const batches = [];
      for (let i = 0; i < allDoctors.length; i += batchSize) {
        batches.push(allDoctors.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const batchPromises = batch.map(async (doctor) => {
          try {
            // Check if doctor has available times on the selected date
            const response = await fetch(
              `https://ghaimcenter.com/laravel/api/clinics/available_times/${doctor.clinic_id}?staff_id=${doctor.id}&date=${selectedDate}`,
              { 
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
                // Add timeout to prevent hanging requests
                signal: AbortSignal.timeout(5000)
              }
            );
            
            if (!response.ok) {
              console.warn(`HTTP error for doctor ${doctor.id}: ${response.status}`);
              return null;
            }

            const data = await response.json();

            // If there are available times, add doctor to available list
            if (
              data.status === "success" &&
              data.data &&
              Object.keys(data.data).length > 0
            ) {
              return doctor.id;
            }
            return null;
          } catch (error) {
            console.warn(
              `Error checking availability for doctor ${doctor.id}:`,
              error.message
            );
            return null;
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        batchResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            availableIds.push(result.value);
          }
        });
      }

      setAvailableDoctorIds(availableIds);
      setIsFiltering(false);
    };

    checkAvailability();
  }, [selectedDate, allDoctors]);

  // Reset all filters
  const resetAllFilters = () => {
    setSelectedCity("");
    setSelectedClinic(null);
    setSelectedDoctor("");
    setSelectedCategory("");
    setSelectedPriceRange("");
    setSelectedDate("");
    setSearchName("");
    setCurrentPage(1);
  };

  // Helper functions for date filters
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const getNextWeekDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split("T")[0];
  };

  // Filter doctors based on selected filters
  useEffect(() => {
    const filterDoctors = () => {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        setIsFiltering(true);

        // Use useMemo-like optimization for filtering
        let filtered = allDoctors;

        // Early return if no doctors
        if (!Array.isArray(allDoctors) || allDoctors.length === 0) {
          setDoctors([]);
          setCurrentPage(1);
          setIsFiltering(false);
          return;
        }

        // Apply filters in order of selectivity (most selective first)
        
        // Filter by clinic (most selective)
        if (selectedClinic) {
          filtered = filtered.filter(
            (doctor) => doctor.clinic_id === selectedClinic
          );
        }

        // Filter by category (specialty) - very selective
        if (selectedCategory) {
          filtered = filtered.filter((doctor) => {
            if (!doctor.clinic_categories) return false;
            const categoryIds = doctor.clinic_categories
              .split(",")
              .map((id) => id.trim());
            return categoryIds.includes(selectedCategory.toString());
          });
        }

        // Filter by date availability - selective
        if (selectedDate && availableDoctorIds.length > 0) {
          filtered = filtered.filter((doctor) =>
            availableDoctorIds.includes(doctor.id)
          );
        }

        // Filter by price range - moderately selective
        if (selectedPriceRange) {
          filtered = filtered.filter((doctor) => {
            const minPrice = doctor.min_price || 0;
            const maxPrice = doctor.max_price || 0;

            // Skip doctors without price information
            if (minPrice === 0 && maxPrice === 0) {
              return false;
            }

            switch (selectedPriceRange) {
              case "under100":
                return minPrice > 0 && minPrice < 100;
              case "100-300":
                return (
                  (minPrice >= 100 && minPrice <= 300) ||
                  (maxPrice >= 100 && maxPrice <= 300) ||
                  (minPrice < 100 && maxPrice > 300)
                );
              case "300-500":
                return (
                  (minPrice >= 300 && minPrice <= 500) ||
                  (maxPrice >= 300 && maxPrice <= 500) ||
                  (minPrice < 300 && maxPrice > 500)
                );
              case "over500":
                return maxPrice > 500 || minPrice > 500;
              default:
                return true;
            }
          });
        }

        // Filter by city - less selective
        if (selectedCity) {
          filtered = filtered.filter(
            (doctor) =>
              doctor.clinic_address &&
              doctor.clinic_address.includes(selectedCity)
          );
        }

        // Filter by doctor name (from dropdown) - less selective
        if (selectedDoctor) {
          filtered = filtered.filter(
            (doctor) => doctor.name && doctor.name.includes(selectedDoctor)
          );
        }

        // Filter by search name (from search box) - least selective, do last
        if (debouncedSearchName.trim()) {
          const searchTerm = debouncedSearchName.toLowerCase();
          filtered = filtered.filter(
            (doctor) =>
              doctor.name &&
              doctor.name.toLowerCase().includes(searchTerm)
          );
        }

        setDoctors(filtered);
        setCurrentPage(1);
        setIsFiltering(false);
      });
    };

    filterDoctors();
  }, [
    selectedCity,
    selectedClinic,
    selectedDoctor,
    selectedCategory,
    selectedPriceRange,
    selectedDate,
    debouncedSearchName,
    availableDoctorIds,
    allDoctors,
  ]);

  // Memoized callbacks for better performance
  const nextImage = useCallback(() => {
    const bannersLength = HOME_DATA.banners?.length || 2; // fallback to 2 for static images
    setCurrentImage((prev) => (prev + 1) % bannersLength);
  }, [HOME_DATA.banners?.length]);

  const prevImage = useCallback(() => {
    const bannersLength = HOME_DATA.banners?.length || 2; // fallback to 2 for static images
    setCurrentImage((prev) => (prev - 1 + bannersLength) % bannersLength);
  }, [HOME_DATA.banners?.length]);

  // Get category names from IDs - memoized for better performance
  const getCategoryNames = useCallback(
    (categoryIds) => {
      if (!categoryIds || !Array.isArray(categories)) return "";
      const ids = categoryIds.split(",").map((id) => parseInt(id.trim()));
      const names = categories
        .filter((cat) => ids.includes(cat.id))
        .map((cat) => cat.title_ar || cat.title);
      return names.join("، ");
    },
    [categories]
  );

  // Memoize category lookup for better performance
  const categoryLookup = useMemo(() => {
    if (!Array.isArray(categories)) return new Map();
    const lookup = new Map();
    categories.forEach(cat => {
      lookup.set(cat.id, cat.title_ar || cat.title);
    });
    return lookup;
  }, [categories]);

  // Render stars based on rating
  const normalizeRatingToFive = (value) => {
    if (!value && value !== 0) return 0;
    
    let r = parseFloat(value);
    if (!isFinite(r) || isNaN(r)) return 0;
    
    // Normalize common scales
    if (r > 5 && r <= 10)
      r = r / 2; // 0-10 scale
    else if (r > 10 && r <= 100) r = r / 20; // 0-100 percentage to 0-5
    
    // Clamp and round to nearest 0.5
    r = Math.max(0, Math.min(5, r));
    return Math.round(r * 2) / 2;
  };

  const getDisplayRating = (value) => {
    const r = normalizeRatingToFive(value);
    return r.toFixed(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const r = normalizeRatingToFive(rating);
    const fullStars = Math.floor(r);
    const hasHalfStar = r - fullStars === 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar
          key={`full-${i}`}
          style={{ color: "#fbbf24", fontSize: "12px" }}
        />
      );
    }
    if (hasHalfStar && fullStars < 5) {
      stars.push(
        <FaStarHalfAlt
          key="half"
          style={{ color: "#fbbf24", fontSize: "12px" }}
        />
      );
    }
    const totalFilledStars = hasHalfStar ? fullStars + 1 : fullStars;
    const emptyStars = 5 - totalFilledStars;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaStar
          key={`empty-${i}`}
          style={{ color: "#d1d5db", fontSize: "12px" }}
        />
      );
    }
    return stars;
  };

  // Pagination logic - memoized for better performance
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(doctors.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentDoctors = doctors.slice(startIndex, endIndex);
    
    return { totalPages, startIndex, endIndex, currentDoctors };
  }, [doctors, currentPage]);

  const { totalPages, currentDoctors } = paginationData;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Banner Section */}
      <section className="banner-section relative w-full h-screen overflow-hidden group -mt-16 pt-16">
        <div className="max-w-full mx-auto">
          {/* Background Images */}
          {HOME_DATA.banners?.length > 0 ? (
            HOME_DATA.banners.map(({ image }, index) => (
              <div
                key={index}
                className="absolute inset-0 w-full h-full transition-opacity duration-500"
                style={{
                  backgroundImage: `url(https://ghaimcenter.com/laravel/storage/app/public/${image})`,
                  backgroundSize: "98% auto",
                  backgroundPosition: "center top",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: "rgb(248, 249, 250)",
                  opacity: currentImage === index ? 1 : 0,
                }}
                role="img"
                aria-label={`بنر غيم الطبي ${index + 1}`}
              />
            ))
          ) : (
            // Fallback to static images if no banners from API
            <>
              <div
                className="absolute inset-0 w-full h-full transition-opacity duration-500"
                style={{
                  backgroundImage: `url(${bannerImage})`,
                  backgroundSize: "98% auto",
                  backgroundPosition: "center top",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: "rgb(248, 249, 250)",
                  opacity: currentImage === 0 ? 1 : 0,
                }}
                role="img"
                aria-label="بنر غيم الطبي 1"
              />
              <div
                className="absolute inset-0 w-full h-full transition-opacity duration-500"
                style={{
                  backgroundImage: `url(${banner2Image})`,
                  backgroundSize: "98% auto",
                  backgroundPosition: "center top",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: "rgb(248, 249, 250)",
                  opacity: currentImage === 1 ? 1 : 0,
                }}
                role="img"
                aria-label="بنر غيم الطبي 2"
              />
            </>
          )}

          {/* Navigation Arrows - Hidden by default, show on hover */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 w-12 h-12 rounded-full border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
            style={{ backgroundColor: "rgb(1, 113, 189)" }}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 w-12 h-12 rounded-full border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
            style={{ backgroundColor: "rgb(1, 113, 189)" }}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Carousel Indicators */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 z-40 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ bottom: "270px" }}
          >
            {(HOME_DATA.banners?.length > 0 ? HOME_DATA.banners : [1, 2]).map(
              (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentImage === index
                      ? "w-4 bg-blue-600"
                      : "bg-white opacity-50"
                  }`}
                  style={{
                    backgroundColor:
                      currentImage === index ? "rgb(1, 113, 189)" : undefined,
                  }}
                  aria-label={`الذهاب إلى الصورة ${index + 1}`}
                />
              )
            )}
          </div>
        </div>

        {/* New Search Card */}
        <div className="search-card-container">
          <div className="search-card">
            <div className="search-elements" dir="rtl">
              <input
                type="text"
                placeholder="ابحث بالاسم  .."
                className="search-input"
                dir="rtl"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />

              <button
                className="book-search-btn-special"
                onClick={() => {
                  // Apply current search filters
                  setCurrentPage(1);
                }}
              >
                <span className="book-search-text">بحث</span>
              </button>

              <button className="reset-button" onClick={resetAllFilters}>
                <span>⟳</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results Section */}
      <section className="search-results-section">
        <div className="results-container">
          {/* Left Side - Results */}
          <div className="results-grid">
            <div className="results-header" dir="rtl"></div>

            <div className={`doctors-grid ${currentDoctors.length <= 6 ? 'center-cards' : ''}`}>
              {loading || isFiltering ? (
                <div
                  className="loading-container"
                  style={{
                    width: "100%",
                    textAlign: "center",
                    padding: "3rem",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      width: "50px",
                      height: "50px",
                      border: "5px solid #f3f3f3",
                      borderTop: "5px solid #0171bd",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      marginBottom: "1rem",
                    }}
                  ></div>
                  <p
                    style={{
                      fontSize: "1.2rem",
                      color: "#0171bd",
                      fontWeight: "600",
                    }}
                  >
                    {loading ? "جاري تحميل الأطباء..." : "جاري التصفية..."}
                  </p>
                </div>
              ) : currentDoctors.length === 0 ? (
                <div
                  className="no-results"
                  style={{
                    width: "100%",
                    textAlign: "center",
                    padding: "3rem",
                  }}
                >
                  <p style={{ fontSize: "1.2rem", color: "#666" }}>
                    لا توجد نتائج
                  </p>
                </div>
              ) : (
                currentDoctors.map((doctor) => (
                  <div className="doctor-card" key={doctor.id}>
                    {/* Top Rated Badge */}
                    {doctor.top_rated === 1 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          backgroundColor: "#ffc107",
                          color: "#fff",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          zIndex: 10,
                        }}
                      >
                        <FaMedal /> مميز
                      </div>
                    )}


                    <div className="doctor-avatar-section">
                      <div className="doctor-avatar">
                        <img
                          src={doctor.photo || "/imge.png"}
                          alt={doctor.name}
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = "/imge.png";
                          }}
                        />
                      </div>
                    </div>

                    <div className="doctor-main-content">
                      <div>
                        <h3 style={{ marginBottom: "15px" }}>{doctor.name}</h3>
                        <p
                          className="specialty"
                          style={{
                            marginTop: "15px",
                            color: "#000",
                            fontWeight: 700,
                          }}
                        >
                          {getCategoryNames(doctor.clinic_categories) ||
                            "غير محدد"}
                        </p>
                        <p
                          className="location"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            flexDirection: "row-reverse",
                          }}
                        >
                          <FaMapMarkerAlt className="location-icon" />
                          <span>{doctor.clinic_address || "غير محدد"}</span>
                        </p>
                      </div>

                      <div className="doctor-rating-section">
                        <div
                          className="price-rating"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            flexWrap: "nowrap",
                          }}
                        >
                          {/* Price Display */}
                          {doctor.min_price > 0 || doctor.max_price > 0 ? (
                            <div
                              style={{
                                fontSize: "1rem",
                                fontWeight: "700",
                                color: "#231f20",
                                marginBottom: 0,
                                fontFamily: "IBM Plex Sans Arabic, sans-serif",
                              }}
                            >
                              {doctor.min_price === doctor.max_price ? (
                                <span className="price" dir="rtl">
                                  {doctor.min_price}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 1124.14 1256.39"
                                    width="12"
                                    height="13"
                                    aria-label="Saudi Riyal"
                                    title="Saudi Riyal"
                                    style={{
                                      display: "inline-block",
                                      verticalAlign: "middle",
                                      marginLeft: "2px",
                                    }}
                                  >
                                    <path
                                      fill="#231f20"
                                      d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"
                                    ></path>
                                    <path
                                      fill="#231f20"
                                      d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"
                                    ></path>
                                  </svg>
                                </span>
                              ) : (
                                <span className="price" dir="rtl">
                                  {doctor.min_price} - {doctor.max_price}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 1124.14 1256.39"
                                    width="12"
                                    height="13"
                                    aria-label="Saudi Riyal"
                                    title="Saudi Riyal"
                                    style={{
                                      display: "inline-block",
                                      verticalAlign: "middle",
                                      marginLeft: "2px",
                                    }}
                                  >
                                    <path
                                      fill="#231f20"
                                      d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"
                                    ></path>
                                    <path
                                      fill="#231f20"
                                      d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"
                                    ></path>
                                  </svg>
                                </span>
                              )}
                            </div>
                          ) : (
                            <div
                              style={{
                                fontSize: "1rem",
                                fontWeight: "700",
                                color: "#231f20",
                                marginBottom: 0,
                                fontFamily: "IBM Plex Sans Arabic, sans-serif",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 1124.14 1256.39"
                                width="12"
                                height="13"
                                aria-label="Saudi Riyal"
                                title="Saudi Riyal"
                                style={{
                                  display: "inline-block",
                                  verticalAlign: "middle",
                                }}
                              >
                                <path
                                  fill="#231f20"
                                  d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"
                                ></path>
                                <path
                                  fill="#231f20"
                                  d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"
                                ></path>
                              </svg>
                            </div>
                          )}

                          <div
                            className="rating"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginBottom: 0,
                            }}
                          >
                            <div className="stars-container">
                              {(() => {
                                const norm = normalizeRatingToFive(
                                  doctor.rating
                                );
                                if (norm > 0) {
                                  return (
                                    <>
                                      <span className="rating-number" dir="rtl">
                                        {getDisplayRating(doctor.rating)}
                                      </span>
                                      <div className="stars">
                                        {renderStars(doctor.rating)}
                                      </div>
                                    </>
                                  );
                                }
                                // لا يوجد تقييم: اعرض 3 نجوم ثابتة بدون رقم
                                return (
                                  <div className="stars">{renderStars(3)}</div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="doctor-button-section">
                      <button
                        className="book-now-btn"
                        onClick={() => handleBookNow(doctor)}
                      >
                        <FaCalendarAlt />
                        احجز الآن
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {!loading && doctors.length > ITEMS_PER_PAGE && (
              <div className="pagination" dir="rtl">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  السابق
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        className={`pagination-btn ${currentPage === pageNumber ? "active" : ""}`}
                        onClick={() => handlePageChange(pageNumber)}
                        dir="ltr"
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span key={pageNumber} style={{ padding: "0 8px" }}>
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  التالي
                </button>
              </div>
            )}
          </div>

          {/* Right Side - Filters */}
          <div className="filters-sidebar" dir="rtl">
            <div className="ghym-filter-header">
              <div className="ghym-filter-icon-container">
                <FaFilter className="ghym-filter-icon" />
              </div>
              <h3>تصفية النتائج</h3>
            </div>

            <div className="filter-group">
              <div className="filter-item"></div>

              <div className="filter-item">
                <div className="filter-label">
                  <FaBuilding className="label-icon" />
                  <label>المركز الطبي</label>
                </div>
                <div className="filter-input-container">
                  <select
                    className="filter-select"
                    value={selectedClinic || ""}
                    onChange={(e) => {
                      setSelectedClinic(
                        e.target.value ? parseInt(e.target.value) : null
                      );
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">جميع المراكز الطبية</option>
                    {Array.isArray(clinics) && clinics.map((clinic) => (
                      <option key={clinic.id} value={clinic.id}>
                        {clinic.clinic_name}
                      </option>
                    ))}
                  </select>
                  <span className="dropdown-arrow">▼</span>
                </div>
              </div>

              <div className="filter-item">
                <div className="filter-label">
                  <FaUser className="label-icon" />
                  <label>التخصص</label>
                </div>
                <div className="filter-input-container">
                  <select
                    className="filter-select"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">جميع التخصصات</option>
                    {Array.isArray(categories) && categories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.title_ar || category.title}
                      </option>
                    ))}
                  </select>
                  <span className="dropdown-arrow">▼</span>
                </div>
              </div>

              <div className="filter-item">
                <div className="filter-label">
                  <FaUserMd className="label-icon" />
                  <label>الطبيب</label>
                </div>
                <div className="filter-input-container">
                  <select
                    className="filter-select"
                    value={selectedDoctor}
                    onChange={(e) => {
                      setSelectedDoctor(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">جميع الأطباء</option>
                    {Array.isArray(doctorNames) && doctorNames.map((doctorName, index) => (
                      <option key={index} value={doctorName}>
                        {doctorName}
                      </option>
                    ))}
                  </select>
                  <span className="dropdown-arrow">▼</span>
                </div>
              </div>

              <div className="filter-item">
                <div className="filter-label">
                  <FaStar className="label-icon" />
                  <label>التصنيف</label>
                </div>
                <div className="filter-input-container">
                  <select className="filter-select filter-select-focused">
                    <option>اختر التصنيف</option>
                  </select>
                  <span className="dropdown-arrow">▼</span>
                </div>
              </div>

              <div className="filter-item">
                <div className="filter-label">
                  <FaCalendarAlt className="label-icon" />
                  <label>التاريخ</label>
                </div>
                <div className="filter-input-container">
                  <input
                    type="date"
                    className="filter-input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    placeholder="yyyy-mm-dd"
                  />
                </div>
                <div className="date-buttons">
                  <button
                    className={`date-btn btn btn-sm btn-outline-secondary ${selectedDate === getTodayDate() ? "active" : ""}`}
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => setSelectedDate(getTodayDate())}
                  >
                    اليوم
                  </button>
                  <button
                    className={`date-btn btn btn-sm btn-outline-secondary ${selectedDate === getTomorrowDate() ? "active" : ""}`}
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => setSelectedDate(getTomorrowDate())}
                  >
                    غداً
                  </button>
                  <button
                    className={`date-btn btn btn-sm btn-outline-secondary ${selectedDate === getNextWeekDate() ? "active" : ""}`}
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => setSelectedDate(getNextWeekDate())}
                  >
                    الأسبوع القادم
                  </button>
                  <button
                    className="date-btn btn btn-sm btn-outline-secondary"
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => setSelectedDate("")}
                  >
                    إزالة التاريخ
                  </button>
                  <button
                    className="date-btn btn btn-sm btn-outline-secondary"
                    style={{ fontSize: "0.75rem" }}
                    onClick={resetAllFilters}
                  >
                    إزالة الكل
                  </button>
                </div>
              </div>

              <div className="filter-item">
                <div className="filter-label">
                  <FaMoneyBillWave className="label-icon" />
                  <label>نطاق السعر</label>
                </div>
                <div className="price-options">
                  <label className="radio-option">
                    <span className="radio-text">أقل من 100 ر.س</span>
                    <input
                      type="radio"
                      name="price"
                      value="under100"
                      checked={selectedPriceRange === "under100"}
                      onChange={(e) => setSelectedPriceRange(e.target.value)}
                    />
                  </label>
                  <label className="radio-option">
                    <span className="radio-text">100 - 300 ر.س</span>
                    <input
                      type="radio"
                      name="price"
                      value="100-300"
                      checked={selectedPriceRange === "100-300"}
                      onChange={(e) => setSelectedPriceRange(e.target.value)}
                    />
                  </label>
                  <label className="radio-option">
                    <span className="radio-text">300 - 500 ر.س</span>
                    <input
                      type="radio"
                      name="price"
                      value="300-500"
                      checked={selectedPriceRange === "300-500"}
                      onChange={(e) => setSelectedPriceRange(e.target.value)}
                    />
                  </label>
                  <label className="radio-option">
                    <span className="radio-text">أكثر من 500 ر.س</span>
                    <input
                      type="radio"
                      name="price"
                      value="over500"
                      checked={selectedPriceRange === "over500"}
                      onChange={(e) => setSelectedPriceRange(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Complex Info Section */}
    </div>
  );
};

export default Book;
