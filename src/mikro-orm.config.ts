import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';
import { Task } from './tasks/task.entity';
import dotenv from 'dotenv';

dotenv.config();

export default {
  type: 'mysql',
  dbName: 'task',
  entities: [Task],
  clientUrl: process.env.DB_URL,
} as MikroOrmModuleSyncOptions;