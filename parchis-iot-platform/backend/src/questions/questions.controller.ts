import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { QuestionsService } from './questions.service';

class QuestionDto {
  @IsString()
  title!: string;

  @IsString()
  text!: string;

  @IsString()
  optionA!: string;

  @IsString()
  optionB!: string;

  @IsString()
  correctOption!: string;

  @IsString()
  topic!: string;

  @IsOptional()
  @IsString()
  audioId?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('topic') topic?: string) {
    return this.questionsService.findAll({ search, topic });
  }

  @Post()
  create(@Body() dto: QuestionDto) {
    return this.questionsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<QuestionDto>) {
    return this.questionsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}
