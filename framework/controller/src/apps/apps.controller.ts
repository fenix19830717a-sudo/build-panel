import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppsService } from './apps.service';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { DeployAppDto } from './dto/deploy-app.dto';
import { AppStatus } from './entities/app.entity';

@Controller('apps')
@UseGuards(AuthGuard('jwt'))
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get()
  findAll(@Query('status') status?: AppStatus) {
    return this.appsService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appsService.findOne(id);
  }

  @Post()
  create(@Body() createAppDto: CreateAppDto, @Request() req) {
    return this.appsService.create(createAppDto, req.user.userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAppDto: UpdateAppDto) {
    return this.appsService.update(id, updateAppDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appsService.remove(id);
  }

  @Post(':id/deploy')
  deploy(
    @Param('id') id: string,
    @Body() deployAppDto: DeployAppDto,
    @Request() req,
  ) {
    return this.appsService.deploy(id, deployAppDto, req.user.userId);
  }

  @Get('server/:serverId/apps')
  findByServer(@Param('serverId') serverId: string, @Request() req) {
    return this.appsService.findByServer(serverId, req.user.userId);
  }
}
