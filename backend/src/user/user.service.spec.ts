import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from './user.service';
import { User } from './user.schema';

describe('UserService', () => {
  let service: UserService;
  let createdInstance: any;

  const mockUserModel = jest.fn().mockImplementation((data) => {
    createdInstance = { ...data, save: jest.fn().mockResolvedValue({ ...data }) };
    return createdInstance;
  });
  mockUserModel.findOne = jest.fn();

  beforeEach(async () => {
    createdInstance = undefined;
    mockUserModel.findOne.mockReset();
    (mockUserModel as jest.Mock).mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects missing email or password', async () => {
    await expect(service.register('', 'pass')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.register('test@example.com', '')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects duplicate email', async () => {
    mockUserModel.findOne.mockResolvedValueOnce({ _id: '123' });

    await expect(service.register('test@example.com', 'pass')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('hashes the password and saves a new user', async () => {
    mockUserModel.findOne.mockResolvedValueOnce(null);

    await expect(service.register('test@example.com', 'pass123')).resolves.toEqual({
      message: 'Registration successful',
    });

    expect(mockUserModel).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: expect.any(String),
    });
    expect(createdInstance.save).toHaveBeenCalled();
    expect(createdInstance.password).not.toBe('pass123');
    expect(await bcrypt.compare('pass123', createdInstance.password)).toBe(true);
  });

  it('allows login with correct credentials', async () => {
    const hashed = await bcrypt.hash('pass123', 10);
    mockUserModel.findOne.mockResolvedValueOnce({ email: 'test@example.com', password: hashed });

    await expect(service.login('test@example.com', 'pass123')).resolves.toEqual({
      message: 'Login successful',
    });
  });

  it('rejects login with missing credentials', async () => {
    await expect(service.login('', 'pass123')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.login('test@example.com', '')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects login with wrong email or password', async () => {
    mockUserModel.findOne.mockResolvedValueOnce(null);
    await expect(service.login('missing@example.com', 'pass123')).rejects.toBeInstanceOf(UnauthorizedException);

    const hashed = await bcrypt.hash('pass123', 10);
    mockUserModel.findOne.mockResolvedValueOnce({ email: 'test@example.com', password: hashed });
    await expect(service.login('test@example.com', 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
