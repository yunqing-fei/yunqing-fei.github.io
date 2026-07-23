# Global SMR Atlas — SMR Design Database QA

## Comparison target

- Source visual truth:
  - `/Users/nolan/Documents/Nuclear/smr-atlas/source-smr-designs-desktop.png`
  - `/Users/nolan/Documents/Nuclear/smr-atlas/source-smr-designs-mobile.png`
  - `/Users/nolan/Documents/Nuclear/smr-atlas/source-smr-design-detail.png`
- Implementation:
  - `/Users/nolan/Documents/Nuclear/smr-atlas/implementation-designs-desktop.png`
  - `/Users/nolan/Documents/Nuclear/smr-atlas/implementation-designs-mobile.png`
  - `/Users/nolan/Documents/Nuclear/smr-atlas/implementation-design-detail.png`
- Side-by-side evidence:
  - `/Users/nolan/Documents/Nuclear/smr-atlas/design-qa-desktop-comparison.png`
  - `/Users/nolan/Documents/Nuclear/smr-atlas/design-qa-mobile-comparison.png`
  - `/Users/nolan/Documents/Nuclear/smr-atlas/design-qa-detail-comparison.png`
- State: unfiltered catalogue with 133 designs; 4S detailed record; all
  developer-HQ markers enabled on the map.
- CSS viewport: 1440 × 1000 desktop and 390 × 844 mobile.
- Capture pixels:
  - Source desktop 1404 × 1000; implementation desktop 1390 × 990.
  - Source mobile 375 × 812; implementation mobile 375 × 812.
  - Source detail 1390 × 990; implementation detail 1390 × 990.
- Density normalization: all captures are 1× browser captures. Desktop pairs
  retain their native width inside a same-height comparison canvas; mobile and
  detail pairs have identical source and implementation dimensions.

## Browser and interaction evidence

- The catalogue rendered all 133 records and reported 133 coordinate-bearing
  designs, 21 country labels, and five reactor-type families.
- Search for `ACP100` returned two matching records.
- The reset action restored all 133 records.
- The Under construction filter returned the five matching source records.
- The 4S detailed view displayed six technical fields, four applications,
  three narrative paragraphs, and two source news links.
- “Show developer HQ on map” selected 4S and rendered its design detail beside
  the map.
- The map rendered 155 interactive markers: 22 project locations plus 133
  developer-headquarters design markers.
- The mobile “Show filters” action revealed all four catalogue filters.
- Browser console errors: none.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: the implementation keeps the Atlas Inter system while
  matching the source hierarchy of database title, compact metadata,
  specification labels, and card names. Long technical narratives use a
  readable 1.8 line height.
- Spacing and layout rhythm: the source's two-column desktop card grid and
  single-column mobile list are preserved. Filters are consolidated into a
  responsive toolbar to remain consistent with the existing Atlas product.
- Colors and tokens: source information grouping is retained with Atlas navy,
  cobalt, sea-glass, white, and slate tokens. Status and HQ markers retain
  semantic contrast.
- Image and asset fidelity: this screen is data-led and does not require source
  imagery. Icons use the existing Phosphor library; the geographic view uses
  real Leaflet/CARTO tiles. No copied WNA branding, placeholder imagery,
  handmade SVG, or CSS illustration is used.
- Copy and content: all 133 source records retain developer, country, HQ city,
  reactor type, spectrum, enrichment, capacities, applications, notes,
  coordinates, and up to three news links. Source attribution and the
  1 July 2026 update date are visible.
- Intentional adaptation: the WNA header, breadcrumb, tabs, and cookie prompt
  are not copied. The catalogue is presented inside Global SMR Atlas, with the
  same factual information architecture and working interactions.
- [P3] The implementation adds a compact four-metric summary above the list.
  This provides useful orientation but is not present in the source database.

## Comparison history

1. Initial desktop and detail comparisons found no P0/P1/P2 issue. The
   catalogue preserved the two-column cards, technical field hierarchy, and
   full-record information while applying the existing Atlas design system.
2. Initial mobile comparison found a P2 density issue: the four summary metrics
   and expanded filter controls pushed the first design card below the
   844-pixel viewport.
3. Fix: condensed the metrics to a single horizontal row and replaced the
   always-expanded mobile filters with a source-aligned “Show filters” control.
4. Post-fix evidence: `design-qa-mobile-comparison.png` shows the first 4S card
   beginning at 605 CSS pixels, with search, result count, sorting, and the
   filter control all visible above it.

## Implementation checklist

- [x] Extract and preserve all 133 source designs.
- [x] Add searchable, sortable, responsive catalogue cards.
- [x] Add status, type, country, and spectrum filters.
- [x] Add full technical record views with applications, notes, and news.
- [x] Plot every supplied coordinate as a clearly labelled developer-HQ marker.
- [x] Preserve existing project markers and data-manager behavior.
- [x] Verify desktop, mobile, catalogue, detail, filtering, and map interactions.
- [x] Verify GitHub Pages and Sites build output.

## Follow-up polish

- P3: a future comparison mode could reproduce the source's multi-design
  side-by-side comparison workflow if that becomes a core research task.

final result: passed
