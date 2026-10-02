import test from 'node:test';
import assert from 'node:assert/strict';
import {captionPages} from './captions.mjs';

test('minimum caption time tolerates binary rounding at nonzero timestamps',()=>{
 const [p]=captionPages([{word:'sea',start:12.08,end:12.297},{word:'justa.',start:12.297,end:12.78}]);
 assert.ok(Math.abs(p.displayEnd-p.start-.7)<1e-12);
 assert.equal(p.tooShort,false);
});
test('a genuinely short page before the next phrase still requires review',()=>{
 const [p]=captionPages([{word:'Sí.',start:12.08,end:12.2},{word:'Continúa.',start:12.4,end:13.2}]);
 assert.equal(p.tooShort,true);
});
