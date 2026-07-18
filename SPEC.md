# Project Spec Kit: Marrakech Guest Guide

## 1. Overview
The **Marrakech Guest Guide** (Riad Dar Blanche) is a premium, mobile-first web application designed to act as a digital concierge for guests. It provides real-time local information, curated recommendations, and in-house service ordering.

## 2. Tech Stack
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS 4 + custom CSS (`index.css`)
- **UI Components:** shadcn/ui + Radix UI Primitives + Framer Motion
- **Routing:** Wouter
- **Maps:** Leaflet + CartoDB Voyager (Premium warm aesthetic, no API key required)
- **Deployment:** Vercel (Edge network, auto-deploy via GitHub `main` branch)
- **Package Manager:** pnpm

## 3. Core Features (Implemented)
### A. Interactive Map & Navigation
- **CartoDB Voyager Integration:** Replaced standard OSM tiles with a high-quality, warm-toned map that matches the Riad's branding.
- **Dynamic Routing:** Calculates walking and taxi times for curated spots based on the Riad's coordinates.
- **Custom Markers:** Custom SVG map pins reflecting categories (food, shopping, etc.) and a pulsing gold marker for the Riad itself.

### B. Live Context Widgets
- **Weather Widget:** Fetches real-time weather from Open-Meteo (Casablanca timezone). Automatically switches between daytime/nighttime aesthetics and icons.
- **Currency Converter:** Real-time exchange rates (MAD to EUR/USD/GBP) using `open.er-api.com`.

### C. In-House Services (Room Swift)
- **Dynamic Ordering System:** Allows guests to select their location (Rooms 1-16, Pool, Rooftop, Courtyard, Spa).
- **Service Tags:** Custom `in_house` tags in `places.json` to differentiate internal services (e.g., Riad Restaurant) from external spots.

### D. Offline / Physical Bridge
- **QR Code Integration:** A custom-styled QR Code (Terra-Cotta on Cream) is generated and served from `/guest-guide-qr.png` for easy printing on keycards and welcome notes.

## 4. Upcoming Roadmap & AI Transition
### Phase 1: Spa & Reception
- The Riad Dar Blanche Spa is currently marked as "Coming Soon". 
- **Next Step:** Integrate an AI-driven chat flow to act as an automated receptionist for booking spa treatments and answering guest FAQs directly in the app.

## 5. Deployment Architecture
- **Host:** Vercel
- **Build Command:** `npm run build` (runs Vite build)
- **Output Directory:** `dist/public`
- **Code Splitting:** Manual chunking configured in `vite.config.ts` to separate large vendor libraries (React, Leaflet, Framer Motion) for optimal load times.
