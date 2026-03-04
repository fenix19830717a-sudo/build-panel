import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { User } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ status: 200, description: '返回用户列表', type: [UserResponseDto] })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '返回用户信息', type: UserResponseDto })
  async getProfile(@Request() req): Promise<User> {
    return this.usersService.findOne(req.user.id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户详情' })
  @ApiResponse({ status: 200, description: '返回用户详情', type: UserResponseDto })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({ status: 200, description: '用户更新成功', type: UserResponseDto })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
