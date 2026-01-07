import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrazione nuovo utente e organizzazione' })
  @ApiResponse({ status: 201, description: 'Registrazione completata' })
  @ApiResponse({ status: 409, description: 'Email già registrata' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login utente' })
  @ApiResponse({ status: 200, description: 'Login effettuato' })
  @ApiResponse({ status: 401, description: 'Credenziali non valide' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rinnova access token' })
  @ApiResponse({ status: 200, description: 'Token rinnovato' })
  @ApiResponse({ status: 401, description: 'Refresh token non valido' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout utente' })
  @ApiResponse({ status: 200, description: 'Logout effettuato' })
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.logout(dto.refreshToken);
    return { message: 'Logout effettuato' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ottieni profilo utente corrente' })
  @ApiResponse({ status: 200, description: 'Profilo utente' })
  async getProfile(@Request() req) {
    const user = await this.authService.validateUser(req.user.sub);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      organizationId: user.organizationId,
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        plan: user.organization.plan,
        sector: user.organization.sector,
      },
      managedStores: user.managedStores.map(ms => ({
        id: ms.store.id,
        name: ms.store.name,
      })),
    };
  }
}
