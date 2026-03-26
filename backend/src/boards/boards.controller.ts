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
}
