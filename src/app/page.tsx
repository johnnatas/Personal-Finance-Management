import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight, ArrowUp, ArrowLeftRight, Utensils, Target, PieChart,
  Shield, CreditCard, Clock, TrendingUp, SunMedium,
} from 'lucide-react'

export const metadata = {
  title: 'Dindin — Cuide do seu dindin sem complicação',
  description:
    'Receitas, despesas, orçamentos e metas em um só lugar. Bonito, simples e feito do jeito brasileiro.',
}

const features = [
  {
    icon: ArrowLeftRight,
    title: 'Controle total',
    description: 'Receitas, despesas e transferências em tempo real, com categorias inteligentes e ícones por tipo.',
  },
  {
    icon: PieChart,
    title: 'Relatórios visuais',
    description: 'Dashboards interativos com gráficos de pizza, área e barras pra você entender pra onde vai o dindin.',
  },
  {
    icon: Target,
    title: 'Metas com prazo',
    description: 'Defina objetivos, acompanhe progresso e veja quanto precisa guardar por mês pra chegar lá.',
  },
  {
    icon: Shield,
    title: 'Seguro de verdade',
    description: 'Criptografia de ponta a ponta. Seus dados ficam só com você — a gente nem consegue espiar.',
  },
  {
    icon: CreditCard,
    title: 'Múltiplas contas',
    description: 'Junte Nubank, Inter, Bradesco e mais num único lugar. Saldo consolidado com 1 clique.',
  },
  {
    icon: Clock,
    title: 'Orçamento por categoria',
    description: 'Planeje quanto gastar com alimentação, lazer, transporte — e receba alertas antes de estourar.',
  },
  {
    icon: TrendingUp,
    title: 'Investimentos',
    description: 'Tesouro, CDB, ações e cripto — tudo agregado num portfólio só pra você acompanhar a rentabilidade.',
  },
  {
    icon: SunMedium,
    title: 'Dark e Light mode',
    description: 'Visual pastel suave pra usar a qualquer hora. Bonito de dia, gentil com seus olhos à noite.',
  },
] as const

const steps = [
  { title: 'Crie sua conta', description: 'Cadastre-se com e-mail. Sem cartão, sem teste, sem letras miúdas. É grátis pra sempre.' },
  { title: 'Adicione suas contas', description: 'Bancos, cartões, carteira em dinheiro. Registre o saldo inicial e começa a brincadeira.' },
  { title: 'Lance e relaxa', description: 'Coloque receitas e despesas no dia a dia. A gente categoriza, monta gráficos e mostra onde está o vacilo.' },
] as const

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      {/* ========== TOP BAR ========== */}
      <header className="sticky top-0 z-50 flex items-center gap-6 border-b border-[var(--color-border-soft)] bg-[color-mix(in_oklab,var(--color-bg)_88%,transparent)] px-5 py-4 backdrop-blur-xl backdrop-saturate-150 md:px-10">
        <Link href="/" className="flex items-center gap-2.5 text-[18px] font-bold tracking-tight">
          <Image src="/dindin-mark.png" alt="Dindin" width={36} height={36} priority className="h-9 w-9" />
          <span>Dindin</span>
        </Link>
        <nav className="ml-8 hidden gap-1 md:flex">
          {[
            { href: '#features', label: 'Recursos' },
            { href: '#how', label: 'Como funciona' },
            { href: '#about', label: 'Sobre' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="rounded-[10px] px-3.5 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-fg)]"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex-1" />
        <Link href="/auth/login" className="btn btn-ghost">Entrar</Link>
        <Link href="/auth/signup" className="btn btn-primary">Começar grátis</Link>
      </header>

      {/* ========== HERO ========== */}
      <section className="mx-auto grid max-w-[1280px] items-center gap-12 px-6 pb-20 pt-12 md:gap-16 md:px-10 md:pb-24 md:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-[60px]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-200)] px-3 py-1.5 text-xs font-semibold tracking-wide text-[var(--color-brand-900)]">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[var(--color-brand-500)]" />
            100% gratuito · sem cartão
          </div>
          <h1 className="text-balance text-[clamp(38px,5vw,68px)] font-bold leading-[1.02] tracking-[-0.035em]">
            Cuide do seu{' '}
            <em className="relative not-italic inline-block text-[var(--color-brand-700)]">
              <span className="relative z-10">dindin</span>
              <span
                aria-hidden
                className="absolute inset-x-[-4px] bottom-1 -z-0 h-3.5 -skew-x-6 rounded bg-[var(--color-brand-300)]"
              />
            </em>{' '}
            sem complicação.
          </h1>
          <p className="mt-6 max-w-[520px] text-pretty text-lg leading-relaxed text-[var(--color-fg-muted)]">
            Receitas, despesas, orçamentos e metas em um só lugar. Bonito, simples e feito do jeito brasileiro — porque controlar o dinheiro não precisa ser chato.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth/signup" className="btn btn-primary btn-lg">
              Começar gratuitamente
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </Link>
            <Link href="/auth/login" className="btn btn-outline btn-lg">Entrar</Link>
          </div>

          <div className="mt-10 flex gap-8 border-t border-[var(--color-border-soft)] pt-7">
            <div>
              <div className="text-2xl font-bold tracking-tight tabular-nums">+12k</div>
              <div className="mt-0.5 text-xs text-[var(--color-fg-faint)]">usuários ativos</div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight tabular-nums">R$ 4,8M</div>
              <div className="mt-0.5 text-xs text-[var(--color-fg-faint)]">organizados</div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">4.9★</div>
              <div className="mt-0.5 text-xs text-[var(--color-fg-faint)]">avaliação média</div>
            </div>
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative mx-auto w-full max-w-[520px] lg:justify-self-end" style={{ aspectRatio: '1 / 1.05' }}>
          <div
            className="absolute inset-0 animate-blob"
            style={{
              background: 'radial-gradient(circle at 30% 30%, var(--color-brand-200), var(--color-brand-300))',
              borderRadius: '50% 45% 55% 50% / 50% 55% 45% 50%',
            }}
          />
          <div className="absolute inset-[8%] grid place-items-center">
            <Image
              src="/dindin-logo.png"
              alt="Logo Dindin"
              width={420}
              height={420}
              priority
              className="h-auto w-4/5 drop-shadow-[0_30px_60px_rgba(45,74,62,0.18)]"
            />
          </div>

          {/* Floating cards */}
          <div className="absolute left-[-8%] top-[4%] animate-floaty rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-4 py-3 shadow-[0_12px_32px_rgba(45,74,62,0.10)]">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[var(--color-success)] text-white">
                <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-semibold">Salário</div>
                <div className="text-[10px] text-[var(--color-fg-faint)]">recebido hoje</div>
              </div>
              <div className="ml-3 text-sm font-bold tabular-nums text-[#16A34A]">+R$ 5.000</div>
            </div>
          </div>

          <div
            className="absolute bottom-[14%] right-[-6%] animate-floaty rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-4 py-3 shadow-[0_12px_32px_rgba(45,74,62,0.10)]"
            style={{ animationDelay: '1.5s' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[var(--color-brand-500)] text-[var(--color-brand-900)]">
                <Target className="h-[18px] w-[18px]" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-semibold">Meta: Viagem</div>
                <div className="text-[10px] text-[var(--color-fg-faint)]">73% concluído</div>
              </div>
            </div>
          </div>

          <div
            className="absolute bottom-0 left-[4%] animate-floaty rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-4 py-3 shadow-[0_12px_32px_rgba(45,74,62,0.10)]"
            style={{ animationDelay: '3s' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#F97316] text-white">
                <Utensils className="h-[18px] w-[18px]" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-semibold">Alimentação</div>
                <div className="text-[10px] text-[var(--color-fg-faint)]">R$ 248 / R$ 1.200</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="border-t border-[var(--color-border-soft)] bg-[var(--color-surface)] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-3 inline-flex text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-brand-700)]">
            Recursos
          </div>
          <h2 className="mb-3.5 max-w-[600px] text-balance text-[clamp(28px,3.5vw,42px)] font-bold tracking-[-0.025em]">
            Tudo o que você precisa pra deixar as finanças em dia.
          </h2>
          <p className="mb-12 max-w-[560px] text-base leading-relaxed text-[var(--color-fg-muted)]">
            Visualize, organize e planeje — do jeito que faz sentido pra você. Sem planilha, sem dor de cabeça.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group cursor-pointer rounded-[20px] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-7 transition-all hover:-translate-y-1 hover:border-[var(--color-brand-300)] hover:shadow-[0_16px_36px_rgba(45,74,62,0.08)]"
              >
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-[14px] bg-[var(--color-brand-200)] text-[var(--color-brand-700)]">
                  <Icon className="h-[22px] w-[22px]" strokeWidth={2} />
                </div>
                <h3 className="mb-1.5 text-[17px] font-bold tracking-[-0.015em]">{title}</h3>
                <p className="text-[13px] leading-relaxed text-[var(--color-fg-muted)]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PREVIEW ========== */}
      <section className="mx-auto max-w-[1280px] px-6 py-16 md:px-10 md:py-24">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <div className="mb-3 inline-flex text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-brand-700)]">
              Visualize
            </div>
            <h2 className="mb-3.5 max-w-[600px] text-balance text-[clamp(28px,3.5vw,42px)] font-bold tracking-[-0.025em]">
              Seu dinheiro em um painel que faz sentido.
            </h2>
            <p className="mb-7 max-w-[560px] text-base leading-relaxed text-[var(--color-fg-muted)]">
              Dashboard limpo, gráficos animados e cards organizados — você entende sua situação financeira em 5 segundos.
            </p>
            <Link href="/auth/signup" className="btn btn-primary btn-lg">
              Ver o painel
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </Link>
          </div>

          <div
            className="relative overflow-hidden rounded-3xl bg-[var(--color-brand-200)] p-7 shadow-[0_24px_48px_rgba(45,74,62,0.12)]"
            style={{ aspectRatio: '16 / 11' }}
          >
            <div className="absolute inset-7 rounded-2xl bg-[var(--color-surface)] shadow-[0_10px_30px_rgba(0,0,0,0.08)]" />
            <div className="absolute inset-14 flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-[10px] bg-[var(--color-surface-muted)] px-3 py-2.5">
                  <div className="text-[9px] text-[var(--color-fg-faint)]">Saldo</div>
                  <div className="mt-0.5 text-sm font-bold text-[var(--color-brand-700)] tabular-nums">R$ 16.401</div>
                </div>
                <div className="rounded-[10px] bg-[var(--color-surface-muted)] px-3 py-2.5">
                  <div className="text-[9px] text-[var(--color-fg-faint)]">Receitas</div>
                  <div className="mt-0.5 text-sm font-bold tabular-nums">R$ 7.050</div>
                </div>
                <div className="rounded-[10px] bg-[var(--color-surface-muted)] px-3 py-2.5">
                  <div className="text-[9px] text-[var(--color-fg-faint)]">Despesas</div>
                  <div className="mt-0.5 text-sm font-bold text-[#DC2626] tabular-nums">R$ 3.873</div>
                </div>
              </div>
              <div className="flex flex-1 items-end gap-2 px-2 pt-4">
                {[32, 58, 44, 72, 50].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-md bg-[var(--color-brand-300)]" style={{ height: `${h}%` }} />
                ))}
                <div className="flex-1 rounded-t-md bg-[var(--color-brand-500)]" style={{ height: '85%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== STEPS ========== */}
      <section id="how" className="border-t border-[var(--color-border-soft)] bg-[var(--color-surface)] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-3 inline-flex text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-brand-700)]">
            Como funciona
          </div>
          <h2 className="mb-3.5 max-w-[600px] text-balance text-[clamp(28px,3.5vw,42px)] font-bold tracking-[-0.025em]">
            Em 3 passos você está no controle.
          </h2>
          <p className="mb-12 max-w-[560px] text-base leading-relaxed text-[var(--color-fg-muted)]">
            Leva menos de 2 minutos pra começar — e dá pra fazer pelo celular tomando um café.
          </p>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="rounded-[22px] bg-[var(--color-bg)] p-8">
                <div className="font-mono text-xs font-semibold text-[var(--color-brand-700)]">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="mb-2 mt-3 text-[19px] font-bold tracking-[-0.02em]">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-fg-muted)]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="mx-auto max-w-[1280px] px-6 py-16 md:px-10 md:py-20">
        <div className="relative overflow-hidden rounded-[28px] bg-[var(--color-brand-300)] px-7 py-12 text-center text-[var(--color-brand-900)] md:px-14 md:py-16">
          <Image
            src="/dindin-mark.png"
            alt=""
            width={200}
            height={200}
            aria-hidden
            className="pointer-events-none absolute -left-10 -top-10 w-[200px] -rotate-[20deg] opacity-[0.18]"
          />
          <Image
            src="/dindin-mark.png"
            alt=""
            width={200}
            height={200}
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-8 w-[200px] rotate-[15deg] opacity-[0.18]"
          />
          <h2 className="relative mb-3.5 text-balance text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.03em]">
            Bora cuidar do seu dindin?
          </h2>
          <p className="relative mx-auto mb-7 max-w-[520px] text-[17px] opacity-75">
            Comece agora, em menos de 2 minutos. Sem cartão, sem amarração — só você no controle do seu bolso.
          </p>
          <div className="relative flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/signup"
              className="btn btn-lg bg-[var(--color-brand-900)] text-[var(--color-brand-100)] hover:bg-[var(--color-brand-800)]"
            >
              Começar gratuitamente
            </Link>
            <Link
              href="/auth/login"
              className="btn btn-lg border border-[var(--color-brand-700)] bg-transparent text-[var(--color-brand-900)] hover:bg-[var(--color-brand-200)]"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-4 border-t border-[var(--color-border-soft)] px-6 py-8 text-[13px] text-[var(--color-fg-faint)] md:px-10">
        <span>© 2026 Dindin. Cuide do seu dinheiro.</span>
        <div className="ml-auto flex gap-5">
          {['Privacidade', 'Termos', 'Suporte', 'Status'].map(label => (
            <a key={label} href="#" className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">
              {label}
            </a>
          ))}
        </div>
      </footer>
    </main>
  )
}
