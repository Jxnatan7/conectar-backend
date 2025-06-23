import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export enum UserRole {
  MANAGER = 'MANAGER',
  USER = 'USER',
}

const SALT_ROUNDS = 10;

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true })
  token: string;

  @BeforeInsert()
  @BeforeUpdate()
  async beforeSave(): Promise<void> {
    await this.hashPassword();
    this.ensureToken();
  }

  private async hashPassword(): Promise<void> {
    const plain = this.password;
    if (this.passwordChanged(plain)) {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      this.password = await bcrypt.hash(plain, salt);
    }
  }

  private passwordChanged(plain: string): boolean {
    return plain != null && !plain.startsWith('$2b$');
  }

  private ensureToken(): void {
    if (this.token) {
      return;
    }

    const expiresIn = '7d';
    const payload = { sub: this.id, role: this.role };

    this.token = this.signJwt(payload, expiresIn);
  }

  private signJwt(payload: object, expiresIn: string): string {
    const secret = this.getJwtSecret();
    return jwt.sign(payload, secret, { expiresIn });
  }

  private getJwtSecret(): string {
    const key = process.env.JWT_SECRET_KEY;

    if (!key) {
      throw new Error('Missing JWT_SECRET_KEY');
    }

    return key;
  }
}
