'use client';

import { Suspense, useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { STT_LANGUAGES } from '@/lib/agora-stt';

const TranslatorSession = dynamic(
  () => import('@/components/TranslatorSession'),
  { ssr: false },
);

const AgoraTranslatorProvider = dynamic(
  async () => {
    const { AgoraRTCProvider, default: AgoraRTC } =
      await import('agora-rtc-react');
    return {
      default: function Provider({ children }: { children: React.ReactNode }) {
        const clientRef = useRef<ReturnType<typeof AgoraRTC.createClient> | null>(null);
        if (!clientRef.current) {
          clientRef.current = AgoraRTC.createClient({
            mode: 'rtc',
            codec: 'vp8',
          });
        }
        return (
          <AgoraRTCProvider client={clientRef.current}>
            {children}
          </AgoraRTCProvider>
        );
      },
    };
  },
  { ssr: false },
);

function TranslatorPageInner() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === '1';

  const [session, setSession] = useState<{
    channel?: string;
    token?: string;
    uid?: string;
    sourceLanguage: string;
    targetLanguages: string[];
    domain: 'maritime' | 'coaching';
    demoMode?: boolean;
  } | null>(null);

  const [sourceLanguage, setSourceLanguage] = useState('en-US');
  const [targetLanguages, setTargetLanguages] = useState<string[]>(['vi-VN']);
  const [domain, setDomain] = useState<'maritime' | 'coaching'>('coaching');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (isDemo) {
      setSession({
        sourceLanguage,
        targetLanguages,
        domain,
        demoMode: true,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tokenRes = await fetch('/api/generate-agora-token');
      const tokenData = await tokenRes.json();

      if (!tokenRes.ok) {
        throw new Error('Token error: ' + JSON.stringify(tokenData));
      }

      setSession({
        channel: tokenData.channel,
        token: tokenData.token,
        uid: tokenData.uid,
        sourceLanguage,
        targetLanguages,
        domain,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnd = useCallback(() => {
    setSession(null);
  }, []);

  useEffect(() => {
    if (isDemo && !session) {
      setSession({
        sourceLanguage,
        targetLanguages,
        domain,
        demoMode: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (session) {
    return (
      <AgoraTranslatorProvider>
        <TranslatorSession
          channel={session.channel}
          token={session.token}
          uid={session.uid}
          sourceLanguage={session.sourceLanguage}
          targetLanguages={session.targetLanguages}
          onEnd={handleEnd}
          demoMode={session.demoMode}
          domain={session.domain}
        />
      </AgoraTranslatorProvider>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Real-Time Translator
          </h1>
          <p className="text-muted-foreground text-sm">
            Speak in one language - hear and see translation in real time.
            Works with bone conduction headphones for deaf accessibility.
          </p>
          {isDemo && (
            <p className="text-xs text-yellow-500 font-medium">
              Demo Mode - no credentials needed
            </p>
          )}
        </div>

        <div className="space-y-4 rounded-lg border p-6 bg-card">
          <div className="space-y-2">
            <label className="text-sm font-medium">I speak</label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {STT_LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Translate to</label>
            <div className="flex flex-wrap gap-2">
              {STT_LANGUAGES.filter((l) => l.value !== sourceLanguage).map(
                (l) => {
                  const isSelected = targetLanguages.includes(l.value);
                  return (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => {
                        setTargetLanguages((prev) =>
                          isSelected
                            ? prev.filter((v) => v !== l.value)
                            : [...prev, l.value],
                        );
                      }}
                      className={
                        'rounded-full px-3 py-1 text-xs font-medium transition-colors ' +
                        (isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80')
                      }
                    >
                      {l.label}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Domain</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDomain('coaching')}
                className={
                  'flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ' +
                  (domain === 'coaching'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80')
                }
              >
                🏊 Coaching
              </button>
              <button
                type="button"
                onClick={() => setDomain('maritime')}
                className={
                  'flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ' +
                  (domain === 'maritime'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80')
                }
              >
                ⚓ Maritime
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={isLoading || targetLanguages.length === 0}
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Connecting...' : isDemo ? 'Start Demo' : 'Start Translation'}
          </button>

          {!isDemo && (
            <div className="text-center">
              <Link
                href="/translator?demo=1"
                className="text-xs text-yellow-500 hover:text-yellow-400 underline"
              >
                Try Demo Mode instead (no credentials)
              </Link>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Back to Voice AI Demo
          </Link>
        </div>

        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Translated text shows as subtitles and speaks via TTS</p>
          <p>Pair bone conduction headphones for deaf-accessible audio</p>
        </div>
      </div>
    </div>
  );
}

export default function TranslatorPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>}>
      <TranslatorPageInner />
    </Suspense>
  );
}
