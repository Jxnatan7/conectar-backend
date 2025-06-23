import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../schemas/user.schema';
import { CreateUserDto } from 'src/user/http/rest/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/http/rest/dto/update-user.dto';
import { FilterQueryDto } from 'src/user/http/rest/dto/filter-query.dto';
import { PaginatedResult } from 'src/user/http/rest/dto/paginated-result.interface';
import { SimpleUser } from 'src/user/http/rest/dto/simple-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.findByEmail(createUserDto.email).then((user) => {
      if (user) {
        throw new ConflictException(
          `User with email ${createUserDto.email} already exists`,
        );
      }
    });
    const user = this.userRepo.create(createUserDto);
    return this.userRepo.save(user);
  }

  async findAll(query?: FilterQueryDto): Promise<PaginatedResult<SimpleUser>> {
    const qb: SelectQueryBuilder<User> =
      this.userRepo.createQueryBuilder('user');

    if (query?.role) {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    if (query?.sort) {
      const direction = query.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`user.${query.sort}`, direction);
    }

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const offset = (page - 1) * limit;

    const [data, total] = await qb.skip(offset).take(limit).getManyAndCount();
    const simpleUserData = data.map((user) => SimpleUser.createFromUser(user));
    return {
      data: simpleUserData,
      total,
      page,
      limit,
    };
  }

  async findInactive(
    query?: FilterQueryDto,
  ): Promise<PaginatedResult<SimpleUser>> {
    const qb: SelectQueryBuilder<User> =
      this.userRepo.createQueryBuilder('user');

    if (query?.role) {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    qb.andWhere('user.updatedAt < :cutoff', { cutoff });

    if (query?.sort) {
      const direction = query.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`user.${query.sort}`, direction);
    }

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const offset = (page - 1) * limit;

    const [data, total] = await qb.skip(offset).take(limit).getManyAndCount();
    const simpleData = data.map((u) => SimpleUser.createFromUser(u));
    return { data: simpleData, total, page, limit };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepo.update(id, updateUserDto);
    return this.findOne(id);
  }

  async updateToken(id: number, token: string): Promise<User> {
    await this.userRepo.update(id, { token });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
