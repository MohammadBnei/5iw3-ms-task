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

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Property()
  done: boolean = false;
  
}
