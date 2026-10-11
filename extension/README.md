# Night Shift Hub — Full Dashboard Extension

Chrome / Microsoft Edge Extension (Manifest V3) for **Riptwosec-collab/night-shift-hub**.

This is **not a redesign or a remote website shortcut**. The extension contains the original Night Shift Hub HTML, CSS and JavaScript and opens as a **full browser tab**, not a small popup. All six source scripts are bundled in their original order. The source website, build/deploy configuration, and production remain unchanged.

## Installation

1. On GitHub, choose the `feat/full-dashboard-extension` branch, select **Code → Download ZIP**, and extract the ZIP.
2. In Chrome open `chrome://extensions`, or in Edge open `edge://extensions`.
3. Enable **Developer mode** and click **Load unpacked**.
4. Select the extracted **extension** folder (the one containing `manifest.json`).
5. Pin the Night Shift Hub icon if desired. Click it to open or focus the full Dashboard tab.

There is no npm installation, remote script, background telemetry, or content script. Intranet links still require your organization network/VPN and authorization.

## Preserved features

- The original Dark / Neon Cyan appearance and responsive layout
- Device temperatures, shifts, reports, report copying and Cisco environment commands
- NetFlow links, Sheets, Work Links and custom links
- Night Shift checklist and NOC table
- Local save/restore behavior, overlays and modal navigation

## Important differences from the hosted website

- This extension uses the `chrome-extension://` origin, so its `localStorage` data is **separate** from the website's saved data. Nothing is auto-migrated; do not expect old checklist or custom-link values to appear automatically.
- Changes to the hosted website will **not** update this installed extension until you rebuild/reload it.
- External links require connectivity. The bundled interface itself loads from local extension files.
- No extra permissions were requested and the extension does not automate websites or bypass access controls.

## Update extension after editing the original website

At the repository root run:

```bash
node tools/build-night-shift-extension.cjs
node tests/night-shift-extension.contract.cjs
```

Then reload the unpacked extension on `chrome://extensions` / `edge://extensions`.

**Validation note:** Static source/manifest parity checks are included. Live end-to-end browser verification of every action is a separate step, and no Chrome Web Store release is claimed.
