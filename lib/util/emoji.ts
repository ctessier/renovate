import emoji from 'node-emoji';
import { RenovateConfig } from '../config';

let unicodeEmoji = false;

export function setEmojiConfig(_config: RenovateConfig): void {
  unicodeEmoji = _config.unicodeEmoji;
}

export function emojify(text: string): string {
  return unicodeEmoji ? emoji.emojify(text) : text;
}

export function unemojify(text: string): string {
  return unicodeEmoji ? text : emoji.unemojify(text);
}
