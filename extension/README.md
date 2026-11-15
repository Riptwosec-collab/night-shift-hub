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

## เปิด 3 Xshell Sessions จากการ์ดอุณหภูมิ

Version 1.1 adds **เปิด Xshell** and **คัดลอก SSH** under each of the original three device cards, in this exact order:

| Host | SSH URL |
|---|---|
| IT05-C3750X-Intra-Inter | `ssh://10.1.100.3` |
| IT06-C9500-CSW1-A01 | `ssh://10.1.100.1` |
| IT06-C9500-CSW2-A02 | `ssh://10.1.100.2` |

- Each click is **individual**. One click launches only one selected SSH target (Windows external-link prompt may appear), not all three automatically.
- To open Xshell directly from Chrome/Edge, **Windows must be configured to handle `ssh://` URLs using Xshell.exe**. The browser extension cannot run a local Windows program directly. The app does not contain any authentication credentials.
- **Optional** first-time setup: run the included `extension/register-xshell-ssh.ps1` from PowerShell on the **user's own Windows machine** after reviewing it. It searches for Xshell 8, shows any existing `ssh://` handler, then asks you to explicitly type `YES` before changing the HKCU association. This changes how **all** `ssh://` links work for your Windows account. You do not need administrator rights for HKCU.
- If you don't want to change Windows settings, click **คัดลอก SSH** and paste the copied URL directly into Xshell 8's address bar, or start Xshell manually: `Xshell -url ssh://10.1.100.3`, `Xshell -url ssh://10.1.100.1`, `Xshell -url ssh://10.1.100.2`.
- With Xshell configured to open multiple sessions in one window, they appear as separate tabs; otherwise windows/tabs follow the Xshell application preference.
- No change to the main Night Shift Hub website, source task logic, temperature values, or Chrome extension permissions.

**Important:** The URL buttons request a Windows protocol handoff; they do not confirm that a connection was established or that a device is online. Real Chrome/Edge + Windows/Xshell end-to-end testing remains necessary.
