'use client';

import { SignInButton, useUser } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ReticleCard } from '@/components/ui';
import { userApi } from '@/lib/api';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const queryClient = useQueryClient();
  const email = user?.primaryEmailAddress?.emailAddress;

  const {
    isSuccess: accountSynced,
    isPending: accountSyncPending,
    isError: accountSyncFailed,
  } = useQuery({
    queryKey: ['user-sync', user?.id, email],
    queryFn: () => userApi.sync(user!.id, email!),
    enabled: Boolean(user?.id && email),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const { data: bookmarksData, isLoading: bookmarksLoading } = useQuery({
    queryKey: ['user-bookmarks', user?.id],
    queryFn: () => userApi.getBookmarks(user!.id),
    enabled: Boolean(user?.id && accountSynced),
    staleTime: 30 * 1000,
  });

  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['user-alerts', user?.id],
    queryFn: () => userApi.getAlerts(user!.id),
    enabled: Boolean(user?.id && accountSynced),
    staleTime: 30 * 1000,
  });

  const deleteBookmark = useMutation({
    mutationFn: (bookmarkId: string) => userApi.deleteBookmark(user!.id, bookmarkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookmarks', user?.id] });
    },
  });

  const deleteAlert = useMutation({
    mutationFn: (alertId: string) => userApi.deleteAlert(user!.id, alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-alerts', user?.id] });
    },
  });

  if (!isLoaded) {
    return (
      <ProfileShell center>
        <ReticleCard className="p-8 bg-surface">
          <span className="data-label animate-pulse text-cyan">LOADING ACCOUNT...</span>
        </ReticleCard>
      </ProfileShell>
    );
  }

  if (!user) {
    return (
      <ProfileShell center>
        <div style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
          <ReticleCard className="p-10 bg-surface text-center">
            <span className="data-label text-amber block mb-3">SIGN IN REQUIRED</span>
            <h1 className="font-display text-5xl text-white tracking-tight leading-none mb-4">
              ACCOUNT ACCESS
            </h1>
            <p className="font-mono text-xs text-silver/70 max-w-sm mx-auto leading-relaxed mb-8">
              Sign in to view your CosmosLive account details.
            </p>
            <SignInButton mode="modal">
              <button className="btn-primary w-full text-center">
                SIGN IN
              </button>
            </SignInButton>
          </ReticleCard>
        </div>
      </ProfileShell>
    );
  }

  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown';

  return (
    <ProfileShell>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '6rem 2rem 10rem 2rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ReticleCard className="p-8 md:p-10 bg-surface">
            <div className="flex flex-col gap-8 md:flex-row md:items-center">
              <div className="relative shrink-0">
                {user.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || 'Account avatar'}
                    className="h-24 w-24 border border-cyan/40 object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 border border-cyan/40 bg-void flex items-center justify-center font-display text-3xl text-cyan">
                    {(user.fullName || user.username || 'U').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 bg-cyan px-1 font-mono text-[0.55rem] font-bold text-void">
                  ACTIVE
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <span className="data-label text-cyan block mb-2">SIGNED IN ACCOUNT</span>
                <h1 className="font-display text-4xl md:text-5xl text-white tracking-tight leading-none mb-3 truncate">
                  {user.fullName || user.username || 'CosmosLive User'}
                </h1>
                <div className="font-mono text-xs text-silver/70 truncate">
                  {user.primaryEmailAddress?.emailAddress || 'No email address connected'}
                </div>
              </div>
            </div>

            <div className="divider-line my-10" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <AccountFact label="Account created" value={createdAt} />
              <AccountFact label="Saved launches" value={accountSyncFailed ? '--' : `${bookmarksData?.bookmarks.length || 0}`} />
              <AccountFact label="Active alerts" value={accountSyncFailed ? '--' : `${alertsData?.alerts.length || 0}`} />
            </div>
          </ReticleCard>
        </motion.div>

        {accountSyncFailed && (
          <ReticleCard className="mt-10 border border-red/20 bg-red/5 p-5">
            <span className="data-label text-red block mb-2">ACCOUNT REGISTRY OFFLINE</span>
            <p className="font-mono text-xs text-silver/70 leading-relaxed">
              CosmosLive could not sync your account with the backend. Profile bookmarks and alerts are temporarily unavailable
              until `/api/users/sync` can reach the production database.
            </p>
          </ReticleCard>
        )}

        <ProfileSection
          title="SAVED MISSIONS"
          eyebrow="DATABASE BOOKMARKS"
          loading={bookmarksLoading || accountSyncPending}
          emptyTitle={accountSyncFailed ? 'Account sync unavailable' : 'No saved missions yet'}
          emptyBody={accountSyncFailed
            ? 'The backend could not connect your Clerk user to the CosmosLive database. Check the API deployment logs and database schema.'
            : 'Use Save Mission on the launch manifest to keep upcoming missions here.'}
        >
          {bookmarksData?.bookmarks.map((bookmark) => (
            <RegistryRow
              key={bookmark.id}
              title={readMeta(bookmark.metadata, 'title') || bookmark.referenceId}
              subtitle={[
                bookmark.type.toUpperCase(),
                readMeta(bookmark.metadata, 'provider'),
                formatDate(readMeta(bookmark.metadata, 'net')),
              ].filter(Boolean).join(' // ')}
              actionLabel={deleteBookmark.isPending && deleteBookmark.variables === bookmark.id ? 'REMOVING...' : 'REMOVE'}
              onAction={() => deleteBookmark.mutate(bookmark.id)}
            />
          ))}
        </ProfileSection>

        <ProfileSection
          title="LAUNCH ALERTS"
          eyebrow="ACTIVE TRIGGERS"
          loading={alertsLoading || accountSyncPending}
          emptyTitle={accountSyncFailed ? 'Account sync unavailable' : 'No launch alerts set'}
          emptyBody={accountSyncFailed
            ? 'Alert data is unavailable until the backend sync endpoint can write to the production database.'
            : 'Use Set Alert on an upcoming launch to track it from your profile.'}
        >
          {alertsData?.alerts.map((alert) => (
            <RegistryRow
              key={alert.id}
              title={readMeta(alert.config, 'title') || readMeta(alert.config, 'referenceId') || 'Launch alert'}
              subtitle={[
                alert.alertType.toUpperCase().replace('_', ' '),
                readMeta(alert.config, 'provider'),
                formatDate(readMeta(alert.config, 'net')),
              ].filter(Boolean).join(' // ')}
              actionLabel={deleteAlert.isPending && deleteAlert.variables === alert.id ? 'DISABLING...' : 'DISABLE'}
              onAction={() => deleteAlert.mutate(alert.id)}
            />
          ))}
        </ProfileSection>
      </div>
    </ProfileShell>
  );
}

function ProfileShell({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div
      style={{
        paddingTop: '90px',
        minHeight: '100vh',
        background: 'var(--color-void)',
        display: center ? 'flex' : 'block',
        alignItems: center ? 'center' : undefined,
        justifyContent: center ? 'center' : undefined,
      }}
      className="select-none"
    >
      {children}
    </div>
  );
}

function AccountFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.03] p-5">
      <span className="data-label text-[0.55rem] text-silver/45 block mb-2">{label}</span>
      <span className="font-mono text-sm font-bold text-white">{value}</span>
    </div>
  );
}

function ProfileSection({
  title,
  eyebrow,
  loading,
  emptyTitle,
  emptyBody,
  children,
}: {
  title: string;
  eyebrow: string;
  loading: boolean;
  emptyTitle: string;
  emptyBody: string;
  children?: React.ReactNode;
}) {
  const hasChildren = Boolean(children && (!Array.isArray(children) || children.length > 0));

  return (
    <section className="w-full">
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <h2 className="font-display text-2xl text-white tracking-tight">{title}</h2>
        <span className="font-mono text-[0.65rem] text-silver/50">{eyebrow}</span>
      </div>

      {loading ? (
        <ReticleCard className="bg-surface/40 p-8 text-center">
          <span className="font-mono text-xs text-silver/45">SYNCING ACCOUNT REGISTRY...</span>
        </ReticleCard>
      ) : hasChildren ? (
        <div className="space-y-4">{children}</div>
      ) : (
        <ReticleCard className="bg-surface/40 p-8 text-center">
          <span className="font-mono text-xs text-silver/45 block mb-2">{emptyTitle}</span>
          <p className="font-mono text-xs text-silver/60 max-w-md mx-auto leading-relaxed">{emptyBody}</p>
        </ReticleCard>
      )}
    </section>
  );
}

function RegistryRow({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <ReticleCard className="bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-display text-xl text-white tracking-tight truncate">{title}</h3>
          <div className="font-mono text-[0.65rem] text-silver/55 mt-1">{subtitle || 'Saved item'}</div>
        </div>
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 border border-red/30 px-3 py-2 font-mono text-[0.6rem] font-bold tracking-widest text-red transition-colors hover:bg-red hover:text-void"
        >
          {actionLabel}
        </button>
      </div>
    </ReticleCard>
  );
}

function readMeta(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === 'string' ? value : '';
}

function formatDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}
