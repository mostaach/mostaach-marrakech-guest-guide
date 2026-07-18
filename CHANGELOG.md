# Changelog

All notable changes to the **Marrakech Guest Guide** will be documented in this file.

## [1.1.0] - July 2026

### Added
- **Live Weather Widget:** Integrated Open-Meteo API for real-time weather updates with automatic day/night theme awareness.
- **Currency Converter:** Added real-time MAD conversion rates against EUR, USD, and GBP.
- **CartoDB Voyager Maps:** Upgraded the Leaflet map tiles to CartoDB Voyager for a premium, warm aesthetic that matches the Riad's brand colors.
- **Room Swift Integration:** Replaced static concierge links with a dynamic room selector allowing guests to specify their exact location in the Riad (Rooms 1-16 + common areas) before ordering.
- **Custom QR Code:** Automatically generated a branded QR code at `/guest-guide-qr.png` for physical distribution in guest rooms.

### Changed
- **Asset Optimization:** Split large JavaScript bundles (React, Leaflet, Framer Motion, Radix) into smaller, parallel chunks in `vite.config.ts` to drastically improve initial load times and resolve chunk size warnings.
- **Real Photography:** Updated `places.json` to map real, high-resolution photography to the curated spots.
- **Deployment Pipeline:** Reconnected the Vercel project to the correct GitHub repository to ensure seamless continuous deployment (CI/CD) on every push to `main`.
- **Dependency Updates:** Upgraded `recharts` to v3 to resolve deprecation warnings and ensure long-term stability.

### Fixed
- **Map Viewport Overlap:** Fixed an issue where the map would overlap with the navigation bars by using `calc(100dvh - 72px)`.
- **Vercel Stale Cache:** Resolved an issue where Vercel was serving an old `index.js` bundle by forcing a clean redeploy and fixing the Git integration.
