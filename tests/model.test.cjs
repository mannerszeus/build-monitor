const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../public/dashboard-model.js');
const record=(id='1',extra={})=>({id,system:'홈페이지',environment:'개발',status:'SUCCESS',startedAt:'2026-01-01T00:00:00Z',...extra});
const snapshot=items=>({schemaVersion:1,generatedAt:'2026-01-02T00:00:00Z',deployments:items});
test('invalid JSON, version, timestamp, size and duplicate IDs are rejected',()=>{
  assert.throws(()=>M.parse('<html>login</html>'));
  assert.throws(()=>M.validate({...snapshot([]),schemaVersion:2}));
  assert.throws(()=>M.validate({...snapshot([]),generatedAt:'2026/01/02'}));
  assert.throws(()=>M.validate({...snapshot([]),generatedAt:'2026-02-30T00:00:00Z'}));
  assert.throws(()=>M.validate({...snapshot([]),generatedAt:new Date(Date.now()+120000).toISOString()}));
  assert.throws(()=>M.parse('x'.repeat(M.MAX_BYTES+1)));
  assert.throws(()=>M.validate(snapshot([record(),record()])));
  assert.throws(()=>M.validate(snapshot([record('1',{finishedAt:'2025-01-01T00:00:00Z'})])));
  assert.throws(()=>M.validate(snapshot([record('1',{logs:[{}]})])));
  assert.throws(()=>M.validate(snapshot([record('1',{durationSeconds:-1})])));
});
test('missing or unmapped data stays unknown without fabricated logs or stages',()=>{
  const d=M.validate(snapshot([{id:'1',system:'홈페이지',status:'unexpected',environment:'some env'}])).deployments[0];
  assert.equal(d.status,'UNKNOWN');assert.equal(d.environment,'미확인');assert.deepEqual(d.logs,[]);assert.equal(d.stage,'');assert.equal(M.duration(d),'미확인');
});
test('sort, environment/status/text filtering and metrics use normalized records',()=>{
  const ds=M.validate(snapshot([record('1'),record('2',{startedAt:'2026-01-01T01:00:00Z',status:'FAILED',environment:'테스트',logs:['compile error']}),record('3',{status:'RUNNING'}),record('4',{status:'UNKNOWN'})])).deployments;
  assert.equal(ds[0].id,'2');assert.equal(M.select(ds,'테스트','FAILED','ERROR').length,1);
  assert.equal(M.select(ds,'개발','SUCCESS','').length,1);
  assert.equal(M.stats(ds).successRate,50);assert.equal(M.stats(ds).UNKNOWN,1);assert.equal(M.stats([]).successRate,null);
});
test('duration and age use source timestamps, empty snapshots are valid',()=>{
  const s=M.validate(snapshot([]));assert.equal(s.deployments.length,0);assert.equal(M.age(s,Date.parse(s.generatedAt)+150000),150);
  assert.equal(M.duration(record('1',{finishedAt:'2026-01-01T00:02:05Z'})),'2분 5초');
});
