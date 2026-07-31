import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { GamesService } from './games.service';

class CreateGameDto {
  @IsString()
  @MinLength(2)
  bluePlayer!: string;

  @IsString()
  @MinLength(2)
  redPlayer!: string;

  @IsString()
  @MinLength(2)
  greenPlayer!: string;

  @IsString()
  @MinLength(2)
  yellowPlayer!: string;
}

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get('active')
  active() {
    return this.gamesService.getActiveGame();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateGameDto) {
    return this.gamesService.create(dto);
  }

  @Post(':id/start')
  start(@Param('id') id: string) {
    return this.gamesService.startGame(id);
  }

  @Post(':id/finish')
  finish(@Param('id') id: string) {
    return this.gamesService.finishGame(id);
  }
}
