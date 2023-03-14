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

  async findAll() {
    return this.prisma.task.findMany();
  }

  async findOne(id: number) {
    const task = this.prisma.task.findUnique({ where: { id } });
    return task;
  }

  async findByName(name: string) {
    const task = this.prisma.task.findUnique({ where: { name } });
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
    return task;
  }

  async remove(id: number) {
    return this.prisma.task.remove({ where: { id } });
  }
}
