'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faBellConcierge,
  faCircleInfo,
  faEnvelope,
  faHouse,
  faRightFromBracket,
  faRightToBracket,
  faStar,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAuthContext } from '../lib/contexts/AuthContext';
import { ApiError } from '../lib/api/client';

type AuthTab = 'login' | 'register';

export default function Navbar() {
  const { user, isLoading, login, logout, register } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const loginOpenButtonRef = useRef<HTMLButtonElement>(null);
  const loginEmailInputRef = useRef<HTMLInputElement>(null);

  const closeLoginModal = useCallback(() => {
    if (!submitting) {
      setLoginOpen(false);
      setFormError(null);
    }
  }, [submitting]);

  const openLoginModal = useCallback(() => {
    setFormError(null);
    setActiveTab('login');
    setLoginOpen(true);
  }, []);

  useEffect(() => {
    if (!loginOpen) {
      return;
    }
    const triggerElement = loginOpenButtonRef.current;
    const focusEmailId = window.setTimeout(() => {
      loginEmailInputRef.current?.focus();
    }, 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!submitting) {
          setLoginOpen(false);
          setFormError(null);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(focusEmailId);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerElement?.focus();
    };
  }, [loginOpen, submitting]);

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

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await register(regEmail.trim(), regPassword, regDisplayName.trim());
      setRegPassword('');
      setLoginOpen(false);
      setMenuOpen(false);
    } catch (error) {
      if (error instanceof ApiError) {
        const { detail } = error;
        setFormError(
          typeof detail === 'string' ? detail : 'No se pudo registrar la cuenta.',
        );
      } else {
        setFormError('No se pudo registrar la cuenta.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    setFormError(null);
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
              'rounded-md p-2 text-main-pink md:hidden ' +
              'focus-visible:outline-none focus-visible:ring-2 ' +
              'focus-visible:ring-main-pink focus-visible:ring-offset-2'
            }
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="toggler-icon leading-none" aria-hidden>
              <FontAwesomeIcon icon={faBars} />
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
                <FontAwesomeIcon icon={faHouse} aria-hidden />{' '}
                Inicio
              </Link>
            </li>
            <li className="py-0.5 md:py-0">
              <Link
                href="/#about"
                className={
                  'navlink-animate flex items-center justify-center gap-1 ' +
                  'no-underline'
                }
                onClick={() => setMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faCircleInfo} aria-hidden />{' '}
                Sobre nosotros
              </Link>
            </li>
            <li className="py-0.5 md:py-0">
              <Link
                href="/#reviews"
                className={
                  'navlink-animate flex items-center justify-center gap-1 ' +
                  'no-underline'
                }
                onClick={() => setMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faStar} aria-hidden /> Reseñas
              </Link>
            </li>
            <li className="py-0.5 md:py-0">
              <Link
                href="/#services"
                className={
                  'navlink-animate flex items-center justify-center gap-1 ' +
                  'no-underline'
                }
                onClick={() => setMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faBellConcierge} aria-hidden />{' '}
                Servicios
              </Link>
            </li>
            <li className="py-0.5 md:py-0">
              <Link
                href="/#contact"
                className={
                  'navlink-animate flex items-center justify-center gap-1 ' +
                  'no-underline'
                }
                onClick={() => setMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faEnvelope} aria-hidden />{' '}
                Contacto
              </Link>
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
                  <FontAwesomeIcon icon={faRightFromBracket} aria-hidden />{' '}
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                ref={loginOpenButtonRef}
                type="button"
                className={
                  'navlink-animate flex items-center justify-center gap-1 ' +
                  'rounded-lg border border-main-pink/40 px-3 py-1.5 ' +
                  'text-sm text-main-pink hover:bg-main-pink/10 ' +
                  'focus-visible:outline-none focus-visible:ring-2 ' +
                  'focus-visible:ring-main-pink focus-visible:ring-offset-2'
                }
                onClick={openLoginModal}
              >
                <FontAwesomeIcon icon={faRightToBracket} aria-hidden />{' '}
                Iniciar sesión
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
                <span className="info-icon text-main-pink lg:mx-3" aria-hidden>
                  <FontAwesomeIcon icon={faEnvelope} />
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
              'relative z-10 w-full max-w-md overscroll-contain ' +
              'rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl'
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2
                id="auth-modal-title"
                className="m-0 text-lg font-bold text-neutral-900"
              >
                {activeTab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </h2>
              <button
                type="button"
                className={
                  'rounded-md p-2 text-neutral-500 hover:bg-neutral-100 ' +
                  'focus-visible:outline-none focus-visible:ring-2 ' +
                  'focus-visible:ring-main-pink focus-visible:ring-offset-2 ' +
                  'disabled:opacity-50'
                }
                aria-label="Cerrar"
                onClick={closeLoginModal}
                disabled={submitting}
              >
                <FontAwesomeIcon icon={faXmark} aria-hidden />
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex gap-1 rounded-lg bg-neutral-100 p-1">
              <button
                type="button"
                className={
                  'flex-1 rounded-md py-1.5 text-sm font-semibold transition-colors ' +
                  (activeTab === 'login'
                    ? 'bg-white text-main-pink shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700')
                }
                onClick={() => handleTabChange('login')}
                disabled={submitting}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                className={
                  'flex-1 rounded-md py-1.5 text-sm font-semibold transition-colors ' +
                  (activeTab === 'register'
                    ? 'bg-white text-main-pink shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700')
                }
                onClick={() => handleTabChange('register')}
                disabled={submitting}
              >
                Registrarse
              </button>
            </div>

            {activeTab === 'login' ? (
              <form className="flex flex-col gap-4" onSubmit={handleLoginSubmit}>
                <div className="flex flex-col gap-1">
                  <label htmlFor="login-email" className="text-sm text-neutral-700">
                    Correo
                  </label>
                  <input
                    ref={loginEmailInputRef}
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    spellCheck={false}
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={
                      'rounded-lg border border-neutral-300 px-3 py-2 text-sm ' +
                      'text-neutral-900 outline-none focus:border-main-pink ' +
                      'focus-visible:ring-2 focus-visible:ring-main-pink'
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
                    spellCheck={false}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={
                      'rounded-lg border border-neutral-300 px-3 py-2 text-sm ' +
                      'text-neutral-900 outline-none focus:border-main-pink ' +
                      'focus-visible:ring-2 focus-visible:ring-main-pink'
                    }
                  />
                </div>
                {formError ? (
                  <p
                    className="m-0 text-sm text-red-600"
                    role="status"
                    aria-live="polite"
                  >
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
            ) : (
              <form className="flex flex-col gap-4" onSubmit={handleRegisterSubmit}>
                <div className="flex flex-col gap-1">
                  <label htmlFor="reg-name" className="text-sm text-neutral-700">
                    Nombre de usuario
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    name="displayName"
                    autoComplete="name"
                    spellCheck={false}
                    required
                    value={regDisplayName}
                    onChange={(event) => setRegDisplayName(event.target.value)}
                    className={
                      'rounded-lg border border-neutral-300 px-3 py-2 text-sm ' +
                      'text-neutral-900 outline-none focus:border-main-pink ' +
                      'focus-visible:ring-2 focus-visible:ring-main-pink'
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="reg-email" className="text-sm text-neutral-700">
                    Correo
                  </label>
                  <input
                    ref={activeTab === 'register' ? loginEmailInputRef : undefined}
                    id="reg-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    spellCheck={false}
                    required
                    value={regEmail}
                    onChange={(event) => setRegEmail(event.target.value)}
                    className={
                      'rounded-lg border border-neutral-300 px-3 py-2 text-sm ' +
                      'text-neutral-900 outline-none focus:border-main-pink ' +
                      'focus-visible:ring-2 focus-visible:ring-main-pink'
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="reg-password"
                    className="text-sm text-neutral-700"
                  >
                    Contraseña
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    spellCheck={false}
                    required
                    value={regPassword}
                    onChange={(event) => setRegPassword(event.target.value)}
                    className={
                      'rounded-lg border border-neutral-300 px-3 py-2 text-sm ' +
                      'text-neutral-900 outline-none focus:border-main-pink ' +
                      'focus-visible:ring-2 focus-visible:ring-main-pink'
                    }
                  />
                </div>
                {formError ? (
                  <p
                    className="m-0 text-sm text-red-600"
                    role="status"
                    aria-live="polite"
                  >
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
                  {submitting ? 'Registrando…' : 'Crear cuenta'}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
