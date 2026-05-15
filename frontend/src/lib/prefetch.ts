import type { QueryClient } from '@tanstack/react-query';
import { issApi, launchApi, mediaApi, newsApi, satelliteApi } from './api';

const prefetchedRoutes = new Set<string>();

export function prefetchRouteData(queryClient: QueryClient, href: string, isSignedIn: boolean) {
  if (prefetchedRoutes.has(href)) {
    return;
  }

  prefetchedRoutes.add(href);

  switch (href) {
    case '/':
      void queryClient.prefetchQuery({
        queryKey: ['iss-position'],
        queryFn: issApi.getPosition,
      });
      void queryClient.prefetchQuery({
        queryKey: ['launches-upcoming'],
        queryFn: launchApi.getUpcoming,
      });
      void queryClient.prefetchQuery({
        queryKey: ['iss-crew'],
        queryFn: issApi.getCrew,
      });
      void queryClient.prefetchQuery({
        queryKey: ['starlink'],
        queryFn: satelliteApi.getStarlink,
      });
      if (isSignedIn) {
        void queryClient.prefetchQuery({
          queryKey: ['apod'],
          queryFn: mediaApi.getAPOD,
        });
        void queryClient.prefetchQuery({
          queryKey: ['news-home'],
          queryFn: () => newsApi.getArticles(6),
        });
      }
      return;
    case '/satellites':
      void queryClient.prefetchQuery({
        queryKey: ['starlink'],
        queryFn: satelliteApi.getStarlink,
      });
      return;
    case '/launches':
      void queryClient.prefetchQuery({
        queryKey: ['launches-upcoming'],
        queryFn: launchApi.getUpcoming,
      });
      void queryClient.prefetchQuery({
        queryKey: ['launches-previous'],
        queryFn: launchApi.getPrevious,
      });
      void queryClient.prefetchQuery({
        queryKey: ['spacex'],
        queryFn: launchApi.getSpaceX,
      });
      return;
    case '/iss':
      void queryClient.prefetchQuery({
        queryKey: ['iss-position'],
        queryFn: issApi.getPosition,
      });
      void queryClient.prefetchQuery({
        queryKey: ['iss-crew'],
        queryFn: issApi.getCrew,
      });
      return;
    case '/media':
      void queryClient.prefetchQuery({
        queryKey: ['apod-archive'],
        queryFn: () => mediaApi.getAPODArchive(30),
      });
      return;
    case '/news':
      void queryClient.prefetchQuery({
        queryKey: ['news', 0, undefined],
        queryFn: () => newsApi.getArticles(24, 0),
      });
      return;
    default:
      return;
  }
}
