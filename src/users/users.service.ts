import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılıyor');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      role: UserRole.USER,
    });

    return this.userRepository.save(user);
  }

  async createAdmin(dto: { name: string; email: string; password: string }): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılıyor');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    return this.userRepository.save(user);
  }

  async seedAdmin(): Promise<void> {
    const existing = await this.userRepository.findOne({
      where: { email: 'admin@eticaret.com' },
    });
    if (existing) return;

    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const admin = this.userRepository.create({
      name: 'Sistem Admini',
      email: 'admin@eticaret.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
    });
    await this.userRepository.save(admin);
  }

  async findAllAdmins(): Promise<User[]> {
    return this.userRepository.find({ where: { role: UserRole.ADMIN } });
  }

  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find({ where: { role: UserRole.USER } });
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.findByIdOrFail(id);
    await this.userRepository.remove(user);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new BadRequestException('Mevcut şifre hatalı');

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByIdOrFail(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Kullanıcı bulunamadı (ID: ${id})`);
    }

    return user;
  }
}
