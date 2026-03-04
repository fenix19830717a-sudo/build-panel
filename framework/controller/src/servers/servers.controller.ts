import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ServersService } from './servers.service';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { SshTestDto } from './dto/ssh-test.dto';
import { ServerStatus } from './entities/server.entity';

@Controller('servers')
@UseGuards(AuthGuard('jwt'))
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Get()
  findAll(
    @Request() req,
    @Query('status') status?: ServerStatus,
  ) {
    return this.serversService.findAll(req.user.userId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.serversService.findOne(id, req.user.userId);
  }

  @Post()
  create(@Body() createServerDto: CreateServerDto, @Request() req) {
    return this.serversService.create(createServerDto, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateServerDto: UpdateServerDto,
    @Request() req,
  ) {
    return this.serversService.update(id, updateServerDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.serversService.remove(id, req.user.userId);
  }

  @Post(':id/test-ssh')
  async testSsh(
    @Param('id') id: string,
    @Body() sshTestDto: SshTestDto,
    @Request() req,
  ) {
    return this.serversService.testSshConnection(id, req.user.userId, sshTestDto);
  }
}
