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

test('Idbot text input stays available across responses without adding duplicate messages', async () => {
  const controller = new ChatController({ delay: 0, showDateTime: true });
  const replies = [];
  controller.setMessages([{ type: 'text', content: 'welcome', self: false }]);
  await controller.setActionRequest({ type: 'text', always: true, addMessage: false }, response => replies.push(response.value));
  const request = controller.getActionRequest();
  await controller.setActionResponse(request, { type: 'text', value: 'first' });
  await controller.setActionResponse(request, { type: 'text', value: 'second' });
  assert.deepEqual(replies, ['first', 'second']);
  assert.equal(controller.getMessages().length, 1);
  assert.equal(controller.getActionRequest(), request);
  await controller.addMessage({ type: 'text', content: 'answer', self: false });
  assert.equal(controller.getMessages()[1].content, 'answer');
  assert.ok(controller.getMessages()[1].createdAt instanceof Date);
  controller.cancelActionRequest();
  await assert.rejects(controller.setActionResponse(request, { type: 'text', value: 'late' }), /Invalid action/);
});