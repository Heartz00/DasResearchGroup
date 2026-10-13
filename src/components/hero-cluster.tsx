'use client';
import dynamic from 'next/dynamic';
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Photo } from '@/lib/content/types';
import ScientificImage from './scientific-image';
import type { ClusterControls } from './cluster-scene';
import './cluster.css';

const Scene = dynamic(() => import('./cluster-scene'), { ssr: false });
class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function HeroCluster({ photo }: { photo?: Photo }) {
  const viewport = useRef<HTMLDivElement>(null);
  const controls = useRef<ClusterControls>({
    x: 0.24,
    y: 0.4,
    pointerX: 0,
    pointerY: 0,
    dragging: false,
    paused: false,
  });
  const last = useRef({ x: 0, y: 0 });
  const [options, setOptions] = useState<{
    mobile: boolean;
    reduced: boolean;
    active: boolean;
  } | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => setFailed(true), []);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const mobile = window.matchMedia('(max-width: 760px), (pointer: coarse)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let supported: boolean | undefined;
    const update = () => {
      if (supported === undefined && visible) {
        try {
          const probe = document.createElement('canvas').getContext('webgl2');
          supported = !!probe;
          probe?.getExtension('WEBGL_lose_context')?.loseContext();
        } catch {
          supported = false;
        }
      }
      const connection = (
        navigator as Navigator & { connection?: { saveData?: boolean } }
      ).connection;
      if (visible && (supported === false || connection?.saveData))
        setFailed(true);
      if (supported && !connection?.saveData)
        setOptions({
          mobile: mobile.matches,
          reduced: motion.matches,
          active: visible && !document.hidden,
        });
    };
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        update();
      },
      { rootMargin: '80px' },
    );
    observer.observe(element);
    mobile.addEventListener('change', update);
    motion.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      mobile.removeEventListener('change', update);
      motion.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  const redraw = () => controls.current.invalidate?.();
  return (
    <div className="hero-science cluster-figure">
      <div
        ref={viewport}
        className={`cluster-viewport ${ready && !failed ? 'cluster-ready' : ''} ${failed ? 'cluster-failed' : ''}`}
        role="group"
        aria-label="Illustrative gold nanocluster visualization"
        aria-describedby="cluster-help"
        tabIndex={ready && !options?.mobile ? 0 : undefined}
        onKeyDown={(event) => {
          if (event.code === 'Space') {
            event.preventDefault();
            controls.current.paused = !paused;
            setPaused(!paused);
            return;
          }
          if (event.key === 'Home') {
            event.preventDefault();
            controls.current.x = 0.24;
            controls.current.y = 0.4;
            redraw();
            return;
          }
          if (
            !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
              event.key,
            )
          )
            return;
          event.preventDefault();
          if (event.key === 'ArrowLeft') controls.current.y -= 0.12;
          if (event.key === 'ArrowRight') controls.current.y += 0.12;
          if (event.key === 'ArrowUp') controls.current.x -= 0.12;
          if (event.key === 'ArrowDown') controls.current.x += 0.12;
          redraw();
        }}
        onPointerDown={(event) => {
          if (!ready || options?.mobile || event.button !== 0) return;
          controls.current.dragging = true;
          last.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (options?.mobile || !ready) return;
          const box = event.currentTarget.getBoundingClientRect();
          if (controls.current.dragging) {
            controls.current.y += (event.clientX - last.current.x) * 0.006;
            controls.current.x = Math.max(
              -1.1,
              Math.min(
                1.1,
                controls.current.x + (event.clientY - last.current.y) * 0.006,
              ),
            );
            last.current = { x: event.clientX, y: event.clientY };
          } else if (!options?.reduced) {
            controls.current.pointerX =
              (event.clientX - box.left) / box.width - 0.5;
            controls.current.pointerY =
              (event.clientY - box.top) / box.height - 0.5;
          }
          redraw();
        }}
        onPointerUp={(event) => {
          controls.current.dragging = false;
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          controls.current.dragging = false;
        }}
        onLostPointerCapture={() => {
          controls.current.dragging = false;
        }}
        onPointerLeave={() => {
          controls.current.pointerX = 0;
          controls.current.pointerY = 0;
          redraw();
        }}
      >
        <div className="cluster-poster" aria-hidden={!failed}>
          {photo && failed ? (
            <ScientificImage
              photo={{
                ...photo,
                alt:
                  photo.alt ||
                  'Scientific research montage from the Das Research Group',
              }}
            />
          ) : (
            <div
              className="cluster-static"
              role="img"
              aria-label="Static illustrative gold nanocluster"
            >
              <svg viewBox="0 0 400 360" aria-hidden="true">
                <g stroke="#856b43" strokeWidth="2">
                  <path d="M200 85 290 150 265 250 135 250 110 150Z M200 85 200 185 290 150 M200 185 265 250 M200 185 135 250 M200 185 110 150" />
                </g>
                <g fill="#d8b56b" stroke="#f0d89c">
                  {[
                    [200, 85],
                    [290, 150],
                    [265, 250],
                    [135, 250],
                    [110, 150],
                    [200, 185],
                  ].map(([x, y]) => (
                    <circle key={`${x}-${y}`} cx={x} cy={y} r="18" />
                  ))}
                </g>
              </svg>
            </div>
          )}
        </div>
        {options && !failed && (
          <SceneBoundary onFailure={onFailure}>
            <Scene
              controls={controls}
              {...options}
              paused={paused}
              onReady={onReady}
              onFailure={onFailure}
            />
          </SceneBoundary>
        )}
      </div>
      <p id="cluster-help" className="visually-hidden">
        {ready && !failed
          ? options?.mobile
            ? 'Illustrative gold structure, simplified mobile view. Reduced motion uses extremely slow automatic rotation.'
            : 'Illustrative gold structure. Drag or use arrow keys to rotate. Space pauses or resumes automatic rotation; Home resets the orientation.'
          : 'Scientific visual · static preview'}
      </p>
    </div>
  );
}
