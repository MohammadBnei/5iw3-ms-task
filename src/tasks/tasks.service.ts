import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    const task = await this.prisma.task.create({ data: createTaskDto });
    return task;
  }

  async findAll(page: number, limit: string) {
    const tasks = await this.prisma.task.findMany({
      skip: (page - 1) * Number(limit),
      take: Number(limit),
    });
    return tasks;
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    return task;
  }

  async update(name: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.task.update({
      where: { name },
      data: updateTaskDto,
    });
    return task;
  }

  async remove(name: string) {
    const task = await this.prisma.task.delete({ where: { name } });
    return task;
  }

  async removeAll() {
    const tasks = await this.prisma.task.deleteMany();
    return tasks;
  }
}
