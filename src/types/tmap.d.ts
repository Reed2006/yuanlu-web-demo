/* eslint-disable @typescript-eslint/no-explicit-any */

/** Tencent Map GL JS SDK type declarations */
declare namespace TMap {
  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  interface MapOptions {
    center: LatLng;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    rotation?: number;
    pitch?: number;
    mapStyleId?: string;
    baseMap?: any;
    viewMode?: string;
  }

  interface MapEvent {
    latLng: LatLng;
    point: { x: number; y: number };
    type: string;
  }

  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latLng: LatLng): void;
    getCenter(): LatLng;
    setZoom(zoom: number): void;
    getZoom(): number;
    panTo(latLng: LatLng, opts?: any): void;
    on(event: string, handler: (e: any) => void): void;
    off(event: string, handler: (e: any) => void): void;
    destroy(): void;
  }

  interface PolylineStyleOptions {
    color: string;
    width: number;
    lineCap?: string;
    dashArray?: number[];
    showArrow?: boolean;
  }

  interface PolylineGeometry {
    id: string;
    styleId: string;
    paths: LatLng[];
  }

  interface MultiPolylineOptions {
    map: Map;
    styles: Record<string, PolylineStyleOptions>;
    geometries: PolylineGeometry[];
  }

  class MultiPolyline {
    constructor(options: MultiPolylineOptions);
    setGeometries(geometries: PolylineGeometry[]): void;
    setMap(map: Map | null): void;
    destroy(): void;
  }

  interface MarkerStyleOptions {
    width: number;
    height: number;
    anchor?: { x: number; y: number };
    src?: string;
  }

  interface MarkerGeometry {
    id: string;
    styleId: string;
    position: LatLng;
    properties?: Record<string, any>;
  }

  interface MultiMarkerOptions {
    map: Map;
    styles: Record<string, MarkerStyleOptions>;
    geometries: MarkerGeometry[];
  }

  class MultiMarker {
    constructor(options: MultiMarkerOptions);
    setGeometries(geometries: MarkerGeometry[]): void;
    setMap(map: Map | null): void;
    on(event: string, handler: (e: any) => void): void;
    destroy(): void;
  }

  class DOMOverlay {
    constructor(options: any);
    setMap(map: Map | null): void;
    destroy(): void;
  }

  namespace service {
    interface DrivingOptions {
      from: LatLng;
      to: LatLng;
    }

    interface DrivingResult {
      result: {
        routes: Array<{
          distance: number;
          duration: number;
          polyline: Array<{ lat: number; lng: number }>;
        }>;
      };
    }

    class Driving {
      constructor(options?: any);
      search(params: DrivingOptions): Promise<DrivingResult>;
    }

    class Walking {
      constructor(options?: any);
      search(params: DrivingOptions): Promise<DrivingResult>;
    }
  }
}

interface Window {
  TMap: typeof TMap;
}
