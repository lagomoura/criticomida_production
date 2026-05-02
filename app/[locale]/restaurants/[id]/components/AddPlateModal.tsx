'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('restaurant.addPlateModal');
  if (!show) return null;

  return (
    <div
      className={
        'modal fade show fixed inset-0 z-[1050] flex items-start ' +
        'justify-center overflow-y-auto overflow-x-hidden overscroll-contain ' +
        'bg-black/35 px-3 py-6 sm:px-4'
      }
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-plate-modal-title"
    >
      <div
        className={
          'my-auto flex w-full max-w-full max-h-[min(90vh,100%)] ' +
          'flex-col sm:max-w-lg'
        }
      >
        <div className="flex max-h-[inherit] flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="modal-header flex flex-shrink-0 items-center justify-between border-b border-neutral-200 pb-3 pt-4 pl-5 pr-4">
            <h2
              id="add-plate-modal-title"
              className="modal-title m-0 text-lg font-semibold"
            >
              {t('title')}
            </h2>
            <button
              type="button"
              className="cc-btn-close"
              aria-label={t('close')}
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
                'overscroll-contain px-5 pt-2 pb-4'
              }
            >
              {formError && <div className="alert alert-danger py-2">{formError}</div>}
              <div className="mb-3">
                <label className="form-label">{t('nameLabel')}</label>
                <input type="text" className="form-control" name="name" value={form.name} onChange={onFormChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">{t('dateLabel')}</label>
                <input type="date" className="form-control" name="date" value={form.date} onChange={onFormChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">{t('timeLabel')}</label>
                <input type="time" className="form-control" name="time" value={form.time} onChange={onFormChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t('imagesLabel')}</label>
                {form.images.map((img, idx) => (
                  <div key={idx} className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t('imageUrlPlaceholder')}
                      value={img}
                      onChange={e => onImageChange(idx, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => onRemoveImageField(idx)}
                      disabled={form.images.length === 1}
                      aria-label={t('removeImage')}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-outline-primary btn-sm mt-1" onClick={onAddImageField}>{t('addImage')}</button>
              </div>
              <div className="mb-3">
                <label className="form-label">{t('notesLabel')}</label>
                <textarea className="form-control" name="note" value={form.note} onChange={onFormChange} rows={2} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t('prosLabel')}</label>
                <input type="text" className="form-control" name="pros" value={form.pros} onChange={onFormChange} placeholder={t('prosPlaceholder')} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t('consLabel')}</label>
                <input type="text" className="form-control" name="cons" value={form.cons} onChange={onFormChange} placeholder={t('consPlaceholder')} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t('ratingLabel')}</label>
                <select className="form-select" name="rating" value={form.rating} onChange={onFormChange}>
                  <option value={5}>★★★★★ (5)</option>
                  <option value={4}>★★★★☆ (4)</option>
                  <option value={3}>★★★☆☆ (3)</option>
                  <option value={2}>★★☆☆☆ (2)</option>
                  <option value={1}>★☆☆☆☆ (1)</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">{t('priceLabel')}</label>
                <select className="form-select" name="price" value={form.price} onChange={onFormChange}>
                  <option value="$">{t('priceCheap')}</option>
                  <option value="$$">{t('priceMid')}</option>
                  <option value="$$$">{t('priceHigh')}</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">{t('portionLabel')}</label>
                <select className="form-select" name="portion" value={form.portion} onChange={onFormChange}>
                  <option value="Small">{t('portionSmall')}</option>
                  <option value="Medium">{t('portionMedium')}</option>
                  <option value="Large">{t('portionLarge')}</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">{t('wouldOrderAgainLabel')}</label>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="wouldOrderAgain" id="wouldOrderAgainYes" value="true" checked={form.wouldOrderAgain === true} onChange={onFormChange} />
                  <label className="form-check-label" htmlFor="wouldOrderAgainYes">{t('yes')}</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="wouldOrderAgain" id="wouldOrderAgainNo" value="false" checked={form.wouldOrderAgain === false} onChange={onFormChange} />
                  <label className="form-check-label" htmlFor="wouldOrderAgainNo">{t('no')}</label>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">{t('tagsLabel')}</label>
                <input type="text" className="form-control" name="tags" value={form.tags} onChange={onFormChange} placeholder={t('tagsPlaceholder')} />
              </div>
              <div className="mb-3">
                <label className="form-label">{t('visitedWithLabel')}</label>
                <input type="text" className="form-control" name="visitedWith" value={form.visitedWith} onChange={onFormChange} placeholder={t('visitedWithPlaceholder')} />
              </div>
            </div>
            <div className="modal-footer flex flex-shrink-0 flex-wrap gap-2 border-t border-neutral-200 px-5 py-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                {t('cancel')}
              </button>
              <button type="submit" className="btn btn-primary">
                {t('submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
