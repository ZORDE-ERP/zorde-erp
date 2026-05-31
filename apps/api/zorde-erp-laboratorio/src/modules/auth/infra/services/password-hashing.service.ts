import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordHashingService {
  private readonly config = {
    type: argon2.argon2id,
    timeCost: 3,
    memoryCost: 65536, // 64MB in KB
    parallelism: 4,
    hashLength: 32,
  };

  async hash(password: string): Promise<string> {
    return argon2.hash(password, this.config);
  }

  async comparar(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }
}
