export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    role: string;
  };
}
