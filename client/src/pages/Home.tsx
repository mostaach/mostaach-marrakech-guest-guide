import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  BaggageClaim,
  Car,
  ChevronDown,
  Clock,
  Coffee,
  Compass,
  ConciergeBell,
  Footprints,
  Heart,
  Home as HomeIcon,
  KeyRound,
  Languages,
  Lightbulb,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  Star,
  Utensils,
  Wifi,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import InteractiveMap from "@/components/InteractiveMap";
import CurrencyConverter from "@/components/CurrencyConverter";
import WeatherWidget from "@/components/WeatherWidget";
import { track } from "@vercel/analytics";
import placesData from "../../../data/places.json";
import routesData from "../../../data/routes.json";
import categoriesData from "../../../data/categories.json";
import riadData from "../../../data/riad.json";
import {
  calculateDistance,
  estimateWalkingTime,
  estimateTaxiTime,
  filterByWalkingDistance,
  sortByDistance,
} from "@/lib/distance";

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

interface Route {
  id: number;
  name: string;
  description: string;
  duration: string;
  stops: string[];
  recommendation: string;
  best_time: string;
  difficulty: string;
}

type Tab = "welcome" | "map" | "nearby" | "routes" | "essentials";
type Language = "en" | "fr";

const whatsappMessage = encodeURIComponent(
  "Hello, I need help with my stay at the riad.",
);

const riadGallery = riadData.gallery ?? [];
const whatsappNumber = riadData.whatsapp.replace(/\D/g, "");

const ui = {
  en: {
    languageName: "English",
    switchLabel: "FR",
    heroKicker: "Welcome to Marrakech",
    heroCopy:
      "Everything you need for arrival, your stay, and discovering the medina.",
    startGuide: "Start Guest Guide",
    openMap: "Open Map",
    contactRiad: "Contact Riad",
    viewOnMaps: "View on Maps",
    yourStay: "Your stay",
    welcomeTitle: "Welcome to your Marrakech home base.",
    welcomeCopy:
      "This guide brings together the practical details guests need first: arrival, contact, house notes, nearby places, routes, and help. Save it on your phone before heading into the medina.",
    developmentNoticeTitle: "Guide in development",
    developmentNotice:
      "We are still improving this guest guide. Please confirm WiFi, timings, bookings, and any urgent details with the riad team at arrival.",
    callRiad: "Call Riad",
    emailRiad: "Email Riad",
    whatsappConcierge: "WhatsApp Concierge",
    quick: {
      checkIn: "Check-in",
      checkOut: "Check-out",
      wifi: "WiFi",
      languages: "Languages",
      askAtArrival: "Ask at arrival",
      early: "Message the team if you arrive early.",
      bags: "Leave bags with the team if needed.",
      wifiDetail: "Keep the network details here once confirmed.",
      languageDetail: "The team can help with taxis and bookings.",
    },
    arrivalHouse: "Arrival & House Notes",
    arrival: [
      {
        title: "Find the riad",
        text: riadData.address,
        icon: MapPin,
      },
      {
        title: "Meet the team",
        text: "The concierge can help with keys, luggage, city orientation, and restaurant bookings.",
        icon: ConciergeBell,
      },
      {
        title: "Settle in",
        text: "Review the map, save the riad contact details, and ask for any custom recommendations.",
        icon: KeyRound,
      },
    ],
    houseNotes: [
      "Keep the riad door closed behind you when entering or leaving.",
      "Quiet hours are best observed after 10:30 PM in the courtyard and rooftop areas.",
      "Breakfast, hammam, dinner, and airport transfers are easiest to arrange one day ahead.",
      "For medina taxis, confirm the price before departure or ask the riad to arrange pickup.",
    ],
    goodToKnow: "Good to Know",
    essentials: [
      {
        title: "Emergency",
        text: "For urgent help, call local emergency services and contact the riad team immediately.",
        icon: ShieldCheck,
      },
      {
        title: "Getting Around",
        text: "Walk inside the medina when possible. Use arranged taxis for late nights or longer trips.",
        icon: Navigation,
      },
      {
        title: "Food & Water",
        text: "Drink bottled water, carry small cash, and ask the team for trusted dinner reservations.",
        icon: Utensils,
      },
    ],
    realPhotos: "Real photos",
    lookInside: "A look inside Riad Dar Blanche",
    firstPicks: "First picks",
    nearbyFavorites: "Start with these nearby favorites",
    placeTrust:
      "Selected for strong recommendations, reputation, and practical value for guests.",
    viewAll: "View all",
    filter: "Filter by Category",
    all: "All",
    nearRiad: "Near Your Riad",
    fiveMinute: "5-Minute Walk",
    localFavorites: "Local Favorites",
    curated: "Curated Experiences",
    stops: "Stops",
    essentialInfo: "Essential Information",
    emergencyContacts: "Emergency Contacts",
    police: "Police",
    ambulance: "Ambulance",
    touristPolice: "Tourist Police",
    practicalTips: "Practical Tips",
    feedbackTitle: "How was this guide?",
    feedbackCopy:
      "Your feedback helps us improve the guest guide for future stays.",
    feedbackThanks: "Thanks for the feedback.",
    feedbackPlaceholder: "Optional note",
    feedbackButton: "Send note",
    tips: [
      "Dress modestly when visiting religious sites.",
      "Bargaining is expected in souks.",
      "The best time to visit is October to April.",
      "Learn a few Arabic or French phrases.",
      "Carry small cash for tips, taxis, and markets.",
    ],
    nav: {
      guide: "Guide",
      map: "Map",
      nearby: "Nearby",
      routes: "Routes",
      help: "Help",
    },
    needHelp: "Need Help?",
    bestTime: "Best Time",
    budget: "Budget",
    openInMaps: "Open in Google Maps",
  },
  fr: {
    languageName: "Francais",
    switchLabel: "EN",
    heroKicker: "Bienvenue a Marrakech",
    heroCopy:
      "Toutes les informations utiles pour l'arrivee, le sejour et la decouverte de la medina.",
    startGuide: "Ouvrir le guide",
    openMap: "Ouvrir la carte",
    contactRiad: "Contacter le riad",
    viewOnMaps: "Voir sur Maps",
    yourStay: "Votre sejour",
    welcomeTitle: "Bienvenue dans votre base a Marrakech.",
    welcomeCopy:
      "Ce guide rassemble les informations pratiques essentielles: arrivee, contact, notes de maison, lieux proches, itineraires et aide. Gardez-le sur votre telephone avant de partir dans la medina.",
    developmentNoticeTitle: "Guide en cours de developpement",
    developmentNotice:
      "Nous ameliorons encore ce guide. Merci de confirmer le WiFi, les horaires, les reservations et les informations urgentes avec l'equipe du riad a l'arrivee.",
    callRiad: "Appeler le riad",
    emailRiad: "Envoyer un email",
    whatsappConcierge: "Concierge WhatsApp",
    quick: {
      checkIn: "Arrivee",
      checkOut: "Depart",
      wifi: "WiFi",
      languages: "Langues",
      askAtArrival: "Demander a l'arrivee",
      early: "Contactez l'equipe si vous arrivez en avance.",
      bags: "Vous pouvez laisser vos bagages si besoin.",
      wifiDetail: "Les details du reseau seront ajoutes une fois confirmes.",
      languageDetail: "L'equipe peut aider pour les taxis et reservations.",
    },
    arrivalHouse: "Arrivee & notes de maison",
    arrival: [
      {
        title: "Trouver le riad",
        text: riadData.address,
        icon: MapPin,
      },
      {
        title: "Rencontrer l'equipe",
        text: "La conciergerie peut aider avec les cles, les bagages, l'orientation et les reservations.",
        icon: ConciergeBell,
      },
      {
        title: "S'installer",
        text: "Consultez la carte, gardez les coordonnees du riad et demandez des recommandations personnalisees.",
        icon: KeyRound,
      },
    ],
    houseNotes: [
      "Gardez la porte du riad fermee en entrant et en sortant.",
      "Merci de respecter le calme apres 22h30 dans la cour et sur la terrasse.",
      "Petit-dejeuner, hammam, diner et transferts aeroport sont plus faciles a organiser la veille.",
      "Pour les taxis dans la medina, confirmez le prix avant le depart ou demandez au riad d'organiser le trajet.",
    ],
    goodToKnow: "Bon a savoir",
    essentials: [
      {
        title: "Urgence",
        text: "En cas d'urgence, appelez les services locaux puis contactez immediatement l'equipe du riad.",
        icon: ShieldCheck,
      },
      {
        title: "Se deplacer",
        text: "Marchez dans la medina quand c'est possible. Utilisez un taxi organise pour le soir ou les longs trajets.",
        icon: Navigation,
      },
      {
        title: "Repas & eau",
        text: "Buvez de l'eau en bouteille, gardez de la petite monnaie et demandez les bonnes adresses a l'equipe.",
        icon: Utensils,
      },
    ],
    realPhotos: "Photos reelles",
    lookInside: "Un apercu de Riad Dar Blanche",
    firstPicks: "Premiers choix",
    nearbyFavorites: "Commencez par ces adresses proches",
    placeTrust:
      "Selection basee sur les recommandations, la reputation et l'utilite pour les voyageurs.",
    viewAll: "Tout voir",
    filter: "Filtrer par categorie",
    all: "Tout",
    nearRiad: "Pres du riad",
    fiveMinute: "A 5 minutes a pied",
    localFavorites: "Favoris locaux",
    curated: "Experiences conseillees",
    stops: "Etapes",
    essentialInfo: "Informations essentielles",
    emergencyContacts: "Contacts d'urgence",
    police: "Police",
    ambulance: "Ambulance",
    touristPolice: "Police touristique",
    practicalTips: "Conseils pratiques",
    feedbackTitle: "Comment trouvez-vous ce guide?",
    feedbackCopy:
      "Votre avis nous aide a ameliorer le guide pour les prochains sejours.",
    feedbackThanks: "Merci pour votre avis.",
    feedbackPlaceholder: "Note optionnelle",
    feedbackButton: "Envoyer la note",
    tips: [
      "Habillez-vous sobrement pour visiter les sites religieux.",
      "La negociation est habituelle dans les souks.",
      "La meilleure periode est d'octobre a avril.",
      "Quelques mots d'arabe ou de francais sont utiles.",
      "Gardez de la petite monnaie pour les pourboires, taxis et marches.",
    ],
    nav: {
      guide: "Guide",
      map: "Carte",
      nearby: "Proche",
      routes: "Routes",
      help: "Aide",
    },
    needHelp: "Besoin d'aide?",
    bestTime: "Meilleur moment",
    budget: "Budget",
    openInMaps: "Ouvrir dans Google Maps",
  },
} satisfies Record<Language, Record<string, any>>;

export default function Home() {
  const [currentTab, setCurrentTab] = useState<Tab>("welcome");
  const [language, setLanguage] = useState<Language>("en");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showHero, setShowHero] = useState(true);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [walkablePlaces, setWalkablePlaces] = useState<Place[]>([]);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>("1");
  const t = ui[language];
  const hasWhatsapp = whatsappNumber.length > 0;
  const quickInfo = [
    {
      icon: Clock,
      label: t.quick.checkIn,
      value: riadData.checkin_time,
      detail: t.quick.early,
    },
    {
      icon: BaggageClaim,
      label: t.quick.checkOut,
      value: riadData.checkout_time,
      detail: t.quick.bags,
    },
    {
      icon: Wifi,
      label: t.quick.wifi,
      value: t.quick.askAtArrival,
      detail: t.quick.wifiDetail,
    },
    {
      icon: Languages,
      label: t.quick.languages,
      value: riadData.languages.join(", "),
      detail: t.quick.languageDetail,
    },
  ];
  const houseNotes = t.houseNotes;
  const arrivalSteps = t.arrival;
  const essentials = t.essentials;

  useEffect(() => {
    const riadCoordinates = riadData.coordinates as [number, number];
    const experiencePlaces = placesData.filter(
      (place) => place.category !== "Essentials",
    );
    const nearby = filterByWalkingDistance(
      experiencePlaces,
      riadCoordinates,
      2,
    );
    const walkable = filterByWalkingDistance(
      experiencePlaces,
      riadCoordinates,
      0.5,
    );

    setNearbyPlaces(sortByDistance(nearby, riadCoordinates));
    setWalkablePlaces(sortByDistance(walkable, riadCoordinates));
  }, []);

  const openTab = (tab: Tab) => {
    setShowHero(false);
    setCurrentTab(tab);
  };

  const handleFeedbackRating = (rating: number) => {
    setFeedbackRating(rating);
    setFeedbackSent(true);
    track("guide_satisfaction", {
      rating: String(rating),
      language,
    });
  };

  const feedbackMailto = () => {
    const subject = encodeURIComponent(
      `${riadData.name} guest guide feedback`,
    );
    const body = encodeURIComponent(
      [
        `Rating: ${feedbackRating ?? "Not selected"}/5`,
        `Language: ${language.toUpperCase()}`,
        "",
        feedbackNote,
      ].join("\n"),
    );

    return `mailto:${riadData.email}?subject=${subject}&body=${body}`;
  };

  const PlaceCard = ({
    place,
    showDistance = true,
  }: {
    place: Place;
    showDistance?: boolean;
  }) => {
    const distance = calculateDistance(
      riadData.coordinates[0],
      riadData.coordinates[1],
      place.coordinates[0],
      place.coordinates[1],
    );
    const walkingTime = estimateWalkingTime(distance);
    const taxiTime = estimateTaxiTime(distance);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card
          className="overflow-hidden border-[#E0D5C7] bg-white/95 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          onClick={() => setSelectedPlace(place)}
        >
          <button className="block w-full text-left" type="button">
            <div className="relative h-40 overflow-hidden bg-[#E8D4B8]">
              <img
                src={place.image}
                alt={place.name}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
              />
              <div className="absolute right-2 top-2 flex gap-1">
                {place.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#B85C3C] px-2 py-1 text-xs font-semibold text-white shadow-md">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </span>
                )}
                {place.local_favorite && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#8B9D83] px-2 py-1 text-xs font-semibold text-white shadow-md">
                    <Heart className="h-3 w-3 fill-current" />
                    Local
                  </span>
                )}
              </div>
            </div>

            <div className="p-3">
              <h3 className="mb-1 text-sm font-bold text-[#2C2C2C]">
                {place.name}
              </h3>
              <p className="mb-2 line-clamp-2 text-xs text-[#6B6B6B]">
                {place.description}
              </p>

              {showDistance && !place.in_house && (
                <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-[#6B6B6B]">
                  <span className="inline-flex items-center gap-1">
                    <Footprints className="h-3.5 w-3.5" />
                    {walkingTime}m
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Car className="h-3.5 w-3.5" />
                    {taxiTime}m
                  </span>
                  <span className="font-semibold text-[#B85C3C]">
                    {place.budget}
                  </span>
                </div>
              )}
              
              {showDistance && place.in_house && (
                <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-[#6B6B6B]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F1E8] px-2 py-0.5 text-[#8B9D83] font-semibold">
                    <HomeIcon className="h-3 w-3" />
                    In-House
                  </span>
                  <span className="font-semibold text-[#B85C3C]">
                    {place.budget}
                  </span>
                </div>
              )}
            </div>
          </button>

          {place.is_order_system ? (
            <button
              className="mx-3 mb-3 inline-flex text-xs font-semibold text-[#B85C3C] transition-colors hover:text-[#A04A2F]"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedPlace(place);
              }}
            >
              {place.action_text || "Order Room Service"}
            </button>
          ) : place.action_link === "#" ? (
            <span
              className="mx-3 mb-3 inline-flex items-center gap-1 text-xs font-semibold text-[#8B9D83] cursor-not-allowed"
              onClick={(event) => event.stopPropagation()}
            >
              <Clock className="h-3 w-3" />
              {place.action_text}
            </span>
          ) : (
            <a
              href={place.action_link || place.google_maps}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-3 mb-3 inline-flex text-xs font-semibold text-[#B85C3C] transition-colors hover:text-[#A04A2F]"
              onClick={(event) => event.stopPropagation()}
            >
              {place.action_text || t.viewOnMaps}
            </a>
          )}
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {showHero && (
        <section
          className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center px-4"
          style={{
            backgroundImage: `url('${riadData.image}')`,
          }}
        >
          <div className="absolute inset-0 bg-black/45" />

          <button
            onClick={() => setLanguage(language === "en" ? "fr" : "en")}
            className="absolute right-4 top-4 z-20 rounded-full border border-white/40 bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/30"
            type="button"
            aria-label={`Switch language to ${language === "en" ? "French" : "English"}`}
          >
            {t.switchLabel}
          </button>

          <div className="relative z-10 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
              {t.heroKicker}
            </p>
            <h1 className="mb-4 text-5xl font-bold text-white md:text-7xl">
              {riadData.name}
            </h1>
            <p className="mb-8 text-xl font-light text-white/90 md:text-2xl">
              {t.heroCopy}
            </p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => openTab("welcome")}
                className="rounded-lg bg-[#B85C3C] px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#A04A2F]"
                type="button"
              >
                {t.startGuide}
              </button>
              <button
                onClick={() => openTab("map")}
                className="rounded-lg border border-white/30 bg-white/20 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30"
                type="button"
              >
                {t.openMap}
              </button>
              <button
                onClick={() => openTab("welcome")}
                className="rounded-lg border border-white/30 bg-white/20 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30"
                type="button"
              >
                {t.contactRiad}
              </button>
            </div>

            <ChevronDown className="mx-auto mt-12 h-6 w-6 animate-bounce text-white" />
          </div>
        </section>
      )}

      {!showHero && (
        <div className="pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentTab === "welcome" && (
            <div className="space-y-6 p-4 md:p-6">
              <div className="mx-auto max-w-6xl">
                <WeatherWidget />
              </div>
              <section className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-lg bg-white/90 p-5 shadow-sm ring-1 ring-[#E0D5C7]">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#B85C3C]">
                    {t.yourStay}
                  </p>
                  <h2 className="mb-3 text-3xl font-bold text-[#2C2C2C]">
                    {t.welcomeTitle}
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-[#6B6B6B]">
                    {t.welcomeCopy}
                  </p>

                  <div className="mt-4 flex gap-3 rounded-lg border border-[#E0D5C7] bg-[#F5F1E8] p-3 text-left">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#B85C3C]" />
                    <div>
                      <p className="text-sm font-semibold text-[#2C2C2C]">
                        {t.developmentNoticeTitle}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#6B6B6B]">
                        {t.developmentNotice}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <a
                      href={`tel:${riadData.phone}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#B85C3C] px-4 py-3 text-sm font-semibold text-white hover:bg-[#A04A2F]"
                    >
                      <Phone className="h-4 w-4" />
                      {t.callRiad}
                    </a>
                    {hasWhatsapp ? (
                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E0D5C7] bg-white px-4 py-3 text-sm font-semibold text-[#2C2C2C] hover:bg-[#F5F1E8]"
                      >
                        <MessageCircle className="h-4 w-4 text-[#1FA463]" />
                        {t.whatsappConcierge}
                      </a>
                    ) : (
                      <a
                        href={`mailto:${riadData.email}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E0D5C7] bg-white px-4 py-3 text-sm font-semibold text-[#2C2C2C] hover:bg-[#F5F1E8]"
                      >
                        <MessageCircle className="h-4 w-4 text-[#B85C3C]" />
                        {t.emailRiad}
                      </a>
                    )}
                  </div>
                </div>

                <Card className="overflow-hidden border-[#E0D5C7] bg-white/95 shadow-sm">
                  <img
                    src={riadData.image}
                    alt={riadData.name}
                    className="h-48 w-full object-cover"
                  />
                  <div className="space-y-2 p-4 text-sm">
                    <h3 className="text-xl font-bold text-[#2C2C2C]">
                      {riadData.name}
                    </h3>
                    <p className="text-[#6B6B6B]">{riadData.description}</p>
                    <p className="flex items-start gap-2 text-[#6B6B6B]">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B85C3C]" />
                      {riadData.address}
                    </p>
                  </div>
                </Card>
              </section>

              <section className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {quickInfo.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card
                      key={item.label}
                      className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm"
                    >
                      <Icon className="mb-3 h-5 w-5 text-[#B85C3C]" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8B9D83]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-base font-semibold text-[#2C2C2C]">
                        {item.value}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#6B6B6B]">
                        {item.detail}
                      </p>
                    </Card>
                  );
                })}
              </section>

              <section className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3">
                <Card className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm lg:col-span-2">
                  <div className="mb-4 flex items-center gap-2">
                    <HomeIcon className="h-5 w-5 text-[#B85C3C]" />
                    <h3 className="text-xl font-bold text-[#2C2C2C]">
                      {t.arrivalHouse}
                    </h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {arrivalSteps.map((step) => {
                      const Icon = step.icon;
                      return (
                        <div
                          key={step.title}
                          className="rounded-lg bg-[#F5F1E8] p-3"
                        >
                          <Icon className="mb-2 h-4 w-4 text-[#B85C3C]" />
                          <p className="text-sm font-semibold text-[#2C2C2C]">
                            {step.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[#6B6B6B]">
                            {step.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#6B6B6B]">
                    {houseNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </Card>

                <div className="flex flex-col gap-4">
                  <Card className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <Coffee className="h-5 w-5 text-[#B85C3C]" />
                      <h3 className="text-xl font-bold text-[#2C2C2C]">
                        {t.goodToKnow}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {essentials.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.title} className="flex gap-3">
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#8B9D83]" />
                            <div>
                              <p className="text-sm font-semibold text-[#2C2C2C]">
                                {item.title}
                              </p>
                              <p className="text-xs leading-5 text-[#6B6B6B]">
                                {item.text}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                  
                  <CurrencyConverter />
                </div>
              </section>

              {riadGallery.length > 0 && (
                <section className="mx-auto max-w-6xl">
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B85C3C]">
                      {t.realPhotos}
                    </p>
                    <h3 className="text-2xl font-bold text-[#2C2C2C]">
                      {t.lookInside}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {riadGallery.slice(0, 8).map((photo, index) => (
                      <img
                        key={photo}
                        src={photo}
                        alt={`${riadData.name} photo ${index + 1}`}
                        className={`h-36 w-full rounded-lg object-cover shadow-sm ring-1 ring-[#E0D5C7] md:h-44 ${
                          index === 0 ? "col-span-2 row-span-2 h-72 md:h-full" : ""
                        }`}
                      />
                    ))}
                  </div>
                </section>
              )}

              <section className="mx-auto max-w-6xl">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B85C3C]">
                      {t.firstPicks}
                    </p>
                    <h3 className="text-2xl font-bold text-[#2C2C2C]">
                      {t.nearbyFavorites}
                    </h3>
                    <p className="mt-1 max-w-xl text-sm text-[#6B6B6B]">
                      {t.placeTrust}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab("nearby")}
                    className="hidden rounded-lg border border-[#E0D5C7] bg-white px-4 py-2 text-sm font-semibold text-[#2C2C2C] hover:bg-[#F5F1E8] sm:inline-flex"
                    type="button"
                  >
                    {t.viewAll}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {nearbyPlaces.slice(0, 3).map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              </section>
            </div>
          )}

          {currentTab === "map" && (
            /* Fixed-height column: fills exactly the space between top of page and bottom nav.
               Bottom nav is ~72px. This layout never scrolls and never overlaps either bar. */
            <div
              className="flex flex-col"
              style={{ height: "calc(100dvh - 72px)" }}
            >
              {/* Compact filter strip — shrinks to its content, never pushed by map */}
              <div className="shrink-0 bg-white/90 px-4 pt-3 pb-2 shadow-md backdrop-blur-sm border-b border-[#E0D5C7]">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                      selectedCategory === null
                        ? "bg-[#B85C3C] text-white shadow-sm"
                        : "border border-[#E0D5C7] bg-white text-[#2C2C2C] hover:border-[#B85C3C]"
                    }`}
                    type="button"
                  >
                    {t.all}
                  </button>
                  {categoriesData.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                        selectedCategory === category.id
                          ? "text-white shadow-sm"
                          : "border border-[#E0D5C7] bg-white text-[#2C2C2C] hover:border-[#B85C3C]"
                      }`}
                      style={{
                        backgroundColor:
                          selectedCategory === category.id
                            ? category.color
                            : "white",
                        borderColor:
                          selectedCategory === category.id
                            ? category.color
                            : "#E0D5C7",
                      }}
                      type="button"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map fills ALL remaining vertical space — flex-1 + min-h-0 is the key */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <InteractiveMap
                  places={placesData}
                  selectedCategory={selectedCategory}
                  onPlaceSelect={setSelectedPlace}
                />
              </div>
            </div>
          )}

          {currentTab === "nearby" && (
            <div className="space-y-8 p-4">
              <section>
                <h2 className="mb-4 text-2xl font-bold text-[#2C2C2C]">
                  {t.nearRiad}
                </h2>
                <p className="-mt-2 mb-4 max-w-2xl text-sm text-[#6B6B6B]">
                  {t.placeTrust}
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {nearbyPlaces.slice(0, 6).map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-[#2C2C2C]">
                  {t.fiveMinute}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {walkablePlaces.slice(0, 6).map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-[#2C2C2C]">
                  {t.localFavorites}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {placesData
                    .filter((place) => place.local_favorite)
                    .slice(0, 6)
                    .map((place) => (
                      <PlaceCard key={place.id} place={place} />
                    ))}
                </div>
              </section>
            </div>
          )}

          {currentTab === "routes" && (
            <div className="space-y-4 p-4">
              <h2 className="mb-4 text-2xl font-bold text-[#2C2C2C]">
                {t.curated}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {routesData.map((route: Route) => (
                  <Card
                    key={route.id}
                    className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm backdrop-blur-sm"
                  >
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#2C2C2C]">
                          {route.name}
                        </h3>
                        <p className="text-xs font-semibold text-[#8B9D83]">
                          {route.duration} / {route.difficulty}
                        </p>
                      </div>
                      <Compass className="h-5 w-5 shrink-0 text-[#B85C3C]" />
                    </div>

                    <p className="mb-3 text-sm text-[#6B6B6B]">
                      {route.description}
                    </p>

                    <div className="mb-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#2C2C2C]">
                        {t.stops}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {route.stops.map((stop) => (
                          <span
                            key={stop}
                            className="rounded-full bg-[#F5F1E8] px-2 py-1 text-xs text-[#2C2C2C]"
                          >
                            {stop}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="flex gap-2 rounded bg-[#F5F1E8] p-2 text-xs text-[#6B6B6B]">
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B85C3C]" />
                      <span>{route.recommendation}</span>
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentTab === "essentials" && (
            <div className="space-y-4 p-4">
              <h2 className="mb-4 text-2xl font-bold text-[#2C2C2C]">
                {t.essentialInfo}
              </h2>

              <Card className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm backdrop-blur-sm">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-[#2C2C2C]">
                  <AlertCircle className="h-5 w-5 text-[#B85C3C]" />
                  {t.emergencyContacts}
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-semibold text-[#2C2C2C]">{t.police}</p>
                    <p className="text-[#6B6B6B]">+212 5 24 43 86 01</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#2C2C2C]">{t.ambulance}</p>
                    <p className="text-[#6B6B6B]">+212 5 24 44 79 99</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#2C2C2C]">
                      {t.touristPolice}
                    </p>
                    <p className="text-[#6B6B6B]">+212 5 24 38 46 01</p>
                  </div>
                </div>
              </Card>

              <Card className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm backdrop-blur-sm">
                <h3 className="mb-3 text-lg font-bold text-[#2C2C2C]">
                  {t.practicalTips}
                </h3>
                <ul className="list-disc space-y-2 pl-5 text-sm text-[#6B6B6B]">
                  {t.tips.map((tip: string) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </Card>

              <Card className="border-[#E0D5C7] bg-white/95 p-4 shadow-sm backdrop-blur-sm">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-[#2C2C2C]">
                  <MessageCircle className="h-5 w-5 text-[#B85C3C]" />
                  {t.feedbackTitle}
                </h3>
                <p className="mb-4 text-sm leading-6 text-[#6B6B6B]">
                  {t.feedbackCopy}
                </p>

                <div className="mb-4 grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFeedbackRating(rating)}
                      className={`rounded-lg border px-0 py-3 text-sm font-bold transition-all ${
                        feedbackRating === rating
                          ? "border-[#B85C3C] bg-[#B85C3C] text-white"
                          : "border-[#E0D5C7] bg-[#F5F1E8] text-[#2C2C2C] hover:border-[#B85C3C]"
                      }`}
                      type="button"
                      aria-label={`Rate this guide ${rating} out of 5`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>

                {feedbackSent && (
                  <p className="mb-3 rounded-lg bg-[#F5F1E8] px-3 py-2 text-sm font-semibold text-[#8B9D83]">
                    {t.feedbackThanks}
                  </p>
                )}

                <textarea
                  value={feedbackNote}
                  onChange={(event) => setFeedbackNote(event.target.value)}
                  placeholder={t.feedbackPlaceholder}
                  className="mb-3 min-h-24 w-full rounded-lg border border-[#E0D5C7] bg-white px-3 py-2 text-sm text-[#2C2C2C] outline-none transition-colors placeholder:text-[#9C9184] focus:border-[#B85C3C]"
                />

                <a
                  href={feedbackMailto()}
                  onClick={() => {
                    track("guide_feedback_email", {
                      rating: String(feedbackRating ?? "none"),
                      language,
                    });
                    setFeedbackSent(true);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#B85C3C] px-4 py-3 text-sm font-semibold text-white hover:bg-[#A04A2F]"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t.feedbackButton}
                </a>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )}

  {!showHero && (
        <button
          onClick={() => setLanguage(language === "en" ? "fr" : "en")}
          className="fixed right-4 top-4 z-40 rounded-full border border-[#E0D5C7] bg-white/90 px-4 py-2 text-sm font-semibold text-[#2C2C2C] shadow-sm backdrop-blur-sm hover:bg-[#F5F1E8]"
          type="button"
          aria-label={`Switch language to ${language === "en" ? "French" : "English"}`}
        >
          {t.switchLabel}
        </button>
      )}

      {!showHero && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#E0D5C7] bg-white/85 shadow-2xl backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-around">
            {[
              { id: "welcome", label: t.nav.guide, icon: HomeIcon },
              { id: "map", label: t.nav.map, icon: MapPin },
              { id: "nearby", label: t.nav.nearby, icon: Navigation },
              { id: "routes", label: t.nav.routes, icon: Compass },
              { id: "essentials", label: t.nav.help, icon: AlertCircle },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id as Tab)}
                  className={`flex flex-1 flex-col items-center gap-1 border-t-2 py-4 transition-all ${
                    isActive
                      ? "border-[#B85C3C] text-[#B85C3C]"
                      : "border-transparent text-[#6B6B6B] hover:text-[#2C2C2C]"
                  }`}
                  type="button"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {hasWhatsapp && (
        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-32 right-4 z-40 flex items-center gap-2 rounded-full bg-[#1FA463] p-4 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#188654] md:bottom-8 md:right-8"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="hidden text-sm font-semibold md:inline">
            {t.needHelp}
          </span>
        </a>
      )}

      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center"
            onClick={() => setSelectedPlace(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <Card className="max-h-[90vh] w-full overflow-y-auto border-[#E0D5C7] shadow-2xl">
                <div className="relative h-64 overflow-hidden md:h-80">
                  <img
                    src={selectedPlace.image}
                    alt={selectedPlace.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedPlace(null)}
                    className="absolute right-4 top-4 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-colors hover:bg-white"
                    type="button"
                    aria-label="Close place details"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h2 className="mb-2 text-3xl font-bold text-[#2C2C2C]">
                      {selectedPlace.name}
                    </h2>
                    <p className="text-sm font-semibold text-[#8B9D83]">
                      {selectedPlace.area} / {selectedPlace.category}
                    </p>
                  </div>

                  <p className="mb-6 leading-relaxed text-[#6B6B6B]">
                    {selectedPlace.description}
                  </p>

                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-[#F5F1E8] p-4">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#2C2C2C]">
                        {t.bestTime}
                      </p>
                      <p className="text-sm text-[#6B6B6B]">
                        {selectedPlace.best_time}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#F5F1E8] p-4">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#2C2C2C]">
                        {t.budget}
                      </p>
                      <p className="text-sm font-semibold text-[#B85C3C]">
                        {selectedPlace.budget}
                      </p>
                    </div>
                  </div>

                  {selectedPlace.is_order_system ? (
                    <div className="flex flex-col gap-3 rounded-xl border border-[#E0D5C7] bg-[#F5F1E8] p-4">
                      <p className="text-sm font-bold text-[#2C2C2C]">Where are you ordering from?</p>
                      <select
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                        className="w-full rounded-lg border border-[#E0D5C7] p-2.5 text-sm font-semibold text-[#2C2C2C] focus:border-[#B85C3C] focus:outline-none focus:ring-1 focus:ring-[#B85C3C]"
                      >
                        {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num.toString()}>
                            Room {num}
                          </option>
                        ))}
                        <option value="pool">Pool / Courtyard</option>
                        <option value="rooftop">Rooftop</option>
                      </select>
                      <a
                        href={`${selectedPlace.action_link}?room=${selectedRoom}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#B85C3C] px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-[#A04A2F]"
                      >
                        <ConciergeBell className="h-5 w-5" />
                        {selectedPlace.action_text || "Order Room Service"}
                      </a>
                    </div>
                  ) : (
                    <a
                      href={selectedPlace.action_link === "#" ? undefined : (selectedPlace.action_link || selectedPlace.google_maps)}
                      target={selectedPlace.action_link === "#" ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-all duration-300 ${
                        selectedPlace.action_link === "#" 
                          ? "bg-[#E0D5C7] cursor-not-allowed text-[#6B6B6B]" 
                          : "bg-[#B85C3C] hover:bg-[#A04A2F]"
                      }`}
                      onClick={(e) => {
                        if (selectedPlace.action_link === "#") e.preventDefault();
                      }}
                    >
                      {selectedPlace.action_link === "#" ? (
                        <Clock className="h-5 w-5" />
                      ) : selectedPlace.action_link ? (
                        <ConciergeBell className="h-5 w-5" />
                      ) : (
                        <MapPin className="h-5 w-5" />
                      )}
                      {selectedPlace.action_text || t.openInMaps}
                    </a>
                  )}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
