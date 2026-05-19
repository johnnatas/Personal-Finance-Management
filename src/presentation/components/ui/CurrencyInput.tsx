'use client'

import { useEffect, useState } from 'react'

interface Props {
  value: string
  onChange: (numericValue: string) => void
  placeholder?: string
  className?: string
  required?: boolean
  id?: string
  'aria-label'?: string
}

function toDisplay(numericStr: string): string {
  if (!numericStr) return ''
  const num = parseFloat(numericStr)
  if (isNaN(num)) return ''
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function CurrencyInput({ value, onChange, placeholder = '0,00', className = '', required, id, ...rest }: Props) {
  const [display, setDisplay] = useState(toDisplay(value))

  useEffect(() => {
    setDisplay(toDisplay(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    if (!raw) {
      setDisplay('')
      onChange('')
      return
    }
    const cents = parseInt(raw, 10)
    const numeric = (cents / 100).toFixed(2)
    const formatted = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    setDisplay(formatted)
    onChange(numeric)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 select-none">
        R$
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        className={`pl-9 ${className}`}
        aria-label={rest['aria-label']}
      />
    </div>
  )
}
