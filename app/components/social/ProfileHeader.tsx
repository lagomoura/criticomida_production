import Avatar from '@/app/components/ui/Avatar';
import Button from '@/app/components/ui/Button';
import FollowButton from './FollowButton';
import type { PublicUserProfile } from '@/app/lib/types/social';

export interface ProfileHeaderProps {
  profile: PublicUserProfile;
  followLoading?: boolean;
  onFollowToggle?: (userId: string, next: boolean) => void;
  onEditProfile?: () => void;
  onOpenFollowers?: (userId: string) => void;
  onOpenFollowing?: (userId: string) => void;
}

export default function ProfileHeader({
  profile,
  followLoading = false,
  onFollowToggle,
  onEditProfile,
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
      </dl>

      <div>
        {isSelf ? (
          <Button variant="outline" size="md" onClick={onEditProfile}>
            Editar perfil
          </Button>
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
}: {
  label: string;
  value: number;
  onClick?: () => void;
}) {
  const content = (
    <>
      <dt className="sr-only">{label}</dt>
      <dd className="m-0 flex items-baseline gap-1.5">
        <span className="font-display text-2xl font-medium tabular-nums text-action-primary">
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
