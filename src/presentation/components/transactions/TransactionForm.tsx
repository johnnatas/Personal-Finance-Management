'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check } from 'lucide-react'
import { CurrencyInput } from '@/presentation/components/ui/CurrencyInput'

const schema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  description: z.string().min(1, 'Descrição é obrigatória').max(255, 'Descrição muito longa'),
  date: z.string().min(1, 'Data é obrigatória'),
  accountId: z.string().min(1, 'Conta é obrigatória'),
  categoryId: z.string().optional(),
  paymentMethod: z.string().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']).default('completed'),
  destinationAccountId: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Account {
  id: string
  name: string
  type: string
  currentBalance: number
  currency: string
  color: string
  isActive: boolean
}

interface Category {
  id: string
  name: string
  type: string
  color: string
  icon: string
}

interface TransactionFormProps {
  accounts: Account[]
  categories: Category[]
  onSubmit: (data: FormData) => Promise<void> | void
  onCancel: () => void
  defaultValues?: Partial<FormData>
  loading?: boolean
}

export function TransactionForm({ accounts, categories, onSubmit, onCancel, defaultValues, loading }: TransactionFormProps) {
  const today = new Date().toISOString().split('T')[0]

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      type: 'expense',
      date: today,
      status: 'completed',
      amount: 0,
      ...defaultValues,
    },
  })

  const type = watch('type')
  const amount = watch('amount')
  const categoryId = watch('categoryId')

  const filteredCategories = categories.filter(
    c => c.type === type || c.type === 'both'
  )

  const setType = (next: 'income' | 'expense' | 'transfer') => {
    setValue('type', next, { shouldValidate: true })
    // clear category if it no longer fits the new type
    const stillValid = categories.find(c => c.id === categoryId && (c.type === next || c.type === 'both'))
    if (!stillValid) setValue('categoryId', '', { shouldValidate: false })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Tipo */}
      <div className="field">
        <label htmlFor="type" className="label">Tipo</label>
        <div className="segments" role="group">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={type === 'expense' ? 'active' : ''}
            style={{ color: type === 'expense' ? 'var(--color-danger)' : undefined }}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={type === 'income' ? 'active' : ''}
            style={{ color: type === 'income' ? 'var(--color-success)' : undefined }}
          >
            Receita
          </button>
          <button
            type="button"
            onClick={() => setType('transfer')}
            className={type === 'transfer' ? 'active' : ''}
          >
            Transferência
          </button>
        </div>
        {/* Hidden select kept for accessibility (label association + tests) */}
        <select id="type" {...register('type')} className="sr-only" aria-hidden="true" tabIndex={-1}>
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
          <option value="transfer">Transferência</option>
        </select>
      </div>

      {/* Valor — big input */}
      <div className="field">
        <label htmlFor="amount" className="label">Valor</label>
        <CurrencyInput
          id="amount"
          aria-label="Valor"
          value={amount ? String(amount) : ''}
          onChange={(numericValue) => setValue('amount', numericValue ? parseFloat(numericValue) : 0, { shouldValidate: true })}
          className="input !h-16 !pl-10 !text-2xl !font-semibold"
        />
        {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
      </div>

      {/* Descrição */}
      <div className="field">
        <label htmlFor="description" className="label">Descrição</label>
        <input
          id="description"
          type="text"
          placeholder="Ex: Supermercado Extra"
          {...register('description')}
          className="input"
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>

      {/* Data + Conta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="field">
          <label htmlFor="date" className="label">Data</label>
          <input id="date" type="date" {...register('date')} className="input" />
          {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>}
        </div>
        <div className="field">
          <label htmlFor="accountId" className="label">Conta</label>
          <select id="accountId" {...register('accountId')} className="select">
            <option value="">Selecione uma conta</option>
            {accounts.filter(a => a.isActive).map(account => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
          {errors.accountId && <p className="mt-1 text-xs text-red-600">{errors.accountId.message}</p>}
        </div>
      </div>

      {/* Forma de pagamento + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="field">
          <label htmlFor="paymentMethod" className="label">Forma de Pagamento</label>
          <select id="paymentMethod" {...register('paymentMethod')} className="select">
            <option value="">Selecione</option>
            <option value="pix">PIX</option>
            <option value="credit_card">Cartão de Crédito</option>
            <option value="debit_card">Cartão de Débito</option>
            <option value="cash">Dinheiro</option>
            <option value="bank_transfer">Transferência Bancária</option>
            <option value="boleto">Boleto</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="status" className="label">Status</label>
          <select id="status" {...register('status')} className="select">
            <option value="completed">Efetivada</option>
            <option value="pending">Pendente</option>
          </select>
        </div>
      </div>

      {/* Conta destino (transfer) */}
      {type === 'transfer' && (
        <div className="field">
          <label htmlFor="destinationAccountId" className="label">Conta Destino</label>
          <select id="destinationAccountId" {...register('destinationAccountId')} className="select">
            <option value="">Selecione a conta destino</option>
            {accounts.filter(a => a.isActive).map(account => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Categoria — chip cloud */}
      {type !== 'transfer' && (
        <div className="field">
          <label htmlFor="categoryId" className="label">Categoria</label>
          <div className="flex flex-wrap gap-2">
            {filteredCategories.map(cat => {
              const isSelected = categoryId === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setValue('categoryId', cat.id, { shouldValidate: false })}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border"
                  style={{
                    background: isSelected ? cat.color : 'var(--color-surface-muted)',
                    color: isSelected ? '#fff' : 'var(--color-fg)',
                    borderColor: isSelected ? cat.color : 'transparent',
                  }}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: isSelected ? '#fff' : cat.color }}
                  />
                  {cat.name}
                </button>
              )
            })}
          </div>
          {/* Hidden select for accessibility/tests */}
          <select id="categoryId" {...register('categoryId')} className="sr-only" aria-hidden="true" tabIndex={-1}>
            <option value="">Sem categoria</option>
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting || loading} className="btn btn-primary">
          <Check className="h-4 w-4" /> Salvar
        </button>
      </div>
    </form>
  )
}
