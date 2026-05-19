'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api';

export function UserSync() {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  useQuery({
    queryKey: ['user-sync', user?.id, email],
    queryFn: () => userApi.sync(user!.id, email!),
    enabled: Boolean(isLoaded && user?.id && email),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  return null;
}
