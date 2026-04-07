import React, { useEffect, useState } from 'react'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Smartphone, 
  Key, 
  Link as LinkIcon,
  Copy,
  Check,
  Smartphone as PhoneIcon,
  Info,
  Save,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { appClient } from '@/lib/app-client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export default function SettingsPage() {
  const { user } = useAuth()
  const [beacons, setBeacons] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newBeaconName, setNewBeaconName] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const ENDPOINT_URL = "/.netlify/functions/gps-update"

  useEffect(() => {
    fetchBeacons()
  }, [])

  const fetchBeacons = async () => {
    const list = await appClient.db.beacons.list()
    setBeacons(list)
  }

  const handleAddBeacon = async () => {
    if (!newBeaconName.trim()) return
    setLoading(true)
    try {
      // Generate a random 16-character API Key
      const apiKey = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
      
      await appClient.db.beacons.create({
        name: newBeaconName,
        userId: user?.id,
        apiKey: apiKey,
        lastLat: 0,
        lastLon: 0,
        lastSeen: new Date().toISOString()
      })
      setNewBeaconName('')
      setIsAdding(false)
      fetchBeacons()
      toast.success("Beacon added successfully")
    } catch (e) {
      console.error(e)
      toast.error("Failed to add beacon")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this beacon?")) return
    try {
      await appClient.db.beacons.delete(id)
      fetchBeacons()
      toast.success("Beacon deleted")
    } catch (e) {
      toast.error("Failed to delete")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your beacons and mobile integration.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Beacon Management */}
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Beacons</CardTitle>
                <CardDescription>Register and manage your tracking devices.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsAdding(true)} disabled={isAdding}>
                <Plus className="w-4 h-4 mr-2" />
                Add Beacon
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAdding && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="name">Beacon Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. My Phone, Delivery Truck A" 
                      value={newBeaconName}
                      onChange={(e) => setNewBeaconName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleAddBeacon} disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Beacon
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {beacons.length === 0 && !isAdding && (
                  <div className="text-center py-8 text-muted-foreground italic">
                    No beacons registered yet.
                  </div>
                )}
                {beacons.map(beacon => (
                  <div key={beacon.id} className="space-y-4 p-4 border rounded-lg group hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{beacon.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">ID: {beacon.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(beacon.id)}
                        >
                          <Trash2 className="h-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-2 rounded text-xs space-y-2">
                      <div className="flex items-center justify-between group/key">
                        <div className="flex items-center gap-2">
                          <Key className="w-3 h-3 text-muted-foreground" />
                          <span className="font-mono text-muted-foreground">API KEY:</span>
                          <span className="font-mono">{beacon.apiKey || '********'}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => copyToClipboard(beacon.apiKey)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Android Integration */}
          <Card className="border-none shadow-md overflow-hidden border-t-4 border-primary">
            <CardHeader className="bg-primary/5 pb-2">
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-5 h-5 text-primary" />
                <CardTitle>Android Setup</CardTitle>
              </div>
              <CardDescription>Connect your phone as a tracking beacon.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <Label className="text-[10px] uppercase text-muted-foreground">Endpoint URL</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs break-all bg-background p-2 rounded border font-mono">
                      {ENDPOINT_URL}
                    </code>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(ENDPOINT_URL)}>
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-2 text-sm">
                    <Info className="w-4 h-4 text-primary" />
                    Instructions for Phone
                  </h4>
                  <ol className="text-sm space-y-3 list-decimal list-inside text-muted-foreground pl-1">
                    <li>Install a GPS Logger app on your Android device.</li>
                    <li>Set the <span className="text-foreground font-medium">URL</span> to the endpoint above.</li>
                    <li>Set the <span className="text-foreground font-medium">HTTP Method</span> to <span className="text-foreground font-medium">POST</span>.</li>
                    <li>Set <span className="text-foreground font-medium">Body Type</span> to <span className="text-foreground font-medium">JSON</span>.</li>
                    <li>Include these fields in the JSON body:
                      <div className="bg-muted p-2 rounded mt-1 font-mono text-[10px] space-y-1">
                        <div>{`{`}</div>
                        <div className="pl-2">"beacon_id": "YOUR_BEACON_ID",</div>
                        <div className="pl-2">"api_key": "YOUR_API_KEY",</div>
                        <div className="pl-2">"lat": %lat, "lon": %lon</div>
                        <div>{`}`}</div>
                      </div>
                    </li>
                    <li>Enable background tracking and start logging.</li>
                  </ol>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold">API Access</p>
                  <p className="text-xs text-muted-foreground">Regenerate your global system key.</p>
                </div>
                <Button variant="outline" size="sm">
                  <Key className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

