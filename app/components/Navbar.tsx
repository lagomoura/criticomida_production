"use client";
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar navbar-expand-md px-4 wow-navbar glassy-navbar shadow-lg">
      {/* logo */}
      <Link href="/" className="navbar-brand d-flex align-items-center gap-2 brand-animate">
        <Image src="/img/logosm.png" alt="CritiComida" width={40} height={40} />
        <span className="fw-bold brand-text-animate">CritiComida</span>
      </Link>
      <button
        className="navbar-toggler ms-auto"
        type="button"
        aria-label="Abrir menú"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="toggler-icon">
          <FontAwesomeIcon icon={["fas", "bars"]} />
        </span>
      </button>
      <div className={`collapse navbar-collapse${menuOpen ? ' show' : ''}`}>
        <ul className="navbar-nav text-capitalize mx-auto wow-navlinks">
          <li className="nav-item active">
            <Link href="/" className="nav-link d-flex align-items-center gap-1 navlink-animate" onClick={() => setMenuOpen(false)}>
              <FontAwesomeIcon icon={["fas", "home"]} /> Inicio
            </Link>
          </li>
          <li className="nav-item">
            <a href="#about" className="nav-link d-flex align-items-center gap-1 navlink-animate" onClick={() => setMenuOpen(false)}>
              <FontAwesomeIcon icon={["fas", "info-circle"]} /> Sobre nosotros
            </a>
          </li>
          <li className="nav-item">
            <a href="#reviews" className="nav-link d-flex align-items-center gap-1 navlink-animate" onClick={() => setMenuOpen(false)}>
              <FontAwesomeIcon icon={["fas", "star"]} /> Reseñas
            </a>
          </li>
          <li className="nav-item">
            <a href="#services" className="nav-link d-flex align-items-center gap-1 navlink-animate" onClick={() => setMenuOpen(false)}>
              <FontAwesomeIcon icon={["fas", "concierge-bell"]} /> Servicios
            </a>
          </li>
          <li className="nav-item">
            <a href="#contact" className="nav-link d-flex align-items-center gap-1 navlink-animate" onClick={() => setMenuOpen(false)}>
              <FontAwesomeIcon icon={["fas", "envelope"]} /> Contacto
            </a>
          </li>
        </ul>
        <div className="d-flex align-items-center gap-3 flex-column flex-md-row mt-3 mt-md-0">
          <div className="info-items d-none d-lg-flex">
            <div className="nav-info align-items-center d-flex justify-content-between mx-lg-5">
              <span className="info-icon mx-lg-3">
                <FontAwesomeIcon icon={["fas", "envelope"]} />
              </span>
              <p className="mb-0">info@criticomida.com</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 