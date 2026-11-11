import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizePublication } from '../src/lib/sanitizePublication.js';
import { limitedBody } from '../src/lib/requestLimits.js';

test('editorial formatting survives the publication allowlist', () => {
  const html = sanitizePublication('<p style="text-align: center"><strong>ACS</strong><img class="img-center" src="/logo.png"></p>');
  assert.match(html, /<strong>ACS/);
  assert.match(html, /text-align:center/);
  assert.match(html, /img-center/);
  assert.equal(sanitizePublication('<form><input></form>'), '');
});

test('the size limit counts streamed bytes without a Content-Length header', async () => {
  const req = new Request('http://localhost/', {method:'POST', body: '12345'});
  const result = await limitedBody(req, {scope:'size-test', bytes:4, perMinute:10});
  assert.equal(result.status, 413);
});

test('valid JSON is accepted and the shared quota bounds repeated requests', async () => {
  const read = () => limitedBody(new Request('http://localhost/', {method:'POST', body:'{"ok":true}'}),
    {scope:'quota-test', bytes:20, perMinute:1});
  for (let i = 0; i < 4; i++) assert.deepEqual(await read(), {ok:true});
  assert.equal((await read()).status, 429);
});
