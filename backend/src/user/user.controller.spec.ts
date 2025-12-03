import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  const mockUserService = {
    register: jest.fn(),
    login: jest.fn(),
  } satisfies Record<keyof UserService, jest.Mock>;

  beforeEach(async () => {
    mockUserService.register.mockReset();
    mockUserService.login.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates registration to the service', async () => {
    mockUserService.register.mockResolvedValue({ message: 'ok' });
    const payload = { email: 'test@example.com', password: 'secret' };

    await expect(controller.register(payload)).resolves.toEqual({ message: 'ok' });
    expect(mockUserService.register).toHaveBeenCalledWith(payload.email, payload.password);
  });

  it('delegates login to the service', async () => {
    mockUserService.login.mockResolvedValue({ message: 'logged in' });
    const payload = { email: 'test@example.com', password: 'secret' };

    await expect(controller.login(payload)).resolves.toEqual({ message: 'logged in' });
    expect(mockUserService.login).toHaveBeenCalledWith(payload.email, payload.password);
  });
});
