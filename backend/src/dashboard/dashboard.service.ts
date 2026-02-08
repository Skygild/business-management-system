import { Injectable } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';
import { FinanceService } from '../finance/finance.service';
import { TasksService } from '../tasks/tasks.service';
import { EmployeesService } from '../employees/employees.service';

export interface DashboardSummary {
  totalInventoryValue: number;
  lowStockCount: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  monthlyProfit: number;
  activeTaskCount: number;
  overdueTaskCount: number;
  activeEmployeeCount: number;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly financeService: FinanceService,
    private readonly tasksService: TasksService,
    private readonly employeesService: EmployeesService,
  ) {}

  async getSummary(orgId: string): Promise<DashboardSummary> {
    const [
      totalInventoryValue,
      lowStockCount,
      monthlyExpenses,
      monthlyIncome,
      activeTaskCount,
      overdueTaskCount,
      activeEmployeeCount,
    ] = await Promise.all([
      this.inventoryService.getTotalInventoryValue(orgId),
      this.inventoryService.getLowStockCount(orgId),
      this.financeService.getMonthlyExpenses(orgId),
      this.financeService.getMonthlyIncome(orgId),
      this.tasksService.countActive(orgId),
      this.tasksService.countOverdue(orgId),
      this.employeesService.countActiveByOrg(orgId),
    ]);

    return {
      totalInventoryValue,
      lowStockCount,
      monthlyExpenses,
      monthlyIncome,
      monthlyProfit: monthlyIncome - monthlyExpenses,
      activeTaskCount,
      overdueTaskCount,
      activeEmployeeCount,
    };
  }
}
