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
    return await this.prisma.task.findMany();
  }

  findOne(id: number) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  async findByName(name: string) {
    return await this.prisma.task.findUnique({ where: { name } });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  // async changeStatus(id: number) {
  //   const task = await this.taskRepository.findOne(id);
  //   task.done = !task.done;
  //   await this.taskRepository.flush();
  //   return task;
  // }

  async remove(id: number) {
    return this.prisma.task.delete({ where: { id } });
  }
}
