import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/loginResponse.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: '用戶登入',
    description: '使用用戶名和密碼登入，成功後返回 JWT token',
  })
  @ApiResponse({
    status: 201,
    description: '登入成功，返回 JWT token',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '請求參數驗證失敗',
  })
  @ApiResponse({
    status: 401,
    description: '用戶名或密碼錯誤',
  })
  @ApiBadRequestResponse({
    description: '請求格式錯誤或缺少必要參數',
  })
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
  ): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto);
  }
}
