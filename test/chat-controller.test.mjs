import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ChatController } from '../src/components/chat-ui-react/chat-controller.ts';

test('chat subscriptions are independently removed and repeated cleanup is harmless', () => {
  const controller = new ChatController({ delay: 0 });
  let messages = 0, actions = 0;
  const onMessages = () => messages++;
  const onAction = () => actions++;
  controller.addOnMessagesChanged(onMessages);
  controller.addOnActionChanged(onAction);
  controller.removeOnMessagesChanged(onMessages);
  controller.removeOnMessagesChanged(onMessages);
  controller.clearMessages();
  controller.cancelActionRequest();
  assert.equal(messages, 0);
  assert.equal(actions, 1);
  controller.removeOnActionChanged(onAction);
  controller.removeOnActionChanged(onAction);
  controller.cancelActionRequest();
  assert.equal(actions, 1);
});
