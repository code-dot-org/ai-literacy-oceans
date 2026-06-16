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
  'Labels Shape A.I.',
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

// A language change is a full iframe reload, not a live prop swap. OceansLab
// holds locale-dependent state in module-level singletons — a cached overlay
// React root, a global mutable state object, the audio/TTS engine, and pending
// timers — none of which a React remount or in-place prop update resets. (On
// code.org a locale change is likewise a full page reload.) Reloading tears all
// of that down: audio/speechSynthesis stop on navigation and the lab re-inits
// cleanly for the new locale. Progress persists in sessionStorage, so the user
// stays on the same mode; only the current mode's animation restarts.
function reloadWithLang(lang: string) {
  window.speechSynthesis?.cancel(); // stop TTS immediately, before the reload
  const params = new URLSearchParams(window.location.search);
  params.set('lang', lang);
  window.location.search = params.toString();
}

// ── App ─────────────────────────────────────────────────────────────────────

const DARK_BG = 'rgb(2, 0, 28)';

export default function App() {
  const session = loadSession();
  const [modeIndex, setModeIndex] = useState(session.modeIndex);
  const [completed, setCompleted] = useState<Set<number>>(session.completed);
  const [done, setDone] = useState(false);

  // Locale is fixed for the lifetime of the page — changing it reloads the
  // iframe (see reloadWithLang), so this never changes after mount.
  const [locale] = useState(getInitialLocale);
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
    if (lang === locale) return;
    reloadWithLang(lang);
  }

  const langSelector = (
    <select
      value={locale}
      onChange={e => handleLocaleChange(e.target.value)}
      style={{
        position: 'fixed',
        bottom: 8,
        left: 8,
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

  // Flex column: bar (natural height) → canvas (fills rest). The canvas
  // constrains itself to 16:9 via aspect-ratio; the iframe embed adds the
  // bar height on top of the 16:9 canvas height.
  const column: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: DARK_BG,
    overflow: 'hidden',
  };

  const canvasArea: React.CSSProperties = {
    flex: 1,
    minHeight: 0, // allow flex child to shrink below content size
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (done) {
    return (
      <div style={column}>
        {langSelector}
        {progress}
        <div
          data-testid="play-again-screen"
          style={{...canvasArea}}
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
      </div>
    );
  }

  return (
    <div style={column}>
      {langSelector}
      {progress}
      <div
        data-testid="lab-area"
        data-mode={MODES[modeIndex]}
        style={canvasArea}
      >
        {/* height:100% + aspect-ratio gives a true 16:9 box inside the flex area */}
        <div style={{height: '100%', aspectRatio: '16/9', maxWidth: '100%'}}>
          <OceansLab
            appMode={MODES[modeIndex] as AppMode}
            guides="HoC"
            textToSpeechLocale={locale !== 'en' ? locale : undefined}
            strings={strings}
            onContinue={handleContinue}
          />
        </div>
      </div>
    </div>
  );
}
