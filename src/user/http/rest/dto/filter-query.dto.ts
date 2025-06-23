import { UserRole } from 'src/user/core/schemas/user.schema';

export class FilterQueryDto {
  role?: UserRole;
  sort?: 'name' | 'createdAt';
  order?: 'ASC' | 'DESC';
  page?: number = 1;
  limit?: number = 10;
}
