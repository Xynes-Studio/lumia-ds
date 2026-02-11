
import type { RegisterIconFn } from '../types';
import IconChatBubble from './ChatBubble';
import IconEye from './Eye';
import IconEyeOff from './EyeOff';
import IconCheck from './IconCheck';
import IconSparkle from './Sparkle';

export const registerGeneratedIcons = (register: RegisterIconFn) => {
  register('chat-bubble', IconChatBubble);
  register('eye', IconEye);
  register('eye-off', IconEyeOff);
  register('icon-check', IconCheck);
  register('sparkle', IconSparkle);
};
