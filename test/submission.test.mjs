import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSubmissionGate } from '../src/utils/submission.ts';
test('submission gate blocks rapid duplicates and releases after success or failure', async () => {
 const submit=createSubmissionGate();
 let finish;
 let count=0;
 const first=submit(async()=>{count++; await new Promise(resolve=>{finish=resolve;});});
 await submit(()=>{count++;});
 assert.equal(count,1);
 finish(); await first;
 await assert.rejects(submit(()=>{throw Error('failed');}),/failed/);
 await submit(()=>{count++;});
 assert.equal(count,2);
});
