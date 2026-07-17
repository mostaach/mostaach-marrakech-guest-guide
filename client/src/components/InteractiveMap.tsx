import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  calculateDistance,
  estimateWalkingTime,
  estimateTaxiTime,
} from "@/lib/distance";
import riadData from "../../../data/riad.json";

interface Place {
  id: number;
  name: string;
  category: string;
  area: string;
  coordinates: number[];
  description: string;
  best_time: string;
  budget: string;
  featured: boolean;
  local_favorite: boolean;
  google_maps: string;
  image: string;
  action_link?: string;
  action_text?: string;
  in_house?: boolean;
}

interface InteractiveMapProps {
  places: Place[];
  selectedCategory: string | null;
  onPlaceSelect: (place: Place) => void;
}

const categoryColors: Record<string, string> = {
  "must-see": "#B85C3C",
  food: "#D4A574",
  rooftops: "#8B9D83",
  shopping: "#C4956E",
  wellness: "#A89968",
  historical: "#9B6B4F",
  essentials: "#7A8B7E",
  "day-trips": "#B8956E",
};

const toCategoryId = (category: string) =>
  category.toLowerCase().replace(/\s+/g, "-");

function createPinMarker(color: string, size = 36): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        transition: transform 0.2s ease;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.9;
        "></div>
      </div>
    `,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -(size + 4)],
  });
}

function createRiadMarker(): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 44px; height: 44px;">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(234, 179, 8, 0.35);
          animation: riadPulse 2s ease-in-out infinite;
        "></div>
        <div style="
          position: absolute;
          inset: 6px;
          background: #EAB308;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 16px rgba(234,179,8,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg style="width:12px;height:12px;transform:rotate(45deg);fill:white;" viewBox="0 0 20 20">
            <path d="M10 2C6.686 2 4 4.686 4 8c0 4.418 6 10 6 10s6-5.582 6-10c0-3.314-2.686-6-6-6zm0 8.5A2.5 2.5 0 1 1 10 5.5a2.5 2.5 0 0 1 0 5z"/>
          </svg>
        </div>
      </div>
    `,
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -48],
  });
}

function buildPopupHTML(place: Place, walkingTime: number, taxiTime: number): string {
  return `
    <div style="width:220px; font-family:'Inter',sans-serif; border-radius:10px; overflow:hidden;">
      <div style="position:relative; height:120px; overflow:hidden;">
        <img
          src="${place.image}"
          alt="${place.name}"
          style="width:100%; height:100%; object-fit:cover; display:block;"
          onerror="this.style.background='#E8D4B8'; this.style.display='flex';"
        />
        ${place.featured ? `
        <span style="
          position:absolute; top:8px; right:8px;
          background:#B85C3C; color:white;
          font-size:10px; font-weight:700;
          padding:2px 8px; border-radius:20px;
          letter-spacing:0.04em;
        ">★ Featured</span>` : ""}
      </div>
      <div style="padding:10px 12px 12px;">
        <h3 style="margin:0 0 2px; font-size:14px; font-weight:700; color:#2C2C2C; font-family:'Playfair Display',serif;">
          ${place.name}
        </h3>
        <p style="margin:0 0 8px; font-size:11px; color:#8B9D83; font-weight:600; text-transform:uppercase; letter-spacing:0.08em;">
          ${place.area}
        </p>
        <p style="margin:0 0 10px; font-size:12px; color:#6B6B6B; line-height:1.5;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
          ${place.description}
        </p>
        <div style="display:flex; gap:12px; margin-bottom:10px; font-size:11px; color:#6B6B6B;">
          ${!place.in_house ? `
            <span style="display:flex; align-items:center; gap:4px;">
              🚶 ${walkingTime} min
            </span>
            <span style="display:flex; align-items:center; gap:4px;">
              🚖 ${taxiTime} min
            </span>
          ` : `
            <span style="display:flex; align-items:center; gap:4px; background:#F5F1E8; padding:2px 6px; border-radius:12px; color:#8B9D83; font-weight:700;">
              🏡 In-House
            </span>
          `}
          <span style="color:#B85C3C; font-weight:700;">${place.budget}</span>
        </div>
        <a
          href="${place.action_link || place.google_maps}"
          target="_blank"
          rel="noopener noreferrer"
          style="
            display:block; text-align:center;
            background:#B85C3C; color:white;
            font-size:12px; font-weight:600;
            padding:7px 12px; border-radius:6px;
            text-decoration:none;
          "
          onmouseover="this.style.background='#A04A2F'"
          onmouseout="this.style.background='#B85C3C'"
        >
          ${place.action_text || 'Open in Google Maps →'}
        </a>
      </div>
    </div>
  `;
}

export default function InteractiveMap({
  places,
  selectedCategory,
  onPlaceSelect,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number | "riad", L.Marker>>(new Map());

  const filteredPlaces = useMemo(() => {
    if (!selectedCategory) return places;
    return places.filter(
      (p) => toCategoryId(p.category) === selectedCategory
    );
  }, [places, selectedCategory]);

  // Initialize map once
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [riadData.coordinates[0], riadData.coordinates[1]],
      zoom: 16,
      zoomControl: false,
    });

    // CartoDB Voyager — warm, clean, premium aesthetic (free, no key needed)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    // Custom zoom control in the bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Riad marker
    const riadMarker = L.marker(
      [riadData.coordinates[0], riadData.coordinates[1]],
      { icon: createRiadMarker(), zIndexOffset: 1000 }
    )
      .addTo(map)
      .bindPopup(
        `<div style="font-family:'Playfair Display',serif; font-size:15px; font-weight:700; color:#2C2C2C; padding:4px 2px;">
          🏡 ${riadData.name}
        </div>`,
        { maxWidth: 220 }
      );

    riadMarker.on("click", () => riadMarker.openPopup());
    markersRef.current.set("riad", riadMarker);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // Sync place markers when filteredPlaces changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remove stale markers
    const activeIds = new Set(filteredPlaces.map((p) => p.id));
    markersRef.current.forEach((marker, id) => {
      if (id !== "riad" && !activeIds.has(id as number)) {
        map.removeLayer(marker);
        markersRef.current.delete(id);
      }
    });

    // Add new markers
    filteredPlaces.forEach((place) => {
      if (markersRef.current.has(place.id)) return;

      const color = categoryColors[toCategoryId(place.category)] ?? "#B85C3C";
      const distance = calculateDistance(
        riadData.coordinates[0],
        riadData.coordinates[1],
        place.coordinates[0],
        place.coordinates[1]
      );
      const walkingTime = estimateWalkingTime(distance);
      const taxiTime = estimateTaxiTime(distance);

      const marker = L.marker(
        [place.coordinates[0], place.coordinates[1]],
        { icon: createPinMarker(color) }
      ).addTo(map);

      marker.bindPopup(buildPopupHTML(place, walkingTime, taxiTime), {
        maxWidth: 240,
        className: "moroccan-popup",
      });

      marker.on("click", () => {
        onPlaceSelect(place);
        marker.openPopup();
      });

      markersRef.current.set(place.id, marker);
    });
  }, [filteredPlaces, onPlaceSelect]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg">
      <div ref={mapContainerRef} className="h-full w-full min-h-[500px]" />
      <style>{`
        @keyframes riadPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50%       { transform: scale(1.5); opacity: 0.1; }
        }

        /* Leaflet popup global overrides — Moroccan Elegance theme */
        .leaflet-popup-content-wrapper {
          background: #ffffff;
          border-radius: 12px !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.14) !important;
          border: 1px solid #E0D5C7;
          padding: 0 !important;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          line-height: 1.5;
        }
        .leaflet-popup-tip-container {
          margin-top: -1px;
        }
        .leaflet-popup-tip {
          background: #ffffff !important;
          box-shadow: none !important;
        }
        .leaflet-popup-close-button {
          color: #6B6B6B !important;
          font-size: 18px !important;
          top: 6px !important;
          right: 8px !important;
          z-index: 10;
          background: rgba(255,255,255,0.85);
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .leaflet-container {
          font-family: 'Inter', sans-serif;
          background: #F5F1E8;
        }
        .leaflet-control-zoom a {
          background: #ffffff !important;
          color: #2C2C2C !important;
          border-color: #E0D5C7 !important;
          font-size: 16px !important;
          border-radius: 6px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #F5F1E8 !important;
          color: #B85C3C !important;
        }
        .leaflet-control-attribution {
          background: rgba(245,241,232,0.8) !important;
          font-size: 10px;
          color: #9C9184;
          border-radius: 4px 0 0 0;
        }
        .leaflet-control-attribution a {
          color: #B85C3C !important;
        }
      `}</style>
    </div>
  );
}
