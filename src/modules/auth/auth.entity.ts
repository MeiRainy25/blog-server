import { Exclude } from 'class-transformer';

export class UserEntity {
  id: string;
  email: string;
  nickname: string;
  roles: string[];

  @Exclude()
  password: string;

  @Exclude()
  refreshToken: string | null;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
