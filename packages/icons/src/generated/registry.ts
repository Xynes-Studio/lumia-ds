
import type { RegisterIconFn } from '../types';
import IconChatBubble from './ChatBubble';
import IconCheck from './IconCheck';
import IconSparkle from './Sparkle';

export const registerGeneratedIcons = (register: RegisterIconFn) => {
  register('chat-bubble', IconChatBubble);
  register('icon-check', IconCheck);
  register('sparkle', IconSparkle);
};
