import { supabase } from './supabase-client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export type AppUser = {
  id: string
  email: string
  displayName: string
}

export type Beacon = {
  id: string
  name: string
  apiKey: string
  lastLat: number
  lastLon: number
  lastSeen: string
  battery?: number
  signal?: number
}

export type BeaconLocation = {
  id: string
  beacon_id: string
  latitude: number
  longitude: number
  accuracy?: number
  speed?: number
  heading?: number
  altitude?: number
  created_at: string
}

const authListeners = new Set<(state: { user: AppUser | null; isLoading: boolean }) => void>()

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

const auth = {
  onAuthStateChanged(cb: (state: { user: AppUser | null; isLoading: boolean }) => void) {
    authListeners.add(cb)
    
    // Initial state
    cb({ user: null, isLoading: true })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const appUser = convertSupabaseUser(session?.user || null)
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('beacons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get latest location for each beacon
      const beaconsWithLocation = await Promise.all(
        (data || []).map(async (beacon: any) => {
          const { data: location } = await supabase
            .from('beacon_locations')
            .select('latitude, longitude, created_at')
            .eq('beacon_id', beacon.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            id: beacon.id,
            name: beacon.name,
            apiKey: beacon.api_key,
            lastLat: location?.latitude ?? 0,
            lastLon: location?.longitude ?? 0,
            lastSeen: location?.created_at ?? new Date().toISOString(),
          }
        })
      )

      return beaconsWithLocation
    },

    async get(id: string): Promise<Beacon | null> {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: beacon, error } = await supabase
        .from('beacons')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error || !beacon) return null

      const { data: location } = await supabase
        .from('beacon_locations')
        .select('latitude, longitude, created_at')
        .eq('beacon_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return {
        id: beacon.id,
        name: beacon.name,
        apiKey: beacon.api_key,
        lastLat: location?.latitude ?? 0,
        lastLon: location?.longitude ?? 0,
        lastSeen: location?.created_at ?? new Date().toISOString(),
      }
    },

    async create(name: string): Promise<Beacon> {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const apiKey = crypto.randomUUID()

      const { data: beacon, error } = await supabase
        .from('beacons')
        .insert({
          user_id: user.id,
          name,
          api_key: apiKey,
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: beacon.id,
        name: beacon.name,
        apiKey: beacon.api_key,
        lastLat: 0,
        lastLon: 0,
        lastSeen: new Date().toISOString(),
      }
    },

    async update(id: string, name: string): Promise<void> {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('beacons')
        .update({ name })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
    },

    async delete(id: string): Promise<void> {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('beacons')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
    },
  },

  beaconHistory: {
    async list(beaconId: string, limit: number = 100): Promise<BeaconLocation[]> {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('beacon_locations')
        .select('*')
        .eq('beacon_id', beaconId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) return []
      return data || []
    },

    async create(beaconId: string, location: Omit<BeaconLocation, 'id' | 'beacon_id' | 'user_id' | 'created_at'>): Promise<void> {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('beacon_locations')
        .insert({
          beacon_id: beaconId,
          user_id: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          speed: location.speed,
          heading: location.heading,
          altitude: location.altitude,
        })

      if (error) throw error
    },
  },
}

export const appClient = { auth, db }
