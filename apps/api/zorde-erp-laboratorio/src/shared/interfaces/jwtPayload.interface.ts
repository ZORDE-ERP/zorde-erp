export interface JwtPayload {
	sub: number;
	role?: string;
	nome?: string;
	jti?: string;
	iat?: number;
	exp?: number;
}
