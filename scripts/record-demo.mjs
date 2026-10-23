import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const url = process.env.DEMO_URL || 'http://127.0.0.1:4173/dna-explorer-pro/';
await fs.mkdir('recordings', {recursive:true});
await fs.mkdir('media', {recursive:true});
const browser = await chromium.launch({
  headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage','--ignore-gpu-blocklist',
        '--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle',
        '--use-angle=swiftshader','--enable-accelerated-2d-canvas']
});
const context = await browser.newContext({
  viewport:{width:1600,height:900},
  deviceScaleFactor:1,
  recordVideo:{dir:'recordings',size:{width:1600,height:900}},
  reducedMotion:'no-preference'
});
const page = await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
page.on('console',m=>{if(m.type()==='error') console.log('CONSOLE ERROR:',m.text().slice(0,400));});
await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
await page.locator('canvas').first().waitFor({timeout:30000});
await page.waitForTimeout(1600);
const info = await page.locator('canvas').first().evaluate(c=>({
  width:c.width,height:c.height, webgl:!!(c.getContext('webgl2')||c.getContext('webgl'))
}));
console.log('THREE.JS CANVAS:',JSON.stringify(info));
if(!info.webgl || info.width<200 || info.height<200) throw new Error('WebGL 3D viewport not functional; refusing to publish fake demo.');

const wait = (ms)=>page.waitForTimeout(ms);
async function mode(name){await page.getByRole('button',{name,exact:true}).first().click({timeout:8000});}
async function orbit(dx,dy){
  const box=await page.locator('canvas').first().boundingBox();
  if(!box) return;
  const x=box.x+box.width*0.52,y=box.y+box.height*0.5;
  await page.mouse.move(x,y);
  await page.mouse.down();
  await page.mouse.move(x+dx,y+dy,{steps:48});
  await page.mouse.up();
}
console.log('Recording live 3D app...');
// Opening: recognizable DNA structure.
await wait(1800);
await orbit(200,25);
await wait(700);
await orbit(-110,-20);
await wait(500);
// Switch molecular visualization, then return to default.
await page.locator('#dock-rep-mode').selectOption('ballAndStick');
await wait(1400);
await page.locator('#dock-rep-mode').selectOption('ribbon');
await wait(1100);
await page.locator('#dock-rep-mode').selectOption('cinematic');
await wait(900);
// Visit live educational lab views, not pre-rendered replacements.
await mode('Replication Lab');
await wait(1900);
await mode('Transcription Lab');
await wait(1700);
await mode('Chromatin Scales');
await wait(1800);
await mode('B-DNA Structure');
await wait(900);
// Finish with a cinematic DNA orbit.
await orbit(260,-30);
await wait(1500);
await page.screenshot({path:'media/dna-explorer-demo-frame.png'});
if(errors.length) console.log('PAGE WARNINGS:',errors.slice(0,6));
const video = page.video();
await context.close();
await browser.close();
const videoPath=await video.path();
await fs.copyFile(videoPath,'recordings/app-recording.webm');
console.log('SAVED recordings/app-recording.webm');
