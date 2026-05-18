import { vi } from 'vitest'

export const createSupabaseMock = () => {
  const mock = {
    from: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    is: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    gt: vi.fn(),
    lt: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    range: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: null, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ data: null, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn().mockResolvedValue({ data: null, error: null }),
      remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      createSignedUrl: vi.fn().mockReturnValue({ data: { signedUrl: 'https://example.com/file' } }),
    },
    channel: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn(),
  }

  mock.from.mockReturnValue(mock)
  mock.select.mockReturnValue(mock)
  mock.insert.mockReturnValue(mock)
  mock.update.mockReturnValue(mock)
  mock.delete.mockReturnValue(mock)
  mock.eq.mockReturnValue(mock)
  mock.neq.mockReturnValue(mock)
  mock.is.mockReturnValue(mock)
  mock.gte.mockReturnValue(mock)
  mock.lte.mockReturnValue(mock)
  mock.gt.mockReturnValue(mock)
  mock.lt.mockReturnValue(mock)
  mock.order.mockReturnValue(mock)
  mock.limit.mockReturnValue(mock)
  mock.range.mockReturnValue(mock)
  mock.single.mockResolvedValue({ data: null, error: null })
  mock.maybeSingle.mockResolvedValue({ data: null, error: null })

  return mock
}

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2026-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: { name: 'Test User' },
  aud: 'authenticated',
}
