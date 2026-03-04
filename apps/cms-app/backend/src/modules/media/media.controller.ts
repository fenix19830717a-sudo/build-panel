import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MediaService } from './media.service';
import { Media, MediaType } from './entities/media.entity';
import { CreateMediaDto, UpdateMediaDto, MediaQueryDto } from './dto/media.dto';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        alt: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: Media })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('alt') alt?: string,
    @Body('description') description?: string,
  ): Promise<Media> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const mediaType = this.mediaService.determineMediaType(file.mimetype);
    
    const createMediaDto: CreateMediaDto = {
      originalName: file.originalname,
      fileName: file.filename,
      url: `/uploads/${file.filename}`,
      type: mediaType,
      mimeType: file.mimetype,
      size: file.size,
      alt,
      description,
    };

    return this.mediaService.create(createMediaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all media files' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['image', 'video', 'document', 'audio', 'other'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of media files' })
  async findAll(@Query() query: MediaQueryDto) {
    return this.mediaService.findAll(query);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get media by type' })
  @ApiParam({ name: 'type', enum: MediaType })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of media files by type' })
  async getByType(
    @Param('type') type: MediaType,
    @Query('limit') limit: number = 20,
  ): Promise<Media[]> {
    return this.mediaService.getByType(type, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Media found', type: Media })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Media> {
    return this.mediaService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update media metadata' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateMediaDto })
  @ApiResponse({ status: 200, description: 'Media updated', type: Media })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMediaDto: UpdateMediaDto,
  ): Promise<Media> {
    return this.mediaService.update(id, updateMediaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'Media deleted' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.mediaService.remove(id);
  }
}
