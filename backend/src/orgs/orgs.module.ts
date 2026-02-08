import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Org, OrgSchema } from './schemas/org.schema';
import { OrgsService } from './orgs.service';
import { OrgsController } from './orgs.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Org.name, schema: OrgSchema }])],
  controllers: [OrgsController],
  providers: [OrgsService],
  exports: [OrgsService],
})
export class OrgsModule {}
