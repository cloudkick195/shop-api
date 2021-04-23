import { Middleware } from "../decorators/middleware.decorator";
import { HttpService } from "../services/http.service";
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { UserRepository } from "../repositories/user.repository";

const iG = 'Shop 160';
const aDress = 'http://tuananh.info';
const optionsPassportStrategy: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY,
  passReqToCallback: true,
  issuer: iG,
  audience: aDress
};

@Middleware()
export class AuthenticationMiddleware {
  passport: any;
  constructor(private userRepository: UserRepository) {
    this.passport = passport;
    this.initMiddleware();
  }

  public handle() {
    return this.passport.authenticate('jwt', { session: false });
  }

  private initMiddleware(): void {
    const callback = async (parentClosure: any, payload: any, next: Function) => {
      try {
        if (!payload || !payload.id) {
          return next(null, null);
        }
        const result: any = await this.userRepository.findUserById(payload.id);
        if (result && result.id) {
          return next(null, result);
        } else {
          return next(null, null);
        }
      } catch {
        return next(null, false);
      }
    };

    const jwtStrategy: JwtStrategy = new JwtStrategy(optionsPassportStrategy, callback);
    this.passport.use(jwtStrategy);
  }
}
