import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([User, Repository])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
