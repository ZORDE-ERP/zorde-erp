export interface JwtPayload {
	sub: number;
	username?: string;
	role?: string;
	nome?: string;
	email?: string;
	jti?: string;
	iat?: number;
	exp?: number;
}
