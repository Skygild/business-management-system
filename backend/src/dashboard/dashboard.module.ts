import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { FinanceModule } from '../finance/finance.module';
import { TasksModule } from '../tasks/tasks.module';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [InventoryModule, FinanceModule, TasksModule, EmployeesModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
