import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createPageTracker, pageDetails, measureAction, failureKind } from '../src/utils/telemetry.ts';
test('page events have absolute sanitized URLs, meaningful titles and one event per transition', () => {
 const track=createPageTracker();
 assert.equal(track('https://example.com','/').page_title,'홈');
 assert.equal(track('https://example.com','/'),null);
 const next=track('https://example.com','/bbs/private-user/123/view');
 assert.equal(next.page_location,'https://example.com/bbs/board/post/view');
 assert.equal(next.page_referrer,'https://example.com/');
 assert.equal(track('https://example.com','/').page_referrer,next.page_location);
 assert.equal(pageDetails('https://example.com','/secret-email').page_path,'/not-found');
});
test('actions preserve results and failures even if telemetry fails; cancellation is not a failure event', async () => {
 const events=[];
 assert.equal(await measureAction('login',async()=>42,event=>events.push(event)),42);
 const error={response:{status:409},message:'private content',config:{data:'password'}};
 await assert.rejects(measureAction('specialroom_apply',async()=>{throw error;},e=>events.push(e)),e=>e===error);
 assert.equal(events[1].failure_kind,'conflict');
 assert.equal(JSON.stringify(events).includes('private'),false);
 await assert.rejects(measureAction('login',async()=>{throw {code:'ERR_CANCELED'};},e=>events.push(e)));
 assert.equal(events.length,2);
 assert.equal(await measureAction('login',async()=>42,()=>{throw Error('sink failed');}),42);
 assert.equal(failureKind({code:'messaging/permission-blocked'}),'permission_denied');
 assert.equal(failureKind({code:'ERR_NETWORK'}),'network');
});
