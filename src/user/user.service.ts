import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserLoginDto } from './dto/user-login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private logger: Logger,
    private jwtService: JwtService,
  ) {}

  private readonly saltRounds = 10; // Adjust the salt rounds as needed

  async createUser(userDetails: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await this.hashPassword(userDetails.password);
      const user = this.userRepository.create({
        ...userDetails,
        password: hashedPassword,
      });
      return await this.userRepository.save(user);
    } catch (error) {
      throw new Error(error);
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
  async login(loginUserDto: UserLoginDto) {
    try {
      // Find the user by email
      const user = await this.userRepository.findOne({
        where: { email: loginUserDto.username },
      });

      // If user not found, throw an exception
      if (!user) {
        throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
      }

      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );

      // If the password is invalid, throw an exception
      if (!isPasswordValid) {
        throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
      }

      const token = await this.generateToken(user);

      // If everything is fine, return a success message or a JWT token
      return {
        message: 'Logged in successfully',
        token,
        id:
          user.id === process.env.ASHOK
            ? process.env.RECIEVER
            : process.env.ASHOK,
      };
    } catch (error) {
      // Handle any unexpected errors
      throw new HttpException(
        error.message,
        error.status ? error.status : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async generateToken(user: User) {
    const options = {
      expiresIn: '86400' + 's',
    };
    return await this.generateJwtWithOptions(user.id, options);
  }

  async generateJwtWithOptions(userId: string, options: any): Promise<string> {
    try {
      const signedJwt = await this.jwtService.signAsync(
        { userId: userId },
        { ...options, secret: process.env.JWT_SECRET },
      );
      return signedJwt;
    } catch (error) {
      throw new HttpException(
        'failed to generate token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
