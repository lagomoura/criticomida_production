'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className={
        'wow-navbar glassy-navbar mx-3 mt-3 flex flex-col gap-3 ' +
        'rounded-2xl px-4 py-3 shadow-lg md:flex-row md:flex-wrap ' +
        'md:items-center md:justify-between'
      }
    >
      <div className="flex w-full items-center justify-between md:w-auto md:max-w-none">
        <Link
          href="/"
          className="brand-animate flex items-center gap-2 no-underline"
        >
          <Image
            src="/img/logosm.png"
            alt="CritiComida"
            width={40}
            height={40}
          />
          <span className="brand-text-animate font-bold">CritiComida</span>
        </Link>
        <button
          type="button"
          className={
            'navbar-toggler inline-flex items-center justify-center ' +
            'rounded-md p-2 text-main-pink md:hidden'
          }
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="toggler-icon leading-none">
            <FontAwesomeIcon icon={['fas', 'bars']} />
          </span>
        </button>
      </div>

      <div
        className={
          (menuOpen ? 'flex' : 'hidden') +
          ' w-full flex-col gap-3 md:flex md:w-auto md:flex-1 ' +
          'md:flex-row md:items-center md:justify-center'
        }
      >
        <ul
          className={
            'wow-navlinks m-0 flex list-none flex-col flex-wrap items-center ' +
            'gap-1 p-0 text-center capitalize md:mx-auto md:flex-row ' +
            'md:gap-2 lg:gap-4'
          }
        >
          <li className="py-0.5 md:py-0">
            <Link
              href="/"
              className={
                'navlink-animate flex items-center justify-center gap-1 ' +
                'no-underline'
              }
              onClick={() => setMenuOpen(false)}
            >
              <FontAwesomeIcon icon={['fas', 'home']} /> Inicio
            </Link>
          </li>
          <li className="py-0.5 md:py-0">
            <a
              href="#about"
              className={
                'navlink-animate flex items-center justify-center gap-1 ' +
                'no-underline'
              }
              onClick={() => setMenuOpen(false)}
            >
              <FontAwesomeIcon icon={['fas', 'info-circle']} /> Sobre nosotros
            </a>
          </li>
          <li className="py-0.5 md:py-0">
            <a
              href="#reviews"
              className={
                'navlink-animate flex items-center justify-center gap-1 ' +
                'no-underline'
              }
              onClick={() => setMenuOpen(false)}
            >
              <FontAwesomeIcon icon={['fas', 'star']} /> Reseñas
            </a>
          </li>
          <li className="py-0.5 md:py-0">
            <a
              href="#services"
              className={
                'navlink-animate flex items-center justify-center gap-1 ' +
                'no-underline'
              }
              onClick={() => setMenuOpen(false)}
            >
              <FontAwesomeIcon icon={['fas', 'concierge-bell']} /> Servicios
            </a>
          </li>
          <li className="py-0.5 md:py-0">
            <a
              href="#contact"
              className={
                'navlink-animate flex items-center justify-center gap-1 ' +
                'no-underline'
              }
              onClick={() => setMenuOpen(false)}
            >
              <FontAwesomeIcon icon={['fas', 'envelope']} /> Contacto
            </a>
          </li>
        </ul>
        <div
          className={
            'info-items hidden flex-col items-center gap-2 lg:flex ' +
            'lg:flex-row lg:gap-3'
          }
        >
          <div
            className={
              'nav-info flex items-center justify-between gap-2 lg:mx-5'
            }
          >
            <span className="info-icon text-main-pink lg:mx-3">
              <FontAwesomeIcon icon={['fas', 'envelope']} />
            </span>
            <p className="m-0 text-sm text-neutral-800">info@criticomida.com</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
