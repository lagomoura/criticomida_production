'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Select from '@/app/components/ui/Select';
import Textarea from '@/app/components/ui/Textarea';
import { useToast } from '@/app/components/ui/Toast';
import { updateProfile } from '@/app/lib/api/users';
import { ApiError } from '@/app/lib/api/client';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import type { Gender } from '@/app/lib/types/user';

const GENDER_OPTIONS: Gender[] = ['female', 'male', 'non_binary', 'prefer_not_to_say'];

const TODAY_ISO = () => new Date().toISOString().slice(0, 10);

export default function EditProfileForm() {
  const { user, refreshUser } = useAuthContext();
  const t = useTranslations('settings.editForm');
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const [displayName, setDisplayName] = useState(user?.display_name ?? '');
  const [handle, setHandle] = useState(user?.handle ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [location, setLocation] = useState(user?.location ?? '');
  const [gender, setGender] = useState<Gender | ''>(user?.gender ?? '');
  const [birthDate, setBirthDate] = useState(user?.birth_date ?? '');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const summaryHandle = user.handle ? `@${user.handle}` : t('noHandle');
  const summaryBio = user.bio ?? t('noBio');
  const summaryLocation = user.location ?? t('noLocation');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await updateProfile({
        display_name: displayName.trim() || undefined,
        handle: handle.trim() ? handle.trim() : null,
        bio: bio.trim() ? bio.trim() : null,
        location: location.trim() ? location.trim() : null,
        gender: gender === '' ? null : gender,
        birth_date: birthDate || null,
      });
      await refreshUser();
      toast.success(t('savedTitle'), t('savedDescription'));
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof ApiError && typeof err.detail === 'string'
          ? err.detail
          : t('errorMessage'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mb-8 rounded-2xl border border-border-default bg-surface-card">
      <header className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="font-sans text-sm font-medium text-text-primary">{t('publicProfile')}</p>
          <p className="font-sans text-xs text-text-muted">
            {summaryHandle} · {summaryLocation}
          </p>
          <p className="mt-1 line-clamp-2 font-sans text-xs text-text-muted">{summaryBio}</p>
        </div>
        {!open && (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            {t('edit')}
          </Button>
        )}
      </header>

      {open && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-border-default p-4" noValidate>
          <Input
            label={t('displayName')}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            minLength={1}
            maxLength={100}
            required
            disabled={submitting}
          />
          <Input
            label={t('handle')}
            helpText={t('handleHelp')}
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            pattern="[a-zA-Z0-9_]{3,30}"
            minLength={3}
            maxLength={30}
            placeholder={t('handlePlaceholder')}
            disabled={submitting}
          />
          <Input
            label={t('location')}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={200}
            placeholder={t('locationPlaceholder')}
            disabled={submitting}
          />
          <Textarea
            label={t('bio')}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            valueLength={bio.length}
            rows={3}
            disabled={submitting}
          />
          <Select
            label={t('gender')}
            helpText={t('genderHelp')}
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender | '')}
            disabled={submitting}
          >
            <option value="">{t('genderOptions.empty')}</option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {t(`genderOptions.${g}`)}
              </option>
            ))}
          </Select>
          <Input
            label={t('birthDate')}
            helpText={t('birthDateHelp')}
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={TODAY_ISO()}
            disabled={submitting}
          />
          {error && (
            <p className="m-0 font-sans text-sm text-action-danger" role="status" aria-live="polite">
              {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" disabled={submitting} onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {t('save')}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
