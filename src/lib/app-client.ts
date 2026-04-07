import { supabase } from './supabase-client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export type AppUser = {
  id: string
  email: string
  displayName: string
}

type Beacon = {
  id: string
  userId?: string
  name: string
  apiKey?: string
  lastLat: number
  lastLon: number
  lastSeen: string
  battery?: number
  signal?: number
}

type BeaconHistory = {
  id: string
  userId?: string
  beaconId: string
  latitude: number
  longitude: number
  speed: number
  timestamp: string
}

const BEACONS_KEY = 'webtracker_beacons'
const HISTORY_KEY = 'webtracker_history'
const CHANNEL = 'webtracker-realtime'

const authListeners = new Set<(state: { user: AppUser | null; isLoading: boolean }) => void>()
const realtimeListeners = new Set<(msg: any) => void>()
const bc = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL) : null

if (bc) {
  bc.onmessage = (event) => {
    realtimeListeners.forEach((listener) => listener(event.data))
  }
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

function convertSupabaseUser(user: SupabaseUser | null): AppUser | null {
  if (!user) return null
  return {
    id: user.id,
    email: user.email || '',
    displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
  }
}

function notifyAuth(user: AppUser | null) {
  authListeners.forEach((cb) => cb({ user, isLoading: false }))
}

function seedData(userId: string) {
  const beacons = readJson<Beacon[]>(BEACONS_KEY, [])
  if (beacons.length > 0) return
  const now = new Date().toISOString()
  writeJson(BEACONS_KEY, [
    {
      id: crypto.randomUUID(),
      name: 'Demo Beacon',
      userId,
      apiKey: Math.random().toString(36).slice(2, 18),
      lastLat: 55.7558,
      lastLon: 37.6176,
      lastSeen: now,
      battery: 92,
      signal: -58,
    },
  ])
  writeJson(HISTORY_KEY, [])
}

const auth = {
  onAuthStateChanged(cb: (state: { user: AppUser | null; isLoading: boolean }) => void) {
    authListeners.add(cb)
    
    // Initial state
    cb({ user: null, isLoading: true })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const appUser = convertSupabaseUser(session?.user || null)
      if (appUser) {
        seedData(appUser.id)
      }
      cb({ user: appUser, isLoading: false })
      notifyAuth(appUser)
    })

    return () => {
      authListeners.delete(cb)
      subscription?.unsubscribe()
    }
  },
  async logout() {
    await supabase.auth.signOut()
    notifyAuth(null)
  },
}

const db = {
  beacons: {
    async list(): Promise<Beacon[]> {
      return readJson<Beacon[]>(BEACONS_KEY, [])
    },
    async get(id: string): Promise<Beacon | undefined> {
      return readJson<Beacon[]>(BEACONS_KEY, []).find((b) => b.id === id)
    },
    async create(data: Partial<Beacon> & { name: string }): Promise<Beacon> {
      const now = new Date().toISOString()
      const next: Beacon = {
        id: crypto.randomUUID(),
        name: data.name,
        userId: data.userId,
        apiKey: data.apiKey ?? Math.random().toString(36).slice(2, 18),
        lastLat: data.lastLat ?? 0,
        lastLon: data.lastLon ?? 0,
        lastSeen: data.lastSeen ?? now,
        battery: data.battery ?? 100,
        signal: data.signal ?? -60,
      }
      const list = readJson<Beacon[]>(BEACONS_KEY, [])
      writeJson(BEACONS_KEY, [next, ...list])
      return next
    },
    async update(id: string, patch: Partial<Beacon>) {
      const list = readJson<Beacon[]>(BEACONS_KEY, [])
      const updated = list.map((b) => (b.id === id ? { ...b, ...patch } : b))
      writeJson(BEACONS_KEY, updated)
    },
    async delete(id: string) {
      const list = readJson<Beacon[]>(BEACONS_KEY, [])
      writeJson(BEACONS_KEY, list.filter((b) => b.id !== id))
    },
  },
  beaconHistory: {
    async list(params?: { where?: { beaconId?: string }; orderBy?: { timestamp?: 'desc' | 'asc' }; limit?: number }) {
      let list = readJson<BeaconHistory[]>(HISTORY_KEY, [])
      if (params?.where?.beaconId) {
        list = list.filter((h) => h.beaconId === params.where?.beaconId)
      }
      if (params?.orderBy?.timestamp === 'desc') {
        list = [...list].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
      }
      if (params?.limit) {
        list = list.slice(0, params.limit)
      }
      return list
    },
    async create(data: Partial<BeaconHistory> & { beaconId: string }) {
      const next: BeaconHistory = {
        id: crypto.randomUUID(),
        userId: data.userId,
        beaconId: data.beaconId,
        latitude: data.latitude ?? 0,
        longitude: data.longitude ?? 0,
        speed: data.speed ?? 0,
        timestamp: data.timestamp ?? new Date().toISOString(),
      }
      const list = readJson<BeaconHistory[]>(HISTORY_KEY, [])
      writeJson(HISTORY_KEY, [next, ...list])
      return next
    },
  },
}

const realtime = {
  channel(_name?: string) {
    return {
      async subscribe() {
        return
      },
      onMessage(cb: (msg: any) => void) {
        realtimeListeners.add(cb)
      },
      unsubscribe() {
        return
      },
    }
  },
  async publish(_name: string, payload: any) {
    realtimeListeners.forEach((listener) => listener(payload))
    bc?.postMessage(payload)
  },
}

export const appClient = { auth, db, realtime }
