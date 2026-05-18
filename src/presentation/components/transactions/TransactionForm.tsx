'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/presentation/components/ui/button'
import { TransactionType, TransactionStatus, PaymentMethod } from '@/domain/entities/Transaction'

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
  notes: z.string().optional(),
  tags: z.string().optional(),
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

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      type: 'expense',
      date: today,
      status: 'completed',
      ...defaultValues,
    },
  })

  const type = watch('type')

  const filteredCategories = categories.filter(
    c => c.type === type || c.type === 'both'
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="type" className="text-sm font-medium">Tipo</label>
          <select
            id="type"
            {...register('type')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
            <option value="transfer">Transferência</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="status" className="text-sm font-medium">Status</label>
          <select
            id="status"
            {...register('status')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="completed">Efetivada</option>
            <option value="pending">Pendente</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="amount" className="text-sm font-medium">Valor</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0,00"
          {...register('amount')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">Descrição</label>
        <input
          id="description"
          type="text"
          placeholder="Ex: Supermercado Extra"
          {...register('description')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="date" className="text-sm font-medium">Data</label>
          <input
            id="date"
            type="date"
            {...register('date')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="paymentMethod" className="text-sm font-medium">Forma de Pagamento</label>
          <select
            id="paymentMethod"
            {...register('paymentMethod')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
        <label htmlFor="accountId" className="text-sm font-medium">Conta</label>
        <select
          id="accountId"
          {...register('accountId')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Selecione uma conta</option>
          {accounts.filter(a => a.isActive).map(account => (
            <option key={account.id} value={account.id}>{account.name}</option>
          ))}
        </select>
        {errors.accountId && <p className="text-xs text-destructive">{errors.accountId.message}</p>}
      </div>

      {type === 'transfer' && (
        <div className="space-y-1">
          <label htmlFor="destinationAccountId" className="text-sm font-medium">Conta Destino</label>
          <select
            id="destinationAccountId"
            {...register('destinationAccountId')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
          <label htmlFor="categoryId" className="text-sm font-medium">Categoria</label>
          <select
            id="categoryId"
            {...register('categoryId')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Sem categoria</option>
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="notes" className="text-sm font-medium">Observações</label>
        <textarea
          id="notes"
          rows={2}
          placeholder="Opcional"
          {...register('notes')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={isSubmitting || loading}>Salvar</Button>
      </div>
    </form>
  )
}
