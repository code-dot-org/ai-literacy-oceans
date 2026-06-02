import React, {useEffect, useState} from 'react';

export interface Step {
  index: number;
  label: string;
}

interface ProgressProps {
  steps: Step[];
  currentIndex: number;
  completedIndices: ReadonlySet<number>;
  onNavigate: (index: number) => void;
}

type StepState = 'completed' | 'current' | 'upcoming';

const DOT_SIZE = 28;
// Labels are hidden below this viewport width (dots-only on mobile).
const LABEL_BREAKPOINT = 480;

const COLOR = {
  completed: '#22c55e',
  current: '#38bdf8',
  upcoming: 'transparent',
  lineActive: '#22c55e',
  lineInactive: 'rgba(255,255,255,0.15)',
  textBright: 'rgba(255,255,255,0.9)',
  textDim: 'rgba(255,255,255,0.55)',
};

function getState(
  index: number,
  current: number,
  completed: ReadonlySet<number>,
): StepState {
  if (completed.has(index)) return 'completed';
  if (index === current) return 'current';
  return 'upcoming';
}

function Dot({state, number}: {state: StepState; number: number}) {
  const shared = {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
    fontWeight: 700,
    fontSize: 13,
    transition: 'background 0.25s, box-shadow 0.25s',
    flexShrink: 0,
  } as const;

  if (state === 'completed') {
    return <div style={{...shared, background: COLOR.completed, color: '#fff'}}>✓</div>;
  }
  if (state === 'current') {
    return (
      <div
        style={{
          ...shared,
          background: COLOR.current,
          color: '#fff',
          boxShadow: '0 0 0 4px rgba(56,189,248,0.3)',
        }}
      >
        {number}
      </div>
    );
  }
  return (
    <div
      style={{
        ...shared,
        background: COLOR.upcoming,
        border: '2px solid rgba(255,255,255,0.5)',
        color: 'rgba(255,255,255,0.7)',
      }}
    >
      {number}
    </div>
  );
}

export default function Progress({
  steps,
  currentIndex,
  completedIndices,
  onNavigate,
}: ProgressProps) {
  const [showLabels, setShowLabels] = useState(
    () => window.innerWidth >= LABEL_BREAKPOINT,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LABEL_BREAKPOINT}px)`);
    const handler = (e: MediaQueryListEvent) => setShowLabels(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div
      style={{
        background: 'rgba(2,0,28,0.95)',
        padding: showLabels ? '8px 24px 10px' : '8px 16px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{width: '100%', maxWidth: 640}}>
        {/* Row 1: dots + connector lines — fixed height, connectors stay centered */}
        <div style={{display: 'flex', alignItems: 'center'}}>
          {steps.map((step, i) => {
            const state = getState(step.index, currentIndex, completedIndices);
            const isLast = i === steps.length - 1;
            return (
              <React.Fragment key={step.index}>
                <button
                  data-testid={`step-${step.index}`}
                  data-state={state}
                  onClick={() => onNavigate(step.index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    flexShrink: 0,
                    lineHeight: 0,
                  }}
                  aria-label={step.label}
                >
                  <Dot state={state} number={step.index + 1} />
                </button>
                {!isLast && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background: completedIndices.has(step.index)
                        ? COLOR.lineActive
                        : COLOR.lineInactive,
                      transition: 'background 0.4s',
                      minWidth: 12,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Row 2: labels centered under each dot — hidden on narrow screens */}
        {showLabels && <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginTop: 4,
          }}
        >
          {steps.map((step, i) => {
            const state = getState(step.index, currentIndex, completedIndices);
            const isLast = i === steps.length - 1;
            return (
              <React.Fragment key={step.index}>
                {/* Label occupies the same width as the dot so it centers under it */}
                <div
                  style={{
                    width: DOT_SIZE,
                    flexShrink: 0,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      width: 72,
                      textAlign: 'center',
                      fontSize: 10,
                      fontFamily: 'sans-serif',
                      lineHeight: 1.3,
                      color: state === 'upcoming' ? COLOR.textDim : COLOR.textBright,
                      transition: 'color 0.25s',
                      wordBreak: 'break-word',
                      hyphens: 'auto',
                    }}
                  >
                    {step.label}
                  </span>
                </div>
                {/* Spacer that mirrors the connector line so labels stay aligned */}
                {!isLast && <div style={{flex: 1, minWidth: 12}} />}
              </React.Fragment>
            );
          })}
        </div>}
      </div>
    </div>
  );
}
