import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBoardDto } from './dto/create-board.dto';
import { InviteDto } from './dto/invite.dto';
import type { Request } from 'express';
import { BoardRole } from '@prisma/client';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateBoardDto) {
    return this.boardsService.createBoard(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req) {
    return this.boardsService.findAllByUser(req.user.userId);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.boardsService.deleteBoard(req.user.userId, id);
  }

  @Post(':id/invite')
  invite(
    @Param('id') boardId: string,
    @Body() dto: InviteDto,
    @Req() req: any,
  ) {
    return this.boardsService.invite(boardId, dto, req.user.userId);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.boardsService.getMembers(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: { name: string; description?: string },
    @Req() req,
  ) {
    return this.boardsService.updateBoard(id, req.user.userId, dto);
  }

  @Patch(':id/member')
  updateMember(
    @Param('id') boardId: string,
    @Body() dto: { userId: string; role: BoardRole },
    @Req() req,
  ) {
    return this.boardsService.updateMember(
      boardId,
      dto.userId,
      dto.role,
      req.user.userId,
    );
  }

  @Delete(':id/member/:userId')
  removeMember(
    @Param('id') boardId: string,
    @Param('userId') userId: string,
    @Req() req,
  ) {
    return this.boardsService.removeMember(boardId, userId, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.boardsService.findOne(id, req.user.userId);
  }
}
