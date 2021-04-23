import { genSalt, hash } from 'bcryptjs';
import { Injectable } from "../decorators/injectable.decorator";

@Injectable()
export class HashingHelper {
  private saltRound: number = 10;

  async hashPassword(password: string): Promise<string> {
    const saltGenned: any = await genSalt(this.saltRound);
    return hash(password, saltGenned);
  }

  constructor() {}
}