'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TrendingUp, Mail, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/infrastructure/supabase/client'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter letra maiúscula')
    .regex(/[0-9]/, 'Deve conter número')
    .regex(/[^A-Za-z0-9]/, 'Deve conter caractere especial'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

const fields = [
  { id: 'name' as const, label: 'Nome completo', type: 'text', placeholder: 'João Silva', autocomplete: 'name', icon: User },
  { id: 'email' as const, label: 'Email', type: 'email', placeholder: 'seu@email.com', autocomplete: 'email', icon: Mail },
  { id: 'password' as const, label: 'Senha', type: 'password', placeholder: '••••••••', autocomplete: 'new-password', icon: Lock },
  { id: 'confirmPassword' as const, label: 'Confirmar senha', type: 'password', placeholder: '••••••••', autocomplete: 'new-password', icon: Lock },
]

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (authError) {
      setError(authError.message === 'User already registered' ? 'Este email já está cadastrado.' : authError.message)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm border border-gray-200 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">Verifique seu email</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Enviamos um link de confirmação para o seu email. Acesse-o para ativar sua conta.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo — gradiente */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
        <h2 className="mb-3 text-3xl font-bold">FinançasPro</h2>
        <p className="mb-8 max-w-xs text-center text-blue-100 text-sm leading-relaxed">
          Crie sua conta gratuita e comece a tomar o controle das suas finanças agora mesmo.
        </p>
        <ul className="space-y-3 text-sm text-blue-100">
          {[
            'Controle de receitas e despesas',
            'Orçamentos inteligentes por categoria',
            'Metas financeiras personalizadas',
            'Relatórios e gráficos detalhados',
            '100% gratuito para começar',
          ].map(item => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">FinançasPro</span>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
            <h1 className="mb-1 text-2xl font-bold text-gray-900">Criar conta gratuita</h1>
            <p className="mb-8 text-sm text-gray-500">Comece a controlar suas finanças hoje</p>

            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {fields.map(({ id, label, type, placeholder, autocomplete, icon: Icon }) => (
                <div key={id} className="space-y-1.5">
                  <label htmlFor={id} className="text-sm font-semibold text-gray-700">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id={id}
                      type={type}
                      autoComplete={autocomplete}
                      placeholder={placeholder}
                      {...register(id)}
                      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  {errors[id] && (
                    <p className="text-xs text-red-600">{errors[id]?.message}</p>
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Criando conta...
                  </span>
                ) : 'Criar conta'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Já tem conta?{' '}
            <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
