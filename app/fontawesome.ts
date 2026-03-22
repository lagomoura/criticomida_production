// app/fontawesome.ts
import { config, library } from '@fortawesome/fontawesome-svg-core';
import {
  faBars,
  faConciergeBell,
  faEnvelope,
  faHome,
  faInfoCircle,
  faRightFromBracket,
  faRightToBracket,
  faStar,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Ensure FontAwesome CSS is loaded

config.autoAddCss = false; // Prevent FontAwesome from adding its CSS automatically

library.add(
  faBars,
  faConciergeBell,
  faEnvelope,
  faFacebook,
  faHome,
  faInfoCircle,
  faInstagram,
  faRightFromBracket,
  faRightToBracket,
  faStar,
  faTwitter,
  faXmark,
);