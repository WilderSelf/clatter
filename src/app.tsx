// Placeholder screen. Unit 2.0 replaces this with the approved design.
import { useRef, useState } from 'preact/hooks';
import { mountTray } from './tray/scene';

export const APP_NAME = 'Clatter';

type TrayState = 'idle' | 'loading' | 'ready' | 'failed';

const TRAY_MESSAGE: Record<TrayState, string> = {
  idle: 'The dice tray is not loaded.',
  loading: 'The dice tray is loading.',
  ready: 'The dice tray is loaded.',
  failed: 'The dice tray did not load.',
};

export function App() {
  // Provisional. Phase 2 owns the real screen. The button stays, so the tray
  // chunk is fetched by a deliberate act rather than on first paint.
  const [tray, setTray] = useState<TrayState>('idle');
  const container = useRef<HTMLDivElement>(null);

  return (
    <main>
      <h1>{APP_NAME}</h1>
      <button
        type="button"
        disabled={tray !== 'idle'}
        onClick={() => {
          const element = container.current;
          if (!element) return;
          setTray('loading');
          mountTray(element).then(
            () => setTray('ready'),
            () => setTray('failed'),
          );
        }}
      >
        Show the dice tray
      </button>
      <p role="status">{TRAY_MESSAGE[tray]}</p>
      <div ref={container} style={{ width: '100%', height: '60vh' }} />
    </main>
  );
}
