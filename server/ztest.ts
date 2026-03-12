import { UpdateTaskPayloadSchema } from './src/schemas/task.schema';
console.log(UpdateTaskPayloadSchema.parse({ status: 'inprogress' }));
