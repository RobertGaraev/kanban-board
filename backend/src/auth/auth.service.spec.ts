import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  let mockAuthService: {
    login: jest.Mock;
    register: jest.Mock;
  };

  beforeEach(async () => {
    // 🔥 создаем новый мок перед каждым тестом
    mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks(); // 🔥 очищаем вызовы
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('должен вызвать login', async () => {
    mockAuthService.login.mockResolvedValue({
      access_token: 'token',
    });

    const result = await controller.login({
      email: 'test@test.com',
      password: '123456',
    });

    expect(result).toEqual({ access_token: 'token' });
    expect(mockAuthService.login).toHaveBeenCalledWith(
      'test@test.com',
      '123456',
    );
  });

  it('должен вызвать register', async () => {
    mockAuthService.register.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    });

    const result = await controller.register({
      email: 'test@test.com',
      password: '123456',
    });

    expect(result).toEqual({
      id: '1',
      email: 'test@test.com',
    });

    expect(mockAuthService.register).toHaveBeenCalledWith(
      'test@test.com',
      '123456',
    );
  });
});
