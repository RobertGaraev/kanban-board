import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, boardId: string, userId: string) {
    // проверяем доступ к доске
    const member = await this.prisma.boardMember.findFirst({
      where: {
        boardId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('No access to board');
    }

    return this.prisma.column.create({
      data: {
        name,
        boardId,
      },
    });
  }

  async findByBoard(boardId: string, userId: string) {
    const member = await this.prisma.boardMember.findFirst({
      where: {
        boardId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('No access to board');
    }

    return this.prisma.column.findMany({
      where: { boardId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async remove(columnId: string, userId: string) {
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

    return this.prisma.column.delete({
      where: { id: columnId },
    });
  }

  async update(id: string, name: string) {
    return this.prisma.column.update({
      where: { id },
      data: { name },
    });
  }
}
