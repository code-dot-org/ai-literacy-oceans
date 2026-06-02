import type {CSSProperties} from 'react';

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

const COLORS = {
  completed: '#22c55e',
  current: '#38bdf8',
  upcoming: 'rgba(255,255,255,0.2)',
  line: 'rgba(255,255,255,0.15)',
  lineFilled: '#22c55e',
  text: 'rgba(255,255,255,0.9)',
  textDim: 'rgba(255,255,255,0.4)',
};

function stepState(index: number, current: number, completed: ReadonlySet<number>): StepState {
  if (completed.has(index)) return 'completed';
  if (index === current) return 'current';
  return 'upcoming';
}

function Dot({state, number}: {state: StepState; number: number}) {
  const base: CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
    transition: 'background 0.25s, box-shadow 0.25s',
  };

  if (state === 'completed') {
    return (
      <div style={{...base, background: COLORS.completed, color: '#fff'}}>
        ✓
      </div>
    );
  }
  if (state === 'current') {
    return (
      <div
        style={{
          ...base,
          background: COLORS.current,
          color: '#fff',
          boxShadow: `0 0 0 4px rgba(56,189,248,0.3)`,
        }}
      >
        {number}
      </div>
    );
  }
  return (
    <div
      style={{
        ...base,
        background: 'transparent',
        border: `2px solid ${COLORS.upcoming}`,
        color: COLORS.textDim,
      }}
    >
      {number}
    </div>
  );
}

export default function Progress({steps, currentIndex, completedIndices, onNavigate}: ProgressProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(2,0,28,0.85)',
        backdropFilter: 'blur(8px)',
        padding: '10px 24px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 0,
          maxWidth: 600,
          width: '100%',
        }}
      >
        {steps.map((step, i) => {
          const state = stepState(step.index, currentIndex, completedIndices);
          const isLast = i === steps.length - 1;

          return (
            <div
              key={step.index}
              style={{display: 'flex', alignItems: 'flex-start', flex: isLast ? 0 : 1}}
            >
              {/* Step */}
              <button
                onClick={() => onNavigate(step.index)}
                title={step.label}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  flexShrink: 0,
                }}
              >
                <Dot state={state} number={step.index + 1} />
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'sans-serif',
                    color: state === 'upcoming' ? COLORS.textDim : COLORS.text,
                    whiteSpace: 'nowrap',
                    maxWidth: 72,
                    textAlign: 'center',
                    lineHeight: 1.2,
                    transition: 'color 0.25s',
                  }}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    marginTop: 15,
                    background: completedIndices.has(step.index)
                      ? COLORS.lineFilled
                      : COLORS.line,
                    transition: 'background 0.4s',
                    minWidth: 16,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
