# 📱 WebTracker API для Макродроида

Используйте этот API для отправки GPS координат с вашего Android устройства в WebTracker.

## 🔐 Авторизация

WebTracker использует авторизацию через Supabase. Только авторизованные пользователи могут обновлять свои маячки.

## 🔑 Получение Access Token и User ID

### Шаг 1: Зайдите в WebTracker
1. Откройте https://bis40k.github.io/webtracker-v2/
2. Авторизуйтесь через email (получите ссылку в письме)

### Шаг 2: Откройте DevTools
1. Нажмите **F12** в браузере
2. Перейдите на вкладку **"Console"**

### Шаг 3: Скопируйте Access Token
В консоли выполните:
```javascript
(await supabase.auth.getSession()).data.session.access_token
```
Нажмите Enter, скопируйте длинную строку — это ваш **Access Token**

### Шаг 4: Скопируйте User ID
В консоли выполните:
```javascript
(await supabase.auth.getUser()).data.user.id
```
Нажмите Enter, скопируйте строку UUID — это ваш **User ID**

## 📍 Создание маячка в приложении

1. В WebTracker на странице **"Панель"** нажмите кнопку **"+ Добавить маячок"**
2. Введите имя: например, `"Мой телефон"`
3. Скопируйте **Beacon ID** из созданного маячка

## 📤 Отправка GPS координат

**URL:**
```
https://jkcpydwgqgccqndwfmnz.supabase.co/rest/v1/beacon_locations
```

**Метод:** `POST`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Body (JSON):**
```json
{
  "beacon_id": "YOUR_BEACON_ID",
  "user_id": "YOUR_USER_ID",
  "latitude": 55.7558,
  "longitude": 37.6176,
  "accuracy": 10,
  "speed": 5.5,
  "heading": 180,
  "altitude": 150
}
```

**Параметры:**
- `beacon_id` (обязательно) - ID маячка из приложения
- `user_id` (обязательно) - Ваш UUID пользователя
- `latitude` (обязательно) - Широта (градусы)
- `longitude` (обязательно) - Долгота (градусы)
- `accuracy` (опционально) - Точность GPS в метрах
- `speed` (опционально) - Скорость в м/с
- `heading` (опционально) - Направление в градусах (0-360)
- `altitude` (опционально) - Высота в метрах

## 🔧 Настройка Макродроида

### Способ 1: Simple HTTP Request

В Макродроиде добавьте действие **"HTTP Request"**:

1. **Метод:** POST
2. **URL:** `https://jkcpydwgqgccqndwfmnz.supabase.co/rest/v1/beacon_locations`
3. **Headers:**
   ```
   Content-Type: application/json
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```
4. **Body:**
   ```json
   {
     "beacon_id": "YOUR_BEACON_ID",
     "user_id": "YOUR_USER_ID",
     "latitude": %gps_latitude%,
     "longitude": %gps_longitude%,
     "accuracy": %gps_accuracy%
   }
   ```

Замените:
- `YOUR_ACCESS_TOKEN` → токен из консоли
- `YOUR_BEACON_ID` → ID маячка из приложения
- `YOUR_USER_ID` → User ID из консоли

### Способ 2: Script (для продвинутых)

```javascript
const token = "YOUR_ACCESS_TOKEN";
const beaconId = "YOUR_BEACON_ID";
const userId = "YOUR_USER_ID";

fetch('https://jkcpydwgqgccqndwfmnz.supabase.co/rest/v1/beacon_locations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    beacon_id: beaconId,
    user_id: userId,
    latitude: gpsLat,
    longitude: gpsLon,
    accuracy: gpsAccuracy
  })
});
```

## 🧪 Тестирование с curl

```bash
curl -X POST https://jkcpydwgqgccqndwfmnz.supabase.co/rest/v1/beacon_locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "beacon_id": "YOUR_BEACON_ID",
    "user_id": "YOUR_USER_ID",
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
  "user_id": "user-uuid",
  "latitude": 55.7558,
  "longitude": 37.6176,
  "accuracy": 10,
  "speed": null,
  "heading": null,
  "altitude": null,
  "created_at": "2026-04-08T11:00:00Z"
}
```

## ❌ Ошибки и решения

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```
**Решение:** Access Token истек. Получите новый из консоли браузера.

### 403 Forbidden
```json
{
  "error": "User does not have permission"
}
```
**Решение:** Проверьте, что `user_id` в запросе совпадает с вашим User ID из консоли.

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```
**Решение:** Проверьте, все ли обязательные поля заполнены (`beacon_id`, `user_id`, `latitude`, `longitude`).

### 404 Not Found
**Решение:** Beacon ID неправильный или маячок принадлежит другому пользователю.

## 📍 Рекомендации

- **Как часто отправлять?** - каждые 1-5 минут (1 раз в минуту хорошо экономит батарею)
- **Минимум:** каждые 30 секунд
- **Отправляйте только при движении** - экономит батарею и траффик

## 💡 Советы

1. **Обновляйте token ежедневно** - tokens могут истекать (обычно на 7 дней)
2. **Проверяйте интернет** - перед отправкой убедитесь в соединении
3. **Используйте фоновые макросы** - отправляйте координаты в фоне
4. **Выключайте при неактивном использовании** - если не нужно отслеживание

## 🆘 Частые проблемы

**"Мои координаты не обновляются на карте"**
→ Скоро напишу инструкцию по реал-тайм обновлению. Пока обновляйте страницу вручную (F5).

**"Access Token не работает"**
→ Он может содержать спецсимволы. Убедитесь, что скопировали полностью.

**"GPS координаты не приходят с Макродроида"**
→ Проверьте:
   1. Включен ли GPS на телефоне
   2. Есть ли интернет
   3. Правильны ли Access Token, User ID, Beacon ID

## 📞 Поддержка

Если что-то не ясно или не работает - напишите! 🚀
