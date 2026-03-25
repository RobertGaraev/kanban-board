import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto, @Req() req: any) {
    return this.tasksService.create(dto, req.user.userId);
  }

  @Get('/column/:id')
  findByColumn(@Param('id') columnId: string, @Req() req: any) {
    return this.tasksService.findByColumn(columnId, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.remove(id, req.user.userId);
  }

  @Patch(':id/move')
  move(@Param('id') id: string, @Body() body, @Req() req: any) {
    return this.tasksService.move(
      id,
      body.columnId,
      body.order,
      req.user.userId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    dto: {
      title?: string;
      description?: string;
      assigneeId?: string;
      deadline?: string;
    },
  ) {
    return this.tasksService.update(id, dto);
  }
}
