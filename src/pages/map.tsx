import React, { useEffect, useState, useRef } from 'react'
import { Layout } from '@/components/layout'
import { Map as LeafletMap } from '@/components/map'
import { appClient } from '@/lib/app-client'
import { useAuth } from '@/hooks/use-auth'
import { 
  Search, 
  Layers, 
  Navigation2, 
  Plus, 
  Minus,
  Maximize2,
  Settings2,
  History,
  Signal,
  Battery,
  MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function MapPage() {
  const { user } = useAuth()
  const [beacons, setBeacons] = useState<any[]>([])
  const [selectedBeacon, setSelectedBeacon] = useState<string | null>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!user?.id) return

    const fetchData = async () => {
      const beaconList = await appClient.db.beacons.list()
      setBeacons(beaconList)
    }
    fetchData()

    let channel: any = null
    const initRealtime = async () => {
      channel = appClient.realtime.channel('beacon-update')
      channelRef.current = channel
      
      await channel.subscribe({ userId: user.id })
      
      channel.onMessage((msg: any) => {
        if (msg.type === 'location-update') {
          setBeacons(prev => prev.map(b => 
            b.id === msg.data.id ? { ...b, ...msg.data, lastUpdated: new Date().toISOString() } : b
          ))
        }
      })
    }
    
    initRealtime()
    return () => { channel?.unsubscribe() }
  }, [user?.id])

  const currentBeacon = beacons.find(b => b.id === selectedBeacon)

  return (
    <Layout>
      <div className="relative flex-1 bg-muted/30">
        {/* Full Screen Map */}
        <LeafletMap 
          beacons={beacons} 
          center={currentBeacon ? [currentBeacon.latitude, currentBeacon.longitude] : undefined}
          zoom={currentBeacon ? 16 : 13}
          className="h-full w-full" 
        />

        {/* Floating Controls - Left */}
        <div className="absolute top-4 left-4 z-10 space-y-2">
          <Card className="p-1 border-none shadow-xl bg-background/95 backdrop-blur-md">
            <div className="flex flex-col">
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/10 hover:text-primary">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/10 hover:text-primary">
                <Layers className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/10 hover:text-primary">
                <Maximize2 className="h-5 w-5" />
              </Button>
            </div>
          </Card>
          <Card className="p-1 border-none shadow-xl bg-background/95 backdrop-blur-md">
            <div className="flex flex-col">
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/10 hover:text-primary">
                <Plus className="h-5 w-5" />
              </Button>
              <div className="h-px bg-border mx-2" />
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/10 hover:text-primary">
                <Minus className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Beacon List - Right Panel */}
        <div className="absolute top-4 right-4 z-10 w-80 max-h-[calc(100vh-8rem)] hidden md:block">
          <Card className="border-none shadow-2xl bg-background/95 backdrop-blur-md overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-border bg-primary/5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Маяки онлайн</h3>
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] rounded-full font-bold">
                  {beacons.length} В СЕТИ
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {beacons.map((beacon) => (
                <button
                  key={beacon.id}
                  onClick={() => setSelectedBeacon(beacon.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all group relative overflow-hidden",
                    selectedBeacon === beacon.id 
                      ? "bg-primary text-primary-foreground shadow-lg" 
                      : "hover:bg-primary/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold truncate pr-2">{beacon.name}</span>
                    <Navigation2 className={cn("w-3 h-3 rotate-45", selectedBeacon === beacon.id ? "text-primary-foreground" : "text-primary")} />
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <div className="flex items-center gap-1 opacity-80">
                      <Signal className="w-3 h-3" />
                      <span>{beacon.signal || -65} dBm</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-80">
                      <Battery className="w-3 h-3" />
                      <span>{beacon.battery || 85}%</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-80 ml-auto">
                      <span>{new Date(beacon.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Selected Beacon Details - Bottom Overlay */}
        {currentBeacon && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
            <Card className="p-6 border-none shadow-2xl bg-background/95 backdrop-blur-xl border-t-4 border-primary animate-slide-up">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{currentBeacon.name}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Онлайн • {currentBeacon.latitude.toFixed(6)}, {currentBeacon.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-primary/20 hover:bg-primary/5">
                    <History className="w-4 h-4 mr-2" />
                    История
                  </Button>
                  <Button size="sm">
                    <Settings2 className="w-4 h-4 mr-2" />
                    Управление
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedBeacon(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}

function X({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

