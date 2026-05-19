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
      {/* Painel esquerdo — gradiente */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
        <h2 className="mb-3 text-3xl font-bold">Dindin</h2>
        <p className="max-w-xs text-center text-blue-100 text-sm leading-relaxed">
          Controle total das suas finanças pessoais. Acompanhe receitas, despesas e metas em um só lugar.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-xs">
          {[
            { label: 'Usuários', value: '10k+' },
            { label: 'Transações', value: '500k+' },
            { label: 'Economias', value: 'R$2M+' },
            { label: 'Satisfação', value: '98%' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl bg-white/10 p-4 text-center">
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-blue-200">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Dindin</span>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
            <h1 className="mb-1 text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
            <p className="mb-8 text-sm text-gray-500">Entre na sua conta para continuar</p>

            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="seu@email.com"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">Senha</label>
                  <Link href="/auth/reset-password" className="text-xs text-blue-600 hover:text-blue-700 hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    {...register('password')}
                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Entrando...
                  </span>
                ) : 'Entrar'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Não tem conta?{' '}
            <Link href="/auth/signup" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Criar conta gratuita
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
