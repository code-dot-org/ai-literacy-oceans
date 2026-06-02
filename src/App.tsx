import {useEffect, useState} from 'react';

import OceansLab from '@code-dot-org/oceans-lab';
import '@code-dot-org/oceans-lab/styles.css';

import {detectLocale, loadStrings} from './locale';

// Curriculum order per design spec D7.
const SEQUENCE = [
  'fishvtrash',
  'creaturesvtrashdemo',
  'creaturesvtrash',
  'short',
  'long',
] as const;

type AppMode = (typeof SEQUENCE)[number];

const DARK_BG = 'rgb(2, 0, 28)';

export default function App() {
  const [modeIndex, setModeIndex] = useState(0);
  const [done, setDone] = useState(false);

  // Locale is detected once at mount and never changes.
  const [locale] = useState(() => detectLocale());
  const [strings, setStrings] = useState<Record<string, string> | undefined>();

  useEffect(() => {
    loadStrings(locale)
      .then(setStrings)
      .catch(() => setStrings(undefined));
  }, [locale]);

  function handleContinue() {
    if (modeIndex < SEQUENCE.length - 1) {
      setModeIndex(i => i + 1);
    } else {
      setDone(true);
    }
  }

  function handlePlayAgain() {
    setModeIndex(0);
    setDone(false);
  }

  if (done) {
    return (
      <div
        data-testid="play-again-screen"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100vw',
          height: '100vh',
          background: DARK_BG,
        }}
      >
        <button
          data-testid="play-again-btn"
          onClick={handlePlayAgain}
          style={{
            padding: '16px 40px',
            fontSize: 22,
            fontFamily: 'sans-serif',
            fontWeight: 600,
            borderRadius: 8,
            border: 'none',
            background: '#00b4d8',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: DARK_BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{width: '100%', maxWidth: 'calc(100vh * 16 / 9)'}}>
        <OceansLab
          appMode={SEQUENCE[modeIndex] as AppMode}
          guides="HoC"
          textToSpeechLocale={locale !== 'en' ? locale : undefined}
          strings={strings}
          onContinue={handleContinue}
        />
      </div>
    </div>
  );
}
