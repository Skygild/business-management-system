// ---- Auth ----
export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ---- User ----
export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  org: string;
}

// ---- Employee ----
export type EmployeeStatus = 'active' | 'inactive';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  status: EmployeeStatus;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  phone?: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {
  status?: EmployeeStatus;
}

// ---- Product ----
export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  unitPrice: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  description?: string;
  category?: string;
  unitPrice: number;
}

export type UpdateProductDto = Partial<CreateProductDto>;

// ---- Inventory ----
export interface InventoryItem {
  id: string;
  product: Product;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  location?: string;
  lowStockThreshold: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInventoryDto {
  productId: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  location?: string;
  lowStockThreshold?: number;
}

export interface UpdateInventoryDto {
  quantity?: number;
  costPrice?: number;
  sellingPrice?: number;
  location?: string;
  lowStockThreshold?: number;
}

// ---- Finance ----
export type TransactionType = 'expense' | 'sale' | 'income';

export type FinanceCategoryType = 'expense' | 'income';

export interface FinanceCategory {
  id: string;
  name: string;
  type: FinanceCategoryType;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string;
  employee?: Employee;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransactionDto {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string;
  employeeId?: string;
  tags?: string[];
}

export type UpdateTransactionDto = Partial<CreateTransactionDto>;

export interface FinanceSummary {
  totalExpenses: number;
  totalIncome: number;
  profit: number;
}

export interface ChartDataPoint {
  label: string;
  revenue: number;
  expenses: number;
  profit?: number;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
}

export interface FinanceCharts {
  revenueVsExpense: ChartDataPoint[];
  categoryBreakdown: CategoryBreakdown[];
  profitTrend: ChartDataPoint[];
}

// ---- Task ----
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: Employee[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeIds?: string[];
}

export type UpdateTaskDto = Partial<CreateTaskDto>;

// ---- Boards / Kanban ----
export interface Card {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  assignees: Employee[];
  order: number;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBoardDto {
  title: string;
}

export interface CreateColumnDto {
  title: string;
}

export interface CreateCardDto {
  title: string;
  description?: string;
  dueDate?: string;
  assigneeIds?: string[];
}

export interface UpdateCardDto extends Partial<CreateCardDto> {
  order?: number;
  columnId?: string;
}

export interface MoveCardDto {
  columnId: string;
  order: number;
}

// ---- Pagination ----
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ---- Dashboard ----
export interface DashboardSummary {
  totalInventoryValue: number;
  lowStockCount: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  activeTaskCount: number;
  overdueTaskCount: number;
  activeEmployeeCount: number;
}

// ---- API Error ----
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
