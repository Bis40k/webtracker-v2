/**
 * Переводит ошибки Supabase на русский язык
 */
export function translateSupabaseError(error: any): string {
  const message = ((error?.message) || (error?.toString()) || '').toLowerCase()

  // Ошибки аутентификации
  if (message.includes('invalid login credentials')) {
    return 'Неверный email или пароль'
  }
  if (message.includes('invalid password')) {
    return 'Неверный пароль'
  }
  if (message.includes('invalid email')) {
    return 'Некорректный email'
  }
  if (message.includes('user not found')) {
    return 'Пользователь не найден'
  }
  if (message.includes('email already registered') || message.includes('duplicate key')) {
    return 'Этот email уже зарегистрирован'
  }
  if (message.includes('password should be at least 6 characters')) {
    return 'Пароль должен быть минимум 6 символов'
  }
  if (message.includes('password should contain an uppercase letter')) {
    return 'Пароль должен содержать заглавную букву'
  }
  if (message.includes('password should contain a lowercase letter')) {
    return 'Пароль должен содержать строчную букву'
  }
  if (message.includes('password should contain a number')) {
    return 'Пароль должен содержать число'
  }
  if (message.includes('password should contain a special character')) {
    return 'Пароль должен содержать специальный символ'
  }
  if (message.includes('email confirmation') || message.includes('confirm your email')) {
    return 'Проверьте ваш email и подтвердите аккаунт'
  }
  if (message.includes('email address has already been used')) {
    return 'Этот email уже используется'
  }
  if (message.includes('network')) {
    return 'Проблема с интернетом. Проверьте соединение'
  }
  if (message.includes('timeout')) {
    return 'Запрос занял слишком много времени. Попробуйте снова'
  }
  if (message.includes('too many')) {
    return 'Слишком много попыток. Попробуйте позже'
  }

  // Если ошибка не переведена, выводим оригинальное сообщение
  return error?.message || 'Неизвестная ошибка при авторизации'
}
