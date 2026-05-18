import Link from 'next/link'
import { ArrowRight, Shield, TrendingUp, PieChart, Target } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-24 text-white">
        <h1 className="mb-4 text-center text-5xl font-bold tracking-tight">
          Controle Financeiro Pessoal
        </h1>
        <p className="mb-8 max-w-xl text-center text-lg text-blue-100">
          Gerencie receitas, despesas, orçamentos e metas financeiras em um só lugar. Seguro, intuitivo e acessível.
        </p>
        <div className="flex gap-4">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
          >
            Começar gratuitamente <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
          >
            Entrar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 bg-white px-6 py-20 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto w-full">
        {[
          { icon: TrendingUp, title: 'Controle Total', desc: 'Receitas, despesas e transferências em tempo real' },
          { icon: PieChart, title: 'Relatórios', desc: 'Dashboards interativos com gráficos detalhados' },
          { icon: Target, title: 'Metas', desc: 'Defina e acompanhe suas metas financeiras' },
          { icon: Shield, title: 'Seguro', desc: 'Dados protegidos com criptografia de ponta a ponta' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-xl bg-blue-50 p-4">
              <Icon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
