import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openDialog, closeDialog, closeAll, removeClosedDialog, useDialogContainerStore } from '../src/components/popup/hooks.ts';

test('closing retains content for animation, then releases content and callbacks', () => {
  useDialogContainerStore.setState({ dialogs: [] });
  const callback = () => {};
  const id = openDialog('title', 'private content', callback);
  closeDialog(id);
  const closing = useDialogContainerStore.getState().dialogs[0];
  assert.equal(closing.isOpened, false); assert.equal(closing.onYes, callback);
  assert.equal(closing.content, 'private content');
  removeClosedDialog(id);
  assert.deepEqual(useDialogContainerStore.getState().dialogs, []);
});

test('a delayed exit cannot remove a newly opened dialog', () => {
  const first = openDialog('first', 'first'); closeDialog(first);
  const second = openDialog('second', 'second');
  assert.notEqual(first, second);
  removeClosedDialog(second); // Defensive: an open dialog must survive a stale callback.
  removeClosedDialog(first); removeClosedDialog(first);
  assert.deepEqual(useDialogContainerStore.getState().dialogs.map(d => d.id), [second]);
  closeAll(); removeClosedDialog(second);
  assert.deepEqual(useDialogContainerStore.getState().dialogs, []);
});

test('closing an empty or already closed store does not notify subscribers', () => {
  let updates = 0;
  const off = useDialogContainerStore.subscribe(() => updates++);
  closeAll(); closeDialog(-1); removeClosedDialog(-1);
  assert.equal(updates, 0);
  const id = openDialog('title', 'content'); closeAll();
  const before = updates; closeAll(); closeDialog(id);
  assert.equal(updates, before);
  removeClosedDialog(id); off();
});
