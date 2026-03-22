"use client";

import React from 'react';

interface PlateForm {
  name: string;
  date: string;
  time: string;
  images: string[];
  note: string;
  pros: string;
  cons: string;
  rating: number;
  price: string;
  portion: string;
  wouldOrderAgain: boolean;
  tags: string;
  visitedWith: string;
}

interface AddPlateModalProps {
  show: boolean;
  form: PlateForm;
  formError: string;
  onClose: () => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (idx: number, value: string) => void;
  onAddImageField: () => void;
  onRemoveImageField: (idx: number) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function AddPlateModal({
  show,
  form,
  formError,
  onClose,
  onFormChange,
  onImageChange,
  onAddImageField,
  onRemoveImageField,
  onSubmit,
}: AddPlateModalProps) {
  if (!show) return null;

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
          'my-auto flex w-full max-w-full max-h-[min(90vh,100%)] ' +
          'flex-col sm:max-w-lg'
        }
      >
        <div className="flex max-h-[inherit] flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="modal-header flex flex-shrink-0 items-center justify-between border-b border-neutral-200 pb-3 pt-4 pl-5 pr-4">
            <h5 className="modal-title m-0 text-lg font-semibold">
              Agregar plato al diario
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
          <form
            onSubmit={onSubmit}
            className="flex max-h-[inherit] flex-col"
          >
            <div
              className={
                'modal-body max-h-[calc(90vh-8rem)] flex-1 overflow-y-auto ' +
                'px-5 pt-2 pb-4'
              }
            >
              {formError && <div className="alert alert-danger py-2">{formError}</div>}
              <div className="mb-3">
                <label className="form-label">Nombre del plato *</label>
                <input type="text" className="form-control" name="name" value={form.name} onChange={onFormChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Fecha *</label>
                <input type="date" className="form-control" name="date" value={form.date} onChange={onFormChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Hora</label>
                <input type="time" className="form-control" name="time" value={form.time} onChange={onFormChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Imágenes del plato</label>
                {form.images.map((img, idx) => (
                  <div key={idx} className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="URL de la imagen"
                      value={img}
                      onChange={e => onImageChange(idx, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => onRemoveImageField(idx)}
                      disabled={form.images.length === 1}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-outline-primary btn-sm mt-1" onClick={onAddImageField}>+ Agregar otra imagen</button>
              </div>
              <div className="mb-3">
                <label className="form-label">Notas</label>
                <textarea className="form-control" name="note" value={form.note} onChange={onFormChange} rows={2} />
              </div>
              <div className="mb-3">
                <label className="form-label">Pros (separados por coma)</label>
                <input type="text" className="form-control" name="pros" value={form.pros} onChange={onFormChange} placeholder="Ej: Rico, Abundante" />
              </div>
              <div className="mb-3">
                <label className="form-label">Contras (separados por coma)</label>
                <input type="text" className="form-control" name="cons" value={form.cons} onChange={onFormChange} placeholder="Ej: Caro, Frío" />
              </div>
              <div className="mb-3">
                <label className="form-label">Calificación</label>
                <select className="form-select" name="rating" value={form.rating} onChange={onFormChange}>
                  <option value={5}>★★★★★ (5)</option>
                  <option value={4}>★★★★☆ (4)</option>
                  <option value={3}>★★★☆☆ (3)</option>
                  <option value={2}>★★☆☆☆ (2)</option>
                  <option value={1}>★☆☆☆☆ (1)</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Precio</label>
                <select className="form-select" name="price" value={form.price} onChange={onFormChange}>
                  <option value="$">$ (Barato)</option>
                  <option value="$$">$$ (Medio)</option>
                  <option value="$$$">$$$ (Caro)</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Tamaño de porción</label>
                <select className="form-select" name="portion" value={form.portion} onChange={onFormChange}>
                  <option value="Small">Pequeña</option>
                  <option value="Medium">Mediana</option>
                  <option value="Large">Grande</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">¿Lo pedirías de nuevo?</label>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="wouldOrderAgain" id="wouldOrderAgainYes" value="true" checked={form.wouldOrderAgain === true} onChange={onFormChange} />
                  <label className="form-check-label" htmlFor="wouldOrderAgainYes">Sí</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="wouldOrderAgain" id="wouldOrderAgainNo" value="false" checked={form.wouldOrderAgain === false} onChange={onFormChange} />
                  <label className="form-check-label" htmlFor="wouldOrderAgainNo">No</label>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Etiquetas (separadas por coma)</label>
                <input type="text" className="form-control" name="tags" value={form.tags} onChange={onFormChange} placeholder="Ej: Vegano, Picante, Sin TACC" />
              </div>
              <div className="mb-3">
                <label className="form-label">¿Con quién fuiste?</label>
                <input type="text" className="form-control" name="visitedWith" value={form.visitedWith} onChange={onFormChange} placeholder="Ej: Familia, Amigos, Solo" />
              </div>
            </div>
            <div className="modal-footer flex flex-shrink-0 flex-wrap gap-2 border-t border-neutral-200 px-5 py-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Agregar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
