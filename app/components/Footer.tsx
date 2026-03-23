import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebook,
  faInstagram,
  faTwitter,
} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  return (
    <footer
      id="contact"
      className="footer-modern scroll-mt-24 mt-5 pb-3 pt-5"
    >
      <div className="cc-container">
        <div className="flex flex-col flex-wrap items-center justify-between gap-6 md:flex-row">
          <div className="w-full text-center md:mb-0 md:w-1/2 md:text-left">
            <span className="footer-brand-modern">CritiComida</span>
            <span className="footer-copy-modern mt-2 block">
              Hecho con{' '}
              <span role="img" aria-label="corazón">
                ❤️
              </span>{' '}
              en Argentina. &copy; {new Date().getFullYear()} CritiComida.
            </span>
          </div>
          <div className="w-full text-center md:w-1/2 md:mt-0 md:text-right">
            <div className="footer-socials-modern inline-flex gap-6">
              <a
                href="mailto:info@criticomida.com"
                className="footer-icon-modern-link"
                aria-label="Email"
              >
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="footer-icon-modern"
                />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-icon-modern-link"
                aria-label="Instagram"
              >
                <FontAwesomeIcon
                  icon={faInstagram}
                  className="footer-icon-modern"
                />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-icon-modern-link"
                aria-label="Facebook"
              >
                <FontAwesomeIcon
                  icon={faFacebook}
                  className="footer-icon-modern"
                />
              </a>
              <a
                href="https://www.twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-icon-modern-link"
                aria-label="Twitter"
              >
                <FontAwesomeIcon
                  icon={faTwitter}
                  className="footer-icon-modern"
                />
              </a>
            </div>
            <div className="footer-cta-modern mt-3">
              <span className="footer-cta-text-modern">
                ¡Seguinos y sumate a la comunidad!
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
