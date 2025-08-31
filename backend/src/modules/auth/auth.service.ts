// CryptoSense Dashboard - Authentication Service
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

// Entities
import { User, UserRole, UserStatus } from '../../database/entities/user.entity';
import { UserPreferences, Theme, TimeZone, Language } from '../../database/entities/user-preferences.entity';

// DTOs
export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: Partial<User>;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
    @InjectRepository(UserPreferences)
    private readonly preferencesRepository: Repository<UserPreferences>,
    
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, username, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already registered');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Username already taken');
      }
    }

    // Validate password strength
    this.validatePassword(password);

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      email: email.toLowerCase(),
      username,
      passwordHash,
      firstName,
      lastName,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: false,
      notificationsEnabled: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Create default preferences
    const preferences = this.preferencesRepository.create({
      userId: savedUser.id,
      theme: Theme.DARK,
      timeZone: TimeZone.UTC,
      language: Language.EN,
      watchlist: ['BTC', 'ETH', 'SOL'],
      defaultAsset: 'BTC',
      dashboardLayout: {
        panels: ['market-overview', 'derivatives', 'cross-asset', 'stablecoins'],
        activeTab: 'market-overview',
      },
      chartSettings: {
        defaultTimeframe: '1h',
        indicators: ['RSI', 'MACD'],
        chartType: 'candlestick',
        showVolume: true,
      },
      notificationPreferences: {
        email: {
          enabled: true,
          frequency: 'immediate',
          types: ['price_alerts', 'liquidations', 'funding_rates'],
        },
        push: {
          enabled: false,
          tokens: [],
          types: [],
        },
      },
      alertSettings: {
        maxAlertsPerHour: 10,
        defaultSeverity: 'medium',
        autoAcknowledge: false,
        soundEnabled: true,
        cooldownMinutes: 5,
      },
    });

    await this.preferencesRepository.save(preferences);

    this.logger.log(`New user registered: ${email} (${savedUser.id})`);

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    return {
      user: this.sanitizeUser(savedUser),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['preferences'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is suspended or inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    this.logger.log(`User logged in: ${email} (${user.id})`);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase() },
      });

      if (user && await bcrypt.compare(password, user.passwordHash)) {
        return user;
      }
      return null;
    } catch (error) {
      this.logger.error('Error validating user:', error);
      return null;
    }
  }

  async validateJwtPayload(payload: JwtPayload): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['preferences'],
      });

      if (user && user.status === UserStatus.ACTIVE) {
        return user;
      }
      return null;
    } catch (error) {
      this.logger.error('Error validating JWT payload:', error);
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // In a production environment, you might want to blacklist the token
    // or store active sessions in Redis and remove them on logout
    this.logger.log(`User logged out: ${userId}`);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password
    this.validatePassword(newPassword);

    // Hash new password
    const saltRounds = 12;
    user.passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.userRepository.save(user);
    this.logger.log(`Password changed for user: ${userId}`);
  }

  async resetPasswordRequest(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if email exists or not
      return;
    }

    // Generate reset token (in production, store this in database with expiry)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // In production, you would:
    // 1. Store the reset token in database with expiry
    // 2. Send reset email with token
    // 3. Provide endpoint to verify token and reset password

    this.logger.log(`Password reset requested for: ${email}`);
    // TODO: Send reset email
  }

  async verifyEmail(userId: string, token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In production, verify the token
    user.emailVerified = true;
    await this.userRepository.save(user);

    this.logger.log(`Email verified for user: ${userId}`);
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only allow certain fields to be updated
    const allowedFields = ['firstName', 'lastName', 'notificationsEnabled'];
    const updates = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    }

    Object.assign(user, updates);
    const updatedUser = await this.userRepository.save(user);

    this.logger.log(`Profile updated for user: ${userId}`);
    return this.sanitizeUser(updatedUser);
  }

  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['preferences'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
  }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    
    // Generate refresh token with longer expiry
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const expiresIn = parseInt(
      this.configService.get('JWT_EXPIRES_IN', '86400'),
      10,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private sanitizeUser(user: User): Partial<User> {
    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new BadRequestException('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new BadRequestException('Password must contain at least one special character');
    }
  }
}