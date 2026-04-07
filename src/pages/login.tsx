import { useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Radio } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [sentEmail, setSentEmail] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
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
      setStep('code')
      toast.success('Код отправлен на почту')
    } catch (error) {
      toast.error((error as any).message || 'Ошибка при отправке кода')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) {
      toast.error('Введите код')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: sentEmail,
        token: code,
        type: 'magiclink',
      })

      if (error) throw error

      toast.success('Вы вошли!')
    } catch (error) {
      toast.error((error as any).message || 'Неверный код')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
        },
      })

      if (error) throw error
    } catch (error) {
      toast.error((error as any).message || 'Ошибка при входе через Google')
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

        {step === 'email' ? (
          <form onSubmit={handleSendCode} className="space-y-4">
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
                Мы отправим код подтверждения на вашу почту
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'Отправить код'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Или</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              🔐 Войти через Google
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground">
                Код отправлен на <br />
                <span className="font-medium text-foreground">{sentEmail}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Код подтверждения
              </label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={loading}
                maxLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Проверка...' : 'Подтвердить'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep('email')
                setCode('')
              }}
              disabled={loading}
            >
              Назад
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
