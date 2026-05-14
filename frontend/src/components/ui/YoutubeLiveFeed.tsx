'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';

interface YoutubeLiveFeedProps {
  videoId: string;
  title: string;
  className?: string;
  style?: CSSProperties;
  volume?: number;
  muted?: boolean;
}

type YoutubeCommandArg = string | number | boolean;

export function YoutubeLiveFeed({
  videoId,
  title,
  className,
  style,
  volume = 60,
  muted = false,
}: YoutubeLiveFeedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const src = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: '1',
      mute: muted ? '1' : '0',
      controls: '0',
      modestbranding: '1',
      rel: '0',
      playsinline: '1',
      disablekb: '1',
      fs: '0',
      iv_load_policy: '3',
      enablejsapi: '1',
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }, [muted, videoId]);

  const sendCommand = useCallback((func: string, args: YoutubeCommandArg[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      'https://www.youtube.com'
    );
  }, []);

  const syncPlayback = useCallback(() => {
    sendCommand('setVolume', [volume]);
    sendCommand(muted ? 'mute' : 'unMute');
    sendCommand('playVideo');
  }, [muted, sendCommand, volume]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      className={className}
      style={{ ...style, pointerEvents: 'none' }}
      allow="autoplay; encrypted-media"
      onLoad={() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [0, 300, 900, 1800].map((delay) => setTimeout(syncPlayback, delay));
      }}
    />
  );
}
