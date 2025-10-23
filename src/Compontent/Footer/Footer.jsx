import React, { useState, useEffect } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaSnapchatGhost,
  FaTwitter,
  FaTiktok,
  FaInstagram,
} from "react-icons/fa";

import mastercard from "../../assets/photo/amex.webp";
import visa from "../../assets/photo/apple.svg";
import mada from "../../assets/photo/bankTransfer.png";
import applepay from "../../assets/photo/mada-.webp";
import american from "../../assets/photo/mastercard.png";
import tabby from "../../assets/photo/tabby2-6Dmfb9v8.svg";
import bank from "../../assets/photo/visa.png";
import tamara from "../../assets/photo/tamara2.svg";
import { fetchContactData } from "../../utils/apis/fetchHomePageData";
import "./Footer.css";

export default function Footer() {
  // Contact data from API
  const [CONTACT_DATA, setCONTACT_DATA] = useState(null);
  const [SOCIAL_MEDIA, setSOCIAL_MEDIA] = useState(null);

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
        console.error("Error fetching contact data in footer:", error);
        // Set fallback data
        setCONTACT_DATA({
          email: "info@ghaym-medical.com",
          phone: "+966 11 123 4567",
        });
        setSOCIAL_MEDIA({
          twitter: "https://twitter.com",
          instagram: "https://instagram.com",
          tiktok: "https://tiktok.com",
          snapchat: "https://snapchat.com",
        });
      }
    };
    
    fetchContactDataApi();
  }, []);

  const paymentMethods = [
    { img: mastercard, alt: "mastercard" },
    { img: visa, alt: "visa" },
    { img: mada, alt: "mada" },
    { img: applepay, alt: "apple" },
    { img: bank, alt: "bankTransfer" },
    { img: tabby, alt: "tabby2" },
    { img: american, alt: "amex" },
    { img: tamara, alt: "tamara" },
  ];

  return (
    <footer className="footer" dir="rtl">
      <div className="footer-container">
        {/* 🟦 تواصل معنا */}
        <div className="footer-section">
          <h3 className="footer-title">تواصل معنا</h3>
          <div className="footer-icons" dir="ltr">
            {CONTACT_DATA?.phone && (
              <a 
                href={`tel:${CONTACT_DATA.phone}`} 
                className="footer-icon-box"
                aria-label="الهاتف"
              >
                <FaPhone />
              </a>
            )}
            {CONTACT_DATA?.email && (
              <a 
                href={`mailto:${CONTACT_DATA.email}`} 
                className="footer-icon-box"
                aria-label="البريد الإلكتروني"
              >
                <FaEnvelope />
              </a>
            )}
            <div className="footer-icon-box"><FaGlobe /></div>
            {SOCIAL_MEDIA?.snapchat && (
              <a 
                href={SOCIAL_MEDIA.snapchat} 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-icon-box"
                aria-label="Snapchat"
              >
                <FaSnapchatGhost />
              </a>
            )}
            {SOCIAL_MEDIA?.twitter && (
              <a 
                href={SOCIAL_MEDIA.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-icon-box"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
            )}
            {SOCIAL_MEDIA?.tiktok && (
              <a 
                href={SOCIAL_MEDIA.tiktok} 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-icon-box"
                aria-label="TikTok"
              >
                <FaTiktok />
              </a>
            )}
            {SOCIAL_MEDIA?.instagram && (
              <a 
                href={SOCIAL_MEDIA.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-icon-box"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            )}
          </div>

        </div>

        {/* 🟧 روابط مهمة */}
        <div className="footer-section">
          <h3 className="footer-title">روابط مهمة</h3>
          <ul className="footer-links">
            <li>- سياسة الخصوصية</li>
            <li>- تواصل معنا</li>
            <li>- خريطة الموقع</li>
            <li>- حجز مواعيد</li>
          </ul>
        </div>

        {/* 🟩 وسائل الدفع */}
        <div className="footer-section">
          <h3 className="footer-title">وسائل الدفع</h3>
          <div className="payment-grid" dir="ltr">
            {paymentMethods.map((item, index) => (
              <div key={index} className="payment-card">
                <img src={item.img} alt={item.alt} className="payment-img" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
