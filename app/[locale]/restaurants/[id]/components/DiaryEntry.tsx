import { useTranslations } from 'next-intl';

interface DiaryEntryProps {
  diary: string;
}

export default function DiaryEntry({ diary }: DiaryEntryProps) {
  const t = useTranslations('restaurant.diaryEntry');
  return (
    <div className="mb-5 w-full">
      <div className="cc-card">
        <div className="cc-card-body">
          <h4 className="card-title mb-3 text-lg font-semibold text-neutral-900">
            {t('title')}
          </h4>
          <p className="mb-0 whitespace-pre-line text-neutral-700">{diary}</p>
        </div>
      </div>
    </div>
  );
}
