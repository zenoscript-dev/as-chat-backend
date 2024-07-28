import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          if (!request || !request.headers || !request.headers.authorization) {
            return null;
          }
          const token = request.headers.authorization.split(' ')[1];
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      secretOrPrivateKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: any) {
    return { userId: payload.sub };
  }
}
