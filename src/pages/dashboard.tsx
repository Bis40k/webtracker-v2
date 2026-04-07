import React, { useEffect, useState } from 'react'
import { Layout } from '@/components/layout'
import { Map } from '@/components/map'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { appClient } from '@/lib/app-client'
import { 
  Activity, 
  Battery, 
  MapPin, 
  ShieldCheck, 
  Zap,
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const [beacons, setBeacons] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalDistance: 0,
    activeBeacons: 0,
    securityScore: 98,
    lastActivity: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      const beaconList = await appClient.db.beacons.list()
      setBeacons(beaconList)
      
      setStats(prev => ({
        ...prev,
        activeBeacons: beaconList.length,
        lastActivity: beaconList[0]?.lastSeen || new Date().toISOString()
      }))
    }
    fetchData()
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Обзор системы</h1>
            <p className="text-muted-foreground">Статус вашей сети отслеживания в реальном времени.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="hidden md:flex">
              <Clock className="w-4 h-4 mr-2" />
              История
            </Button>
            <Button size="sm">
              <Zap className="w-4 h-4 mr-2" />
              Онлайн-режим
            </Button>
          </div>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={item}>
            <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Активные маяки</CardTitle>
                <Activity className="h-4 w-4 opacity-70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeBeacons}</div>
                <p className="text-xs opacity-70">+1 за последний час</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Общая дистанция</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">124.5 km</div>
                <p className="text-xs text-muted-foreground">+12% за прошлую неделю</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Статус безопасности</CardTitle>
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.securityScore}%</div>
                <p className="text-xs text-muted-foreground">Высокое соответствие OWASP</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Задержка сети</CardTitle>
                <Activity className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42ms</div>
                <p className="text-xs text-muted-foreground">Оптимальная производительность</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4 border-none shadow-md overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>Положение устройств</CardTitle>
              <CardDescription>Онлайн-отслеживание всех зарегистрированных маяков.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-[400px]">
              <Map 
                beacons={beacons} 
                className="h-full w-full" 
                interactive={true} 
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 border-none shadow-md">
            <CardHeader>
              <CardTitle>Последняя активность</CardTitle>
              <CardDescription>Свежие логи перемещений в вашей сети.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {beacons.length > 0 ? beacons.slice(0, 5).map((beacon) => (
                  <div key={beacon.id} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{beacon.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Перемещение: {beacon.lastLat.toFixed(4)}, {beacon.lastLon.toFixed(4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(beacon.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto opacity-20 mb-4" />
                    <p>Активность пока не зафиксирована.</p>
                  </div>
                )}
                <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/10">
                  Показать всю активность
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

