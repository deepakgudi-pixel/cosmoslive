'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { issApi, launchApi, mediaApi, newsApi, satelliteApi } from '@/lib/api';
import { HeroSection } from '@/components/sections/HeroSection';
import { TickerBar } from '@/components/sections/TickerBar';

const IssSection = dynamic(() => import('@/components/sections/IssSection').then((mod) => mod.IssSection));
const LaunchSection = dynamic(() => import('@/components/sections/LaunchSection').then((mod) => mod.LaunchSection));
const ApodSection = dynamic(() => import('@/components/sections/ApodSection').then((mod) => mod.ApodSection));
const NewsSection = dynamic(() => import('@/components/sections/NewsSection').then((mod) => mod.NewsSection));
const FooterSection = dynamic(() => import('@/components/sections/FooterSection').then((mod) => mod.FooterSection));

export default function HomePage() {
  const { isSignedIn } = useAuth();

  const { data: issPos } = useQuery({
    queryKey: ['iss-position'],
    queryFn: issApi.getPosition,
    refetchInterval: 10000,
  });

  const { data: launches } = useQuery({
    queryKey: ['launches-upcoming'],
    queryFn: launchApi.getUpcoming,
    staleTime: 5 * 60 * 1000,
  });

  const { data: crew } = useQuery({
    queryKey: ['iss-crew'],
    queryFn: issApi.getCrew,
    staleTime: 6 * 60 * 60 * 1000,
  });

  const { data: apod } = useQuery({
    queryKey: ['apod'],
    queryFn: mediaApi.getAPOD,
    staleTime: 24 * 60 * 60 * 1000,
    enabled: Boolean(isSignedIn),
  });

  const { data: news } = useQuery({
    queryKey: ['news-home'],
    queryFn: () => newsApi.getArticles(6),
    staleTime: 10 * 60 * 1000,
    enabled: Boolean(isSignedIn),
  });

  const { data: satData } = useQuery({
    queryKey: ['starlink'],
    queryFn: satelliteApi.getStarlink,
    refetchInterval: 30000,
    staleTime: 25000,
  });

  const nextLaunch = launches?.[0];

  return (
    <div style={{ paddingTop: '70px', width: '100%', overflowX: 'hidden' }}>
      <HeroSection
        issPos={issPos}
        launches={launches}
        satData={satData}
        crew={crew}
      />

      <TickerBar
        satCount={satData?.count}
        issPos={issPos ?? null}
        crewCount={crew?.count}
      />

      {isSignedIn && (
        <>
          <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '6rem 2rem', display: 'flex', flexDirection: 'column', gap: '8rem' }}>
            <IssSection crew={crew} />
            <LaunchSection nextLaunch={nextLaunch} />
            <ApodSection apod={apod} />
            <NewsSection news={news} />
          </div>

          <FooterSection />
        </>
      )}
    </div>
  );
}
