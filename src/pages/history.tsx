import React, { useEffect, useState } from 'react'
import { Layout } from '@/components/layout'
import { Map } from '@/components/map'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { appClient } from '@/lib/app-client'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight,
  Download,
  Filter,
  Route
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [beacons, setBeacons] = useState<any[]>([])
  const [selectedBeacon, setSelectedBeacon] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const beaconList = await appClient.db.beacons.list()
      setBeacons(beaconList)
      if (beaconList.length > 0) {
        setSelectedBeacon(beaconList[0].id)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!selectedBeacon) return
    const fetchHistory = async () => {
      const logs = await appClient.db.beaconHistory.list({
        where: { beaconId: selectedBeacon },
        orderBy: { timestamp: 'desc' },
        limit: 50
      })
      setHistory(logs)
    }
    fetchHistory()
  }, [selectedBeacon])

  const path = history.map(h => [h.latitude, h.longitude] as [number, number]).reverse()
  const currentBeacon = beacons.find(b => b.id === selectedBeacon)

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Movement History</h1>
            <p className="text-muted-foreground">Analyze past routes and location data logs.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Select Beacon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {beacons.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBeacon(b.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedBeacon === b.id 
                        ? "bg-primary text-primary-foreground font-medium" 
                        : "hover:bg-primary/10"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Path Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Logs</span>
                  <span className="font-bold">{history.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="font-bold">12.4 km</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Stops</span>
                  <span className="font-bold">4</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map View */}
          <div className="lg:col-span-9 space-y-6">
            <Card className="border-none shadow-md overflow-hidden h-[400px]">
              <Map 
                beacons={currentBeacon ? [currentBeacon] : []} 
                history={path}
                className="h-full w-full"
              />
            </Card>

            {/* Log Table */}
            <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Detailed Logs</CardTitle>
                  <CardDescription>Chronological list of position updates.</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                  {history.length} entries
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history.map((log, i) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {log.latitude.toFixed(6)}, {log.longitude.toFixed(6)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {log.speed > 0 ? 'Moving' : 'Stationary'}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  {history.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Route className="w-12 h-12 mx-auto opacity-20 mb-4" />
                      <p>No history records found for this beacon.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

