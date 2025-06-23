import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/core/services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { SimpleUser } from '../dto/simple-user.dto';
import { ManagerGuard } from 'src/auth/guards/manager.guard';
import { FilterQueryDto } from '../dto/filter-query.dto';
import { PaginatedResult } from '../dto/paginated-result.interface';

@Controller('api/users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(ManagerGuard)
  async create(@Body() createUserDto: CreateUserDto): Promise<SimpleUser> {
    const user = await this.userService.create(createUserDto);
    return SimpleUser.createFromUser(user);
  }

  @Get()
  @UseGuards(ManagerGuard)
  async findAll(
    @Query() query: FilterQueryDto,
  ): Promise<PaginatedResult<SimpleUser>> {
    return await this.userService.findAll(query);
  }

  @Get('/inactive')
  @UseGuards(ManagerGuard)
  async findInactive(
    @Query() query: FilterQueryDto,
  ): Promise<PaginatedResult<SimpleUser>> {
    return this.userService.findInactive(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SimpleUser> {
    const user = await this.userService.findOne(id);
    return SimpleUser.createFromUser(user);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<SimpleUser> {
    const user = await this.userService.update(id, updateUserDto);
    return SimpleUser.createFromUser(user);
  }

  @Delete(':id')
  @UseGuards(ManagerGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }
}
