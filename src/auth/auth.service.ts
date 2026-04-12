import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

export interface AuthResponse {
  accessToken: string;
  user: Omit<User, 'password'>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const user = await this.usersService.create(registerDto);
    return this.generateAuthResponse(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('E-posta adresi veya şifre hatalı');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-posta adresi veya şifre hatalı');
    }

    return this.generateAuthResponse(user);
  }

  async getProfile(userId: number): Promise<User> {
    return this.usersService.findByIdOrFail(userId);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    await this.usersService.changePassword(userId, currentPassword, newPassword);
  }

  async createAdmin(dto: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const user = await this.usersService.createAdmin(dto);
    return this.generateAuthResponse(user);
  }

  async getAllAdmins() {
    return this.usersService.findAllAdmins();
  }

  async getAllUsers() {
    return this.usersService.findAllUsers();
  }

  async deleteUser(id: number): Promise<void> {
    return this.usersService.deleteUser(id);
  }

  private generateAuthResponse(user: User): AuthResponse {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword as User,
    };
  }
}
