import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Radio, Battery, Signal, Navigation } from 'lucide-react'

// Fix for Leaflet default icon issues in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

const beaconIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-12 h-12 bg-primary/20 rounded-full animate-ping"></div>
      <div class="relative w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center">
        <div class="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

interface Beacon {
  id: string
  name: string
  lastLat: number
  lastLon: number
  battery?: number
  signal?: number
  lastSeen: string
}

interface MapProps {
  beacons: Beacon[]
  history?: [number, number][]
  center?: [number, number]
  zoom?: number
  className?: string
  interactive?: boolean
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export function Map({ 
  beacons, 
  history = [], 
  center = [0, 0], 
  zoom = 13, 
  className = "h-full w-full",
  interactive = true 
}: MapProps) {
  // Use first beacon as center if center is default and beacons exist
  const finalCenter = (center[0] === 0 && center[1] === 0 && beacons.length > 0)
    ? [beacons[0].lastLat, beacons[0].lastLon] as [number, number]
    : center

  return (
    <div className={className}>
      <MapContainer 
        center={finalCenter} 
        zoom={zoom} 
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        className="h-full w-full z-0"
      >
        <ChangeView center={finalCenter} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {history.length > 1 && (
          <Polyline 
            positions={history} 
            color="hsl(var(--primary))" 
            weight={3} 
            opacity={0.6}
            dashArray="10, 10"
          />
        )}

        {beacons.map((beacon) => (
          <Marker 
            key={beacon.id} 
            position={[beacon.lastLat, beacon.lastLon]} 
            icon={beaconIcon}
          >
            <Popup className="rounded-xl overflow-hidden shadow-xl border-none">
              <div className="p-1 space-y-2 min-w-[200px]">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-primary">{beacon.name}</span>
                  <div className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full font-medium">
                    АКТИВЕН
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Battery className="w-3 h-3 text-emerald-500" />
                    <span>{beacon.battery ?? 85}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Signal className="w-3 h-3 text-blue-500" />
                    <span>{beacon.signal ?? -65} dBm</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                    <Navigation className="w-3 h-3" />
                    <span className="truncate">{beacon.lastLat.toFixed(6)}, {beacon.lastLon.toFixed(6)}</span>
                  </div>
                </div>
                
                <div className="text-[10px] text-muted-foreground pt-2 border-t">
                  Обновлено: {new Date(beacon.lastSeen).toLocaleTimeString()}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
