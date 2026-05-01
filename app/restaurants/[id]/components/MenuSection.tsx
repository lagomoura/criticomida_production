'use client';

import React from 'react';
import Image from 'next/image';

interface MenuSectionProps {
  menu: { image: string; uploadDate: string } | null;
  onOpenMenuModal: () => void;
}

export default function MenuSection({
  menu,
  onOpenMenuModal,
}: MenuSectionProps) {
  return (
    <div className="mb-5 w-full">
      <div className="cc-card shadow-sm">
        <div className="cc-card-body">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="card-title mb-0 text-lg">Menú del restaurante</h4>
            <button
              className={
                'btn btn-outline-primary btn-lg flex items-center gap-2 ' +
                'rounded-full px-4 py-2 text-base font-bold shadow-sm ' +
                'border-2'
              }
              type="button"
              onClick={onOpenMenuModal}
            >
              <span className="text-xl" aria-hidden>
                📋
              </span>
              {menu ? 'Actualizar menú' : 'Subir menú'}
            </button>
          </div>
          {menu ? (
            <div className="flex flex-col items-start gap-3 sm:flex-row">
              <div className="shrink-0">
                <Image
                  src={menu.image}
                  alt="Menú del restaurante"
                  width={200}
                  height={150}
                  className="max-h-[150px] max-w-[200px] cursor-pointer rounded object-cover shadow-sm"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    if (e.currentTarget) {
                      e.currentTarget.src = '/img/menu-fallback.jpg';
                    }
                  }}
                  onClick={() => window.open(menu.image, '_blank')}
                  title="Click para ver en tamaño completo"
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="mb-2 flex items-center gap-2 text-muted">
                  <span className="text-lg" aria-hidden>
                    📅
                  </span>
                  <small>
                    Menú subido el:{' '}
                    {new Date(menu.uploadDate).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </small>
                </div>
                <small className="text-muted">
                  <span className="text-base" aria-hidden>
                    👆
                  </span>{' '}
                  Click en la imagen para ver en tamaño completo
                </small>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <div className="mb-2 text-5xl" aria-hidden>
                📋
              </div>
              <h5 className="text-muted">No hay menú disponible</h5>
              <p className="text-secondary">
                ¡Sube el menú de este restaurante para tenerlo siempre a mano!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
