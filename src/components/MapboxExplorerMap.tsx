import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { MapboxAnchor, MapboxCapsule } from '../types/mapboxTypes';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MapboxExplorerMapProps {
  center: [number, number]; // [longitude, latitude]
  trajectoryPath: { lat: number; lng: number }[];
  anchors: MapboxAnchor[];
  capsules: MapboxCapsule[];
  onAnchorClick?: (anchor: MapboxAnchor) => void;
  onCapsuleClick?: (capsule: MapboxCapsule) => void;
  zoom?: number;
  passive?: boolean;
  lineColor?: string;
  lineWidth?: number;
}

export function MapboxExplorerMap({
  center,
  trajectoryPath,
  anchors,
  capsules,
  onAnchorClick,
  onCapsuleClick,
  zoom = 12,
  passive = false,
  lineColor = '#e8451a',
  lineWidth = 4,
}: MapboxExplorerMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 清除所有标记
  const clearMarkers = useCallback(() => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
  }, []);

  // 添加锚点和胶囊标记
  const addMarkers = useCallback((mapInstance: mapboxgl.Map) => {
    // 确保地图样式已加载
    if (!mapInstance.isStyleLoaded()) {
      console.warn("Map style not loaded yet, skipping marker addition");
      return;
    }
    
    clearMarkers();

    // 添加轨迹线
    if (trajectoryPath.length > 1) {
      const lineCoordinates = trajectoryPath.map(point => [point.lng, point.lat] as [number, number]);

      // 移除旧的轨迹线（如果存在）
      try {
        if (mapInstance.getLayer('route')) {
          mapInstance.removeLayer('route');
        }
      } catch (e) {
        // 如果图层不存在，忽略错误
      }
      
      try {
        if (mapInstance.getSource('route')) {
          mapInstance.removeSource('route');
        }
      } catch (e) {
        // 如果源不存在，忽略错误
      }

      // 添加新的轨迹线
      mapInstance.addSource('route', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: lineCoordinates
            }
          }]
        }
      });

      mapInstance.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': lineColor,
          'line-width': lineWidth,
          'line-opacity': 0.8
        }
      });
    }

    // 添加锚点标记
    anchors.forEach(anchor => {
      const el = document.createElement('div');
      el.className = 'anchor-marker';
      el.innerHTML = `
        <div class="relative">
          <div class="w-8 h-8 rounded-full bg-orange-500 border-2 border-white shadow-lg flex items-center justify-center cursor-pointer">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      `;
      
      el.addEventListener('click', () => {
        if (!passive && onAnchorClick) {
          onAnchorClick(anchor);
        }
      });
      
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([anchor.lng, anchor.lat])
        .addTo(mapInstance);
      
      markers.current.push(marker);
    });

    // 添加胶囊标记
    capsules.forEach(capsule => {
      const el = document.createElement('div');
      el.className = 'capsule-marker';
      el.innerHTML = `
        <div class="relative">
          <div class="w-8 h-8 rounded-full bg-purple-500 border-2 border-white shadow-lg flex items-center justify-center animate-pulse cursor-pointer">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 00.39.242l9.57 3.593a1 1 0 00.788 0l7-3a1 1 0 000-1.839l-7-3zM4.862 5.387A1 1 0 003.5 6.04v6.595a1 1 0 00.724.964l6.5 2.25v-8.089l-6.138-2.63z"/>
            </svg>
          </div>
          ${capsule.distance < 100 ? `<div class="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-1 py-0.5 whitespace-nowrap">${Math.round(capsule.distance)}m</div>` : ''}
        </div>
      `;
      
      el.addEventListener('click', () => {
        if (!passive && onCapsuleClick) {
          onCapsuleClick(capsule);
        }
      });
      
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([capsule.lng, capsule.lat])
        .addTo(mapInstance);
      
      markers.current.push(marker);
    });
  }, [anchors, capsules, onAnchorClick, onCapsuleClick, passive, trajectoryPath, lineColor, lineWidth, clearMarkers]);

  useEffect(() => {
    if (map.current) return; // 初始化后不再重复初始化

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
      attributionControl: false
    });

    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    mapInstance.on('load', () => {
      map.current = mapInstance;
      setMapLoaded(true);
      // 地图加载完成后添加标记
      addMarkers(mapInstance);
    });

    // 添加自定义Attribution
    const attribution = document.createElement('div');
    attribution.className = 'mapboxgl-ctrl mapboxgl-ctrl-attrib';
    attribution.style.cssText = `
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(255, 255, 255, 0.8);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      color: #666;
      z-index: 10;
    `;
    attribution.textContent = '© Mapbox © OpenStreetMap';
    mapContainer.current?.appendChild(attribution);

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
      clearMarkers();
    };
  }, [center, zoom, addMarkers]);

  // 当数据变化时更新标记
  useEffect(() => {
    if (map.current && mapLoaded) {
      // 确保地图样式已加载后再添加标记
      const updateMarkers = () => {
        if (map.current && map.current.isStyleLoaded()) {
          addMarkers(map.current);
        } else {
          // 如果样式还没加载完成，稍后再试
          setTimeout(updateMarkers, 100);
        }
      };
      updateMarkers();
    }
  }, [mapLoaded, addMarkers, trajectoryPath, anchors, capsules]);

  // 当中心点变化时移动地图
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.flyTo({
        center: center,
        zoom: zoom,
        essential: true
      });
    }
  }, [center, zoom, mapLoaded]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* 用户位置标记 */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="relative">
          <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-ping opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
        </div>
      </div>
      
      <style>{`
        .anchor-marker:hover, .capsule-marker:hover {
          transform: scale(1.1);
          cursor: ${passive ? 'default' : 'pointer'};
        }
      `}</style>
    </div>
  );
}
