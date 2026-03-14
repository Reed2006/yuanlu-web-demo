import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { X, Navigation } from "lucide-react";
import { useAppState } from "../../contexts/AppStateContext";

function bearingTo(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const dLng = ((toLng - fromLng) * Math.PI) / 180;
  const lat1 = (fromLat * Math.PI) / 180;
  const lat2 = (toLat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function haversineM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function directionLabel(deg: number): string {
  const dirs = [
    "北", "东北", "东", "东南", "南", "西南", "西", "西北",
  ];
  return dirs[Math.round(deg / 45) % 8] + "方向";
}

export function CapsuleARSearch() {
  const navigate = useNavigate();
  const { nearbyCapsules, currentPosition } = useAppState();

  const targetCapsule = nearbyCapsules[0];
  const targetLat = targetCapsule?.lat ?? currentPosition.lat ?? 31.2304;
  const targetLng = targetCapsule?.lng ?? currentPosition.lng ?? 121.4737;

  const [distance, setDistance] = useState<number | null>(null);
  const [direction, setDirection] = useState("定位中...");
  const [arrowRotation, setArrowRotation] = useState(0);
  const [cameraOpacity, setCameraOpacity] = useState(0);
  const [showPickupButton, setShowPickupButton] = useState(false);

  const compassHeading = useRef(0);
  const userPos = useRef<{ lat: number; lng: number } | null>(
    currentPosition.lat !== null && currentPosition.lng !== null
      ? { lat: currentPosition.lat, lng: currentPosition.lng }
      : null,
  );

  // Camera fade-in
  useEffect(() => {
    const fadeIn = setInterval(() => {
      setCameraOpacity((prev) => {
        if (prev >= 1) {
          clearInterval(fadeIn);
          return 1;
        }
        return prev + 0.05;
      });
    }, 50);
    return () => clearInterval(fadeIn);
  }, []);

  // Update arrow direction toward target
  const updateArrow = useCallback(() => {
    const pos = userPos.current;
    if (!pos) return;
    const bearing = bearingTo(pos.lat, pos.lng, targetLat, targetLng);
    const relative = (bearing - compassHeading.current + 360) % 360;
    setArrowRotation(relative);
    setDirection(directionLabel(bearing));
    const dist = haversineM(pos.lat, pos.lng, targetLat, targetLng);
    setDistance(Math.round(dist));
    if (dist <= 10) {
      setShowPickupButton(true);
    }
  }, [targetLat, targetLng]);

  // Real GPS tracking
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        userPos.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        updateArrow();
      },
      () => {},
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 3000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [updateArrow]);

  // Real device compass (DeviceOrientationEvent)
  useEffect(() => {
    let permissionGranted = false;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // iOS uses webkitCompassHeading, Android uses alpha
      const heading =
        (e as DeviceOrientationEvent & { webkitCompassHeading?: number })
          .webkitCompassHeading ??
        (e.alpha !== null ? (360 - e.alpha) % 360 : 0);
      compassHeading.current = heading;
      updateArrow();
    };

    const requestPermission = async () => {
      // iOS 13+ requires explicit permission
      const DOE = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (typeof DOE.requestPermission === "function") {
        try {
          const perm = await DOE.requestPermission();
          if (perm === "granted") {
            permissionGranted = true;
            window.addEventListener("deviceorientation", handleOrientation);
          }
        } catch {
          // User denied — fall back to GPS heading only
        }
      } else {
        permissionGranted = true;
        window.addEventListener("deviceorientation", handleOrientation);
      }
    };

    requestPermission();

    return () => {
      if (permissionGranted) {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
    };
  }, [updateArrow]);

  const distLabel = distance !== null ? `${distance}m` : "...";

  return (
    <div
      className="w-full max-w-[430px] h-[100dvh] mx-auto bg-black overflow-hidden relative"
      style={{
        opacity: cameraOpacity,
        transition: "opacity 1s ease-in-out",
      }}
    >
      {/* AR Camera View */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-600">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.03) 2px,
              rgba(255,255,255,0.03) 4px
            )`,
          }}
        />
      </div>

      {/* Mystical Light Beams */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className="absolute w-32 h-96 opacity-60"
          style={{
            background:
              "linear-gradient(to top, rgba(251, 146, 60, 0.8), rgba(234, 179, 8, 0.6), transparent)",
            filter: "blur(30px)",
            transform: `translateY(-20%) rotate(${arrowRotation - 90}deg)`,
            transition: "transform 0.3s ease",
          }}
        />
        <div
          className="absolute w-24 h-80 opacity-40"
          style={{
            background:
              "linear-gradient(to top, rgba(251, 191, 36, 0.6), transparent)",
            filter: "blur(25px)",
            transform: `translateY(-10%) translateX(40px) rotate(${arrowRotation - 80}deg)`,
            transition: "transform 0.3s ease",
          }}
        />

        {/* Target glow point */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2"
          style={{
            width: distance !== null && distance < 50 ? "80px" : "60px",
            height: distance !== null && distance < 50 ? "80px" : "60px",
            transition: "all 0.5s ease",
          }}
        >
          <div
            className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-400 rounded-full animate-pulse"
            style={{
              boxShadow:
                distance !== null && distance < 50
                  ? "0 0 60px rgba(251, 146, 60, 0.8), 0 0 120px rgba(251, 146, 60, 0.4)"
                  : "0 0 40px rgba(251, 146, 60, 0.8), 0 0 80px rgba(251, 146, 60, 0.4)",
            }}
          />
        </div>

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-300 rounded-full"
            style={{
              left: `${30 + i * 8}%`,
              top: `${20 + (i % 3) * 20}%`,
              animation: `float ${3 + i * 0.3}s ease-in-out infinite ${i * 0.2}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Distance Indicator */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full">
          <div className="text-center">
            <div className="text-3xl font-light text-white mb-1">
              {distLabel}
            </div>
            <div className="text-xs text-amber-300">{direction}</div>
          </div>
        </div>
      </div>

      {/* Instruction Text */}
      <div className="absolute bottom-32 left-0 right-0 z-10 px-8">
        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-5 text-center">
          <p className="text-sm text-white/90 leading-relaxed">
            跟随光束靠近胶囊
          </p>
          {distance !== null && distance < 50 && (
            <p className="text-xs text-amber-300 mt-2 animate-pulse">
              快到了...
            </p>
          )}
        </div>
      </div>

      {/* Compass Indicator */}
      <div className="absolute top-1/2 right-6 -translate-y-1/2 z-10">
        <div className="w-16 h-16 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center">
          <Navigation
            className="w-7 h-7 text-amber-300"
            style={{
              transform: `rotate(${arrowRotation}deg)`,
              transition: "transform 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Exit Button */}
      <button
        onClick={() => navigate("/yuan")}
        className="absolute top-6 left-5 z-20 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Pickup Button */}
      {showPickupButton && (
        <button
          onClick={() => navigate("/yuan/capsule-open")}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full shadow-lg flex items-center justify-center"
        >
          <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full animate-pulse" />
          </div>
        </button>
      )}

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}
