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
import { ColumnsService } from './columns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateColumnDto } from './dto/create-column.dto';

@Controller('columns')
@UseGuards(JwtAuthGuard)
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Post()
  create(@Body() dto: CreateColumnDto, @Req() req: any) {
    return this.columnsService.create(dto.name, dto.boardId, req.user.userId);
  }

  @Get('/board/:id')
  findByBoard(@Param('id') boardId: string, @Req() req: any) {
    return this.columnsService.findByBoard(boardId, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.columnsService.remove(id, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: { name: string }) {
    return this.columnsService.update(id, dto.name);
  }
}
