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

function setLangParam(lang: string) {
  const params = new URLSearchParams(window.location.search);
  params.set('lang', lang);
  history.replaceState(null, '', `?${params.toString()}`);
}

// ── App ─────────────────────────────────────────────────────────────────────

const DARK_BG = 'rgb(2, 0, 28)';

export default function App() {
  const session = loadSession();
  const [modeIndex, setModeIndex] = useState(session.modeIndex);
  const [completed, setCompleted] = useState<Set<number>>(session.completed);
  const [done, setDone] = useState(false);

  const [locale, setLocale] = useState(getInitialLocale);
  // The locale+strings pair actually fed to OceansLab. Updated only after the
  // strings chunk resolves, so the lab never renders a locale whose strings
  // are still in flight; the stale flag drops superseded loads when the user
  // switches languages faster than chunks arrive.
  const [applied, setApplied] = useState<{
    locale: string;
    strings?: Record<string, string>;
  }>({locale: 'en'});

  useEffect(() => {
    let stale = false;
    loadStrings(locale)
      .then(strings => {
        if (!stale) setApplied({locale, strings});
      })
      .catch(() => {
        if (!stale) setApplied({locale, strings: undefined});
      });
    return () => {
      stale = true;
    };
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

  const steps = buildSteps(applied.strings);
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
          {/* key forces a clean remount on language change — the lab does not
              support live strings/textToSpeechLocale swaps mid-animation (on
              code.org a locale change is a full page reload). */}
          <OceansLab
            key={applied.locale}
            appMode={MODES[modeIndex] as AppMode}
            guides="HoC"
            textToSpeechLocale={applied.locale !== 'en' ? applied.locale : undefined}
            strings={applied.strings}
            onContinue={handleContinue}
          />
        </div>
      </div>
    </div>
  );
}
