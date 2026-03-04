import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}
  @Post()
  create(@Body() dto: CreateTicketDto) { return this.ticketsService.create(dto); }
  @Get()
  findAll() { return this.ticketsService.findAll(); }
  @Get(':id')
  findOne(@Param('id') id: string) { return this.ticketsService.findOne(id); }
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) { return this.ticketsService.update(id, dto); }
  @Post(':id/assign')
  assign(@Param('id') id: string, @Body('agentId') agentId: string) { return this.ticketsService.assign(id, agentId); }
  @Delete(':id')
  remove(@Param('id') id: string) { return this.ticketsService.remove(id); }
}
