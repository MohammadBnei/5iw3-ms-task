import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Task {
  @PrimaryKey()
  id: number;

  @Property({
    unique: true,
  })
  name: string;

  @Property()
  dueDate: Date = new Date();

  @Property()
  done: boolean = false;
}