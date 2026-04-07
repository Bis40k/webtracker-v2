# 📱 WebTracker API для Макродроида

Используйте этот API для отправки GPS координат с вашего Android устройства в WebTracker.

## 🔑 Получение API Key

1. Вы зарегистрировались в WebTracker
2. Создали маячок (Beacon) в приложении
3. Скопировали **API Key** маячка

## 📤 Отправка GPS координат

**URL:**
```
https://jkcpydwgqgccqndwfmnz.supabase.co/rest/v1/beacon_locations
```

**Метод:** `POST`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer (не требуется для API key)
```

**Body (JSON):**
```json
{
  "beacon_id": "your-beacon-id",
  "latitude": 55.7558,
  "longitude": 37.6176,
  "accuracy": 10,
  "speed": 5.5,
  "heading": 180,
  "altitude": 150
}
```

**Параметры:**
- `beacon_id` (обязательно) - ID вашего маячка
- `latitude` (обязательно) - Широта (градусы)
- `longitude` (обязательно) - Долгота (градусы)
- `accuracy` (опционально) - Точность GPS в метрах
- `speed` (опционально) - Скорость в м/с
- `heading` (опционально) - Направление в градусах (0-360)
- `altitude` (опционально) - Высота в метрах

## 🔧 Настройка Макродроида

### Вариант 1: Java/Kotlin (для разработчиков)

```kotlin
fun sendGPS(latitude: Double, longitude: Double, accuracy: Float) {
    val json = JSONObject().apply {
        put("beacon_id", "YOUR_BEACON_ID")
        put("latitude", latitude)
        put("longitude", longitude)
        put("accuracy", accuracy.toInt())
    }

    val url = "https://jkcpydwgqgccqndwfmnz.supabase.co/rest/v1/beacon_locations"
    val request = POST(url)
    request.setHeader("Content-Type", "application/json")
    request.setBody(json.toString())
    request.execute()
}
```

### Вариант 2: HTTP Request (для Макродроида)

В Макродроиде создайте действие **"HTTP Request"**:

1. **Метод:** POST
2. **URL:** `https://jkcpydwgqgccqndwfmnz.supabase.co/rest/v1/beacon_locations`
3. **Headers:**
   ```
   Content-Type: application/json
   ```
4. **Body:**
   ```json
   {
     "beacon_id": "YOUR_BEACON_ID",
     "latitude": %latitude%,
     "longitude": %longitude%,
     "accuracy": %accuracy%
   }
   ```

## 🧪 Тестирование с curl

```bash
curl -X POST https://jkcpydwgqgccqndwfmnz.supabase.co/rest/v1/beacon_locations \
  -H "Content-Type: application/json" \
  -d '{
    "beacon_id": "your-beacon-id",
    "latitude": 55.7558,
    "longitude": 37.6176,
    "accuracy": 10
  }'
```

## ✅ Ответ при успехе

```json
{
  "id": "location-uuid",
  "beacon_id": "beacon-uuid",
  "latitude": 55.7558,
  "longitude": 37.6176,
  "accuracy": 10,
  "created_at": "2026-04-07T11:00:00Z"
}
```

## ❌ Ошибки

**400 Bad Request** - Отсутствуют обязательные поля
```json
{
  "error": "Missing required fields"
}
```

**401 Unauthorized** - Неправильный API Key
```json
{
  "error": "Unauthorized"
}
```

## 📍 Как часто отправлять?

- **Рекомендуется:** каждые 1-5 минут
- **Минимум:** каждые 30 секунд
- **Максимум:** нет ограничений, но помните о батарее телефона

## 💡 Советы

1. **Отправляйте только при изменении координат** - экономит батарею
2. **Используйте фоновые процессы** - запускайте отправку в фоне
3. **Обрабатывайте ошибки** - если отправка не удалась, повторите через 30 сек
4. **Выключайте при неактивном использовании** - не нужно постоянное отслеживание

## 📞 Поддержка

Если что-то не работает - проверьте:
1. Правильность beacon_id
2. Формат JSON (проверьте синтаксис)
3. Подключение к интернету
4. Значения координат (должны быть реальные GPS координаты)
