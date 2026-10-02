const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const {spawn}=require('node:child_process');
const base=process.env.BUILD_MONITOR_TEST_URL||'http://127.0.0.1:3101';
const fixture=()=>({schemaVersion:1,source:'fixture',generatedAt:new Date().toISOString(),deployments:Array.from({length:22},(_,i)=>({id:String(i),system:i===0?'<img src=x onerror="window.injected=true">':'시스템 '+i,environment:i%2?'개발':'테스트',project:'PROJECT',status:i===0?'FAILED':i===1?'RUNNING':i===2?'UNMAPPED':'SUCCESS',startedAt:new Date(Date.now()-i*60000).toISOString(),logs:i===0?['<script>window.injected=true</script>','compile error']:[]}))});
async function upload(page,value){await page.locator('#import').setInputFiles({name:'test.json',mimeType:'application/json',buffer:Buffer.from(typeof value==='string'?value:JSON.stringify(value))});}
(async()=>{
  const server=process.env.BUILD_MONITOR_TEST_URL?null:spawn(process.execPath,[require.resolve('next/dist/bin/next'),'start','--hostname','127.0.0.1','--port','3101'],{stdio:'ignore'});
  let browser;
  try{
    let ready=false;for(let i=0;i<40;i++){try{const r=await fetch(base,{signal:AbortSignal.timeout(1000)});if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}assert.equal(ready,true,'production server is reachable');
    browser=await chromium.launch({headless:true,executablePath:process.env.BUILD_MONITOR_CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/');await page.locator('iframe').waitFor();assert.equal(await page.frameLocator('iframe').locator('h1').textContent(),'배포 모니터링');
    await page.goto(base+'/dashboard.html');assert.equal(await page.locator('#total').textContent(),'0');
    await page.locator('#demo').click();assert.match(await page.locator('#source').textContent(),/예제/);assert.equal(await page.locator('#total').textContent(),'4');
    await upload(page,fixture());await page.waitForFunction(()=>document.querySelector('#total').textContent==='22');
    assert.equal(await page.locator('#results tbody tr').count(),20);assert.equal(await page.locator('#results img').count(),0);assert.equal(await page.evaluate(()=>window.injected),undefined);
    await page.locator('.row-button').first().click();assert.equal(await page.locator('#modal').evaluate(e=>e.open),true);assert.match(await page.locator('#mLog').textContent(),/<script>/);assert.equal(await page.locator('#mLog script').count(),0);await page.keyboard.press('Escape');
    await page.locator('[data-view="running"]').click();assert.equal(await page.locator('#results tbody tr').count(),1);
    await page.locator('.row-button').first().click();assert.match(await page.locator('#mLog').textContent(),/제공되지 않았습니다/);await page.keyboard.press('Escape');
    await page.locator('[data-view="systems"]').click();assert.equal(await page.locator('#results tbody tr').count(),22);
    await page.locator('[data-view="stats"]').click();assert.equal(await page.locator('progress').count(),5);
    await page.locator('[data-view="logs"]').click();await page.locator('#search').fill('compile error');assert.equal(await page.locator('#results tbody tr').count(),1);await page.locator('#search').fill('');
    await page.locator('#environment').selectOption('개발');assert.equal(await page.locator('#total').textContent(),'11');await page.locator('#environment').selectOption('ALL');
    await page.locator('#status').selectOption('UNKNOWN');assert.equal(await page.locator('#total').textContent(),'1');await page.locator('#status').selectOption('ALL');
    await upload(page,'broken JSON');await page.locator('#error').waitFor({state:'visible'});assert.equal(await page.locator('#total').textContent(),'22');
    await upload(page,{schemaVersion:1,generatedAt:new Date().toISOString(),deployments:[]});await page.waitForFunction(()=>document.querySelector('#total').textContent==='0');assert.match(await page.locator('#results').textContent(),/없습니다/);
    let calls=0;await page.route('**/snapshot.json',route=>{calls++;return route.fulfill(calls===1?{status:200,contentType:'application/json',body:JSON.stringify({...fixture(),generatedAt:new Date(Date.now()-180000).toISOString()})}:{status:503,contentType:'text/plain',body:'down'});});
    await page.clock.install();await page.locator('#connect').click();await page.waitForFunction(()=>document.querySelector('#total').textContent==='22');assert.match(await page.locator('#source').textContent(),/지연/);
    await page.clock.fastForward(31000);await page.waitForFunction(()=>document.querySelector('#error').textContent.includes('503'));assert.equal(await page.locator('#total').textContent(),'22');assert.match(await page.locator('#source').textContent(),/조회 실패/);await page.locator('#connect').click();
    await page.unroute('**/snapshot.json');await page.route('**/snapshot.json',route=>route.fulfill({status:200,contentType:'text/html',body:'<form>Login</form>'}));await page.locator('#connect').click();await page.waitForFunction(()=>document.querySelector('#error').textContent.includes('JSON 응답'));await page.locator('#connect').click();
    await page.locator('#demo').click();await page.locator('[data-view="recent"]').click();
    if(process.env.BUILD_MONITOR_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.BUILD_MONITOR_SCREENSHOT_DIR,'build-monitor-desktop.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.equal(await page.locator('[data-view="recent"]').isVisible(),true);
    if(process.env.BUILD_MONITOR_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.BUILD_MONITOR_SCREENSHOT_DIR,'build-monitor-mobile.png'),fullPage:true});
    const offline=await browser.newPage();await offline.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);await offline.locator('#demo').click();assert.equal(await offline.locator('#total').textContent(),'4');await offline.locator('#connect').click();assert.match(await offline.locator('#error').textContent(),/사내 웹서버/);
    assert.deepEqual(errors,[]);console.log('PASS: wrapper, empty/demo/import, five views, recent-20, filters/search, XSS, missing logs, invalid JSON retention, stale/503/HTML response, mobile, offline HTML; no page errors.');
  }finally{await browser?.close();server?.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
