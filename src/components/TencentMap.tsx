import { useEffect, useRef } from 'react';
import type { AnchorData, CapsuleData } from '../api/types';

// 3D orange-red anchor pin
const ANCHOR_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56"><defs><radialGradient id="g" cx="40%" cy="35%" r="60%"><stop offset="0%" stop-color="%23ff6b3d"/><stop offset="60%" stop-color="%23e8451a"/><stop offset="100%" stop-color="%23c1300a"/></radialGradient><filter id="s" x="-20%" y="-10%" width="140%" height="130%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000" flood-opacity="0.25"/></filter></defs><path d="M22 2C11 2 2 11 2 22c0 16 20 32 20 32s20-16 20-32C42 11 33 2 22 2z" fill="url(%23g)" filter="url(%23s)"/><circle cx="22" cy="20" r="9" fill="white" opacity="0.9"/><circle cx="22" cy="20" r="5" fill="%23e8451a"/><ellipse cx="22" cy="54" rx="8" ry="2" fill="%23000" opacity="0.12"/></svg>`)}`;

// Capsule glow
const CAPSULE_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="%236366f1" opacity="0.15"/><circle cx="18" cy="18" r="11" fill="%236366f1"/><circle cx="18" cy="18" r="5" fill="white" opacity="0.9"/></svg>`)}`;

interface Props {
  center: { lat: number; lng: number } | null;
  trajectoryPath: Array<{ lat: number; lng: number }>;
  anchors: AnchorData[];
  capsules: CapsuleData[];
  routePath?: Array<{ lat: number; lng: number }>;
  onCapsuleClick?: (capsule: CapsuleData) => void;
  onAnchorClick?: (anchor: AnchorData) => void;
  zoom?: number;
  pitch?: number;
  rotation?: number;
  passive?: boolean;
  lineColor?: string;
  lineWidth?: number;
}

/**
 * All TMap operations happen imperatively via refs + a RAF update loop.
 * No React effect timing issues.
 */
export function TencentMap({
  center, trajectoryPath, anchors, capsules, routePath,
  onCapsuleClick, onAnchorClick,
  zoom = 16, pitch = 0, rotation: rotationProp, passive = false,
  lineColor = '#d4956e', lineWidth = 6,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Store ALL props in refs so the update loop always sees latest values
  const propsRef = useRef({
    center, trajectoryPath, anchors, capsules, routePath,
    onCapsuleClick, onAnchorClick, lineColor, lineWidth, passive, rotation: rotationProp,
  });
  propsRef.current = {
    center, trajectoryPath, anchors, capsules, routePath,
    onCapsuleClick, onAnchorClick, lineColor, lineWidth, passive, rotation: rotationProp,
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !window.TMap) return;

    // Fresh div for map
    const mapDiv = document.createElement('div');
    mapDiv.style.cssText = 'width:100%;height:100%';
    el.appendChild(mapDiv);

    const initCenter = propsRef.current.center;
    const c = initCenter
      ? new TMap.LatLng(initCenter.lat, initCenter.lng)
      : new TMap.LatLng(31.230, 121.474);

    let map: TMap.Map;
    try {
      map = new TMap.Map(mapDiv, {
        center: c,
        zoom,
        pitch,
        rotation: rotationProp ?? 20,
        // Hide default controls
        mapZoomType: (TMap as any).constants?.MAP_ZOOM_TYPE?.SCROLLWHEEL,
      });
    } catch (e) {
      console.error('[TMap] Map constructor failed:', e);
      mapDiv.remove();
      return;
    }

    // Remove default controls (compass, zoom, scale, rotation)
    try {
      const ctrl = (map as any).getControl?.();
      if (ctrl) {
        try { (map as any).removeControl(ctrl); } catch { /* */ }
      }
    } catch { /* */ }

    // Hide TMap UI via CSS on the map container
    const style = document.createElement('style');
    style.textContent = `
      .tmap-zoom-control, .tmap-control, .tmap-scale-control,
      .tmap-compass, .tmap-scale-text, .tmap-logo,
      [class*="tmap-zoom"], [class*="tmap-compass"], [class*="tmap-scale"],
      .rotate-bindary { display: none !important; }
    `;
    mapDiv.appendChild(style);

    // ── Overlay instances ──
    let polyline: TMap.MultiPolyline | null = null;
    let routePolyline: TMap.MultiPolyline | null = null;
    let anchorMarker: TMap.MultiMarker | null = null;
    let capsuleMarker: TMap.MultiMarker | null = null;

    // Track what's been drawn to avoid unnecessary updates
    let lastTrajectoryKey = '';
    let lastRouteKey = '';
    let lastAnchorIds = '';
    let lastCapsuleIds = '';
    let lastCenterKey = '';
    let lastRotation = rotationProp ?? 20;

    // ── Update loop — runs every 100ms to sync props → TMap smoothly ──
    const intervalId = setInterval(() => {
      const p = propsRef.current;

      // 1. Center + Rotation — batch into one smooth transition for passive mode
      const centerChanged = p.center && `${p.center.lat.toFixed(6)},${p.center.lng.toFixed(6)}` !== lastCenterKey;
      const rotChanged = p.rotation !== undefined && Math.abs(p.rotation - lastRotation) > 0.5;

      if (centerChanged || rotChanged) {
        if (p.center && centerChanged) lastCenterKey = `${p.center.lat.toFixed(6)},${p.center.lng.toFixed(6)}`;
        if (rotChanged) lastRotation = p.rotation!;

        try {
          if (p.passive && (map as any).easeTo) {
            const opts: any = { duration: 400 };
            if (p.center && centerChanged) opts.center = new TMap.LatLng(p.center.lat, p.center.lng);
            if (rotChanged) opts.rotation = p.rotation;
            (map as any).easeTo(opts);
          } else {
            if (p.center && centerChanged) map.setCenter(new TMap.LatLng(p.center.lat, p.center.lng));
            if (rotChanged) (map as any).setRotation?.(p.rotation);
          }
        } catch { /* */ }
      }

      // 2. Trajectory polyline
      const lastPt = p.trajectoryPath.length > 0 ? p.trajectoryPath[p.trajectoryPath.length - 1] : null;
      const trajKey = lastPt ? `${p.trajectoryPath.length}:${lastPt.lat.toFixed(5)},${lastPt.lng.toFixed(5)}` : '';
      if (p.trajectoryPath.length >= 2 && trajKey !== lastTrajectoryKey) {
        lastTrajectoryKey = trajKey;
        const paths = p.trajectoryPath.map((pt) => new TMap.LatLng(pt.lat, pt.lng));
        try {
          if (polyline) {
            polyline.setGeometries([{ id: 'traj', styleId: 'line', paths }]);
          } else {
            polyline = new TMap.MultiPolyline({
              map,
              styles: { line: { color: p.lineColor, width: p.lineWidth, showArrow: false, lineCap: 'round' } },
              geometries: [{ id: 'traj', styleId: 'line', paths }],
            });
          }
        } catch (e) { console.warn('[TMap] polyline:', e); }
      }

      // 2b. Route polyline (dashed, for navigation to capsule)
      if (p.routePath && p.routePath.length >= 2) {
        const rKey = p.routePath.map((pt) => `${pt.lat.toFixed(5)},${pt.lng.toFixed(5)}`).join(';');
        if (rKey !== lastRouteKey) {
          lastRouteKey = rKey;
          const paths = p.routePath.map((pt) => new TMap.LatLng(pt.lat, pt.lng));
          try {
            if (routePolyline) {
              routePolyline.setGeometries([{ id: 'route', styleId: 'dash', paths }]);
            } else {
              routePolyline = new TMap.MultiPolyline({
                map,
                styles: { dash: { color: '#6366f1', width: 8, showArrow: true, dashArray: [12, 8], lineCap: 'round' } },
                geometries: [{ id: 'route', styleId: 'dash', paths }],
              });
            }
          } catch (e) { console.warn('[TMap] route:', e); }
        }
      } else if (lastRouteKey !== '') {
        lastRouteKey = '';
        try { routePolyline?.setMap(null); routePolyline = null; } catch { /* */ }
      }

      // 3. Anchor markers
      const validAnchors = p.anchors.filter((a) => a.lat !== 0 || a.lng !== 0);
      const anchorKey = validAnchors.map((a) => a.id).join(',');
      if (anchorKey !== lastAnchorIds) {
        lastAnchorIds = anchorKey;
        if (validAnchors.length === 0) {
          try { anchorMarker?.setMap(null); } catch { /* */ }
        } else {
          const geos = validAnchors.map((a) => ({
            id: a.id, styleId: 'pin',
            position: new TMap.LatLng(a.lat, a.lng),
          }));
          try {
            if (anchorMarker) {
              anchorMarker.setGeometries(geos);
              anchorMarker.setMap(map);
            } else {
              anchorMarker = new TMap.MultiMarker({
                map,
                styles: { pin: { width: 44, height: 56, anchor: { x: 22, y: 56 }, src: ANCHOR_SVG } },
                geometries: geos,
              });
              if (!p.passive) {
                anchorMarker.on('click', (evt: any) => {
                  const id = evt?.geometry?.id;
                  const a = propsRef.current.anchors.find((x) => x.id === id);
                  if (a) propsRef.current.onAnchorClick?.(a);
                });
              }
            }
          } catch (e) { console.warn('[TMap] anchor:', e); }
        }
      }

      // 4. Capsule markers
      if (!p.passive) {
        const validCaps = p.capsules.filter((c) => c.lat !== 0 || c.lng !== 0);
        const capKey = validCaps.map((c) => c.id).join(',');
        if (capKey !== lastCapsuleIds) {
          lastCapsuleIds = capKey;
          if (validCaps.length === 0) {
            try { capsuleMarker?.setMap(null); } catch { /* */ }
          } else {
            const geos = validCaps.map((c) => ({
              id: c.id, styleId: 'cap',
              position: new TMap.LatLng(c.lat, c.lng),
            }));
            try {
              if (capsuleMarker) {
                capsuleMarker.setGeometries(geos);
                capsuleMarker.setMap(map);
              } else {
                capsuleMarker = new TMap.MultiMarker({
                  map,
                  styles: { cap: { width: 36, height: 36, anchor: { x: 18, y: 18 }, src: CAPSULE_SVG } },
                  geometries: geos,
                });
                capsuleMarker.on('click', (evt: any) => {
                  const id = evt?.geometry?.id;
                  const cc = propsRef.current.capsules.find((x) => x.id === id);
                  if (cc) propsRef.current.onCapsuleClick?.(cc);
                });
              }
            } catch (e) { console.warn('[TMap] capsule:', e); }
          }
        }
      }
    }, 100);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      try { polyline?.setMap(null); } catch { /* */ }
      try { routePolyline?.setMap(null); } catch { /* */ }
      try { anchorMarker?.setMap(null); } catch { /* */ }
      try { capsuleMarker?.setMap(null); } catch { /* */ }
      try { map.destroy(); } catch { /* */ }
      mapDiv.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full h-full">
      {/* Base map layer — lowest z */}
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* User position CSS dot */}
      {center && !passive && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[5]">
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 rounded-full bg-amber-500/30 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-[3px] rounded-full bg-amber-600 border-2 border-white shadow-[0_2px_8px_rgba(217,119,6,0.4)]" />
          </div>
        </div>
      )}

      {/* Warm vignette — above trajectory */}
      <div className="absolute inset-0 pointer-events-none z-[3]"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(251,248,241,0.15) 70%, rgba(251,248,241,0.35) 100%)' }} />

      {/* Passive: block interaction — above all map layers */}
      {passive && <div className="absolute inset-0 z-[6]" />}

      {/* Hide TMap default controls globally */}
      <style>{`
        .tmap-zoom-control, .tmap-control-bindary, .tmap-scale-control,
        .tmap-compass, .tmap-scale-text, .tmap-logo, .tmap-controlgroup,
        [class*="tmap-zoom"], [class*="tmap-compass"], [class*="tmap-scale"],
        [class*="tmap-logo"], [class*="tmap-control"], .rotate-bindary,
        .tmap-attribution { display: none !important; visibility: hidden !important; }
      `}</style>
    </div>
  );
}
