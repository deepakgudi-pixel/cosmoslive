'use client';

import { useUser } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { userApi } from '@/lib/api';

export function UserSync() {
  const { user, isLoaded } = useUser();
  const lastSyncedRef = useRef<string | null>(null);

  const syncUser = useMutation({
    mutationFn: ({ clerkId, email }: { clerkId: string; email: string }) => userApi.sync(clerkId, email),
  });

  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!isLoaded || !user || !email || lastSyncedRef.current === user.id) return;

    lastSyncedRef.current = user.id;
    syncUser.mutate({ clerkId: user.id, email });
  }, [isLoaded, syncUser, user]);

  return null;
}
