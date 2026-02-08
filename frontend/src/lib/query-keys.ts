export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  employees: {
    all: ['employees'] as const,
    list: (params?: object) => ['employees', 'list', params] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
  },
  products: {
    all: ['products'] as const,
    list: (params?: object) => ['products', 'list', params] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    list: (params?: object) => ['inventory', 'list', params] as const,
    detail: (id: string) => ['inventory', 'detail', id] as const,
  },
  finance: {
    all: ['finance'] as const,
    transactions: (params?: object) => ['finance', 'transactions', params] as const,
    summary: (params?: object) => ['finance', 'summary', params] as const,
    charts: (params?: object) => ['finance', 'charts', params] as const,
    categories: ['finance', 'categories'] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    list: (params?: object) => ['tasks', 'list', params] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
  },
  boards: {
    all: ['boards'] as const,
    list: ['boards', 'list'] as const,
    detail: (id: string) => ['boards', 'detail', id] as const,
  },
  dashboard: {
    summary: ['dashboard', 'summary'] as const,
  },
} as const;
