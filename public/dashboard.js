'use strict';
const M = window.BuildMonitor;
const $ = id => document.getElementById(id);
let snapshot = null, view = 'recent', mode = 'none', polling = false, timer = null, generation = 0, loading = false, lastError = '';
const titles = {recent:'최근 배포',running:'진행 중 배포',systems:'시스템별 현황',stats:'통계·분석',logs:'로그 조회'};
function el(tag, text, className) { const node = document.createElement(tag); if (text != null) node.textContent = text; if (className) node.className = className; return node; }
function badge(item) { return el('em', M.labels[item.status], 'badge '+item.status.toLowerCase()); }
function when(value) { return value ? new Date(value).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',hour12:false}) : '미확인'; }
function setError(message) { lastError = message; $('error').textContent = message; $('error').hidden = !message; renderFreshness(); }
function stopPolling() { polling = false; generation++; clearTimeout(timer); timer = null; if(mode==='snapshot')mode='file'; $('connect').textContent = '사내 스냅샷 연결'; }
function useSnapshot(value, sourceMode) { snapshot = value; mode = value.source === 'demo' ? 'demo' : sourceMode; setError(''); closeModal(); render(); }
function renderFreshness() {
  if (!snapshot) { $('source').textContent = '데이터 없음 · JSON 파일 또는 예제를 열어주세요'; return; }
  const seconds = M.age(snapshot);
  const source = mode === 'demo' ? '예제 데이터 · 실제 빌드포지 미연결' : mode === 'file' ? '파일 데이터 · 자동 갱신 없음' : '사내 스냅샷 · 30초마다 조회';
  $('source').textContent = source+' | 수집 '+when(snapshot.generatedAt)+(mode!=='demo'&&seconds>=120?' | 지연 '+seconds+'초':'')+(lastError?' | 조회 실패 · 이전 데이터 유지':'');
  $('source').classList.toggle('stale', !!lastError || (mode!=='demo'&&seconds>=120));
}
function filtered() { return snapshot ? M.select(snapshot.deployments,$('environment').value,$('status').value,$('search').value) : []; }
function render() {
  renderFreshness(); $('viewTitle').textContent = titles[view];
  const data = filtered(), s = M.stats(data);
  $('total').textContent=s.total; $('running').textContent=s.RUNNING; $('failed').textContent=s.FAILED; $('rate').textContent=s.successRate==null?'—':s.successRate+'%';
  $('summary').textContent='현재 스냅샷·필터 기준 '+data.length+'건 (전체 운영 이력 통계가 아닙니다)';
  const container=$('results'); container.replaceChildren();
  if (!snapshot || !data.length) { container.append(el('p',snapshot?'조건에 맞는 배포가 없습니다.':'JSON 파일을 열거나 예제 데이터를 확인하세요.','empty')); return; }
  if (view === 'stats') {
    const list=el('div',null,'statistics');
    for(const status of M.statuses) { const line=el('div',null,'stat-line'); line.append(el('span',M.labels[status]),el('strong',s[status]+'건'));const bar=el('progress');bar.max=s.total;bar.value=s[status];bar.setAttribute('aria-label',M.labels[status]+' '+s[status]+'건');line.append(bar);list.append(line); }
    list.append(el('p','성공률 = 성공 / (성공 + 실패 + 취소). 진행중·미확인은 제외합니다.'));container.append(list);return;
  }
  const table=el('table'),head=el('thead'),tr=el('tr');
  ['시스템','환경','프로젝트 / 실행 ID','실행자','시작시간 (KST)','소요','단계','상태'].forEach(t=>tr.append(el('th',t)));head.append(tr);table.append(head);
  const tbody=el('tbody');let selected=data;
  if(view==='running')selected=data.filter(d=>d.status==='RUNNING');
  if(view==='systems'){const seen=new Set();selected=data.filter(d=>{const key=JSON.stringify([d.system,d.environment]);if(seen.has(key))return false;seen.add(key);return true;});}
  if(view==='recent')selected=selected.slice(0,20);
  // Logs view includes jobs without logs and explicitly marks absence in the detail dialog.
  selected.forEach(item=>{
    const row=el('tr');const first=el('td');const button=el('button',item.system,'row-button');button.addEventListener('click',()=>openModal(item));first.append(button);row.append(first);
    const env=el('td');env.append(el('em',item.environment,'env '+item.environment));row.append(env);
    const project=el('td');project.append(el('b',item.project||'미확인'),el('small',item.id));row.append(project);
    [item.executor||'미확인',when(item.startedAt),M.duration(item),item.stage||'미확인'].forEach(value=>row.append(el('td',value)));
    const status=el('td');status.append(badge(item));row.append(status);tbody.append(row);
  });
  table.append(tbody);container.append(table);
  if(!selected.length)container.append(el('p','진행 중 배포가 없습니다.','empty'));
  $('summary').textContent+=' · 표시 '+selected.length+'건'+(view==='systems'?' · 시스템/환경별 최신 실행 기준':'');
}
let returnFocus=null;
function openModal(item) {
  returnFocus=document.activeElement; $('mSystem').textContent=item.system; $('mId').textContent=item.id; $('mBuild').textContent=item.project||'미확인';$('mExecutor').textContent=item.executor||'미확인';$('mServer').textContent=item.environment;
  $('mStatus').textContent=M.labels[item.status];$('mStatus').className='badge '+item.status.toLowerCase();$('mStages').textContent='현재 단계: '+(item.stage||'미확인')+' · 세부 단계별 결과는 아직 수집하지 않았습니다.';
  $('mLog').textContent=item.logs.length?item.logs.join('\n'):'이 실행의 로그가 제공되지 않았습니다.';
  $('modal').showModal();$('close').focus();
}
function closeModal(){if($('modal').open){$('modal').close();returnFocus?.focus();}}
async function readResponse(response){
  if(!response.ok)throw new Error('스냅샷 조회 실패 (HTTP '+response.status+').');
  const type=response.headers.get('content-type')||'';
  if(!type.toLowerCase().includes('application/json'))throw new Error('JSON 응답이 아닙니다. 로그인 페이지 또는 경로를 확인하세요.');
  if(Number(response.headers.get('content-length'))>M.MAX_BYTES)throw new Error('스냅샷이 5MB를 초과합니다.');
  const reader=response.body.getReader();const chunks=[];let length=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>M.MAX_BYTES){await reader.cancel();throw new Error('스냅샷이 5MB를 초과합니다.');}chunks.push(value);}}finally{reader.releaseLock();}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  return M.parse(new TextDecoder().decode(bytes));
}
async function refresh(token){
  if(!polling || token!==generation)return;
  loading=true;const abort=new AbortController();const timeout=setTimeout(()=>abort.abort(),10000);
  try{const response=await fetch('/snapshot.json',{cache:'no-store',credentials:'same-origin',redirect:'error',signal:abort.signal});const value=await readResponse(response);if(polling&&token===generation)useSnapshot(value,'snapshot');}
  catch(error){if(polling&&token===generation)setError(error.name==='AbortError'?'스냅샷 응답 대기가 10초를 초과했습니다.':error.message);}
  finally{clearTimeout(timeout);loading=false;if(polling&&token===generation)timer=setTimeout(()=>refresh(token),30000);}
}
$('connect').addEventListener('click',()=>{
  if(polling){stopPolling();if(mode==='snapshot')mode='file';render();return;}
  if(location.protocol==='file:'){setError('자동 연결은 사내 웹서버에서 사용하세요. 지금은 JSON 파일을 열 수 있습니다.');return;}
  if(loading)return;
  polling=true;generation++;$('connect').textContent='자동 조회 중지';refresh(generation);
});
$('import').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;stopPolling();const token=generation;
  try{if(file.size>M.MAX_BYTES)throw new Error('JSON은 최대 5MB까지 읽을 수 있습니다.');const value=M.parse(await file.text());if(token===generation)useSnapshot(value,'file');}
  catch(error){if(token===generation)setError(error.message);}finally{event.target.value='';}
});
$('demo').addEventListener('click',()=>{stopPolling();const base=new Date(Date.now()-240000).toISOString();useSnapshot(M.validate({schemaVersion:1,source:'demo',generatedAt:new Date().toISOString(),deployments:[{id:'DEMO-001',system:'예제 챗봇',environment:'테스트',project:'CHATBOT-TEST',executor:'예제 담당자',startedAt:base,status:'RUNNING',stage:'Deploy'},{id:'DEMO-002',system:'예제 홈페이지',environment:'개발',project:'WEB-DEV',startedAt:base,finishedAt:new Date(Date.now()-60000).toISOString(),status:'FAILED',stage:'Build',logs:['[예제] 컴파일 오류: 확인용 샘플입니다.']},{id:'DEMO-003',system:'예제 홈페이지',environment:'테스트',project:'WEB-TEST',startedAt:base,status:'SUCCESS',durationSeconds:120},{id:'DEMO-004',system:'예제 배치',environment:'미확인',status:'UNKNOWN'}]}),'demo');});
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.view;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b===button));render();}));
['environment','status'].forEach(id=>$(id).addEventListener('change',render));$('search').addEventListener('input',render);
$('close').addEventListener('click',closeModal);$('modal').addEventListener('click',event=>{if(event.target===$('modal'))closeModal();});
setInterval(renderFreshness,1000);window.addEventListener('pagehide',stopPolling);render();
