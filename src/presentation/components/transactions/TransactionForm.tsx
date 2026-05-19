'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

const inputClass = 'input'
const labelClass = 'label'

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

  const filteredCategories = categories.filter(
    c => c.type === type || c.type === 'both'
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="type" className={labelClass}>Tipo</label>
          <select
            id="type"
            {...register('type')}
            className={inputClass}
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
            <option value="transfer">Transferência</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="status" className={labelClass}>Status</label>
          <select
            id="status"
            {...register('status')}
            className={inputClass}
          >
            <option value="completed">Efetivada</option>
            <option value="pending">Pendente</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="amount" className={labelClass}>Valor</label>
        <CurrencyInput
          id="amount"
          value={amount ? String(amount) : ''}
          onChange={(numericValue) => setValue('amount', numericValue ? parseFloat(numericValue) : 0, { shouldValidate: true })}
          className="input"
        />
        {errors.amount && <p className="text-xs text-red-600">{errors.amount.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className={labelClass}>Descrição</label>
        <input
          id="description"
          type="text"
          placeholder="Ex: Supermercado Extra"
          {...register('description')}
          className={inputClass}
        />
        {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="date" className={labelClass}>Data</label>
          <input
            id="date"
            type="date"
            {...register('date')}
            className={inputClass}
          />
          {errors.date && <p className="text-xs text-red-600">{errors.date.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="paymentMethod" className={labelClass}>Forma de Pagamento</label>
          <select
            id="paymentMethod"
            {...register('paymentMethod')}
            className={inputClass}
          >
            <option value="">Selecione</option>
            <option value="pix">PIX</option>
            <option value="credit_card">Cartão de Crédito</option>
            <option value="debit_card">Cartão de Débito</option>
            <option value="cash">Dinheiro</option>
            <option value="bank_transfer">Transferência Bancária</option>
            <option value="boleto">Boleto</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="accountId" className={labelClass}>Conta</label>
        <select
          id="accountId"
          {...register('accountId')}
          className={inputClass}
        >
          <option value="">Selecione uma conta</option>
          {accounts.filter(a => a.isActive).map(account => (
            <option key={account.id} value={account.id}>{account.name}</option>
          ))}
        </select>
        {errors.accountId && <p className="text-xs text-red-600">{errors.accountId.message}</p>}
      </div>

      {type === 'transfer' && (
        <div className="space-y-1">
          <label htmlFor="destinationAccountId" className={labelClass}>Conta Destino</label>
          <select
            id="destinationAccountId"
            {...register('destinationAccountId')}
            className={inputClass}
          >
            <option value="">Selecione a conta destino</option>
            {accounts.filter(a => a.isActive).map(account => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
        </div>
      )}

      {type !== 'transfer' && (
        <div className="space-y-1">
          <label htmlFor="categoryId" className={labelClass}>Categoria</label>
          <select
            id="categoryId"
            {...register('categoryId')}
            className={inputClass}
          >
            <option value="">Sem categoria</option>
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="btn btn-primary"
        >
          Salvar
        </button>
      </div>
    </form>
  )
}
