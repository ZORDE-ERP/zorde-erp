import * as bcrypt from 'bcrypt';
import { globalEnvironment } from '../../config/env.validation';
export class BcryptService {
	public async hashPassword(password: string, saltRounds: number = globalEnvironment.SALT_ROUNDS_BCRYPT): Promise<string> {
		const hash = await bcrypt.hash(password, saltRounds);
		return hash;
	}

	public async comparePassword(password: string, hash: string): Promise<boolean> {
		const isMatch = await bcrypt.compare(password, hash);
		return isMatch;
	}
}
