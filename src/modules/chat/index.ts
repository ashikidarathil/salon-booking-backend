import { container } from 'tsyringe';
import { TOKENS } from '../../common/di/tokens';
import { ChatRoomRepository } from './repository/chatRoom.repository';
import { MessageRepository } from './repository/message.repository';
import { ChatService } from './service/chat.service';
import { ChatController } from './controller/chat.controller';

container.register(TOKENS.ChatRoomRepository, { useClass: ChatRoomRepository });
container.register(TOKENS.MessageRepository, { useClass: MessageRepository });
container.register(TOKENS.ChatService, { useClass: ChatService });
container.register(ChatController, { useClass: ChatController });

export const resolveChatController = () => container.resolve(ChatController);
