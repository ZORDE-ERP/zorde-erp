import { User } from '../../../../../shared/providers/UserAuth.service';

export interface LoginModel {
	email: string;
	senha: string;
	remember: boolean;
}

export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	usuario: User;
}
