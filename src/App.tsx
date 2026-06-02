import {useEffect, useState} from 'react';

import OceansLab from '@code-dot-org/oceans-lab';
import '@code-dot-org/oceans-lab/styles.css';

import Progress, {type Step} from './Progress';
import {detectLocale, loadStrings, SUPPORTED_LOCALES} from './locale';

// ── Sequence ────────────────────────────────────────────────────────────────

const EN_STEP_LABELS = [
  'Label Fish & Trash',
  'Bias in Action',
  'Retrain Fairly',
  'Pick a Simple Word',
  'Teach AI a New Word',
];

function buildSteps(strings: Record<string, string> | undefined): Step[] {
  return EN_STEP_LABELS.map((enLabel, i) => ({
    index: i,
    label: strings?.[`app-step-${i + 1}`] ?? enLabel,
  }));
}

const MODES = [
  'fishvtrash',
  'creaturesvtrashdemo',
  'creaturesvtrash',
  'short',
  'long',
] as const;

type AppMode = (typeof MODES)[number];

// ── Session persistence ─────────────────────────────────────────────────────

const SESSION_COMPLETED = 'oceans-completed';
const SESSION_MODE = 'oceans-mode';

function loadSession(): {modeIndex: number; completed: Set<number>} {
  try {
    const completed = new Set<number>(
      JSON.parse(sessionStorage.getItem(SESSION_COMPLETED) ?? '[]'),
    );
    const modeIndex = Math.min(
      parseInt(sessionStorage.getItem(SESSION_MODE) ?? '0', 10),
      MODES.length - 1,
    );
    return {modeIndex, completed};
  } catch {
    return {modeIndex: 0, completed: new Set()};
  }
}

function saveSession(modeIndex: number, completed: Set<number>) {
  sessionStorage.setItem(SESSION_COMPLETED, JSON.stringify([...completed]));
  sessionStorage.setItem(SESSION_MODE, String(modeIndex));
}

// ── Language / URL param ────────────────────────────────────────────────────

function getInitialLocale(): string {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang');
  if (lang && lang in SUPPORTED_LOCALES) return lang;
  return detectLocale();
}

function setLangParam(lang: string) {
  const params = new URLSearchParams(window.location.search);
  params.set('lang', lang);
  history.replaceState(null, '', `?${params.toString()}`);
}

// ── App ─────────────────────────────────────────────────────────────────────

const DARK_BG = 'rgb(2, 0, 28)';
const PROGRESS_BAR_HEIGHT = 62;

export default function App() {
  const session = loadSession();
  const [modeIndex, setModeIndex] = useState(session.modeIndex);
  const [completed, setCompleted] = useState<Set<number>>(session.completed);
  const [done, setDone] = useState(false);

  const [locale, setLocale] = useState(getInitialLocale);
  const [strings, setStrings] = useState<Record<string, string> | undefined>();

  useEffect(() => {
    loadStrings(locale)
      .then(setStrings)
      .catch(() => setStrings(undefined));
  }, [locale]);

  // Persist progress to sessionStorage on every change.
  useEffect(() => {
    saveSession(modeIndex, completed);
  }, [modeIndex, completed]);

  function navigate(index: number) {
    setModeIndex(index);
    setDone(false);
  }

  function handleContinue() {
    const next = modeIndex + 1;
    setCompleted(prev => new Set([...prev, modeIndex]));
    if (next < MODES.length) {
      setModeIndex(next);
    } else {
      setDone(true);
    }
  }

  function handlePlayAgain() {
    setCompleted(new Set());
    setModeIndex(0);
    setDone(false);
  }

  function handleLocaleChange(lang: string) {
    setLocale(lang);
    setLangParam(lang);
  }

  const langSelector = (
    <select
      value={locale}
      onChange={e => handleLocaleChange(e.target.value)}
      style={{
        position: 'fixed',
        top: 8,
        right: 8,
        zIndex: 100,
        background: 'rgba(0,0,0,0.6)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 4,
        padding: '3px 6px',
        fontSize: 12,
        cursor: 'pointer',
      }}
      aria-label="Language"
    >
      {Object.entries(SUPPORTED_LOCALES).map(([code, name]) => (
        <option key={code} value={code} style={{background: '#111'}}>
          {name}
        </option>
      ))}
    </select>
  );

  const steps = buildSteps(strings);
  const progress = (
    <Progress
      steps={steps}
      currentIndex={done ? -1 : modeIndex}
      completedIndices={done ? new Set(steps.map(s => s.index)) : completed}
      onNavigate={navigate}
    />
  );

  const labHeight = `calc(100vh - ${PROGRESS_BAR_HEIGHT}px)`;

  if (done) {
    return (
      <>
        {langSelector}
        {progress}
        <div
          data-testid="play-again-screen"
          style={{
            marginTop: PROGRESS_BAR_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100vw',
            height: labHeight,
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
      </>
    );
  }

  return (
    <>
      {langSelector}
      {progress}
      <div
        data-testid="lab-area"
        data-mode={MODES[modeIndex]}
        style={{
          marginTop: PROGRESS_BAR_HEIGHT,
          width: '100vw',
          height: labHeight,
          background: DARK_BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{width: '100%', maxWidth: `calc(${labHeight} * 16 / 9)`}}>
          <OceansLab
              appMode={MODES[modeIndex] as AppMode}
              guides="HoC"
              textToSpeechLocale={locale !== 'en' ? locale : undefined}
              strings={strings}
              onContinue={handleContinue}
            />
        </div>
      </div>
    </>
  );
}
