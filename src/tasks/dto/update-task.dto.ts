import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { Task } from '../../stubs/task/v1alpha/task';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    
    constructor(task: Task) {
        super(task);
        this.done = task.done;
    }
    name: string;
    dueDate: Date;
    done: boolean;
}
