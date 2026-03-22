import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  async createBoard(userId: string, dto: CreateBoardDto) {
    return this.prisma.board.create({
      data: {
        name: dto.name,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async getBoards(userId: string) {
    return this.prisma.board.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: { members: true },
    });
  }

  async deleteBoard(userId: string, boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.ownerId !== userId) {
      throw new ForbiddenException('You are not the owner');
    }

    // ВАЖНО: сначала удалить связи
    await this.prisma.boardMember.deleteMany({
      where: { boardId },
    });

    // потом удалить доску
    return this.prisma.board.delete({
      where: { id: boardId },
    });
  }
}
