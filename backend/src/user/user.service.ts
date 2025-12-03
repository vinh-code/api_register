import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async register(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException("Email and password are required");
    }

    const existed = await this.userModel.findOne({ email });
    if (existed) {
      throw new BadRequestException("Email already exists");
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      email,
      password: hash,
    });

    await newUser.save();

    return { message: "Registration successful" };
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException("Email and password are required");
    }

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return { 
      message: "Login successful",
      email: user.email,
      createdAt: user.createdAt
    };
  }
}
