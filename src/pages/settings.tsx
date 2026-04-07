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
      toast.success("Маяк успешно добавлен")
    } catch (e) {
      console.error(e)
      toast.error("Не удалось добавить маяк")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот маяк?")) return
    try {
      await appClient.db.beacons.delete(id)
      fetchBeacons()
      toast.success("Маяк удален")
    } catch (e) {
      toast.error("Не удалось удалить")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Скопировано в буфер обмена")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
          <p className="text-muted-foreground">Управление маяками и мобильной интеграцией.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Beacon Management */}
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Мои маяки</CardTitle>
                <CardDescription>Регистрация и управление устройствами отслеживания.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsAdding(true)} disabled={isAdding}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить маяк
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAdding && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="name">Название маяка</Label>
                    <Input 
                      id="name" 
                      placeholder="Например: Мой телефон, Курьер 1" 
                      value={newBeaconName}
                      onChange={(e) => setNewBeaconName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Отмена</Button>
                    <Button size="sm" onClick={handleAddBeacon} disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Сохранить маяк
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {beacons.length === 0 && !isAdding && (
                  <div className="text-center py-8 text-muted-foreground italic">
                    Пока нет зарегистрированных маяков.
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
                          <span className="font-mono text-muted-foreground">API КЛЮЧ:</span>
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
                <CardTitle>Настройка Android</CardTitle>
              </div>
              <CardDescription>Подключите телефон как маяк отслеживания.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <Label className="text-[10px] uppercase text-muted-foreground">URL эндпоинта</Label>
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
                    Инструкция для телефона
                  </h4>
                  <ol className="text-sm space-y-3 list-decimal list-inside text-muted-foreground pl-1">
                    <li>Установите на Android приложение <span className="text-foreground font-medium">MacroDroid</span>.</li>
                    <li>В MacroDroid создайте новый макрос с любым удобным названием.</li>
                    <li>Добавьте триггер <span className="text-foreground font-medium">Период</span> и задайте нужный интервал.</li>
                    <li>Добавьте действие <span className="text-foreground font-medium">Поделиться местоположением</span> и в поле укажите: <span className="font-mono text-foreground">gps_data</span>.</li>
                    <li>Добавьте действие <span className="text-foreground font-medium">HTTP-запрос</span> и выберите метод <span className="text-foreground font-medium">POST</span>.</li>
                    <li>В настройках HTTP-запроса укажите URL из поля выше и задайте тайм-аут.</li>
                    <li>В тело сообщения вставьте:
                      <div className="bg-muted p-2 rounded mt-1 font-mono text-[10px] space-y-1">
                        <div>{`{`}</div>
                        <div className="pl-2">"beacon_id": "Ваш id",</div>
                        <div className="pl-2">"api_key": "ваш api",</div>
                        <div className="pl-2">"lat": {`{last_loc_lat}`},</div>
                        <div className="pl-2">"lon": {`{last_loc_long}`}</div>
                        <div>{`}`}</div>
                      </div>
                    </li>
                    <li>Сохраните макрос и запустите его.</li>
                  </ol>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold">Доступ к API</p>
                  <p className="text-xs text-muted-foreground">Пересоздайте глобальный системный ключ.</p>
                </div>
                <Button variant="outline" size="sm">
                  <Key className="w-4 h-4 mr-2" />
                  Пересоздать
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

