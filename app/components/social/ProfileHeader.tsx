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

  return (
    <header className="flex flex-col gap-5">
      <div className="flex items-start gap-5">
        <Avatar src={profile.avatarUrl} name={profile.displayName} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-medium text-text-primary sm:text-4xl">
            {profile.displayName}
          </h1>
          {profile.handle && (
            <p className="mt-0.5 font-sans text-sm text-text-muted">@{profile.handle}</p>
          )}
          {profile.location && (
            <p className="mt-1 font-sans text-sm text-text-muted">{profile.location}</p>
          )}
        </div>
      </div>

      {profile.bio && (
        <p className="max-w-2xl whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-text-primary">
          {profile.bio}
        </p>
      )}

      <dl className="flex items-center gap-6 font-sans text-sm">
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
      <dd className="flex items-baseline gap-1">
        <span className="font-sans text-base font-medium tabular-nums text-text-primary">{value}</span>
        <span className="font-sans text-sm text-text-muted">{label}</span>
      </dd>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-md text-left hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
      >
        {content}
      </button>
    );
  }
  return <div>{content}</div>;
}
