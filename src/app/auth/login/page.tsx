'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TrendingUp, Mail, Lock, AlertCircle } from 'lucide-react'
import { createClient } from '@/infrastructure/supabase/client'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (authError) {
      setError('Email ou senha incorretos. Verifique seus dados e tente novamente.')
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo — gradiente sage */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-[var(--color-brand-400)] via-[var(--color-brand-500)] to-[var(--color-brand-700)] p-12">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.25)] backdrop-blur-sm">
          <TrendingUp className="h-8 w-8 text-[var(--color-brand-900)]" />
        </div>
        <h2 className="mb-3 text-3xl font-bold text-[var(--color-brand-900)]">Dindin</h2>
        <p className="max-w-xs text-center text-[var(--color-brand-900)]/80 text-sm leading-relaxed">
          Controle total das suas finanças pessoais. Acompanhe receitas, despesas e metas em um só lugar.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-xs">
          {[
            { label: 'Usuários', value: '10k+' },
            { label: 'Transações', value: '500k+' },
            { label: 'Economias', value: 'R$2M+' },
            { label: 'Satisfação', value: '98%' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl bg-[rgba(255,255,255,0.18)] p-4 text-center backdrop-blur-sm">
              <p className="text-xl font-bold tabular-nums text-[var(--color-brand-900)]">{stat.value}</p>
              <p className="text-xs text-[var(--color-brand-900)]/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-[var(--color-bg)] px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
              <TrendingUp className="h-5 w-5 text-brand-900" />
            </div>
            <span className="text-xl font-bold text-[var(--color-fg)]">Dindin</span>
          </div>

          <div className="card">
            <h1 className="mb-1 text-2xl font-bold text-[var(--color-fg)]">Bem-vindo de volta</h1>
            <p className="mb-8 text-sm text-[var(--color-fg-muted)]">Entre na sua conta para continuar</p>

            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="field">
                <label htmlFor="email" className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-fg-faint)] z-10 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className="input pl-10"
                    placeholder="seu@email.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div className="field">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="label !mb-0">Senha</label>
                  <Link href="/auth/reset-password" className="text-xs text-brand-700 hover:text-brand-900 hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-fg-faint)] z-10 pointer-events-none" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    {...register('password')}
                    className="input pl-10"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full justify-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-brand-900)] border-t-transparent" />
                    Entrando...
                  </span>
                ) : 'Entrar'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-[var(--color-fg-muted)]">
            Não tem conta?{' '}
            <Link href="/auth/signup" className="font-semibold text-brand-700 hover:text-brand-900 hover:underline">
              Criar conta gratuita
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
