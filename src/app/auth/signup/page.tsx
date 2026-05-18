'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/infrastructure/supabase/client'
import { Button } from '@/presentation/components/ui/button'

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

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name } },
    })
    if (authError) {
      setError(authError.message === 'User already registered' ? 'Email já cadastrado' : authError.message)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
          <div className="mb-4 text-5xl">✉️</div>
          <h2 className="mb-2 text-xl font-bold">Verifique seu email</h2>
          <p className="text-sm text-gray-500">
            Enviamos um link de confirmação. Acesse-o para ativar sua conta.
          </p>
          <Link href="/auth/login" className="mt-6 inline-block text-sm text-blue-600 hover:underline">
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Criar conta gratuita</h1>
        <p className="mb-8 text-center text-sm text-gray-500">Comece a controlar suas finanças hoje</p>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { id: 'name', label: 'Nome completo', type: 'text', placeholder: 'João Silva', autocomplete: 'name' },
            { id: 'email', label: 'Email', type: 'email', placeholder: 'seu@email.com', autocomplete: 'email' },
            { id: 'password', label: 'Senha', type: 'password', placeholder: '••••••••', autocomplete: 'new-password' },
            { id: 'confirmPassword', label: 'Confirmar senha', type: 'password', placeholder: '••••••••', autocomplete: 'new-password' },
          ].map(({ id, label, type, placeholder, autocomplete }) => (
            <div key={id} className="space-y-1">
              <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
              <input
                id={id}
                type={type}
                autoComplete={autocomplete}
                placeholder={placeholder}
                {...register(id as keyof FormData)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors[id as keyof FormData] && (
                <p className="text-xs text-red-600">{errors[id as keyof FormData]?.message}</p>
              )}
            </div>
          ))}

          <Button type="submit" loading={isSubmitting} className="w-full">Criar conta</Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Já tem conta?{' '}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
