// src/types/mapboxTypes.ts

export interface MapboxAnchor {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  timestamp: string;
}

export interface MapboxCapsule {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  distance: number;
}