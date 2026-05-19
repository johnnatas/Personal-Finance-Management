'use client'

import {
  Utensils, Car, ShoppingBag, Home, Heart, Film, Book, Repeat,
  Wallet, TrendingUp, Briefcase, Tag,
} from 'lucide-react'

interface Props {
  name?: string
  color: string
  size?: number
  radius?: number
}

function pickIcon(name?: string) {
  const n = (name || '').toLowerCase()
  if (n.includes('aliment') || n.includes('food') || n.includes('comida')) return Utensils
  if (n.includes('transport') || n.includes('uber') || n.includes('carro')) return Car
  if (n.includes('compra') || n.includes('shopping')) return ShoppingBag
  if (n.includes('casa') || n.includes('home') || n.includes('moradia')) return Home
  if (n.includes('saude') || n.includes('saúde') || n.includes('health')) return Heart
  if (n.includes('lazer') || n.includes('fun')) return Film
  if (n.includes('educ')) return Book
  if (n.includes('assinatur')) return Repeat
  if (n.includes('salar') || n.includes('income') || n.includes('renda')) return Wallet
  if (n.includes('freela')) return Briefcase
  if (n.includes('invest')) return TrendingUp
  return Tag
}

export function CategoryIcon({ name, color, size = 40, radius = 12 }: Props) {
  const Icon = pickIcon(name)
  const iconSize = Math.round(size * 0.5)
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: color,
        display: 'grid',
        placeItems: 'center',
        color: 'white',
        flexShrink: 0,
      }}
    >
      <Icon style={{ width: iconSize, height: iconSize }} />
    </div>
  )
}
