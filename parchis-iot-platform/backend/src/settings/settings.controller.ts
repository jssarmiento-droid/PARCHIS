import { Body, Controller, Get, Patch } from '@nestjs/common';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { SettingsService } from './settings.service';

class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(4)
  playerCount?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(120)
  timeoutSeconds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  volume?: number;

}

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  get() {
    return this.settingsService.get();
  }

  @Patch()
  update(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(dto);
  }
}
