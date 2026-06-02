import React, {useRef, useState} from 'react';

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

const DOT = 28;

const COLOR = {
  completed: '#22c55e',
  current: '#38bdf8',
  lineActive: '#22c55e',
  lineInactive: 'rgba(255,255,255,0.18)',
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
  const base: React.CSSProperties = {
    width: DOT,
    height: DOT,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
    fontWeight: 700,
    fontSize: 12,
    transition: 'background 0.2s, box-shadow 0.2s',
    flexShrink: 0,
    userSelect: 'none',
  };
  if (state === 'completed')
    return <div style={{...base, background: COLOR.completed, color: '#fff'}}>✓</div>;
  if (state === 'current')
    return (
      <div style={{
        ...base,
        background: COLOR.current,
        color: '#fff',
        boxShadow: '0 0 0 4px rgba(56,189,248,0.28)',
      }}>{number}</div>
    );
  return (
    <div style={{
      ...base,
      background: 'transparent',
      border: '2px solid rgba(255,255,255,0.45)',
      color: 'rgba(255,255,255,0.65)',
    }}>{number}</div>
  );
}

function StepButton({step, state, onNavigate}: {
  step: Step;
  state: StepState;
  onNavigate: (i: number) => void;
}) {
  const [tip, setTip] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const show = () => setTip(true);
  const hide = () => { clearTimeout(timer.current); setTip(false); };
  const longStart = () => { timer.current = setTimeout(show, 400); };
  const longEnd = () => { clearTimeout(timer.current); setTip(false); };

  return (
    <div style={{position: 'relative', flexShrink: 0}}>
      <button
        data-testid={`step-${step.index}`}
        data-state={state}
        onClick={() => onNavigate(step.index)}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onTouchStart={longStart}
        onTouchEnd={longEnd}
        onTouchCancel={longEnd}
        aria-label={step.label}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          lineHeight: 0,
          display: 'block',
        }}
      >
        <Dot state={state} number={step.index + 1} />
      </button>

      {tip && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.88)',
          color: '#fff',
          fontSize: 11,
          fontFamily: 'sans-serif',
          lineHeight: 1.3,
          padding: '5px 9px',
          borderRadius: 5,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 200,
        }}>
          {step.label}
          {/* arrow */}
          <span style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: 5,
            borderStyle: 'solid',
            borderColor: 'rgba(0,0,0,0.88) transparent transparent transparent',
          }} />
        </div>
      )}
    </div>
  );
}

export default function Progress({steps, currentIndex, completedIndices, onNavigate}: ProgressProps) {
  return (
    <div style={{
      background: 'rgba(2,0,28,0.95)',
      padding: '10px 24px',
      flexShrink: 0,
      display: 'flex',
      justifyContent: 'center',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: 560,
      }}>
        {steps.map((step, i) => {
          const state = getState(step.index, currentIndex, completedIndices);
          const isLast = i === steps.length - 1;
          return (
            <React.Fragment key={step.index}>
              <StepButton step={step} state={state} onNavigate={onNavigate} />
              {!isLast && (
                <div style={{
                  flex: 1,
                  height: 2,
                  background: completedIndices.has(step.index)
                    ? COLOR.lineActive
                    : COLOR.lineInactive,
                  transition: 'background 0.4s',
                  minWidth: 12,
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
