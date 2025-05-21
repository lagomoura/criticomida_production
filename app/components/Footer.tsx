import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Footer() {
  return (
    <footer className="footer-modern pt-5 pb-3 mt-5">
      <div className="container">
        <div className="row align-items-center justify-content-between flex-wrap">
          <div className="col-12 col-md-6 text-center text-md-start mb-3 mb-md-0">
            <span className="footer-brand-modern">CritiComida</span>
            <span className="footer-copy-modern d-block mt-2">Hecho con <span role="img" aria-label="corazón">❤️</span> en Argentina. &copy; {new Date().getFullYear()} CritiComida.</span>
          </div>
          <div className="col-12 col-md-6 text-center text-md-end mt-2 mt-md-0">
            <div className="footer-socials-modern d-inline-flex gap-4">
              <a href="mailto:info@criticomida.com" className="footer-icon-modern-link" aria-label="Email">
                <FontAwesomeIcon icon={["fas", "envelope"]} className="footer-icon-modern" />
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener" className="footer-icon-modern-link" aria-label="Instagram">
                <FontAwesomeIcon icon={["fab", "instagram"]} className="footer-icon-modern" />
              </a>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener" className="footer-icon-modern-link" aria-label="Facebook">
                <FontAwesomeIcon icon={["fab", "facebook"]} className="footer-icon-modern" />
              </a>
              <a href="https://www.twitter.com/" target="_blank" rel="noopener" className="footer-icon-modern-link" aria-label="Twitter">
                <FontAwesomeIcon icon={["fab", "twitter"]} className="footer-icon-modern" />
              </a>
            </div>
            <div className="footer-cta-modern mt-3">
              <span className="footer-cta-text-modern">¡Seguinos y sumate a la comunidad!</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 