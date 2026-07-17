import { useState, useEffect } from "react";
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  Wind,
  Thermometer,
  CloudFog,
  Moon,
  CloudMoon
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
  is_day: number;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // Coordinates for Marrakech with local timezone
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=31.6295&longitude=-7.9811&current_weather=true&timezone=Africa/Casablanca"
        );
        const data = await res.json();
        
        if (data && data.current_weather) {
          setWeather(data.current_weather);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch weather", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherDetails = (code: number, is_day: number) => {
    if (code === 0) return { 
      icon: is_day ? Sun : Moon, 
      label: "Clear sky", 
      color: is_day ? "text-yellow-500" : "text-indigo-300" 
    };
    if (code >= 1 && code <= 3) return { 
      icon: is_day ? CloudSun : CloudMoon, 
      label: "Partly cloudy", 
      color: is_day ? "text-blue-400" : "text-indigo-400" 
    };
    if (code === 45 || code === 48) return { icon: CloudFog, label: "Foggy", color: "text-gray-400" };
    if (code >= 51 && code <= 67) return { icon: CloudRain, label: "Rain", color: "text-blue-500" };
    if (code >= 71 && code <= 77) return { icon: CloudSnow, label: "Snow", color: "text-blue-200" };
    if (code >= 95) return { icon: CloudLightning, label: "Thunderstorm", color: "text-purple-500" };
    
    return { icon: Cloud, label: "Unknown", color: "text-gray-400" };
  };

  if (loading) {
    return (
      <Card className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm animate-pulse h-24 flex items-center justify-center">
        <div className="text-sm text-[#8B9D83] font-semibold">Loading Marrakech weather...</div>
      </Card>
    );
  }

  if (error || !weather) {
    return null; // Silently fail if weather can't be loaded so we don't ruin the UI
  }

  const { icon: WeatherIcon, label, color } = getWeatherDetails(weather.weathercode, weather.is_day);

  return (
    <Card className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full bg-[#F5F1E8] ${color}`}>
          <WeatherIcon className="h-8 w-8" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8B9D83]">
            Marrakech Now
          </p>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold text-[#2C2C2C]">
              {Math.round(weather.temperature)}°C
            </h3>
            <span className="text-sm font-semibold text-[#6B6B6B]">
              {label}
            </span>
          </div>
        </div>
      </div>
      
      <div className="hidden sm:flex flex-col items-end justify-center border-l border-[#E0D5C7] pl-4">
        <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mb-1">
          <Thermometer className="h-3.5 w-3.5 text-[#B85C3C]" />
          <span>Feels warm</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B]">
          <Wind className="h-3.5 w-3.5 text-[#8B9D83]" />
          <span>{weather.windspeed} km/h wind</span>
        </div>
      </div>
    </Card>
  );
}
