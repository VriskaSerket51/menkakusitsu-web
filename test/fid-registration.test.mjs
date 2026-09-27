import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createFidRegistration } from '../src/utils/fid-registration.ts';
test('FID registration observes initial IDs and rotations, serializes unregister, and releases observers',async()=>{
 let registered,unregistered,disposed=0;
 const calls=[],events=[];
 const registration=createFidRegistration({
  onRegistered:callback=>{registered=callback;return()=>disposed++;},
  onUnregistered:callback=>{unregistered=callback;return()=>disposed++;},
  register:async()=>{calls.push('register');registered('first');},
  unregister:async()=>{calls.push('unregister');unregistered('second');},
 });
 registration.subscribe(event=>events.push(event));
 assert.equal(await registration.register(),'first');
 registered('second');
 await registration.unregister();
 assert.deepEqual(events.map(event=>[event.state,event.installationId]),[['registered','first'],['registered','second'],['unregistered','second']]);
 assert.deepEqual(calls,['register','unregister']);
 registration.dispose();assert.equal(disposed,2);
});
test('failed registration can retry and simultaneous register/unregister execute in order',async()=>{
 let registered,attempt=0;
 const calls=[];
 const registration=createFidRegistration({onRegistered:cb=>{registered=cb;return()=>{};},onUnregistered:()=>()=>{},
 register:async()=>{calls.push('register');if(++attempt===1)throw Error('offline');registered('fid');},
 unregister:async()=>{calls.push('unregister');}});
 await assert.rejects(registration.register(),/offline/);
 const next=registration.register();const stop=registration.unregister();
 assert.equal(await next,'fid');await stop;
 assert.deepEqual(calls,['register','register','unregister']);
});
