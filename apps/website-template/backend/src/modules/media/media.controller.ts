import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  Headers,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { MediaService } from './media.service';

@ApiTags('Media')
@Controller('api/v1')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('media')
  @ApiOperation({ summary: '媒体文件列表' })
  findAll(
    @Query('folder') folder: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.mediaService.findAll(tenantId, folder);
  }

  @Post('admin/media/upload')
  @ApiOperation({ summary: '上传媒体文件' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: HttpStatus.CREATED, description: '上传成功' })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.mediaService.upload(file, tenantId, folder);
  }

  @Delete('admin/media/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除媒体文件' })
  remove(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.mediaService.remove(id, tenantId);
  }
}
