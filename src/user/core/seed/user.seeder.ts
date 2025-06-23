import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(User);
    const hashPassword = (pass: string) => {
      const salt = bcrypt.genSaltSync(SALT_ROUNDS);
      return bcrypt.hashSync(pass, salt);
    };
    await repository.insert([
      {
        name: 'Gerente',
        email: 'gerente@email.com',
        password: hashPassword('123456'),
        role: UserRole.MANAGER,
      },
      {
        name: 'Cliente',
        email: 'cliente@email.com',
        password: hashPassword('123456'),
        role: UserRole.USER,
      },
    ]);
  }
}
