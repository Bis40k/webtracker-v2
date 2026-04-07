-- Создание таблицы маячков (beacons)
CREATE TABLE beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Индекс для быстрого поиска маячков пользователя
CREATE INDEX beacons_user_id_idx ON beacons(user_id);
CREATE INDEX beacons_api_key_idx ON beacons(api_key);

-- Создание таблицы GPS координат (beacon_locations)
CREATE TABLE beacon_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beacon_id UUID NOT NULL REFERENCES beacons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  accuracy NUMERIC,
  speed NUMERIC,
  heading NUMERIC,
  altitude NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Индексы для быстрого поиска
CREATE INDEX beacon_locations_beacon_id_idx ON beacon_locations(beacon_id);
CREATE INDEX beacon_locations_user_id_idx ON beacon_locations(user_id);
CREATE INDEX beacon_locations_created_at_idx ON beacon_locations(created_at DESC);

-- Row Level Security (RLS) для beacons
ALTER TABLE beacons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own beacons"
  ON beacons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own beacons"
  ON beacons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own beacons"
  ON beacons FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own beacons"
  ON beacons FOR DELETE
  USING (auth.uid() = user_id);

-- RLS для beacon_locations
ALTER TABLE beacon_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own beacon locations"
  ON beacon_locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own beacon locations"
  ON beacon_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow API key authenticated inserts"
  ON beacon_locations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM beacons 
      WHERE beacons.id = beacon_id 
      AND beacons.api_key = current_setting('request.headers')::json->>'x-api-key'
    )
  );
