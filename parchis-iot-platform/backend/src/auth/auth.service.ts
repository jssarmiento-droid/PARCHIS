import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(username: string, password: string) {
    await this.ensureAdminSeed();
    const admin = await this.prisma.adminUser.findUnique({ where: { username } });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      accessToken: await this.jwt.signAsync({ sub: admin.id, username: admin.username }),
      user: { id: admin.id, username: admin.username },
    };
  }

  private async ensureAdminSeed() {
    const username = this.config.get<string>('ADMIN_USER') || 'admin';
    const password = this.config.get<string>('ADMIN_PASSWORD') || 'admin123';
    const exists = await this.prisma.adminUser.findUnique({ where: { username } });
    if (!exists) {
      await this.prisma.adminUser.create({
        data: {
          username,
          passwordHash: await bcrypt.hash(password, 10),
        },
      });
    }
  }
}
