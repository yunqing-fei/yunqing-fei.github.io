import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowsLeftRight,
  CarProfile,
  ChartLineUp,
  Clock,
  Gauge,
  Lightning,
  Moon,
  Pause,
  Play,
  Plus,
  Rewind,
  Ruler,
  Sparkle,
  Sun,
  Timer,
  TrendUp,
  Wind,
} from "@phosphor-icons/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MAX_SPEED = 30;
const TRACK_LENGTH = 300;
const DEFAULT_SPEED = 12;
const MAX_ACCELERATION = 4;
const HISTORY_LIMIT = 150;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, places = 1) => Number(value.toFixed(places));

function ChartTooltip({ active, payload, label, unit, valueLabel }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span>{Number(label).toFixed(1)} s</span>
      <strong>
        {Number(payload[0].value).toFixed(1)} {unit}
      </strong>
      <small>{valueLabel}</small>
    </div>
  );
}

function Metric({ icon: Icon, label, value, unit, tone = "blue" }) {
  return (
    <div className="metric">
      <span className={`metric-icon metric-icon-${tone}`} aria-hidden="true">
        <Icon weight="duotone" />
      </span>
      <span className="metric-copy">
        <span className="metric-label">{label}</span>
        <span className={`metric-value metric-value-${tone}`}>{value}</span>
        <span className="metric-unit">{unit}</span>
      </span>
    </div>
  );
}

function Concept({ icon: Icon, title, children, formula, tone }) {
  return (
    <article className="concept">
      <span className={`concept-icon concept-icon-${tone}`} aria-hidden="true">
        <Icon weight="duotone" />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
        <strong className={`concept-result concept-result-${tone}`}>{formula}</strong>
      </div>
    </article>
  );
}

export function App() {
  const [targetSpeed, setTargetSpeed] = useState(DEFAULT_SPEED);
  const targetSpeedRef = useRef(DEFAULT_SPEED);
  const [mass, setMass] = useState(1000);
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const simRef = useRef({ speed: DEFAULT_SPEED, acceleration: 0, distance: 0, time: 0 });
  const [sim, setSim] = useState(simRef.current);
  const historyRef = useRef([{ time: 0, speed: DEFAULT_SPEED, distance: 0 }]);
  const [history, setHistory] = useState(historyRef.current);
  const lastFrameRef = useRef(null);
  const lastSampleRef = useRef(0);
  const lastUiUpdateRef = useRef(0);

  useEffect(() => {
    targetSpeedRef.current = targetSpeed;
  }, [targetSpeed]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const reset = useCallback(() => {
    const initial = { speed: DEFAULT_SPEED, acceleration: 0, distance: 0, time: 0 };
    simRef.current = initial;
    historyRef.current = [{ time: 0, speed: DEFAULT_SPEED, distance: 0 }];
    setSim(initial);
    setHistory(historyRef.current);
    setTargetSpeed(DEFAULT_SPEED);
    targetSpeedRef.current = DEFAULT_SPEED;
    lastSampleRef.current = 0;
    lastUiUpdateRef.current = 0;
    lastFrameRef.current = null;
    setRunning(false);
    runningRef.current = false;
  }, []);

  const nudgeSpeed = useCallback((amount) => {
    setTargetSpeed((current) => clamp(current + amount, 0, MAX_SPEED));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "BUTTON") return;
      if (event.code === "Space") {
        event.preventDefault();
        setRunning((value) => !value);
      }
      if (event.code === "ArrowUp" || event.code === "ArrowRight") {
        event.preventDefault();
        nudgeSpeed(1);
      }
      if (event.code === "ArrowDown" || event.code === "ArrowLeft") {
        event.preventDefault();
        nudgeSpeed(-1);
      }
      if (event.key.toLowerCase() === "r") reset();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nudgeSpeed, reset]);

  useEffect(() => {
    let frameId;
    const tick = (timestamp) => {
      if (lastFrameRef.current === null) lastFrameRef.current = timestamp;
      const delta = clamp((timestamp - lastFrameRef.current) / 1000, 0, 0.05);
      lastFrameRef.current = timestamp;

      if (runningRef.current) {
        const previous = simRef.current;
        const difference = targetSpeedRef.current - previous.speed;
        const acceleration = Math.abs(difference) < 0.025
          ? 0
          : clamp(difference * 1.65, -MAX_ACCELERATION, MAX_ACCELERATION);
        const nextSpeed = clamp(previous.speed + acceleration * delta, 0, MAX_SPEED);
        const nextTime = previous.time + delta;
        const nextDistance = previous.distance + ((previous.speed + nextSpeed) / 2) * delta;
        const next = {
          speed: nextSpeed,
          acceleration,
          distance: nextDistance,
          time: nextTime,
        };
        simRef.current = next;
        if (timestamp - lastUiUpdateRef.current >= 80) {
          lastUiUpdateRef.current = timestamp;
          setSim(next);
        }

        if (nextTime - lastSampleRef.current >= 0.2) {
          lastSampleRef.current = nextTime;
          const points = [
            ...historyRef.current,
            {
              time: round(nextTime, 2),
              speed: round(nextSpeed, 2),
              distance: round(nextDistance, 2),
            },
          ].slice(-HISTORY_LIMIT);
          historyRef.current = points;
          setHistory(points);
        }
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const averageSpeed = sim.time > 0 ? sim.distance / sim.time : sim.speed;
  const momentum = mass * sim.speed;
  const kineticEnergy = 0.5 * mass * sim.speed * sim.speed;
  const stoppingDistance = sim.speed * sim.speed / (2 * 0.7 * 9.81);
  const trackProgress = (sim.distance % TRACK_LENGTH) / TRACK_LENGTH;
  const lap = Math.floor(sim.distance / TRACK_LENGTH) + 1;
  const speedTrend = sim.acceleration > 0.08 ? "speeding up" : sim.acceleration < -0.08 ? "slowing down" : "moving at constant speed";

  const graphDomain = useMemo(() => {
    const first = history[0]?.time ?? 0;
    const last = history.at(-1)?.time ?? 10;
    return [Math.floor(first), Math.max(10, Math.ceil(last))];
  }, [history]);

  return (
    <div className="app-shell" data-theme={darkMode ? "dark" : "light"}>
      <header className="topbar">
        <a className="brand" href="#simulator" aria-label="Motion Lab home">
          <span className="brand-mark" aria-hidden="true"><CarProfile weight="duotone" /></span>
          <span>
            <strong>Motion Lab</strong>
            <small>Kinetic notebook</small>
          </span>
        </a>
        <div className="header-actions">
          <span className="keyboard-hint">Space: play · ↑↓: speed · R: reset</span>
          <button
            className="icon-button"
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} theme`}
          >
            {darkMode ? <Sun weight="bold" /> : <Moon weight="bold" />}
          </button>
        </div>
      </header>

      <main id="simulator">
        <section className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title" className="sr-only">Motion Lab interactive motion simulator</h1>
          <div className="track-stage">
            <img className="track-image" src={`${import.meta.env.BASE_URL}assets/road-scene.png`} alt="A countryside road between start and finish signs" />
            <div className="track-shade" />
            <div className="track-prompt"><Sparkle weight="fill" /> Drag the speed control or press Play</div>
            <span className={`status-chip ${running ? "status-running" : ""}`}>
              <span className="status-dot" /> {running ? "Experiment running" : "Experiment paused"}
            </span>
            <div className="metrics-panel" aria-live="polite">
              <Metric icon={Gauge} label="Speed" value={sim.speed.toFixed(1)} unit="m/s" tone="blue" />
              <Metric icon={Ruler} label="Distance" value={sim.distance.toFixed(1)} unit="m" tone="green" />
              <Metric icon={TrendUp} label="Acceleration" value={sim.acceleration.toFixed(2)} unit="m/s²" tone="coral" />
              <Metric icon={Clock} label="Elapsed time" value={sim.time.toFixed(1)} unit="s" tone="navy" />
            </div>
            <div className="lap-label">Lap {lap} · {Math.round(trackProgress * TRACK_LENGTH)} m / {TRACK_LENGTH} m</div>
            <img
              className={`moving-car ${running && sim.speed > 0.05 ? "car-driving" : ""}`}
              src={`${import.meta.env.BASE_URL}assets/car-su7-blue.png`}
              alt="Aqua Blue Xiaomi SU7 moving along the test track"
              style={{ "--car-progress": trackProgress }}
            />
          </div>

          <div className="control-deck">
            <div className="speed-control">
              <div className="control-label-row">
                <label htmlFor="speed-range">Set speed</label>
                <output htmlFor="speed-range">{targetSpeed.toFixed(1)} <small>m/s</small></output>
              </div>
              <div className="slider-row">
                <button type="button" className="nudge-button" onClick={() => nudgeSpeed(-1)} aria-label="Decrease target speed by 1 metre per second">
                  <ArrowDown weight="bold" /> <span>Slower</span>
                </button>
                <div className="range-wrap">
                  <input
                    id="speed-range"
                    type="range"
                    min="0"
                    max={MAX_SPEED}
                    step="0.5"
                    value={targetSpeed}
                    onChange={(event) => setTargetSpeed(Number(event.target.value))}
                    style={{ "--range-progress": `${(targetSpeed / MAX_SPEED) * 100}%` }}
                    aria-valuetext={`${targetSpeed.toFixed(1)} metres per second`}
                  />
                  <div className="range-ticks" aria-hidden="true"><span>0</span><span>10</span><span>20</span><span>30 m/s</span></div>
                </div>
                <button type="button" className="nudge-button" onClick={() => nudgeSpeed(1)} aria-label="Increase target speed by 1 metre per second">
                  <ArrowUp weight="bold" /> <span>Faster</span>
                </button>
              </div>
            </div>
            <div className="transport-controls">
              <button className="primary-control" type="button" onClick={() => setRunning((value) => !value)}>
                {running ? <Pause weight="fill" /> : <Play weight="fill" />}
                {running ? "Pause" : "Play"}
              </button>
              <button className="secondary-control" type="button" onClick={reset}>
                <Rewind weight="bold" /> Reset
              </button>
            </div>
          </div>
        </section>

        <section className="graphs-section" aria-labelledby="graphs-title">
          <h2 id="graphs-title" className="sr-only">Live speed and distance graphs</h2>

          <div className="graph-grid">
            <article className="graph-panel">
              <div className="graph-heading">
                <div>
                  <p>Speed vs time</p>
                  <h3>How fast is the car moving?</h3>
                </div>
                <span className="graph-legend graph-legend-blue"><span /> Speed</span>
              </div>
              <div className="chart-wrap" aria-label="Live speed versus time graph">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 12, right: 18, bottom: 6, left: -10 }}>
                    <CartesianGrid stroke="var(--grid-line)" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="time" type="number" domain={graphDomain} tickCount={6} tickFormatter={(value) => `${value}s`} stroke="var(--axis)" fontSize={12} />
                    <YAxis domain={[0, MAX_SPEED]} tickFormatter={(value) => `${value}`} stroke="var(--axis)" fontSize={12} />
                    <Tooltip content={<ChartTooltip unit="m/s" valueLabel="speed" />} />
                    <ReferenceLine y={targetSpeed} stroke="var(--coral)" strokeDasharray="5 5" opacity={0.75} />
                    <Line type="monotone" dataKey="speed" stroke="var(--blue)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "var(--blue)", stroke: "var(--surface)", strokeWidth: 3 }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="graph-note"><TrendUp weight="bold" /> Its slope is acceleration: <strong>{sim.acceleration.toFixed(2)} m/s²</strong>.</p>
            </article>

            <article className="graph-panel">
              <div className="graph-heading">
                <div>
                  <p>Distance vs time</p>
                  <h3>How far has the car travelled?</h3>
                </div>
                <span className="graph-legend graph-legend-green"><span /> Distance</span>
              </div>
              <div className="chart-wrap" aria-label="Live distance versus time graph">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 12, right: 18, bottom: 6, left: -8 }}>
                    <CartesianGrid stroke="var(--grid-line)" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="time" type="number" domain={graphDomain} tickCount={6} tickFormatter={(value) => `${value}s`} stroke="var(--axis)" fontSize={12} />
                    <YAxis domain={[0, "auto"]} width={54} tickFormatter={(value) => `${Math.round(value)}m`} stroke="var(--axis)" fontSize={12} />
                    <Tooltip content={<ChartTooltip unit="m" valueLabel="distance" />} />
                    <Area type="monotone" dataKey="distance" stroke="var(--green)" strokeWidth={3} fill="var(--green-soft)" fillOpacity={0.65} activeDot={{ r: 6, fill: "var(--green)", stroke: "var(--surface)", strokeWidth: 3 }} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="graph-note"><ChartLineUp weight="bold" /> Its slope is speed: <strong>{sim.speed.toFixed(1)} m/s</strong>.</p>
            </article>
          </div>
        </section>

        <section className="lesson-section" aria-labelledby="lesson-title">
          <div className="lesson-heading">
            <p className="handwritten">What’s happening?</p>
            <h2 id="lesson-title">The car is <span>{speedTrend}</span>.</h2>
            <p>{sim.acceleration > 0.08 ? "The speed graph tilts upward and the distance graph gets steeper." : sim.acceleration < -0.08 ? "The speed graph tilts downward and the distance graph becomes less steep." : "The speed graph is flat while distance keeps growing at a steady rate."}</p>
          </div>
          <div className="concept-grid">
            <Concept icon={TrendUp} title="Slope of speed graph" formula={`a = ${sim.acceleration.toFixed(2)} m/s²`} tone="blue">
              Slope shows how quickly velocity changes. A flat line means zero acceleration.
            </Concept>
            <Concept icon={ChartLineUp} title="Slope of distance graph" formula={`v = ${sim.speed.toFixed(1)} m/s`} tone="green">
              A steeper distance line means more distance is covered each second.
            </Concept>
            <Concept icon={Wind} title="Area under speed graph" formula={`d = ${sim.distance.toFixed(1)} m`} tone="coral">
              Adding the speed travelled in every tiny moment gives total distance.
            </Concept>
            <Concept icon={ArrowsLeftRight} title="Average speed" formula={`v̄ = ${averageSpeed.toFixed(1)} m/s`} tone="navy">
              Divide the whole journey’s distance by the whole journey’s time.
            </Concept>
          </div>
          <div className="equation-strip" aria-label="Key motion equations">
            <div><span>Speed</span><strong>v = Δd / Δt</strong></div>
            <div><span>Acceleration</span><strong>a = Δv / Δt</strong></div>
            <div><span>Constant speed</span><strong>d = vt</strong></div>
            <div><span>Average speed</span><strong>v̄ = total d / total t</strong></div>
          </div>
        </section>

        <section className="more-section" aria-labelledby="more-title">
          <button className="more-toggle" type="button" onClick={() => setShowMore((value) => !value)} aria-expanded={showMore} aria-controls="more-physics">
            <span><Lightning weight="duotone" /><span><small>Go further</small><strong id="more-title">Energy, momentum & stopping</strong></span></span>
            <Plus className={showMore ? "toggle-open" : ""} weight="bold" />
          </button>
          {showMore && (
            <div id="more-physics" className="more-content">
              <div className="mass-control">
                <div>
                  <label htmlFor="mass-range">Vehicle mass</label>
                  <p>Speed describes motion; mass changes how hard that motion is to stop.</p>
                </div>
                <div className="mass-input">
                  <input id="mass-range" type="range" min="500" max="2500" step="50" value={mass} onChange={(event) => setMass(Number(event.target.value))} />
                  <output htmlFor="mass-range">{mass.toLocaleString()} kg</output>
                </div>
              </div>
              <div className="physics-grid">
                <article><Lightning weight="duotone" /><span>Kinetic energy</span><strong>{(kineticEnergy / 1000).toFixed(1)} kJ</strong><p>KE = ½mv², so doubling speed makes four times the energy.</p></article>
                <article><CarProfile weight="duotone" /><span>Momentum</span><strong>{Math.round(momentum).toLocaleString()} kg·m/s</strong><p>p = mv, the quantity of motion carried by the vehicle.</p></article>
                <article><Timer weight="duotone" /><span>Ideal braking distance</span><strong>{stoppingDistance.toFixed(1)} m</strong><p>Estimated for a dry road, before adding the driver’s reaction distance.</p></article>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer>
        <span>Motion Lab · Learn by changing one thing at a time.</span>
        <a href="#simulator">Back to the car</a>
      </footer>
    </div>
  );
}
