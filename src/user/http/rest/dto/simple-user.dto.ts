import { User, UserRole } from 'src/user/core/schemas/user.schema';

export class SimpleUser {
  private readonly id: string;
  private readonly name: string;
  private readonly email: string;
  private readonly token: string;
  private readonly role: UserRole;

  private constructor(
    id: string,
    name: string,
    email: string,
    token: string,
    role: UserRole,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.token = token;
    this.role = role;
  }

  public static createFromUser(user: User): SimpleUser {
    if (!user.id || !user.name || !user.email) {
      throw new Error('Dados do usuário inválidos para criação de SimpleUser.');
    }

    return new SimpleUser(
      String(user.id),
      user.name,
      user.email,
      user.token,
      user.role,
    );
  }
}
