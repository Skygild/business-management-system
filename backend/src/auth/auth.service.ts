import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from '../common/decorators/roles.decorator';
import { UserDocument } from '../users/schemas/user.schema';

export interface AuthTokenResponse {
  accessToken: string;
  user: {
    id: unknown;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    org: unknown;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly orgsService: OrgsService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmailAnyOrg(email);
    if (!user) {
      return null;
    }
    const isValid = await this.usersService.validatePassword(user, password);
    return isValid ? user : null;
  }

  async login(loginDto: LoginDto): Promise<AuthTokenResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return this.generateTokenResponse(user);
  }

  async register(registerDto: RegisterDto): Promise<AuthTokenResponse> {
    const org = await this.orgsService.create({
      name: registerDto.orgName,
      slug: registerDto.orgSlug,
    });

    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: Role.ADMIN,
      org: (org._id as object).toString(),
    });

    return this.generateTokenResponse(user);
  }

  private generateTokenResponse(user: UserDocument): AuthTokenResponse {
    const payload = {
      sub: (user._id as object).toString(),
      email: user.email,
      role: user.role,
      org: user.org.toString(),
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        org: user.org,
      },
    };
  }
}
