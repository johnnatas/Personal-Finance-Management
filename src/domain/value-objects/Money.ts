export class Money {
  private constructor(
    readonly amount: number,
    readonly currency: string,
  ) {}

  static create(amount: number, currency: string): Money {
    if (amount < 0) throw new Error('Money amount cannot be negative')
    if (amount > 1_000_000) throw new Error('Money amount exceeds maximum allowed')
    const rounded = Math.round(amount * 100) / 100
    return new Money(rounded, currency)
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Cannot operate on different currencies')
    return Money.create(this.amount + other.amount, this.currency)
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Cannot operate on different currencies')
    return Money.create(Math.max(0, this.amount - other.amount), this.currency)
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency
  }

  toString(): string {
    return `${this.currency} ${this.amount}`
  }
}
