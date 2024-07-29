import { IsEmail, IsString } from 'class-validator';
import { Base } from 'src/core/models/base.model';
import { PrimaryGeneratedColumn, Column, Entity, Index } from 'typeorm';

@Entity('users')
export class User extends Base {
  @PrimaryGeneratedColumn('uuid')
  @Index('IDX_USER_ID')
  id: string;

  @Column({ nullable: false })
  @IsString()
  username: string;

  @Index('IDX_USER_EMAIL')
  @Column({ nullable: false, unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: false })
  @IsString()
  password: string;

  @Column({ nullable: true })
  @IsString()
  chatid: string;
}
