import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket, faUtensils } from '@fortawesome/free-solid-svg-icons';
import Avatar from '@/app/components/ui/Avatar';
import Button from '@/app/components/ui/Button';
import Tooltip from '@/app/components/ui/Tooltip';
import FollowButton from './FollowButton';
import type { CategoryStat, PublicUserProfile } from '@/app/lib/types/social';

export interface ProfileHeaderProps {
  profile: PublicUserProfile;
  followLoading?: boolean;
  onFollowToggle?: (userId: string, next: boolean) => void;
  onEditProfile?: () => void;
  onLogout?: () => void;
  logoutLoading?: boolean;
  onOpenFollowers?: (userId: string) => void;
  onOpenFollowing?: (userId: string) => void;
}

export default function ProfileHeader({
  profile,
  followLoading = false,
  onFollowToggle,
  onEditProfile,
  onLogout,
  logoutLoading = false,
  onOpenFollowers,
  onOpenFollowing,
}: ProfileHeaderProps) {
  const { isSelf, following } = profile.viewerState;
  const kicker = isSelf ? 'Tu paladar' : 'Crítico';

  return (
    <header className="flex flex-col gap-6 border-b border-border-subtle pb-6">
      <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-action-primary">
        {kicker}
      </p>

      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:gap-7">
        <Avatar
          src={profile.avatarUrl}
          name={profile.displayName}
          size="xl"
          className="ring-2 ring-surface-card shadow-[var(--shadow-base)]"
        />
        <div className="min-w-0 flex-1">
          <h1 className="m-0 font-display text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.05] text-text-primary">
            {profile.displayName}
          </h1>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 font-sans text-sm text-text-muted">
            {profile.handle && <span>@{profile.handle}</span>}
            {profile.handle && profile.location && (
              <span aria-hidden className="opacity-60">·</span>
            )}
            {profile.location && <span>{profile.location}</span>}
          </div>
        </div>
      </div>

      {profile.bio && (
        <p className="max-w-2xl whitespace-pre-wrap font-display italic text-base leading-relaxed text-text-secondary sm:text-lg">
          {profile.bio}
        </p>
      )}

      <dl className="flex flex-wrap items-baseline gap-x-7 gap-y-3 font-sans text-sm">
        <Stat label="reseñas" value={profile.counts.reviews} />
        <Stat
          label="seguidores"
          value={profile.counts.followers}
          onClick={onOpenFollowers ? () => onOpenFollowers(profile.id) : undefined}
        />
        <Stat
          label="seguidos"
          value={profile.counts.following}
          onClick={onOpenFollowing ? () => onOpenFollowing(profile.id) : undefined}
        />
        {profile.reputation && profile.reputation.verifiedReviewCount > 0 && (
          <Tooltip
            multiline
            label={
              <>
                <strong className="font-semibold">Reseñas expertas.</strong>{' '}
                Cantidad de reseñas con los 3 pilares técnicos completos
                (presentación, costo/beneficio y ejecución). Pondera más en el
                Geek Score.
              </>
            }
          >
            <span tabIndex={0} className="cursor-help">
              <Stat
                label="expertas"
                value={profile.reputation.verifiedReviewCount}
                accent
              />
            </span>
          </Tooltip>
        )}
        {profile.reputation && profile.reputation.restaurantsVisited > 0 && (
          <Stat
            label="locales"
            value={profile.reputation.restaurantsVisited}
          />
        )}
      </dl>

      {profile.reputation && profile.reputation.topCategories.length > 0 && (
        <SpecialtySection categories={profile.reputation.topCategories} />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {isSelf ? (
          <>
            <Button variant="outline" size="md" onClick={onEditProfile}>
              Editar perfil
            </Button>
            {onLogout && (
              <Button
                variant="ghost"
                size="md"
                loading={logoutLoading}
                onClick={onLogout}
                leftIcon={
                  <FontAwesomeIcon icon={faRightFromBracket} className="h-3.5 w-3.5" aria-hidden />
                }
              >
                Cerrar sesión
              </Button>
            )}
          </>
        ) : onFollowToggle ? (
          <FollowButton
            userId={profile.id}
            following={following}
            loading={followLoading}
            onToggle={onFollowToggle}
          />
        ) : null}
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  onClick,
  accent = false,
}: {
  label: string;
  value: number;
  onClick?: () => void;
  /** Cuando true, el número va en color azafrán (sello visual de "calidad"). */
  accent?: boolean;
}) {
  const content = (
    <>
      <dt className="sr-only">{label}</dt>
      <dd className="m-0 flex items-baseline gap-1.5">
        <span
          className={
            accent
              ? 'font-display text-2xl font-medium tabular-nums text-[color:var(--color-azafran)]'
              : 'font-display text-2xl font-medium tabular-nums text-action-primary'
          }
        >
          {value}
        </span>
        <span className="font-sans text-xs uppercase tracking-[0.14em] text-text-muted">
          {label}
        </span>
      </dd>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-md text-left transition-colors hover:[&_dd>span:first-child]:text-action-primary-hover focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
      >
        {content}
      </button>
    );
  }
  return <div>{content}</div>;
}

function SpecialtySection({ categories }: { categories: CategoryStat[] }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
        Especialidad
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <Tooltip
            key={cat.name}
            multiline
            label={
              <>
                <strong className="font-semibold">{cat.name}.</strong>{' '}
                {cat.reviewCount} reseña{cat.reviewCount === 1 ? '' : 's'} con
                rating promedio{' '}
                <span className="font-semibold tabular-nums">
                  {cat.avgRating.toFixed(1)}
                </span>
                . Una de las categorías donde más muestra criterio.
              </>
            }
          >
            <span
              tabIndex={0}
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-azafran)]/30 bg-[color:var(--color-azafran)]/8 px-3 py-1 font-sans text-xs font-medium text-text-primary"
            >
              <FontAwesomeIcon
                icon={faUtensils}
                className="text-[10px] text-[color:var(--color-azafran)]"
                aria-hidden
              />
              <span>{cat.name}</span>
              <span className="font-display text-xs font-semibold text-[color:var(--color-azafran)] tabular-nums">
                {cat.avgRating.toFixed(1)}
              </span>
            </span>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
