import * as fs from 'node:fs';
import { Body, Controller, Delete, Get, Param, Patch, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { IsOptional, IsString } from 'class-validator';
import { AudiosService } from './audios.service';

class AudioDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  relationType?: 'QUESTION' | 'INFORMATIVE_TILE' | 'GENERAL';
}

@Controller('audios')
export class AudiosController {
  constructor(private readonly audiosService: AudiosService) {}

  @Get()
  findAll() {
    return this.audiosService.findAll();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          fs.mkdirSync('./uploads/audios', { recursive: true });
          callback(null, './uploads/audios');
        },
        filename: (_req, file, callback) => callback(null, `${Date.now()}-${file.originalname}`),
      }),
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File, @Body() dto: AudioDto) {
    return this.audiosService.createFromUpload(file, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<AudioDto>) {
    return this.audiosService.update(id, dto);
  }

  @Get(':id/stream')
  async stream(@Param('id') id: string, @Res() res: Response) {
    const audio = await this.audiosService.findOne(id);
    return res.sendFile(audio.path, { root: process.cwd() });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.audiosService.remove(id);
  }
}
