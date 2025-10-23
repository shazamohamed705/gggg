import React from 'react';
import './About.css';

// Import the medical team image
import medicalTeamImage from '../assets/photo/Screenshot 2025-10-10 004324.png';

// Optimized SVG Icons as React Components for better performance
const DoctorsIcon = () => (
  <svg viewBox="0 0 24 24" className="about-feature-icon-svg">
    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9C15 10.1 14.1 11 13 11V16C14.1 16 15 16.9 15 18V20H13V18C13 17.4 12.6 17 12 17S11 17.4 11 18V20H9V18C9 16.9 9.9 16 11 16V11C9.9 11 9 10.1 9 9V7.5L3 7V9C3 10.1 3.9 11 5 11V16C3.9 16 3 16.9 3 18V20H1V18C1 16.3 2.3 15 4 15V11C2.9 11 2 10.1 2 9V7C2 5.9 2.9 5 4 5L10 4.5C10.3 4.2 10.6 4 11 4H13C13.4 4 13.7 4.2 14 4.5L20 5C21.1 5 22 5.9 22 7V9C22 10.1 21.1 11 20 11V15C21.7 15 23 16.3 23 18V20H21V18C21 16.9 20.1 16 19 16V11C20.1 11 21 10.1 21 9Z"/>
  </svg>
);

const TechnologyIcon = () => (
  <svg viewBox="0 0 24 24" className="about-feature-icon-svg">
    <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
  </svg>
);

const SupportIcon = () => (
  <svg viewBox="0 0 24 24" className="about-feature-icon-svg">
    <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
  </svg>
);

const QualityIcon = () => (
  <svg viewBox="0 0 24 24" className="about-feature-icon-svg">
    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16.2V16H7.8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z"/>
  </svg>
);

const About = () => {
  const [aboutData, setAboutData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let isMounted = true;
    const fetchAbout = async () => {
      try {
        const res = await fetch('https://ghaimcenter.com/laravel/api/about');
        const json = await res.json();
        if (res.ok && json?.status === 'success') {
          if (isMounted) setAboutData(json.data);
        } else if (isMounted) {
          setError(json?.message || 'تعذر جلب بيانات صفحة من نحن');
        }
      } catch (e) {
        if (isMounted) setError('تعذر الاتصال بالخادم');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAbout();
    return () => { isMounted = false; };
  }, []);
  // Memoized feature data for performance
  const features = React.useMemo(() => [
    {
      icon: <DoctorsIcon />,
      title: "أطباء معتمدون",
      description: "خبرة دولية في جميع التخصصات الطبية"
    },
    {
      icon: <TechnologyIcon />,
      title: "تقنيات متقدمة",
      description: "أحدث المعدات والتقنيات الطبية"
    },
    {
      icon: <SupportIcon />,
      title: "خدمة على مدار الساعة",
      description: "دعم فني متقدم ورعاية مستمرة"
    },
    {
      icon: <QualityIcon />,
      title: "معايير الجودة",
      description: "سلامة وجودة عالمية معتمدة"
    }
  ], []);

  return (
    <div className="about-page">
      <div className="about-container">
        {/* Section Title */}
        <h1 className="about-title">من نحن</h1>
        
        {/* Main Content */}
        <div className="about-content">
          {/* Image Section */}
          <div className="about-image-container">
            <img 
              src={aboutData?.image || medicalTeamImage} 
              alt="فريق طبي متخصص في مناقشة الحالات الطبية" 
              className="about-image"
              loading="lazy"
            />
          </div>
          
          {/* Text Section */}
          <div className="about-text-section">
            <h2 className="about-main-heading">
              {aboutData?.title_ar || 'نحن نؤمن بأن الصحة حق للجميع'}
            </h2>
            
            {error && (
              <div className="contact-error-message" style={{ marginBottom: '0.75rem' }}>{error}</div>
            )}
            <p className="about-description">
              {aboutData?.about_ar || (
                'مستشفى الشفاء تقدم أفضل رعاية طبية متكاملة مع فريق من الأطباء المتخصصين والاستشاريين ذوي الخبرة العالية.'
              )}
            </p>
            
            {/* Features Grid */}
            <div className="about-features">
              {features.map((feature, index) => (
                <div key={index} className="about-feature">
                  <div className="about-feature-icon">
                    {feature.icon}
                  </div>
                  <div className="about-feature-content">
                    <h3 className="about-feature-title">{feature.title}</h3>
                    <p className="about-feature-description">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Call to Action Buttons */}
        <div className="about-cta">
          <a href="/contact" className="about-btn about-btn-outline">
            تواصل معنا
          </a>
          <a href="/services" className="about-btn about-btn-primary">
            استكشف خدماتنا
          </a>
        </div>
      </div>
    </div>
  );
};

export default React.memo(About);
