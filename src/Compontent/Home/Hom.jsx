import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import bannerImage from "../../assets/photo/baner1.webp";
import banner2Image from "../../assets/photo/bamer 2.webp";
import download1Image from "../../assets/photo/download (1).png";
import serviceImage from "../../assets/photo/service.png";
import imImage from "../../assets/photo/im.png";
import "./Home.css";

import {
  FaInstagram,
  FaSnapchatGhost,
  FaTwitter,
  FaTiktok,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";
import { fetchHomePageData, fetchContactData, fetchBanners } from "../../utils/apis/fetchHomePageData";
// Constants moved outside component for better performance
const CARD_WIDTH = 384 + 24; // w-96 (384px) + gap (approx 24px)
const SERVICE_CARD_WIDTH = 320 + 24; // w-80 (320px) + gap (approx 24px)
const AUTO_SCROLL_INTERVAL = 3000; // 3 seconds - faster for mobile
// Display all active categories - no limit

// Remove static IMAGES array - use dynamic HOME_DATA.banners instead

const Home = () => {
  const navigate = useNavigate();

  // Dynamic clinics data from API
  const [CLINICS, setCLINICS] = useState([]);
  const [HOME_DATA, setHOME_DATA] = useState([]);
  // Dynamic services data from API
  const [SERVICES, setSERVICES] = useState([]);
  // Most booking services data from API
  const [MOST_BOOKING_SERVICES, setMOST_BOOKING_SERVICES] = useState([]);
  const [SERVICES_TITLE, setSERVICES_TITLE] = useState("أبرز خدمات غيم");
  const [CATEGORIES_DATA, setCATEGORIES_DATA] = useState({});
  // Services by categories data
  const [SERVICES_BY_CATEGORIES, setSERVICES_BY_CATEGORIES] = useState({});
  
  // Home page settings
  const [HOME_PAGE_SETTINGS, setHOME_PAGE_SETTINGS] = useState({
    categories_in_navbar: 0,
    clinics_in_home_page: 1,
    services_in_home_page: 1
  });

  // Dynamic reviews data from API
  const [REVIEWS, setREVIEWS] = useState([]);

  // Contact data from API
  const [CONTACT_DATA, setCONTACT_DATA] = useState(null);
  const [SOCIAL_MEDIA, setSOCIAL_MEDIA] = useState(null);

  const [currentImage, setCurrentImage] = useState(0);
  const [currentService, setCurrentService] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const clinicsRowRef = useRef(null);
  const servicesRowRef = useRef(null);
  const reviewsRowRef = useRef(null);

  // Fetch home page data from API
  useEffect(() => {
    const fetchHomePageDataApi = async () => {
      try {
        // Fetch banners from dedicated API
        const bannersResult = await fetchBanners();
        console.log("✅ Banners loaded:", bannersResult);
        
        // Fetch other home page data
        const data = await fetchHomePageData();
        if (data?.data) {
          // Merge banners from dedicated API with other data
          const mergedData = {
            ...data.data,
            banners: bannersResult.data || []
          };
          setHOME_DATA(mergedData);
          console.log("✅ Home page data loaded:", mergedData);
        } else {
          // Set fallback data structure with banners
          setHOME_DATA({ 
            banners: bannersResult.data || [],
            clinics: [],
            services: [],
            reviews: []
          });
        }
      } catch (error) {
        console.error("Error fetching home page data:", error);
        // Set fallback data structure
        setHOME_DATA({ banners: [] });
      }
    };
    fetchHomePageDataApi();
    const fetchClinics = async () => {
      try {
        const response = await fetch(
          "https://ghaimcenter.com/laravel/api/clinics"
        );
        const result = await response.json();
        if (result.status === "success") {
          // Handle new data structure - clinics are now in result.data.data array
          const clinicsArray = result.data.data || result.data;
          
          // Extract clinic information from the new structure
          const clinicsData = clinicsArray.map((clinic) => ({
            id: clinic.id,
            name: clinic.clinic_name,
            // Try to get photo from images array first, then fallback to owner_photo
            photo:
              clinic.images && clinic.images.length > 0
                ? clinic.images[0].image
                : clinic.owner_photo,
            // Include additional clinic information if available
            address: clinic.clinic_address,
            phone: clinic.clinic_phone,
            lat: clinic.clinic_lat,
            lng: clinic.clinic_long,
            categories: clinic.clinic_categories
          }));
          setCLINICS(clinicsData);
          console.log("✅ Clinics loaded with new structure:", clinicsData);
        }
      } catch (error) {
        console.error("Error fetching clinics:", error);
        // Fallback to static data
        setCLINICS([
          { id: 1, name: "عيادة غيم للجلدية", photo: download1Image },
          { id: 2, name: "عيادة غيم للقلب", photo: download1Image },
          { id: 3, name: "عيادة غيم للعظام", photo: download1Image },
          { id: 4, name: "عيادة غيم للأسنان", photo: download1Image },
        ]);
      }
    };

    fetchClinics();
  }, []);
  // Fetch services data from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(
          "https://ghaimcenter.com/laravel/api/clinics/services"
        );
        const result = await response.json();
        if (result.status === "success") {
          // Take all services from the API
          const servicesData = result.data.map((service) => ({
            id: service.id,
            clinic_id: service.clinics_id || service.clinic_id, // Use clinics_id if available
            clinics_id: service.clinics_id || service.clinic_id, // Ensure both fields are available
            name: service.title_ar || service.title,
            price: service.price > 0 ? service.price : "اتصل للسعر",
            image:
              service.images && service.images.length > 0
                ? service.images[0].image
                : serviceImage,
          }));
          setSERVICES(servicesData);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        // Fallback to static data
        setSERVICES([
          {
            id: 1,
            clinic_id: 1,
            name: "امل فيلر (أنواع محددة) + امل بوتكس مع ابرة نضارة هدية",
            price: "اتصل للسعر",
            image: serviceImage,
          },
          {
            id: 2,
            clinic_id: 2,
            name: "مل فيلر (أنواع محددة) كونتور وجه كامل",
            price: "اتصل للسعر",
            image: serviceImage,
          },
          {
            id: 3,
            clinic_id: 3,
            name: "حشو الأسنان",
            price: "200",
            image: serviceImage,
          },
          {
            id: 4,
            clinic_id: 4,
            name: "تنظيف الأسنان والتبييض",
            price: "150",
            image: serviceImage,
          },
        ]);
      }
    };

    fetchServices();
  }, []);

  // Fetch reviews data from API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          "https://ghaimcenter.com/laravel/api/clinics/reviews"
        );
        const result = await response.json();
        if (result.status === "success" && result.data && result.data.data) {
          // Extract reviews data
          const reviewsData = result.data.data.map((review) => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            userName: review.user.fullname,
            clinicName: review.clinic?.clinic_name || "عيادة غيم",
          }));
          setREVIEWS(reviewsData);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        // Fallback to static data
        setREVIEWS([
          {
            id: 1,
            comment: "عيادة ولا اروععع بالذات الليزر",
            userName: "Ahmed Ibrahim",
            clinicName: "عيادة الأسنان المتميزة",
            rating: 5,
          },
          {
            id: 2,
            comment:
              "مرکز ممتاز دقه بالمواعيد سويت تشقير حواجب عند اسراء يعطيها العافيه خلت حواجي مرتبه",
            userName: "Ahmed Ibrahim",
            clinicName: "عيادة الأسنان المتميزة",
            rating: 5,
          },
          {
            id: 3,
            comment: "الموظفات الاستقبال في كامل الرقي ومتعاونين جداً",
            userName: "Ahmed Ibrahim",
            clinicName: "عيادة الأسنان المتميزة",
            rating: 5,
          },
          {
            id: 4,
            comment: "خدمة ممتازة ونتائج رائعة، أنصح بشدة",
            userName: "Sarah Mohammed",
            clinicName: "عيادة التجميل",
            rating: 5,
          },
        ]);
      }
    };

    fetchReviews();
  }, []);

  // Fetch contact data from API
  useEffect(() => {
    const fetchContactDataApi = async () => {
      try {
        const data = await fetchContactData();
        if (data?.data) {
          // Separate contact data and social media data
          const contactDataItem = data.data.find(item => item.prefix === "contact_data");
          const socialMediaItem = data.data.find(item => item.prefix === "social_media");
          
          if (contactDataItem) {
            setCONTACT_DATA(contactDataItem.data);
          }
          if (socialMediaItem) {
            setSOCIAL_MEDIA(socialMediaItem.data);
          }
        }
      } catch (error) {
        console.error("Error fetching contact data:", error);
        // Set fallback data
        setCONTACT_DATA({
          email: "info@ghaym-medical.com",
          phone: "+966 11 123 4567",
          address: "الرياض، المملكة العربية السعودية - شارع الملك فهد، حي الملز",
          working_times: {
            weekends: ["الجمعه"],
            available: [
              {
                start_day: "الاتنين",
                end_day: "الخميس",
                start_time: "09:00",
                end_time: "18:00"
              },
              {
                start_day: "السبت",
                end_day: "الاحد",
                start_time: "09:00",
                end_time: "18:00"
              }
            ]
          },
          google_maps_link: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.4!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2ee2c4b8c8c8c9%3A0x3e2ee2c4b8c8c8c9!2sKing%20Fahd%20Rd%2C%20Al%20Malaz%2C%20Riyadh%2012621%2C%20Saudi%20Arabia!5e0!3m2!1sen!2s!4v1704067200000!5m2!1sen!2s"
        });
        setSOCIAL_MEDIA({
          facebook: "https://facebook.com",
          twitter: "https://twitter.com",
          instagram: "https://instagram.com",
          linkedin: "https://linkedin.com",
          tiktok: "https://tiktok.com",
          youtube: "https://youtube.com",
          snapchat: "https://snapchat.com",
          x: "https://x.com"
        });
      }
    };
    
    fetchContactDataApi();
  }, []);

  // Fetch services by categories from new API - optimized function
  useEffect(() => {
    const fetchServicesByCategories = async () => {
      try {
        console.log("🔄 Fetching services by categories...");
        
        // Fetch services by categories from the new API endpoint
        const response = await fetch(
          "https://ghaimcenter.com/laravel/api/clinics/services-in-categories"
        );
        
        if (!response.ok) {
          throw new Error(`Services by categories API error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === "success" && result.data) {
          console.log("✅ Services by categories loaded:", result.data);
          
          // Handle new data structure - data is now in result.data.data
          const categoriesData = result.data.data || result.data;
          const homePageSettings = result.data.home_page_setting;
          
          // Process the data to create a more efficient structure
          const processedData = {};
          
          Object.entries(categoriesData).forEach(([categoryName, categoryData]) => {
            // Skip empty categories or categories with no services
            if (!categoryData.category_info || !categoryData.services || categoryData.services.length === 0) {
              return;
            }
            
            const categoryInfo = categoryData.category_info;
            const services = categoryData.services;
            
            // Process services for this category
            const processedServices = services.map((service) => ({
              id: service.id,
              title_ar: service.title_ar || service.title,
              name: service.title_ar || service.title,
              price: service.price > 0 ? service.price : "اتصل للسعر",
              discount: service.discount,
              image: service.images && service.images.length > 0 
                ? service.images[0].image 
                : serviceImage,
              clinic_id: service.clinics_id || service.clinic_id,
              clinics_id: service.clinics_id || service.clinic_id,
              clinic_name: service.clinic?.clinic_name || "مجمع غيم الطبي",
              category_id: service.category_id,
              category_name: categoryInfo.title_ar || categoryInfo.title,
              service_time: service.service_time,
              about_ar: service.about_ar || service.about,
              gender: service.gender,
              status: service.status
            }));
            
            // Only add categories that have services
            if (processedServices.length > 0) {
              processedData[categoryName] = {
                category_info: {
                  id: categoryInfo.id,
                  title_ar: categoryInfo.title_ar || categoryInfo.title,
                  title_en: categoryInfo.title_en,
                  icon: categoryInfo.icon 
                    ? `https://ghaimcenter.com/laravel/storage/app/public/${categoryInfo.icon}`
                    : serviceImage
                },
                services: processedServices
              };
            }
          });
          
          setSERVICES_BY_CATEGORIES(processedData);
          console.log("✅ Processed services by categories:", processedData);
          
          // Update home page settings if available
          if (homePageSettings) {
            setHOME_PAGE_SETTINGS(homePageSettings);
            console.log("✅ Home page settings loaded:", homePageSettings);
          }
          
          // Also update MOST_BOOKING_SERVICES for backward compatibility
          const allServices = Object.values(processedData)
            .flatMap(category => category.services)
            .slice(0, 3); // Take first 3 services for the main display
          
          setMOST_BOOKING_SERVICES(allServices);
          
          // Set initial title
          if (allServices.length > 0) {
            setSERVICES_TITLE(allServices[0].category_name || "خدمات غيم");
          } else {
            setSERVICES_TITLE("خدمات غيم");
          }
        }
      } catch (error) {
        console.error("Error fetching services by categories:", error);
        // Fallback to existing categories fetch
        fetchCategoriesAndServices();
      }
    };
    
    // Fallback function for categories only (if services by categories fails)
    const fetchCategoriesAndServices = async () => {
      try {
        const categoriesResponse = await fetch(
          "https://ghaimcenter.com/laravel/api/clinics/categories"
        );
        
        if (!categoriesResponse.ok) {
          throw new Error(`Categories API error! status: ${categoriesResponse.status}`);
        }
        
        const categoriesResult = await categoriesResponse.json();
        
        if (categoriesResult.status === "success" && categoriesResult.data) {
          const activeCategories = categoriesResult.data.filter(category => category.is_deleted === 0);
          
          const servicesFromCategories = activeCategories
            .map((category) => ({
              id: category.id,
              title_ar: category.title_ar || category.title,
              name: category.title_ar || category.title,
              category_name: category.title_ar || category.title,
              category_icon: category.icon,
              category_id: category.id,
              image: category.icon 
                ? `https://ghaimcenter.com/laravel/storage/app/public/${category.icon}` 
                : serviceImage,
              price: "اتصل للسعر",
              clinic_name: "مجمع غيم الطبي",
              clinic_id: 1,
              clinics_id: 1
            }));
          
          setMOST_BOOKING_SERVICES(servicesFromCategories);
          
          if (servicesFromCategories.length > 0) {
            setSERVICES_TITLE(servicesFromCategories[0].category_name);
          } else {
            setSERVICES_TITLE("خدمات غيم");
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    
    fetchServicesByCategories();
  }, []);

  // Helper function to format working hours
  const formatWorkingHours = useCallback((workingTimes) => {
    if (!workingTimes || !workingTimes.available) {
      return (
        <div
          className="text-xs md:text-base text-gray-600 space-y-1 md:space-y-2"
          style={{
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
          }}
        >
          <p>الأحد - الخميس: 8:00 ص - 6:00 م</p>
          <p>الجمعة: 2:00 م - 6:00 م</p>
          <p>السبت: مغلق</p>
        </div>
      );
    }

    return (
      <div
        className="text-xs md:text-base text-gray-600 space-y-1 md:space-y-2"
        style={{
          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
        }}
      >
        {workingTimes.available.map((schedule, index) => (
          <p key={index}>
            {schedule.start_day} - {schedule.end_day}: {schedule.start_time} - {schedule.end_time}
          </p>
        ))}
        {workingTimes.weekends && workingTimes.weekends.length > 0 && (
          <p>أيام العطل: {workingTimes.weekends.join(", ")}</p>
        )}
      </div>
    );
  }, []);

  // Navigate to booking page
  const handleBookNowClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Book now clicked - navigating to /book");
      navigate("/book");
    },
    [navigate]
  );

  // Navigate to service details page - optimized for categories and performance
  const handleServiceClick = useCallback(
    (service) => {
      // Early validation to prevent unnecessary processing
      if (!service || !service.id) {
        console.error("Invalid service data:", service);
        return;
      }
      
      console.log("Service clicked:", service);
      
      // For categories, navigate to services page with category filter
      if (service.category_id) {
        console.log(`Navigating to services with category: ${service.category_id}`);
        navigate(`/services?category_id=${service.category_id}`);
        return;
      }

      // Fallback for regular services
      const clinicId = service.clinics_id || service.clinic_id;
      
      if (!clinicId || clinicId === "undefined" || clinicId === undefined) {
        console.error("No valid clinic ID found in service data:", service);
        return;
      }

      console.log(`Navigating to: /service/${clinicId}/${service.id}`);
      navigate(`/service/${clinicId}/${service.id}`);
    },
    [navigate]
  );

  // Navigate to clinic services page
  const handleClinicClick = useCallback(
    (clinic) => {
      console.log("Clinic clicked:", clinic);
      navigate(`/services?clinic_id=${clinic.id}`);
    },
    [navigate]
  );

  // Handle touch for mobile devices
  const handleBookNowTouch = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Book now touched - navigating to /book");
      navigate("/book");
    },
    [navigate]
  );

  // Memoized callbacks for better performance
  const nextImage = useCallback(() => {
    const bannersLength = HOME_DATA.banners?.length || 2; // fallback to 2 for static images
    setCurrentImage((prev) => (prev + 1) % bannersLength);
  }, [HOME_DATA.banners?.length]);

  const prevImage = useCallback(() => {
    const bannersLength = HOME_DATA.banners?.length || 2; // fallback to 2 for static images
    setCurrentImage((prev) => (prev - 1 + bannersLength) % bannersLength);
  }, [HOME_DATA.banners?.length]);

  // Auto-scroll effect for banner images - optimized
  useEffect(() => {
    const bannersLength = HOME_DATA.banners?.length || 2; // fallback to 2 for static images
    if (bannersLength <= 1) return; // Don't auto-scroll if only one image

    let isTransitioning = false; // Prevent multiple transitions

    const interval = setInterval(() => {
      if (isTransitioning) return; // Skip if already transitioning
      
      isTransitioning = true;
      setCurrentImage((prev) => (prev + 1) % bannersLength);
      
      // Reset transition flag after animation
      setTimeout(() => {
        isTransitioning = false;
      }, 500);
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [HOME_DATA.banners?.length]);

  const getClinicScrollStep = useCallback(() => {
    const el = clinicsRowRef.current;
    if (!el) return 304; // fallback
    const firstCard = el.querySelector(".home-clinic-card-wrapper");
    const cardWidth = firstCard?.offsetWidth || 288;
    const gap = 16; // 1rem
    return cardWidth + gap;
  }, []);

  const nextClinic = useCallback(() => {
    if (!CLINICS.length) return;
    const step = getClinicScrollStep();
    clinicsRowRef.current?.scrollBy({ left: step, behavior: "smooth" });
  }, [CLINICS.length, getClinicScrollStep]);

  const prevClinic = useCallback(() => {
    if (!CLINICS.length) return;
    const step = getClinicScrollStep();
    clinicsRowRef.current?.scrollBy({ left: -step, behavior: "smooth" });
  }, [CLINICS.length, getClinicScrollStep]);

  // Auto-scroll effect for clinics - optimized for better performance
  useEffect(() => {
    if (isPaused || CLINICS.length === 0) return;

    let currentIndex = 0;
    let isScrolling = false; // Prevent multiple scroll operations

    const interval = setInterval(() => {
      if (isScrolling) return; // Skip if already scrolling
      
      currentIndex = (currentIndex + 1) % CLINICS.length;
      if (clinicsRowRef.current) {
        const cardWidth =
          clinicsRowRef.current.querySelector(".home-clinic-card-wrapper")
            ?.offsetWidth || 288;
        const gap = 16; // 1rem gap
        const scrollAmount = (cardWidth + gap) * currentIndex;
        
        isScrolling = true;
        
        try {
          clinicsRowRef.current.scrollTo({
            left: scrollAmount,
            behavior: "smooth",
          });
          
          // Reset scrolling flag after animation
          setTimeout(() => {
            isScrolling = false;
          }, 500);
        } catch (error) {
          console.warn('Clinic scroll error:', error);
          isScrolling = false;
        }
      }
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused, CLINICS.length]);

  // Auto-scroll effect for services - Mobile only
  useEffect(() => {
    const servicesToUse = MOST_BOOKING_SERVICES.length > 0 ? MOST_BOOKING_SERVICES : SERVICES;
    const limitedServices = servicesToUse.slice(0, 3); // Only use first 3 services
    if (limitedServices.length === 0) return; // Don't start scrolling until services are loaded

    let isScrolling = false; // Prevent multiple scroll operations
    let intervalId = null;
    let consecutiveErrors = 0;
    const maxRetries = 3;

    const startAutoScroll = () => {
      // Clear existing interval
      if (intervalId) clearInterval(intervalId);
      
      // Only start auto-scroll on mobile (screen width < 768px)
      if (window.innerWidth >= 768) return;

      intervalId = setInterval(() => {
        if (isScrolling) return; // Skip if already scrolling
        
        setCurrentService((prev) => {
          const nextIndex = (prev + 1) % limitedServices.length;
          
          if (servicesRowRef.current) {
            // Horizontal scrolling for mobile only
            const firstCard = servicesRowRef.current.querySelector('.home-service-card');
            if (firstCard) {
              const cardRect = firstCard.getBoundingClientRect();
              const cardWidth = cardRect.width;
              const gap = 12;
              const scrollAmount = (cardWidth + gap) * nextIndex;
              
              isScrolling = true;
              consecutiveErrors = 0; // Reset error count on success
              
              try {
                servicesRowRef.current.scrollTo({
                  left: scrollAmount,
                  behavior: 'smooth'
                });
                
                setTimeout(() => {
                  isScrolling = false;
                }, 300); // Reduced timeout for faster scrolling
              } catch (error) {
                console.warn('Scroll error:', error);
                isScrolling = false;
                consecutiveErrors++;
                
                // If too many consecutive errors, try to restart
                if (consecutiveErrors >= 3) {
                  console.log('Restarting services scroll');
                  clearInterval(intervalId);
                  setTimeout(() => {
                    startAutoScroll();
                  }, 1000);
                }
              }
            } else {
              // Card not found, try again later
              setTimeout(() => {
                if (consecutiveErrors < maxRetries) {
                  consecutiveErrors++;
                } else {
                  console.warn('Could not find service card');
                }
              }, 100);
            }
          }
          return nextIndex;
        });
      }, AUTO_SCROLL_INTERVAL);
    };

    // Start auto-scroll with delay to ensure DOM is ready
    const startWithDelay = () => {
      setTimeout(() => {
        startAutoScroll();
      }, 500);
    };

    startWithDelay();

    // Listen for window resize
    const handleResize = () => {
      if (window.innerWidth < 768) {
        startAutoScroll();
      } else {
        if (intervalId) clearInterval(intervalId);
      }
    };

    window.addEventListener('resize', handleResize);

    // Restart scroll every 30 seconds to ensure continuity
    const restartInterval = setInterval(() => {
      if (window.innerWidth < 768) {
        startAutoScroll();
      }
    }, 30000);

    return () => {
      if (intervalId) clearInterval(intervalId);
      clearInterval(restartInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [MOST_BOOKING_SERVICES.length, SERVICES.length]);

  // Auto-scroll effect for services by categories - Mobile only
  useEffect(() => {
    // Only run on mobile and if we have services by categories
    if (window.innerWidth >= 768 || Object.keys(SERVICES_BY_CATEGORIES).length === 0) return;

    let categoryScrollIntervals = {};
    let isPaused = false;
    let retryCount = 0;
    const maxRetries = 3;

    const startCategoryAutoScroll = () => {
      // Clear existing intervals
      Object.values(categoryScrollIntervals).forEach(clearInterval);
      categoryScrollIntervals = {};

      Object.entries(SERVICES_BY_CATEGORIES).forEach(([categoryName, categoryData]) => {
        const services = categoryData.services;
        if (services.length <= 1) return; // Don't scroll if only one service

        let currentIndex = 0;
        let isScrolling = false;
        let consecutiveErrors = 0;

        const scrollInterval = setInterval(() => {
          if (isScrolling || isPaused) return;

          currentIndex = (currentIndex + 1) % services.length;
          
          // Find the category services row with retry mechanism
          const findCategoryRow = () => {
            let categoryRow = document.querySelector(`[data-category="${categoryName}"] .home-category-services-row`);
            
            // If not found, try alternative selectors
            if (!categoryRow) {
              categoryRow = document.querySelector(`.home-category-section .home-category-services-row`);
            }
            
            return categoryRow;
          };

          const categoryRow = findCategoryRow();
          
          if (categoryRow) {
            const firstCard = categoryRow.querySelector('.home-service-card');
            if (firstCard) {
              const cardRect = firstCard.getBoundingClientRect();
              const cardWidth = cardRect.width;
              const gap = 16; // 1rem gap
              const scrollAmount = (cardWidth + gap) * currentIndex;
              
              isScrolling = true;
              consecutiveErrors = 0; // Reset error count on success
              
              try {
                categoryRow.scrollTo({
                  left: scrollAmount,
                  behavior: 'smooth'
                });
                
                setTimeout(() => {
                  isScrolling = false;
                }, 300); // Reduced timeout for faster scrolling
              } catch (error) {
                console.warn('Category scroll error:', error);
                isScrolling = false;
                consecutiveErrors++;
                
                // If too many consecutive errors, try to restart
                if (consecutiveErrors >= 3) {
                  console.log('Restarting scroll for category:', categoryName);
                  clearInterval(scrollInterval);
                  setTimeout(() => {
                    startCategoryAutoScroll();
                  }, 1000);
                }
              }
            } else {
              // Card not found, try again later
              setTimeout(() => {
                if (consecutiveErrors < maxRetries) {
                  consecutiveErrors++;
                } else {
                  console.warn('Could not find service card for category:', categoryName);
                }
              }, 100);
            }
          } else {
            // Row not found, try again later
            setTimeout(() => {
              if (consecutiveErrors < maxRetries) {
                consecutiveErrors++;
              } else {
                console.warn('Could not find category row for:', categoryName);
              }
            }, 100);
          }
        }, AUTO_SCROLL_INTERVAL);

        categoryScrollIntervals[categoryName] = scrollInterval;
      });
    };

    // Start auto-scroll with delay to ensure DOM is ready
    const startWithDelay = () => {
      setTimeout(() => {
        startCategoryAutoScroll();
      }, 500);
    };

    startWithDelay();

    // Add hover pause functionality (only for desktop)
    const handleMouseEnter = () => {
      if (window.innerWidth >= 768) {
        isPaused = true;
      }
    };

    const handleMouseLeave = () => {
      if (window.innerWidth >= 768) {
        isPaused = false;
      }
    };

    // Add event listeners to all category sections
    const addEventListeners = () => {
      const categorySections = document.querySelectorAll('.home-category-section');
      categorySections.forEach(section => {
        section.addEventListener('mouseenter', handleMouseEnter);
        section.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    // Add listeners with delay
    setTimeout(addEventListeners, 1000);

    // Listen for window resize
    const handleResize = () => {
      if (window.innerWidth < 768) {
        isPaused = false; // Ensure scrolling continues on mobile
        startCategoryAutoScroll();
      } else {
        // Clear intervals on desktop
        Object.values(categoryScrollIntervals).forEach(clearInterval);
      }
    };

    window.addEventListener('resize', handleResize);

    // Restart scroll every 30 seconds to ensure continuity
    const restartInterval = setInterval(() => {
      if (window.innerWidth < 768) {
        startCategoryAutoScroll();
      }
    }, 30000);

    return () => {
      Object.values(categoryScrollIntervals).forEach(clearInterval);
      clearInterval(restartInterval);
      
      const categorySections = document.querySelectorAll('.home-category-section');
      categorySections.forEach(section => {
        section.removeEventListener('mouseenter', handleMouseEnter);
        section.removeEventListener('mouseleave', handleMouseLeave);
      });
      window.removeEventListener('resize', handleResize);
    };
  }, [SERVICES_BY_CATEGORIES]);

  // Update title based on current service - Mobile only
  useEffect(() => {
    // Only update title on mobile (screen width < 768px)
    if (window.innerWidth >= 768) return;
    
    const servicesToUse = MOST_BOOKING_SERVICES.length > 0 ? MOST_BOOKING_SERVICES : SERVICES;
    const limitedServices = servicesToUse.slice(0, 3); // Only use first 3 services
    if (limitedServices.length > 0 && currentService < limitedServices.length) {
      const currentServiceData = limitedServices[currentService];
      if (currentServiceData && currentServiceData.category_name) {
        setSERVICES_TITLE(currentServiceData.category_name);
      } else if (currentServiceData && currentServiceData.title_ar) {
        setSERVICES_TITLE(currentServiceData.title_ar);
      }
    }
  }, [currentService, MOST_BOOKING_SERVICES, SERVICES]);

  // Update main title when services change - optimized
  useEffect(() => {
    const servicesToUse = MOST_BOOKING_SERVICES.length > 0 ? MOST_BOOKING_SERVICES : SERVICES;
    const limitedServices = servicesToUse.slice(0, 3);
    
    if (limitedServices.length > 0) {
      const firstService = limitedServices[0];
      const newTitle = firstService?.category_name || firstService?.title_ar || "خدمات غيم";
      
      // Only update if title actually changed to prevent unnecessary re-renders
      if (newTitle !== SERVICES_TITLE) {
        setSERVICES_TITLE(newTitle);
      }
    }
  }, [MOST_BOOKING_SERVICES, SERVICES, SERVICES_TITLE]);

  // Memoized service card component for better performance
  const ServiceCard = useCallback(({ service, serviceIdx }) => {
    // Memoize price display logic
    const priceDisplay = useMemo(() => {
      if (!service.price || service.price === "اتصل للسعر") {
        return "اتصل للسعر";
      }
      
      return (
        <>
          {service.price}{" "}
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
              fill="currentColor"
              d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"
            ></path>
            <path
              fill="currentColor"
              d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"
            ></path>
          </svg>
        </>
      );
    }, [service.price]);

    return (
      <div key={serviceIdx} className="home-service-card-wrapper">
        <div
          className="home-service-card group"
          onClick={() => handleServiceClick(service)}
        >
          {/* Image Area */}
          <div className="home-service-card-image-area">
            <img
              src={service.image}
              alt={service.title_ar || service.name || "خدمة"}
              className="home-service-card-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = serviceImage;
              }}
              loading="lazy" // Lazy loading for better performance
            />
            {/* Hover overlay with button */}
            <div className="home-service-card-overlay">
              <button className="home-service-card-overlay-btn">
                عرض التفاصيل
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="home-service-card-content">
            {/* Service Description */}
            <div className="home-service-card-description">
              <p>{service.title_ar || service.name || "خدمة"}</p>
              {/* Clinic Name */}
              {service.clinic_name && (
                <p className="home-service-clinic-name">
                  {service.clinic_name}
                </p>
              )}
            </div>

            {/* Price/Call Button */}
            <div className="home-service-card-price">
              <span className="price" dir="rtl">
                {priceDisplay}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }, [handleServiceClick]);

  // Auto-scroll effect for reviews - continuous right scroll - optimized
  useEffect(() => {
    if (REVIEWS.length === 0) return; // Don't start scrolling until reviews are loaded

    let scrollPos = 0;
    let isScrolling = false; // Prevent multiple scroll operations

    const interval = setInterval(() => {
      if (isScrolling) return; // Skip if already scrolling
      
      if (reviewsRowRef.current) {
        const cardWidth = 400; // width of review card
        const gap = 24; // gap-6 = 24px
        const totalWidth = (cardWidth + gap) * REVIEWS.length; // total width based on reviews count

        scrollPos += cardWidth + gap;
        isScrolling = true;

        try {
          // Reset to start when reaching end
          if (scrollPos >= totalWidth) {
            reviewsRowRef.current.scrollTo({ left: 0, behavior: "auto" });
            scrollPos = cardWidth + gap;
            setTimeout(() => {
              if (reviewsRowRef.current) {
                reviewsRowRef.current.scrollTo({
                  left: scrollPos,
                  behavior: "smooth",
                });
                setTimeout(() => {
                  isScrolling = false;
                }, 500);
              }
            }, 50);
          } else {
            reviewsRowRef.current.scrollTo({
              left: scrollPos,
              behavior: "smooth",
            });
            setTimeout(() => {
              isScrolling = false;
            }, 500);
          }
        } catch (error) {
          console.warn('Review scroll error:', error);
          isScrolling = false;
        }
      }
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [REVIEWS.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Banner Section */}
      <section className="home-banner group">
        <div className="home-banner-container">
          {/* Background Images */}
          {HOME_DATA.banners?.length > 0 ? (
            HOME_DATA.banners.map(({ image }, index) => (
              <div
                key={index}
                className="home-banner-image"
                style={{
                  backgroundImage: `url(https://ghaimcenter.com/laravel/storage/app/public/${image})`,
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
                className="home-banner-image"
                style={{
                  backgroundImage: `url(${bannerImage})`,
                  opacity: currentImage === 0 ? 1 : 0,
                }}
                role="img"
                aria-label="بنر غيم الطبي 1"
              />
              <div
                className="home-banner-image"
                style={{
                  backgroundImage: `url(${banner2Image})`,
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
            className="home-banner-btn home-banner-btn-prev"
            aria-label="الصورة السابقة"
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
            className="home-banner-btn home-banner-btn-next"
            aria-label="الصورة التالية"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Carousel Indicators */}
          <div className="home-banner-indicators">
            {(HOME_DATA.banners?.length > 0 ? HOME_DATA.banners : [1, 2]).map(
              (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`home-banner-indicator ${currentImage === index ? "active" : ""}`}
                  aria-label={`الذهاب إلى الصورة ${index + 1}`}
                />
              )
            )}
          </div>
        </div>

        {/* Hero Booking Card - At Bottom Center of Banner */}
        <div className="home-hero-booking-card-wrapper">
          <div
            className="home-hero-booking-card"
            onClick={handleBookNowClick}
            onTouchStart={handleBookNowTouch}
            role="button"
            tabIndex={0}
            aria-label="احجز موعدك الآن"
          >
            {/* Book Now Button - Top */}
            <div className="home-hero-booking-btn-container">
              <button
                className="home-hero-booking-btn"
                onClick={handleBookNowClick}
                onTouchStart={handleBookNowTouch}
                type="button"
              >
                احجز الآن
              </button>
            </div>

            {/* Services Text - Bottom */}
            <div className="home-hero-booking-text-container">
              <h2 className="home-hero-booking-title">خدمات غيم</h2>
              <p className="home-hero-booking-description">
                <span className="text-gray">احجز موعدك لدى </span>
                <span className="text-blue">خدمات غيم </span>
                <span className="text-gray">بخطوات بسيطة....</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Complex Info Section */}
      <section className="home-complex-section" dir="rtl">
        <div className="home-complex-container">
          {/* Title */}
          <h1 className="home-complex-title">مجمع غيم الطبي</h1>

          {/* Description */}
          <p className="home-complex-description">
            مستشفى الشفاء تقدم أفضل رعاية طبية متكاملة ...مستشفى الشفاء تقدم
            أفضل رعاية طبية متكاملة ...مستشفى الشفاء تقدم أفضل رعاية طبية
            متكاملة ...مستشفى الشفاء تقدم أفضل رعاية طبية متكاملة ...مستشفى
            الشفاء تقدم أفضل رعاية طبية متكاملة ...مستشفى الشفاء تقدم أفضل رعاية
            طبية متكاملة ...مستشفى الشفاء تقدم أفضل رعاية طبية متكاملة ...مستشفى
            الشفاء تقدم أفضل رعاية طبية متكاملة ...مستشفى الشفاء تقدم أفضل رعاية
            طبية متكاملة ...
          </p>

          {/* Social Media Icons */}
          <div className="home-complex-social">
            {SOCIAL_MEDIA?.instagram && (
              <a
                href={SOCIAL_MEDIA.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="home-complex-social-icon"
                aria-label="Instagram"
              >
                <FaInstagram className="text-2xl" />
              </a>
            )}

            {SOCIAL_MEDIA?.snapchat && (
              <a
                href={SOCIAL_MEDIA.snapchat}
                target="_blank"
                rel="noopener noreferrer"
                className="home-complex-social-icon"
                aria-label="Snapchat"
              >
                <FaSnapchatGhost className="text-2xl" />
              </a>
            )}

            {SOCIAL_MEDIA?.twitter && (
              <a
                href={SOCIAL_MEDIA.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="home-complex-social-icon"
                aria-label="Twitter"
              >
                <FaTwitter className="text-2xl" />
              </a>
            )}

            {SOCIAL_MEDIA?.tiktok && (
              <a
                href={SOCIAL_MEDIA.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="home-complex-social-icon"
                aria-label="TikTok"
              >
                <FaTiktok className="text-2xl" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Clinics Section - Only show if clinics_in_home_page is 1 */}
      {HOME_PAGE_SETTINGS.clinics_in_home_page === 1 && (
        <section className="home-clinics-section">
          <div className="home-clinics-container">
            {/* Background Container */}
            <div className="home-clinics-bg">
              {/* Section Title */}
              <h2 className="home-clinics-title">العيادات</h2>

              {/* Clinics Carousel */}
              <div className="home-clinics-carousel">
                {/* Navigation Buttons - Inside the container */}
                <button
                  onClick={prevClinic}
                  className="home-clinics-nav-btn home-clinics-nav-btn-prev"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
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
                  onClick={nextClinic}
                  className="home-clinics-nav-btn home-clinics-nav-btn-next"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Clinics Cards Row - Container with overflow hidden */}
                <div className="home-clinics-overflow">
                  <div
                    ref={clinicsRowRef}
                    className="home-clinics-row"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    {CLINICS.map((clinic, idx) => (
                      <div
                        key={idx}
                        className="home-clinic-card-wrapper"
                        onClick={() => handleClinicClick(clinic)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="home-clinic-card">
                          {/* Card Content with overflow hidden */}
                          <div className="home-clinic-card-content">
                            {/* Icon Area */}
                            <div className="home-clinic-card-icon-area">
                              <img
                                src={clinic.photo || download1Image}
                                alt={clinic.name}
                                className="home-clinic-card-icon"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = download1Image;
                                }}
                              />
                              <div className="home-clinic-card-white-overlay"></div>
                              {/* Dark Overlay */}
                              <div className="home-clinic-card-dark-overlay"></div>
                            </div>
                          </div>
                          {/* Text Overlay - Part of moving card */}
                          <div className="home-clinic-card-text-wrapper">
                            <div className="home-clinic-card-line"></div>
                            <p className="home-clinic-card-text">{clinic.name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Services Section - Only show if services_in_home_page is 1 */}
      {HOME_PAGE_SETTINGS.services_in_home_page === 1 && (
        <section className="home-services-section">
          <div className="home-services-outer">
            {/* Background Container */}
            <div className="home-services-bg">
              {/* Main Title */}
              <h2 className="home-services-main-title">خدمات غيم الطبي</h2>
              
              {/* Services by Categories */}
              {Object.keys(SERVICES_BY_CATEGORIES).length > 0 ? (
                <div className="home-services-by-categories">
                  {Object.entries(SERVICES_BY_CATEGORIES).map(([categoryName, categoryData]) => (
                    <div key={categoryName} className="home-category-section" data-category={categoryName}>
                      {/* Category Title */}
                      <div className="home-category-header">
                        <div className="home-category-line"></div>
                        <h3 className="home-category-title">
                          {categoryData.category_info.title_ar || categoryName}
                        </h3>
                      </div>
                      
                      {/* Services Row for this Category */}
                      <div className="home-category-services-row">
                        {categoryData.services.slice().reverse().map((service, serviceIdx) => (
                          <ServiceCard 
                            key={`${categoryName}-${service.id}-${serviceIdx}`}
                            service={service} 
                            serviceIdx={serviceIdx} 
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback to original services display */
                <div ref={servicesRowRef} className="home-services-row">
                  {(MOST_BOOKING_SERVICES.length > 0 ? MOST_BOOKING_SERVICES : SERVICES).slice(0, 3).map((service, idx) => (
                    <div key={idx} className="home-service-card-wrapper">
                      {/* Service Title Above Card - Only for first card */}
                      {idx === 0 && (
                        <h2 className="home-services-title">
                          {service.category_name || service.title_ar || service.name || "خدمات غيم"}
                        </h2>
                      )}
                      
                      {/* Service Title Above Card for other cards */}
                      {idx > 0 && (
                        <h3 className="home-service-card-title">
                          {service.category_name || service.title_ar || service.name || "خدمة"}
                        </h3>
                      )}
                      
                      {/* Service Card */}
                      <div
                        className="home-service-card group"
                        onClick={() => handleServiceClick(service)}
                      >
                      {/* Image Area */}
                      <div className="home-service-card-image-area">
                        <img
                          src={
                            service.image || 
                            (service.images && service.images.length > 0 
                              ? service.images[0].image 
                              : serviceImage)
                          }
                          alt={service.title_ar || service.name || "خدمة"}
                          className="home-service-card-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = serviceImage;
                          }}
                        />
                        {/* Hover overlay with button */}
                        <div className="home-service-card-overlay">
                          <button className="home-service-card-overlay-btn">
                            عرض التفاصيل
                          </button>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="home-service-card-content">
                        {/* Service Description */}
                        <div className="home-service-card-description">
                          <p>{service.title_ar || service.name || "خدمة"}</p>
                          {/* Clinic Name - show for regular services only */}
                          {service.clinic_name && !service.category_id && (
                            <p className="home-service-clinic-name">
                              {service.clinic_name}
                            </p>
                          )}
                        </div>

                        {/* Price/Call Button */}
                        <div className="home-service-card-price">
                          <span className="price" dir="rtl">
                            {!service.price || service.price === "اتصل للسعر" ? (
                              "اتصل للسعر"
                            ) : (
                              <>
                                {service.price}{" "}
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
                                    fill="currentColor"
                                    d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"
                                  ></path>
                                  <path
                                    fill="currentColor"
                                    d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"
                                  ></path>
                                </svg>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Services Indicators - Only visible on mobile for fallback */}
              {Object.keys(SERVICES_BY_CATEGORIES).length === 0 && (
                <div className="home-services-indicators">
                  {(MOST_BOOKING_SERVICES.length > 0 ? MOST_BOOKING_SERVICES : SERVICES).slice(0, 3).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        // Check if we're on mobile (horizontal layout) or desktop (vertical layout)
                        const isMobile = window.innerWidth < 768;
                        
                        if (isMobile) {
                          // Horizontal scrolling for mobile
                          const firstCard = servicesRowRef.current?.querySelector('.home-service-card');
                          if (firstCard) {
                            const cardRect = firstCard.getBoundingClientRect();
                            const cardWidth = cardRect.width;
                            const gap = 12;
                            const scrollAmount = (cardWidth + gap) * index;
                            servicesRowRef.current.scrollLeft = scrollAmount;
                          }
                        } else {
                          // Vertical scrolling for desktop
                          const cards = servicesRowRef.current?.querySelectorAll('.home-service-card');
                          if (cards && cards[index]) {
                            cards[index].scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'center' 
                            });
                          }
                        }
                        setCurrentService(index);
                      }}
                      className={`home-services-indicator ${currentService === index ? "active" : ""}`}
                      aria-label={`الذهاب إلى الخدمة ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Customer Reviews Section */}
      <section className="home-reviews-section">
        <div className="home-reviews-container">
          {/* Section Title */}
          <h2 className="home-reviews-title">آراء العملاء</h2>

          {/* Reviews Carousel */}
          <div ref={reviewsRowRef} className="home-reviews-row">
            {REVIEWS.map((review) => (
              <div
                key={review.id}
                className="home-review-card"
                style={{ backgroundImage: `url(${imImage})` }}
              >
                <div className="home-review-card-content">
                  <div className="home-review-card-text">
                    <p className="home-review-card-comment">{review.comment}</p>
                    <div className="home-review-card-info">
                      <p className="home-review-card-name">{review.userName}</p>
                      <p className="home-review-card-clinic">
                        {review.clinicName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location and Contact Section */}
      <section
        className="relative bg-white z-10 location-section"
        style={{
          marginTop: "0px",
          paddingTop: "80px",
          paddingBottom: "80px",
          minHeight: "60vh",
        }}
        dir="rtl"
      >
        <div
          className="w-full overflow-visible flex justify-center items-center"
          style={{ paddingTop: "0px" }}
        >
          {/* Background Container */}
          <div className="w-11/12 md:w-[98%] max-w-[1200px] bg-[#F9F9F9] rounded-lg p-4 md:px-12 md:py-10 relative mb-8 md:mb-10">
            {/* Section Title */}
            <h2
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:translate-x-2 text-lg md:text-2xl lg:text-[34px] font-extrabold text-right mb-3 md:mb-8 whitespace-nowrap"
              style={{
                color: "#0874BE",
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              موقعنا على الخريطة
            </h2>

            {/* Map and Contact Info */}
            <div className="grid grid-cols-2 gap-3 md:gap-8">
              {/* Contact Information - Left side */}
              <div className="">
                {/* Address */}
                <div
                  className="flex items-start gap-2 md:gap-4 contact-item"
                  style={{ marginBottom: "20px" }}
                >
                  <div
                    className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgb(225, 236, 244)" }}
                  >
                    <FaMapMarkerAlt
                      className="text-xs md:text-sm"
                      style={{ color: "rgb(1, 113, 189)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-sm md:text-lg font-semibold mb-1 md:mb-3"
                      style={{
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        color: "#0874BE",
                      }}
                    >
                      العنوان
                    </h3>
                    <p
                      className="text-xs md:text-base text-gray-600 leading-relaxed md:leading-loose"
                      style={{
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                      }}
                    >
                      {CONTACT_DATA?.address || "الرياض، المملكة العربية السعودية - شارع الملك فهد، حي الملز"}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div
                  className="flex items-start gap-2 md:gap-4 contact-item"
                  style={{ marginBottom: "20px" }}
                >
                  <div
                    className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgb(225, 236, 244)" }}
                  >
                    <FaPhone
                      className="text-xs md:text-sm"
                      style={{ color: "rgb(1, 113, 189)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-sm md:text-lg font-semibold mb-1 md:mb-3"
                      style={{
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        color: "#0874BE",
                      }}
                    >
                      الهاتف
                    </h3>
                    <p
                      className="text-xs md:text-base text-gray-600 leading-relaxed md:leading-loose"
                      style={{
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                      }}
                    >
                      {CONTACT_DATA?.phone || "+966 11 123 4567"}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div
                  className="flex items-start gap-2 md:gap-4 contact-item"
                  style={{ marginBottom: "20px" }}
                >
                  <div
                    className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgb(225, 236, 244)" }}
                  >
                    <FaEnvelope
                      className="text-xs md:text-sm"
                      style={{ color: "rgb(1, 113, 189)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-sm md:text-lg font-semibold mb-1 md:mb-3"
                      style={{
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        color: "#0874BE",
                      }}
                    >
                      البريد الإلكتروني
                    </h3>
                    <p
                      className="text-xs md:text-base text-gray-600 leading-relaxed md:leading-loose break-all"
                      style={{
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                      }}
                    >
                      {CONTACT_DATA?.email || "info@ghaym-medical.com"}
                    </p>
                  </div>
                </div>

                {/* Working Hours */}
                <div
                  className="flex items-start gap-2 md:gap-4 contact-item"
                  style={{ marginBottom: "0px" }}
                >
                  <div
                    className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgb(225, 236, 244)" }}
                  >
                    <FaClock
                      className="text-xs md:text-sm"
                      style={{ color: "rgb(1, 113, 189)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-sm md:text-lg font-semibold mb-1 md:mb-3"
                      style={{
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        color: "#0874BE",
                      }}
                    >
                      ساعات العمل
                    </h3>
                    {formatWorkingHours(CONTACT_DATA?.working_times)}
                  </div>
                </div>
              </div>

              {/* Google Map - Right side */}
              <div
                className="bg-white shadow-xl overflow-hidden"
                style={{ borderRadius: "15px" }}
              >
                <iframe
                  src={CONTACT_DATA?.google_maps_link || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.4!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2ee2c4b8c8c8c9%3A0x3e2ee2c4b8c8c8c9!2sKing%20Fahd%20Rd%2C%20Al%20Malaz%2C%20Riyadh%2012621%2C%20Saudi%20Arabia!5e0!3m2!1sen!2s!4v1704067200000!5m2!1sen!2s"}
                  className="w-full h-80 md:h-96 lg:h-[450px]"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="موقع غيم الطبي - الرياض، شارع الملك فهد، حي الملز"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
