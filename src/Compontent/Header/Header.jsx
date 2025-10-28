import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HeaderMobile.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategoriesInNavbar, setShowCategoriesInNavbar] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [homePageSettings, setHomePageSettings] = useState({
    categories_in_navbar: 0,
    hero_title_ar: "مجمع غيم الطبي"
  });
  const navigate = useNavigate();

  // Toggle menu - memoized with useCallback
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  // Close menu - memoized with useCallback
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('userToken');
      const user = localStorage.getItem('user');
      setIsLoggedIn(!!(token || user));
    };

    checkLoginStatus();
    
    // Listen for storage changes (in case user logs in/out in another tab)
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  // Fetch home page settings from API
  useEffect(() => {
    const fetchHomePageSettings = async () => {
      try {
        const response = await fetch("https://ghaimcenter.com/laravel/api/home-page-settings");
        const result = await response.json();
        
        if (result.status === true && result.data) {
          setHomePageSettings(prevSettings => ({
            ...prevSettings,
            ...result.data
          }));
          console.log("✅ Home page settings loaded in header:", result.data);
        }
      } catch (error) {
        console.error("Error fetching home page settings:", error);
      }
    };
    
    fetchHomePageSettings();
  }, []);

   // Fetch categories for navbar from API (clinics/categories)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        
        // إضافة timeout للاستجابة
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 ثانية timeout
        
        const response = await fetch(
          "https://ghaimcenter.com/laravel/api/clinics/categories",
          {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === "success" && Array.isArray(result.data)) {
          const categoriesArray = result.data;

          // Filter categories to show in navbar only when show_in_navbar === 1 and not deleted
          const navbarCategories = categoriesArray
            .filter((cat) => Number(cat.show_in_navbar) === 1 && Number(cat.is_deleted) === 0)
            .map((cat) => ({
              id: cat.id,
              name: cat.title_ar || cat.title,
              title_ar: cat.title_ar,
              title_en: cat.title_en,
              icon: cat.icon ? `https://ghaimcenter.com/laravel/storage/app/public/${cat.icon}` : undefined
            }));

          if (navbarCategories.length > 0) {
            setShowCategoriesInNavbar(true);
            setCategories(navbarCategories);
          } else {
            setShowCategoriesInNavbar(false);
            setCategories([]);
          }
        } else {
          setShowCategoriesInNavbar(false);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setShowCategoriesInNavbar(false);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [homePageSettings]);

  // Handle category click
  const handleCategoryClick = useCallback((categoryId) => {
    console.log("Category clicked:", categoryId);
    navigate(`/services?category_id=${categoryId}`);
  }, [navigate]);


  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
    window.location.reload();
  }, [navigate]);

  // Handle scroll effect for desktop only - optimized with requestAnimationFrame
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;
          setIsScrolled(scrollPosition > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Only add scroll listener on desktop
    if (window.innerWidth > 768) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('ghym-main-menu-open-body');
    } else {
      document.body.classList.remove('ghym-main-menu-open-body');
    }

    return () => {
      document.body.classList.remove('ghym-main-menu-open-body');
    };
  }, [isMenuOpen]);

  // Memoize header className to avoid unnecessary re-renders
  const headerClassName = useMemo(() => 
    `ghym-main-header-wrapper bg-white w-full shadow-sm transition-all duration-300 ${isScrolled ? 'ghym-main-header-scrolled' : ''}`,
    [isScrolled]
  );

  // Debug render
  console.log("🔍 Header render - showCategoriesInNavbar:", showCategoriesInNavbar, "categories:", categories);

  return (
    <>
      <header className={headerClassName}> 
        <div className="ghym-main-header-container w-full px-6 py-4 pb-8 md:py-3 md:pb-8" style={{ paddingTop: '20px' }}>
          {/* Mobile Hamburger - Left Side */}
          <button
            onClick={toggleMenu}
            className="ghym-main-mobile-hamburger"
            aria-label="Toggle Menu"
          >
            <span className={`ghym-main-hamburger-bar ${isMenuOpen ? 'ghym-main-bar-active-1' : ''}`}></span>
            <span className={`ghym-main-hamburger-bar ${isMenuOpen ? 'ghym-main-bar-active-2' : ''}`}></span>
            <span className={`ghym-main-hamburger-bar ${isMenuOpen ? 'ghym-main-bar-active-3' : ''}`}></span>
          </button>
        
        {/* Navigation Links with Logo and Login Buttons - All in same line */}
        <nav className="ghym-main-navigation arabic" style={{ paddingRight: '15px', paddingBottom: '8px' }}>
          <div className="ghym-main-nav-container flex justify-between items-center gap-4">
            {/* Logo and Navigation Links - Left side */}
            <div className="flex items-center gap-4" style={{ marginLeft: '80px' }}>
              {/* Logo beside navigation links */}
              <Link to="/" className="ghym-main-logo-link flex items-center">
                <img 
                  src="/logoo.png" 
                  alt="مجمع غيم الطبي" 
                  className="ghym-main-logo-img"
                  loading="eager"
                  decoding="async"
                />
              </Link>
              
              {/* Navigation Links */}
              <Link to="/" className="ghym-main-nav-item">الصفحة الرئيسية</Link>
              
              {/* Categories - Only show if enabled and available - Right after home page */}
              {isLoadingCategories && (
                <span className="ghym-main-nav-item" style={{ color: '#999', fontSize: '14px' }}>
                  جاري التحميل...
                </span>
              )}
              {!isLoadingCategories && showCategoriesInNavbar && categories.length > 0 && categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="ghym-main-nav-item"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0874BE',
                    font: 'inherit',
                    cursor: 'pointer',
                    padding: '0',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '16px',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = 'rgb(1, 113, 189)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = '#0874BE';
                  }}
                >
                  {category.name}
                </button>
              ))}
              
              <Link to="/services" className="ghym-main-nav-item">جميع الخدمات</Link>
              <Link to="/book" className="ghym-main-nav-item">حجز موعد</Link>
              <Link to="/about" className="ghym-main-nav-item">من نحن</Link>
              <Link to="/blogs" className="ghym-main-nav-item">المدونة</Link>
              <Link to="/contact" className="ghym-main-nav-item">تواصل معنا</Link>
            </div>
            
            {/* Login/Dashboard Buttons - Right side */}
            {isLoggedIn ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '30px' }}>
                <Link 
                  to="/dashboard" 
                  className="arabic ghym-main-login-button"
                  style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: 'rgb(1, 113, 189)', 
                    backgroundColor: 'rgb(255, 255, 255)', 
                    padding: '0.5rem 1.5rem', 
                    borderRadius: '8px', 
                    transition: 'all 0.3s ease', 
                    textDecoration: 'none', 
                    border: '2px solid rgb(1, 113, 189)', 
                    transform: 'translateY(0px)', 
                    boxShadow: 'none',
                    display: 'inline-block',
                    cursor: 'pointer'
                  }}
                >
                  لوحة التحكم
                </Link>
                <button
                  onClick={handleLogout}
                  title="تسجيل الخروج"
                  className="arabic ghym-main-login-button"
                  style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: 'rgb(1, 113, 189)', 
                    backgroundColor: 'white', 
                    padding: '0.6rem', 
                    borderRadius: '8px', 
                    transition: 'all 0.3s ease', 
                    textDecoration: 'none', 
                    border: '2px solid rgb(1, 113, 189)', 
                    transform: 'translateY(0px)', 
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    width: '45px',
                    height: '45px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgb(1, 113, 189)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = 'rgb(1, 113, 189)';
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </div>
            ) : (
              <Link 
                to="/auth/login" 
                className="arabic ghym-main-login-button"
                style={{ 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  color: 'rgb(1, 113, 189)', 
                  backgroundColor: 'rgb(255, 255, 255)', 
                  padding: '0.5rem 1.5rem', 
                  borderRadius: '8px', 
                  transition: 'all 0.3s ease', 
                  textDecoration: 'none', 
                  border: '2px solid rgb(1, 113, 189)', 
                  transform: 'translateY(0px)', 
                  boxShadow: 'none',
                  display: 'inline-block',
                  cursor: 'pointer',
                  marginLeft: '30px'
                }}
              >
                تسجيل دخول
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>

    {/* Mobile Menu - Only render when open */}
    {isMenuOpen && (
      <>
        {/* Mobile Menu Overlay */}
        <div 
          className="ghym-main-menu-backdrop ghym-main-backdrop-show"
          onClick={closeMenu}
        ></div>

        {/* Mobile Menu Panel */}
        <div className="ghym-main-menu-panel ghym-main-panel-open">
          <div className="ghym-main-menu-inner">
        {/* Menu Header */}
        <div className="ghym-main-menu-header">
          <div className="ghym-main-menu-header-flex">
            <h2 className="ghym-main-menu-heading arabic">القائمة الرئيسية</h2>
            <button 
              onClick={closeMenu}
              className="ghym-main-menu-close-button"
              aria-label="Close Menu"
            >
              <svg className="ghym-main-close-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Links */}
        <nav className="ghym-main-menu-navigation arabic">
          <div className="ghym-main-menu-links">
            <Link to="/" onClick={closeMenu} className="ghym-main-menu-link">
              <svg className="ghym-main-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="ghym-main-menu-text">الصفحة الرئيسية</span>
            </Link>

            <Link to="/services" onClick={closeMenu} className="ghym-main-menu-link">
              <svg className="ghym-main-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="ghym-main-menu-text">جميع الخدمات</span>
            </Link>

            <Link to="/book" onClick={closeMenu} className="ghym-main-menu-link">
              <svg className="ghym-main-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="ghym-main-menu-text">حجز موعد</span>
            </Link>

            <Link to="/about" onClick={closeMenu} className="ghym-main-menu-link">
              <svg className="ghym-main-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="ghym-main-menu-text">من نحن</span>
            </Link>

            <Link to="/blogs" onClick={closeMenu} className="ghym-main-menu-link">
              <svg className="ghym-main-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20l9-5-9-5-9 5 9 5z" />
              </svg>
              <span className="ghym-main-menu-text">المدونة</span>
            </Link>

            <Link to="/contact" onClick={closeMenu} className="ghym-main-menu-link">
              <svg className="ghym-main-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="ghym-main-menu-text">تواصل معنا</span>
            </Link>
          </div>
        </nav>

            {/* Menu Footer - Login/Dashboard/Logout Buttons */}
            <div className="ghym-main-menu-footer">
              {isLoggedIn ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link to="/dashboard" onClick={closeMenu} className="ghym-main-menu-login-link arabic">
                    لوحة التحكم
                  </Link>
                  <button 
                    onClick={() => { closeMenu(); handleLogout(); }} 
                    className="ghym-main-menu-login-link arabic"
                    style={{ 
                      backgroundColor: 'white',
                      color: 'rgb(1, 113, 189)',
                      border: '2px solid rgb(1, 113, 189)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    تسجيل خروج
                  </button>
                </div>
              ) : (
                <Link to="/auth/login" onClick={closeMenu} className="ghym-main-menu-login-link arabic">
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        </div>
      </>
    )}
    </>
  );
};

export default Header;
