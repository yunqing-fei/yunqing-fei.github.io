# Global SMR Atlas — Design QA

## Comparison target

- Source visual truth: `/Users/nolan/Documents/Nuclear/smr-atlas/source-option-1.png`
- Implementation screenshot: `/Users/nolan/Documents/Nuclear/smr-atlas/implementation-desktop.png`
- Responsive evidence:
  - `/Users/nolan/Documents/Nuclear/smr-atlas/implementation-mobile.png`
  - `/Users/nolan/Documents/Nuclear/smr-atlas/implementation-admin.png`
  - `/Users/nolan/Documents/Nuclear/smr-atlas/implementation-admin-mobile.png`
- Full-view comparison: `/Users/nolan/Documents/Nuclear/smr-atlas/qa-full-comparison.png`
- Focused header/overview comparison: `/Users/nolan/Documents/Nuclear/smr-atlas/qa-top-comparison.png`
- State: main atlas, all filters active, Darlington BWRX-300 selected.
- CSS viewport: 1440 × 1024 desktop; 390 × 844 mobile.
- Source pixels: 1487 × 1058 at 1×.
- Browser desktop capture pixels: 1389 × 1013 at the in-app browser’s 1× capture scale.
- Browser mobile capture pixels: 375 × 812 at the in-app browser’s 1× capture scale.
- Normalization: the full comparison preserves each source’s aspect ratio and scales both to the same 1058 px comparison height. The focused comparison crops equivalent top regions and normalizes them to 1487 × 360 before placing them side by side.

## Browser and interaction evidence

- The atlas rendered in the in-app browser with no console errors or warnings.
- Search filtered the project count and map markers from 22 to 1.
- Selecting the filtered map marker changed the detail panel to “HTR-PM at Shidao Bay”.
- The mobile filter drawer opened, aligned to the viewport edge, and closed successfully.
- The case-sensitive password gate rejected `boci` and accepted `BOCI`.
- The protected data manager rendered 22 records with add, import, JSON export, CSV export, and online-save controls.
- Saving an unchanged draft completed successfully and produced the published confirmation.
- A mobile project record expanded to reveal all 17 editable fields.
- Desktop and mobile body widths matched their viewports with no horizontal page overflow.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Typography: Inter, weights, hierarchy, title scale, KPI labels, and compact detail typography closely match the selected source. Mobile text remains readable without clipped headings.
- Spacing and layout rhythm: the navy header, overview/KPI band, left filters, dominant map, and right detail rail preserve the source composition. The portrait breakpoint intentionally stacks the detail rail below the map.
- Colors and tokens: navy, cobalt, green, amber, grey, white, and pale-blue map surfaces align with the selected visual system. Semantic status colors stay consistent across KPIs, filters, markers, details, and editor records.
- Image and asset fidelity: the map uses real OpenStreetMap/CARTO tiles through Leaflet, and icons use the Phosphor icon library. No placeholder illustrations, custom SVGs, emoji, or code-drawn map assets are present.
- Copy and content: product labels, project detail fields, status vocabulary, and the selected Darlington record follow the source. Counts intentionally reflect the included 22-record dataset rather than the mock image’s invented totals.
- [P3] The production basemap has slightly greyer water and denser geographic labels than the generated source image. This is acceptable because it preserves a real interactive map and improves geographic legibility.
- [P3] The implementation replaces long checkbox lists for technology, region, and vendor with compact selects. This is an intentional responsive trade-off that preserves all filtering capabilities and prevents the narrow rail from becoming excessively tall.

## Comparison history

1. Initial browser capture found a P1 layout failure: the Leaflet stylesheet was blocked by an incorrect integrity value, causing visible tile seams, a 2076 px page width, and a 2592 px map height.
2. Fix: removed the stale integrity attributes so the versioned Leaflet stylesheet and script load normally.
3. Post-fix evidence: `/Users/nolan/Documents/Nuclear/smr-atlas/implementation-desktop.png` shows a continuous map. Browser measurements confirmed a 1425 px client/scroll width, an 832 px map height, 16 of 16 tiles loaded, and no console errors.
4. Responsive polish: hid the KPI strip scrollbar and simplified the mobile editor’s “View atlas” action to an icon to remove visual noise. Mobile captures show no horizontal page overflow.

## Implementation checklist

- [x] Match selected desktop information hierarchy.
- [x] Make map, filters, markers, search, detail selection, and source links functional.
- [x] Add portrait and mobile layouts.
- [x] Add separate protected data manager route.
- [x] Add online persistence, import, JSON export, and CSV export.
- [x] Verify desktop, mobile, password, editing, and publish flows.
- [x] Verify build output and Sites worker tests.

## Follow-up polish

- Optional: swap to a custom licensed basemap style if an even closer pale-blue match is required.

final result: passed
