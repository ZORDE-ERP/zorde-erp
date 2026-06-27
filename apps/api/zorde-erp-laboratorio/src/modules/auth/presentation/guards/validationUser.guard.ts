import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class IsUserValidGuard extends AuthGuard('IsUserValid') {}
