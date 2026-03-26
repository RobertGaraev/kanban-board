import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { InviteDto } from './dto/invite.dto';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  async createBoard(userId: string, dto: CreateBoardDto) {
    return this.prisma.board.create({
      data: {
        name: dto.name,
        description: dto.description,
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

  async findAllByUser(userId: string) {
    return this.prisma.board.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        members: {
          where: {
            userId,
          },
        },
      },
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

  async updateColumn(id: string, name: string) {
    return this.prisma.column.update({
      where: { id },
      data: { name },
    });
  }

  async invite(boardId: string, dto: InviteDto, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new ForbiddenException('Only owner can invite');
    }

    if (board.ownerId !== userId) {
      throw new ForbiddenException('Only owner can invite');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.boardMember.findFirst({
      where: {
        boardId,
        userId: user.id,
      },
    });

    if (existing) {
      throw new BadRequestException('User already in board');
    }

    return this.prisma.boardMember.create({
      data: {
        boardId,
        userId: user.id,
        role: dto.role,
      },
    });
  }

  async getMembers(boardId: string) {
    return this.prisma.boardMember.findMany({
      where: { boardId },
      include: {
        user: true,
      },
    });
  }

  async updateBoard(id: string, userId: string, dto: any) {
    const board = await this.prisma.board.findUnique({
      where: { id },
    });

    if (!board || board.ownerId !== userId) {
      throw new Error('Нет доступа');
    }

    return this.prisma.board.update({
      where: { id },
      data: dto,
    });
  }
}
