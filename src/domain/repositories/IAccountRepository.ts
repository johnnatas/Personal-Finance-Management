import { Account } from '../entities/Account'

export interface IAccountRepository {
  create(account: Account): Promise<Account>
  findById(id: string): Promise<Account | null>
  findByUserId(userId: string): Promise<Account[]>
  update(id: string, data: Partial<Account>): Promise<Account>
  delete(id: string): Promise<void>
  updateBalance(id: string, balance: number): Promise<void>
}
