(function (root) {
  'use strict';
  const statuses = ['RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED', 'UNKNOWN'];
  const labels = {RUNNING:'진행중',SUCCESS:'성공',FAILED:'실패',CANCELLED:'취소',UNKNOWN:'미확인'};
  const envs = ['개발','테스트','운영','미확인'];
  const MAX_BYTES = 5 * 1024 * 1024;
  function text(value, name, limit = 500, required = false) {
    if (value == null && !required) return '';
    if (typeof value !== 'string' || value.length > limit || (required && !value.trim())) throw new Error(name + ' 값이 올바르지 않습니다.');
    return value;
  }
  function date(value, name, optional = false) {
    if (optional && value == null) return null;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) throw new Error(name + '에는 시간대가 포함된 ISO 시간을 입력하세요.');
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    if (day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate() || Number(value.slice(11,13)) > 23) throw new Error(name + ' 날짜가 올바르지 않습니다.');
    return value;
  }
  function validate(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input) || input.schemaVersion !== 1) throw new Error('schemaVersion: 1 스냅샷이 필요합니다.');
    const generatedAt = date(input.generatedAt, 'generatedAt');
    if (Date.parse(generatedAt) > Date.now() + 60000) throw new Error('수집 시간이 미래입니다. 서버 시간을 확인하세요.');
    if (!Array.isArray(input.deployments) || input.deployments.length > 5000) throw new Error('deployments는 최대 5,000개 배열이어야 합니다.');
    const ids = new Set();
    const deployments = input.deployments.map((item, i) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('잘못된 배포 항목: ' + i);
      const id = text(item.id, 'id', 200, true);
      if (ids.has(id)) throw new Error('중복된 배포 ID: ' + id);
      ids.add(id);
      if (item.status != null && typeof item.status !== 'string') throw new Error('status는 문자열이어야 합니다.');
      if (item.environment != null && typeof item.environment !== 'string') throw new Error('environment는 문자열이어야 합니다.');
      const startedAt = date(item.startedAt, 'startedAt', true);
      const finishedAt = date(item.finishedAt, 'finishedAt', true);
      if (startedAt && finishedAt && Date.parse(finishedAt) < Date.parse(startedAt)) throw new Error('종료 시간이 시작 시간보다 빠릅니다.');
      if (item.durationSeconds != null && (!Number.isFinite(item.durationSeconds) || item.durationSeconds < 0 || item.durationSeconds > 31536000)) throw new Error('durationSeconds 값이 올바르지 않습니다.');
      if (item.logs != null && (!Array.isArray(item.logs) || item.logs.length > 1000)) throw new Error('logs는 최대 1,000개 배열이어야 합니다.');
      return {id,system:text(item.system,'system',200,true),project:text(item.project,'project',200),executor:text(item.executor,'executor',200),environment:envs.includes(item.environment)?item.environment:'미확인',status:statuses.includes(item.status)?item.status:'UNKNOWN',startedAt,finishedAt,durationSeconds:item.durationSeconds??null,stage:text(item.stage,'stage',200),logs:(item.logs||[]).map(log=>text(log,'log',10000))};
    }).sort((a,b)=>(Date.parse(b.startedAt)||0)-(Date.parse(a.startedAt)||0));
    return {schemaVersion:1,generatedAt,source:text(input.source,'source',200),deployments};
  }
  function parse(raw) {
    if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > MAX_BYTES) throw new Error('JSON은 최대 5MB까지 읽을 수 있습니다.');
    let value;
    try { value = JSON.parse(raw); } catch { throw new Error('JSON 형식을 확인하세요.'); }
    return validate(value);
  }
  function select(items, environment, status, query) {
    query = String(query || '').trim().toLocaleLowerCase();
    return items.filter(d=>(environment==='ALL'||d.environment===environment)&&(status==='ALL'||d.status===status)&&(!query||[d.id,d.system,d.project,d.executor,d.stage,...d.logs].some(v=>v.toLocaleLowerCase().includes(query))));
  }
  function stats(items) {
    const counts = Object.fromEntries(statuses.map(s=>[s,items.filter(d=>d.status===s).length]));
    const done = counts.SUCCESS+counts.FAILED+counts.CANCELLED;
    return {...counts,total:items.length,successRate:done?Math.round(counts.SUCCESS/done*100):null};
  }
  function age(snapshot, now = Date.now()) { return Math.max(0, Math.floor((now-Date.parse(snapshot.generatedAt))/1000)); }
  function duration(item) {
    const n = item.durationSeconds ?? (item.startedAt && item.finishedAt ? (Date.parse(item.finishedAt)-Date.parse(item.startedAt))/1000 : null);
    return n==null?'미확인':Math.floor(n/60)+'분 '+Math.floor(n%60)+'초';
  }
  const api = {parse,validate,select,stats,age,duration,statuses,labels,MAX_BYTES};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BuildMonitor = api;
})(typeof window !== 'undefined' ? window : globalThis);
