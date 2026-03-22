import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BoardsModule } from './boards/boards.module';
import { ColumnsModule } from './columns/columns.module';

@Module({
  imports: [PrismaModule, AuthModule, BoardsModule, ColumnsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
