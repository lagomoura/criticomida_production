'use client';

import React from 'react';
import Image from 'next/image';

interface MenuForm {
  image: string;
  uploadDate: string;
}

interface AddMenuModalProps {
  show: boolean;
  menuForm: MenuForm;
  hasExistingMenu: boolean;
  onClose: () => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function AddMenuModal({
  show,
  menuForm,
  hasExistingMenu,
  onClose,
  onFormChange,
  onSubmit,
}: AddMenuModalProps) {
  if (!show) {
    return null;
  }

  return (
    <div
      className={
        'modal fade show fixed inset-0 z-[1050] flex items-start ' +
        'justify-center overflow-y-auto overflow-x-hidden bg-black/35 ' +
        'px-3 py-6 sm:px-4'
      }
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={
          'my-auto flex w-full max-w-full flex-col sm:max-w-lg'
        }
      >
        <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="modal-header flex items-center justify-between border-b border-neutral-200 px-5 pb-3 pt-4">
            <h5 className="modal-title m-0 flex items-center text-lg font-semibold">
              <span className="mr-2 text-xl" aria-hidden>
                📋
              </span>
              {hasExistingMenu
                ? 'Actualizar menú'
                : 'Subir menú del restaurante'}
            </h5>
            <button
              type="button"
              className="cc-btn-close"
              aria-label="Cerrar"
              onClick={onClose}
            >
              ×
            </button>
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body px-5 pt-2 pb-4">
              <div className="mb-3">
                <label className="form-label">URL de la imagen del menú *</label>
                <input
                  type="url"
                  className="form-control"
                  name="image"
                  value={menuForm.image}
                  onChange={onFormChange}
                  placeholder="https://ejemplo.com/menu.jpg"
                  required
                />
                <div className="form-text">
                  Pega aquí la URL de la imagen del menú
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Fecha de subida</label>
                <input
                  type="date"
                  className="form-control"
                  name="uploadDate"
                  value={menuForm.uploadDate}
                  onChange={onFormChange}
                />
                <div className="form-text">
                  Fecha en que obtuviste este menú
                </div>
              </div>
              {menuForm.image && (
                <div className="mb-3">
                  <label className="form-label">Vista previa:</label>
                  <div className="rounded border border-neutral-200 p-2">
                    <Image
                      src={menuForm.image}
                      alt="Vista previa del menú"
                      width={400}
                      height={300}
                      className="img-fluid max-h-[200px] rounded object-contain"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        if (e.currentTarget) {
                          e.currentTarget.src = '/img/menu-fallback.jpg';
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer flex flex-wrap gap-2 border-t border-neutral-200 px-5 py-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                <span className="mr-2 text-lg" aria-hidden>
                  💾
                </span>
                {hasExistingMenu ? 'Actualizar' : 'Guardar menú'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
