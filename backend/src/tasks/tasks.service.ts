import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTaskDto, userId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: dto.columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const member = await this.prisma.boardMember.findFirst({
      where: {
        boardId: column.boardId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('No access');
    }

    const lastTask = await this.prisma.task.findFirst({
      where: { columnId: dto.columnId },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastTask ? lastTask.order + 1 : 1;

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        columnId: dto.columnId,
        order: newOrder,
      },
    });
  }

  async findByColumn(columnId: string, userId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const member = await this.prisma.boardMember.findFirst({
      where: {
        boardId: column.boardId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('No access');
    }

    return this.prisma.task.findMany({
      where: { columnId },
      orderBy: { order: 'asc' },
    });
  }

  async remove(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const member = await this.prisma.boardMember.findFirst({
      where: {
        boardId: task.column.boardId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('No access');
    }

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }

  async move(
    taskId: string,
    newColumnId: string,
    newOrder: number,
    userId: string,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const member = await this.prisma.boardMember.findFirst({
      where: {
        boardId: task.column.boardId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('No access');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: newColumnId,
        order: newOrder,
      },
    });
  }
}
