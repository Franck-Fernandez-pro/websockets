import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  messages: Message[] = [{ name: 'John', text: 'Hello World' }];

  create(createMessageDto: CreateMessageDto): Message {
    const message: Message = { ...createMessageDto };
    this.messages.push(createMessageDto); // TODO: improve it

    return message;
  }

  findAll() {
    return this.messages;
  }
}
