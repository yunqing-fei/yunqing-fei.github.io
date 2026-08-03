# Design QA

## Evidence

- Source visual truth: `/Users/nolan/Documents/Educatgion/motion-lab/source-option-1.png`
- Normalized source: `/Users/nolan/Documents/Educatgion/motion-lab/source-option-1-normalized.png`
- Desktop implementation: `/Users/nolan/Documents/Educatgion/motion-lab/implementation-desktop-active.png`
- Portrait implementation: `/Users/nolan/Documents/Educatgion/motion-lab/implementation-mobile-final.png`
- Landscape implementation: `/Users/nolan/Documents/Educatgion/motion-lab/implementation-landscape-final.png`
- Aqua Blue SU7 desktop recheck: `/Users/nolan/Documents/Educatgion/motion-lab/implementation-su7-desktop.png`
- Aqua Blue SU7 portrait recheck: `/Users/nolan/Documents/Educatgion/motion-lab/implementation-su7-mobile.png`
- Aqua Blue SU7 landscape recheck: `/Users/nolan/Documents/Educatgion/motion-lab/implementation-su7-landscape.png`
- Full-view comparison: `/Users/nolan/Documents/Educatgion/motion-lab/design-comparison-desktop.png`
- Focused controls comparison: `/Users/nolan/Documents/Educatgion/motion-lab/design-comparison-controls.png`
- Focused graphs comparison: `/Users/nolan/Documents/Educatgion/motion-lab/design-comparison-graphs.png`
- Desktop CSS viewport override: 1440 × 1024. In-app browser capture: 1389 × 1013 pixels.
- Source pixels: 1487 × 1058. The source was center-cropped to the implementation aspect ratio and resampled to 1389 × 1013 for equal-pixel comparison.
- Portrait CSS viewport override: 390 × 844. Capture: 375 × 812 pixels.
- Landscape CSS viewport override: 844 × 390. Capture: 829 × 383 pixels.
- Density normalization: source and implementation were compared at the same final pixel dimensions; no browser or device frame was included.
- State: live accelerated run at target 16 m/s, elapsed 2.5 s, speed 15.9 m/s, acceleration 0.12 m/s², distance 37.9 m.

## Findings

No actionable P0, P1, or P2 differences remain.

- Fonts and typography: the implementation preserves the source's handwritten notebook accent, high-contrast navy display text, compact uppercase labels, and readable scientific units. System-safe font stacks avoid a GitHub Pages runtime dependency.
- Spacing and layout rhythm: the final desktop proportions closely match the source: slim brand bar, compact track, one-row controls, paired graphs, and the learning strip visible in the same viewport. Portrait stacks metrics, controls, and graphs without horizontal overflow. Landscape uses a compact track and hides annotations that would collide with the two-column metric block.
- Colors and tokens: cream paper, navy ink, cobalt data, green distance, coral acceleration/control, and pale tinted icon surfaces map consistently to the source.
- Image quality and asset fidelity: the road scene and isolated car are full-resolution generated raster assets rather than CSS/vector stand-ins. Both remain sharp at desktop and mobile sizes, and the car layer moves independently over the track.
- Copy and content: visible labels, units, equations, graph titles, state explanations, and control names were checked. The additional energy/momentum/stopping lesson is below the primary experience and does not alter the selected visual hierarchy.
- Interaction and accessibility: play/pause, faster, slower, reset, speed slider, dark theme, expandable advanced physics, and keyboard controls work. Focus styles, semantic labels, reduced-motion handling, and responsive reflow are present.

## Comparison History

1. Initial comparison found a P1 hierarchy drift: a large editorial hero heading pushed the simulator and graphs below the source's above-the-fold composition. The heading was removed from the visible layout while retaining an accessible H1. Post-fix evidence: `implementation-desktop-top-v2.png`.
2. The next pass found a P2 proportion mismatch: the road and graph panels were materially taller than the source, leaving the learning strip below the viewport. Track height, control height, graph height, graph padding, and lesson rhythm were reduced. Post-fix evidence: `design-comparison-desktop.png`, where the track, both graphs, learning headline, and all four concept results are visible together.
3. Landscape inspection found a P2 overlap between the handwritten prompt/status and the 2 × 2 metric block. Those annotations now hide below 1050 px and the landscape track uses a compact 260 px height. Post-fix evidence: `implementation-landscape-final.png`.
4. Extended live testing exposed a P1 stability risk from re-rendering the full React/chart tree every animation frame. Physics integration remains requestAnimationFrame-based, while visible UI updates are throttled to 80 ms and graph samples to 200 ms. A fresh-browser post-fix run updated both chart paths and metrics with no console warnings or errors.
5. Portrait recheck confirmed `scrollWidth` equals rendered body width (375 px) at the 390 × 844 override, with no horizontal overflow. Post-fix evidence: `implementation-mobile-final.png`.
6. The user-directed vehicle update replaces the coral generic sedan with an Aqua Blue Xiaomi SU7 cutout. The isolated asset keeps the same right-facing side-profile framing, so motion behavior and track geometry remain unchanged.

## Primary Interactions Tested

- Play changes the state to running and advances time and distance.
- Faster increases the target speed and produces positive acceleration and a rising speed-time trace.
- Reset returns speed, distance, acceleration, time, graph history, and play state to defaults.
- The advanced-physics disclosure opens three calculated sections and exposes the vehicle-mass control.
- Desktop, portrait, and landscape views render without horizontal overflow.
- Browser console warnings/errors checked: none in the final run.

## Follow-up Polish

- P3: the source's handwritten curved arrow and faint paper-grid texture are simplified in the implementation to keep the interface crisp and avoid decorative image clutter.
- P3: graph hover tooltips are functional but are not pinned by default like the illustrative callouts in the static source mock.

## Implementation Checklist

- [x] Source and implementation normalized and compared at equal pixels.
- [x] Desktop source hierarchy reproduced.
- [x] Primary physics controls and graphs function together.
- [x] Portrait and landscape breakpoints verified.
- [x] No final console errors.
- [x] Production build and Sites packaging tests pass.

final result: passed
