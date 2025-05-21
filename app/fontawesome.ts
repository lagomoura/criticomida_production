// app/fontawesome.ts
import { config, library } from '@fortawesome/fontawesome-svg-core';
import { faEnvelope, faBars, faHome, faInfoCircle, faStar, faConciergeBell } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Ensure FontAwesome CSS is loaded

config.autoAddCss = false; // Prevent FontAwesome from adding its CSS automatically

library.add(faEnvelope, faBars, faHome, faInfoCircle, faStar, faConciergeBell, faFacebook, faTwitter, faInstagram);