import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isChatSubmit, isCompositionEnter } from '../src/utils/form-keyboard.ts';
test('chat submit respects newline and Korean composition, including legacy IME key codes', () => {
 const enter={key:'Enter',shiftKey:false,isComposing:false,keyCode:13};
 assert.equal(isChatSubmit(enter),true);
 assert.equal(isChatSubmit({...enter,shiftKey:true}),false);
 for(const event of [{...enter,isComposing:true},{...enter,keyCode:229}]) {
  assert.equal(isChatSubmit(event),false); assert.equal(isCompositionEnter(event),true);
 }
 assert.equal(isChatSubmit({...enter,key:'Escape'}),false);
});
