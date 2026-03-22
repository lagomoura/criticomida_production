'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormEvent, useState } from 'react';
import { useAuthContext } from '../lib/contexts/AuthContext';
import { ApiError } from '../lib/api/client';

export default function Navbar() {
  const { user, isLoading, login, logout } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openLoginModal = () => {
    setFormError(null);
    setLoginOpen(true);
  };

  const closeLoginModal = () => {
    if (!submitting) {
      setLoginOpen(false);
      setFormError(null);
    }
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      setPassword('');
      setLoginOpen(false);
      setMenuOpen(false);
    } catch (error) {
      if (error instanceof ApiError) {
        const { detail } = error;
        setFormError(
          typeof detail === 'string' ? detail : 'No se pudo iniciar sesión.',
        );
      } else {
        setFormError('No se pudo iniciar sesión.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  return (
    <>
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
              'flex flex-col items-center gap-2 md:ml-auto md:flex-row ' +
              'md:gap-3'
            }
          >
            {isLoading ? (
              <div
                className="h-9 w-28 max-w-full rounded-lg bg-neutral-200/80 animate-pulse"
                aria-hidden
              />
            ) : user ? (
              <div className="flex flex-col items-center gap-2 md:flex-row md:gap-2">
                <span className="max-w-[12rem] truncate text-sm text-neutral-800">
                  {user.display_name || user.email}
                </span>
                <button
                  type="button"
                  className={
                    'navlink-animate rounded-lg border border-main-pink/40 ' +
                    'px-3 py-1.5 text-sm text-main-pink no-underline ' +
                    'hover:bg-main-pink/10'
                  }
                  onClick={() => void handleLogout()}
                >
                  <FontAwesomeIcon icon={['fas', 'right-from-bracket']} />{' '}
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={
                  'navlink-animate flex items-center justify-center gap-1 ' +
                  'rounded-lg border border-main-pink/40 px-3 py-1.5 ' +
                  'text-sm text-main-pink hover:bg-main-pink/10'
                }
                onClick={openLoginModal}
              >
                <FontAwesomeIcon icon={['fas', 'right-to-bracket']} /> Iniciar
                sesión
              </button>
            )}

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
                <p className="m-0 text-sm text-neutral-800">
                  info@criticomida.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {loginOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="Cerrar"
            onClick={closeLoginModal}
          />
          <div
            className={
              'relative z-10 w-full max-w-md rounded-2xl border ' +
              'border-neutral-200 bg-white p-6 shadow-xl'
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-modal-title"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2
                id="login-modal-title"
                className="m-0 text-lg font-bold text-neutral-900"
              >
                Iniciar sesión
              </h2>
              <button
                type="button"
                className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100"
                aria-label="Cerrar"
                onClick={closeLoginModal}
                disabled={submitting}
              >
                <FontAwesomeIcon icon={['fas', 'xmark']} />
              </button>
            </div>
            <form className="flex flex-col gap-4" onSubmit={handleLoginSubmit}>
              <div className="flex flex-col gap-1">
                <label htmlFor="login-email" className="text-sm text-neutral-700">
                  Correo
                </label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={
                    'rounded-lg border border-neutral-300 px-3 py-2 text-sm ' +
                    'text-neutral-900 outline-none focus:border-main-pink ' +
                    'focus:ring-1 focus:ring-main-pink'
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="login-password"
                  className="text-sm text-neutral-700"
                >
                  Contraseña
                </label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={
                    'rounded-lg border border-neutral-300 px-3 py-2 text-sm ' +
                    'text-neutral-900 outline-none focus:border-main-pink ' +
                    'focus:ring-1 focus:ring-main-pink'
                  }
                />
              </div>
              {formError ? (
                <p className="m-0 text-sm text-red-600" role="alert">
                  {formError}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className={
                  'rounded-xl bg-main-pink px-4 py-2.5 text-sm font-semibold ' +
                  'text-white shadow-md hover:opacity-90 disabled:opacity-50'
                }
              >
                {submitting ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
