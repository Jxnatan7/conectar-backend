import { UserRole } from 'src/user/core/schemas/user.schema';

export class UpdateUserDto {
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  readonly token: string;
}
