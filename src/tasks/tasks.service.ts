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

  findAll() {
    return this.prisma.task.findMany();
  }

  findOne(id: number) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  findByName(name: string) {
    return this.prisma.task.findUnique({ where: { name } });
  }

  update(updateTaskDto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id: updateTaskDto.id },
      data: updateTaskDto,
    });
  }

  deleteByName(name: string) {
    return this.prisma.task.delete({ where: { name } });
  }

  async listTasks(pageSize: number, currentPage: number) {
    const skip = pageSize * (currentPage - 1);
    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        take: pageSize,
        skip: skip,
      }),
      this.prisma.task.count(),
    ]);
    const totalPages = Math.ceil(total / pageSize);
    const nextPageToken =
      currentPage < totalPages ? String(currentPage + 1) : '';
    const listTasksResponse = {
      task: tasks,
      nextPageToken: nextPageToken,
    };
    return listTasksResponse;
  }

  // async update(id: number, updateTaskDto: UpdateTaskDto) {
  //   let task = await this.taskRepository.findOne(id);
  //   task = await this.taskRepository.assign(task, updateTaskDto);
  //   await this.taskRepository.flush();
  //   return task;
  // }

  // async changeStatus(id: number) {
  //   const task = await this.taskRepository.findOne(id);
  //   task.done = !task.done;
  //   await this.taskRepository.flush();
  //   return task;
  // }

  // async remove(id: number) {
  //   const task = await this.taskRepository.findOne(id);
  //   return this.taskRepository.removeAndFlush(task);
  // }
}
