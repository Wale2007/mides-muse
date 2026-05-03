import { FaWhatsapp, FaInstagram, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="logo-mides">Mide's</span>
            <span className="logo-muse">MUSE</span>
          </Link>
          <p className="footer-tagline">
            Curated jewelry & accessories for the elegant woman.
          </p>
        </div>

        <div className="footer-links-section">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop All</Link>
          <Link to="/shop?category=Necklaces">Necklaces</Link>
          <Link to="/shop?category=Earrings">Earrings</Link>
        </div>

        <div className="footer-section">
          <h4>Shop</h4>
          <Link to="/shop?category=Necklaces">Necklaces/Chain</Link>
          <Link to="/shop?category=Earrings">Earrings</Link>
          <Link to="/shop?category=Bracelets">Bracelets</Link>
          <Link to="/shop?category=Rings">Rings</Link>
        </div>

        <div className="footer-links-section">
          <h4>Connect</h4>
          <a
            href="https://wa.me/2348063221557"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-link"
          >
            <FaWhatsapp /> WhatsApp
          </a>
          <a
            href="https://wa.me/2348063221557"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-link"
          >
            <FaInstagram /> Instagram
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Mide's MUSE. Made with{' '}
          <FaHeart className="heart-icon" /> All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
