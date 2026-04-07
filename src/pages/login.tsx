import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { translateSupabaseError } from '@/lib/error-messages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Radio, Mail, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'choose' | 'link' | 'password' | 'register' | 'link-sent'>('choose')
  const [sentEmail, setSentEmail] = useState('')

  // Проверяем, если пришли по magic link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        toast.success('Вы успешно вошли!')
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Введите почту')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
        },
      })

      if (error) throw error

      setSentEmail(email)
      setMode('link-sent')
      toast.success('Ссылка отправлена на почту!')
    } catch (error) {
      toast.error(translateSupabaseError(error))
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Введите почту и пароль')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      toast.success('Вы успешно вошли!')
    } catch (error) {
      toast.error(translateSupabaseError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Введите почту и пароль')
      return
    }

    if (password.length < 6) {
      toast.error('Пароль должен быть минимум 6 символов')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
        },
      })

      if (error) throw error
      toast.success('Аккаунт создан! Проверьте почту для подтверждения')
      setMode('choose')
      setEmail('')
      setPassword('')
    } catch (error) {
      toast.error(translateSupabaseError(error))
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="p-3 rounded-lg bg-primary/10">
            <Radio className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold">WebTracker</h1>
            <p className="text-muted-foreground mt-1">Отследите ваши GPS устройства</p>
          </div>
        </div>

        {/* Выбор способа входа */}
        {mode === 'choose' && (
          <div className="space-y-3">
            <Button
              onClick={() => setMode('link')}
              className="w-full"
              variant="default"
            >
              📧 Вход через ссылку в письме
            </Button>
            <Button
              onClick={() => setMode('password')}
              className="w-full"
              variant="outline"
            >
              🔑 Вход с паролем
            </Button>
            <Button
              onClick={() => setMode('register')}
              className="w-full"
              variant="ghost"
            >
              ➕ Создать аккаунт
            </Button>
          </div>
        )}

        {/* Вход по ссылке */}
        {mode === 'link' && (
          <form onSubmit={handleSendLink} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email почта
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Мы отправим вам ссылку для входа на вашу почту
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'Отправить ссылку'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setMode('choose')
                setEmail('')
              }}
            >
              Назад
            </Button>
          </form>
        )}

        {/* Ссылка отправлена */}
        {mode === 'link-sent' && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>

            <div className="text-center space-y-3">
              <h2 className="text-xl font-semibold">Ссылка отправлена!</h2>
              <p className="text-muted-foreground">
                На почту <span className="font-medium text-foreground">{sentEmail}</span> отправлена ссылка для входа
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-900 dark:text-blue-100">
                📧 Нажмите на ссылку в письме или проверьте папку "Спам"
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setMode('choose')
                setEmail('')
              }}
            >
              Назад
            </Button>
          </div>
        )}

        {/* Вход с паролем */}
        {mode === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email-password" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email-password"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password-input" className="text-sm font-medium">
                Пароль
              </label>
              <div className="relative">
                <Input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setMode('choose')
                setEmail('')
                setPassword('')
              }}
            >
              Назад
            </Button>
          </form>
        )}

        {/* Регистрация */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email-register" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email-register"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password-register" className="text-sm font-medium">
                Пароль (минимум 6 символов)
              </label>
              <div className="relative">
                <Input
                  id="password-register"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать аккаунт'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setMode('choose')
                setEmail('')
                setPassword('')
              }}
            >
              Назад
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
