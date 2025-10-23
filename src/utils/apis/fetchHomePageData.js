export const fetchHomePageData = async () => {
  try {
    // Fetch banners from the new API endpoint
    const bannersResponse = await fetch(
      "https://ghaimcenter.com/laravel/api/banners",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!bannersResponse.ok) {
      throw new Error(`HTTP error! status: ${bannersResponse.status}`);
    }
    
    const bannersData = await bannersResponse.json();
    
    // Fetch other home page data from the original endpoint
    const homeResponse = await fetch(
      "https://ghaimcenter.com/laravel/api/fetchHomePageData",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    let homeData = {
      banners: [],
      clinics: [],
      services: [],
      reviews: []
    };
    
    if (homeResponse.ok) {
      const homeResponseData = await homeResponse.json();
      homeData = homeResponseData.data || homeData;
    }
    
    // Merge banners from the new API with other data
    return {
      status: "success",
      data: {
        ...homeData,
        banners: bannersData.data || []
      }
    };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    // Return fallback data structure
    return {
      status: "success",
      data: {
        banners: [],
        clinics: [],
        services: [],
        reviews: []
      }
    };
  }
};

// Fetch banners from the dedicated banners API
export const fetchBanners = async () => {
  try {
    const response = await fetch(
      "https://ghaimcenter.com/laravel/api/banners",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return {
      status: false,
      message: "Failed to fetch banners",
      data: []
    };
  }
};

// Fetch contact data including social media links and contact information
export const fetchContactData = async () => {
  try {
    const response = await fetch(
      "https://ghaimcenter.com/laravel/api/contact-data",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching contact data:", error);
    // Return fallback data structure
    return {
      status: "error",
      data: [
        {
          id: 1,
          prefix: "contact_data",
          data: {
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
          }
        },
        {
          id: 2,
          prefix: "social_media",
          data: {
            facebook: "https://facebook.com",
            twitter: "https://twitter.com",
            instagram: "https://instagram.com",
            linkedin: "https://linkedin.com",
            tiktok: "https://tiktok.com",
            youtube: "https://youtube.com",
            snapchat: "https://snapchat.com",
            x: "https://x.com"
          }
        }
      ]
    };
  }
};