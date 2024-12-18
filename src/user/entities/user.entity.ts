import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum Role {
  admin = 'admin',
  hr = 'hr',
  employee = 'employee',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  username: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;
}
