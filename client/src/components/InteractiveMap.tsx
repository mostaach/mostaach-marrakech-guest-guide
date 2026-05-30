import { useEffect, useRef, useState } from "react";
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

export default function InteractiveMap({
  places,
  selectedCategory,
  onPlaceSelect,
}: InteractiveMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>(places);

  useEffect(() => {
    if (!selectedCategory) {
      setFilteredPlaces(places);
      return;
    }

    setFilteredPlaces(
      places.filter((place) => toCategoryId(place.category) === selectedCategory),
    );
  }, [selectedCategory, places]);

  useEffect(() => {
    if (mapRef.current || !mapElementRef.current) return;

    const map = L.map(mapElementRef.current).setView(
      [riadData.coordinates[0], riadData.coordinates[1]],
      15,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    const riadIcon = L.divIcon({
      html: `
        <div class="relative">
          <div class="absolute inset-0 rounded-full bg-yellow-400" style="width: 20px; height: 20px; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
          <div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-yellow-500 shadow-lg">
            <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      `,
      className: "riad-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    L.marker([riadData.coordinates[0], riadData.coordinates[1]], {
      icon: riadIcon,
    })
      .addTo(map)
      .bindPopup(`<div class="text-center font-semibold">${riadData.name}</div>`)
      .openPopup();

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker, placeId) => {
      if (!filteredPlaces.find((place) => place.id === placeId)) {
        mapRef.current?.removeLayer(marker);
        markersRef.current.delete(placeId);
      }
    });

    filteredPlaces.forEach((place) => {
      if (markersRef.current.has(place.id)) return;

      const categoryId = toCategoryId(place.category);
      const color = categoryColors[categoryId] || "#B85C3C";

      const icon = L.divIcon({
        html: `
          <div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-lg" style="background-color: ${color};">
            <div class="h-2 w-2 rounded-full bg-white"></div>
          </div>
        `,
        className: "place-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const distance = calculateDistance(
        riadData.coordinates[0],
        riadData.coordinates[1],
        place.coordinates[0],
        place.coordinates[1],
      );

      const marker = L.marker([place.coordinates[0], place.coordinates[1]], {
        icon,
      })
        .addTo(mapRef.current!)
        .bindPopup(
          `<div class="w-48">
            <img src="${place.image}" alt="${place.name}" class="mb-2 h-32 w-full rounded object-cover" />
            <h3 class="mb-1 text-sm font-bold">${place.name}</h3>
            <p class="mb-2 text-xs text-gray-600">${place.description.substring(0, 60)}...</p>
            <div class="space-y-1 text-xs">
              <p>${estimateWalkingTime(distance)} min walk</p>
              <p>${estimateTaxiTime(distance)} min taxi</p>
              <p>${place.budget}</p>
            </div>
          </div>`,
        )
        .on("click", () => {
          onPlaceSelect(place);
        });

      markersRef.current.set(place.id, marker);
    });
  }, [filteredPlaces, onPlaceSelect]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg shadow-lg">
      <div ref={mapElementRef} className="h-full w-full min-h-[500px]" />
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .leaflet-container {
          font-family: 'Inter', sans-serif;
        }
        .leaflet-popup-content-wrapper {
          background-color: #FFFFFF;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-tip {
          background-color: #FFFFFF;
        }
      `}</style>
    </div>
  );
}
