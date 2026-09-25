const devices={desktop:{label:'Desktop',width:1440,height:900},ipad:{label:'iPad',width:1024,height:1366},mobile:{label:'Mobile',width:390,height:844}};
const state={device:'desktop',width:520,x:120,y:120,radius:14,alignment:'custom',ratio:16/9,hasForeground:false,backgroundUrl:null,foregroundUrl:null};
const $=selector=>document.querySelector(selector);
const stage=$('#stage'),viewport=$('#viewport'),foreground=$('#foreground'),foregroundImage=$('#foreground-image'),backgroundImage=$('#background-image');
const fields={width:$('#width-number'),widthRange:$('#width-range'),x:$('#x-position'),y:$('#y-position'),radius:$('#radius-number'),radiusRange:$('#radius-range')};

function device(){return devices[state.device]}
function clamp(value,min,max){return Math.min(Math.max(value,min),max)}
function foregroundHeight(){return state.width/state.ratio}
function fitStage(){
  const d=device();stage.style.width=`${d.width}px`;stage.style.height=`${d.height}px`;
  const availableWidth=Math.max(280,viewport.clientWidth-20),availableHeight=Math.max(320,viewport.clientHeight-20);
  const scale=Math.min(1,availableWidth/d.width,availableHeight/d.height);
  stage.style.transform=`scale(${scale})`;viewport.style.setProperty('--scaled-width',`${d.width*scale}px`);
  stage.parentElement.style.setProperty('--stage-scale',scale);
  stage.style.marginBottom=`${d.height*(scale-1)}px`;stage.style.marginRight=`${d.width*(scale-1)}px`;
  $('#device-label').textContent=`${d.label} · ${d.width} × ${d.height}`;
  fields.widthRange.max=d.width;
  state.width=clamp(state.width,20,d.width);state.x=clamp(state.x,0,Math.max(0,d.width-state.width));state.y=clamp(state.y,0,Math.max(0,d.height-foregroundHeight()));
  render();
}
function render(){
  const h=foregroundHeight();foreground.style.width=`${state.width}px`;foreground.style.aspectRatio=`${state.ratio}`;foreground.style.left=`${state.x}px`;foreground.style.top=`${state.y}px`;foregroundImage.style.height='100%';foregroundImage.style.objectFit='fill';foregroundImage.style.borderRadius=`${state.radius}px`;
  fields.width.value=Math.round(state.width);fields.widthRange.value=Math.round(state.width);fields.x.value=Math.round(state.x);fields.y.value=Math.round(state.y);fields.radius.value=state.radius;fields.radiusRange.value=state.radius;
  $('#custom-guide').style.left=`${clamp(Number($('#custom-guide-x').value)||0,0,device().width)}px`;
  document.querySelectorAll('[data-align]').forEach(button=>button.classList.toggle('active',button.dataset.align===state.alignment));
  $('#parameter-output').textContent=[`device: ${device().label}`,`width: ${Math.round(state.width)}px`,`max-width: ${Math.round(state.width)}px`,`x: ${Math.round(state.x)}px`,`y: ${Math.round(state.y)}px`,`border-radius: ${state.radius}px`,`alignment: ${state.alignment}`].join('\n');
}
function setImage(file,type){
  if(!file)return;const url=URL.createObjectURL(file);
  if(type==='background'){
    if(state.backgroundUrl)URL.revokeObjectURL(state.backgroundUrl);state.backgroundUrl=url;backgroundImage.src=url;backgroundImage.style.display='block';$('#background-empty').classList.add('hidden');
  }else{
    if(state.foregroundUrl)URL.revokeObjectURL(state.foregroundUrl);state.foregroundUrl=url;foregroundImage.onload=()=>{state.ratio=foregroundImage.naturalWidth/foregroundImage.naturalHeight||1;state.hasForeground=true;foreground.classList.remove('hidden');state.width=Math.min(device().width*.6,foregroundImage.naturalWidth);state.x=(device().width-state.width)/2;state.y=Math.max(40,device().height*.12);render()};foregroundImage.src=url;
  }
}
$('#background-file').addEventListener('change',event=>setImage(event.target.files[0],'background'));
$('#foreground-file').addEventListener('change',event=>setImage(event.target.files[0],'foreground'));
fields.width.addEventListener('input',event=>{state.width=clamp(Number(event.target.value)||20,20,device().width);state.alignment='custom';render()});
fields.widthRange.addEventListener('input',event=>{state.width=Number(event.target.value);state.alignment='custom';render()});
fields.x.addEventListener('input',event=>{state.x=Number(event.target.value)||0;state.alignment='custom';render()});
fields.y.addEventListener('input',event=>{state.y=Number(event.target.value)||0;render()});
fields.radius.addEventListener('input',event=>{state.radius=clamp(Number(event.target.value)||0,0,24);render()});
fields.radiusRange.addEventListener('input',event=>{state.radius=Number(event.target.value);render()});
document.querySelectorAll('[data-device]').forEach(button=>button.addEventListener('click',()=>{state.device=button.dataset.device;document.querySelectorAll('[data-device]').forEach(item=>item.classList.toggle('active',item===button));fitStage()}));
document.querySelectorAll('[data-align]').forEach(button=>button.addEventListener('click',()=>{state.alignment=button.dataset.align;state.x=state.alignment==='left'?device().width*.08:state.alignment==='center'?(device().width-state.width)/2:device().width-state.width-device().width*.08;render()}));

for(const [input,guide] of [['#guide-left','#left-guide'],['#guide-center','#center-guide'],['#guide-custom','#custom-guide']])$(input).addEventListener('change',event=>$(guide).classList.toggle('hidden',!event.target.checked));
$('#custom-guide-x').addEventListener('input',render);

let gesture=null;
foreground.addEventListener('pointerdown',event=>{
  if(!state.hasForeground)return;event.preventDefault();foreground.setPointerCapture(event.pointerId);
  const corner=event.target.dataset.corner||null;gesture={corner,startX:event.clientX,startY:event.clientY,width:state.width,x:state.x,y:state.y,height:foregroundHeight()};
});
foreground.addEventListener('pointermove',event=>{
  if(!gesture)return;const rect=stage.getBoundingClientRect(),scale=rect.width/device().width,dx=(event.clientX-gesture.startX)/scale,dy=(event.clientY-gesture.startY)/scale;
  if(!gesture.corner){state.x=clamp(gesture.x+dx,0,device().width-state.width);state.y=clamp(gesture.y+dy,0,device().height-foregroundHeight());state.alignment='custom'}
  else{
    const horizontal=gesture.corner.includes('e')?dx:-dx;let nextWidth=clamp(gesture.width+horizontal,20,device().width);let nextHeight=$('#lock-ratio').checked?nextWidth/state.ratio:Math.max(20,gesture.height+(gesture.corner.includes('s')?dy:-dy));
    if(!$('#lock-ratio').checked)state.ratio=nextWidth/nextHeight;
    if(gesture.corner.includes('w'))state.x=gesture.x+(gesture.width-nextWidth);if(gesture.corner.includes('n'))state.y=gesture.y+(gesture.height-nextHeight);
    state.width=nextWidth;state.x=clamp(state.x,0,device().width-state.width);state.y=clamp(state.y,0,device().height-foregroundHeight());state.alignment='custom';
  }render();
});
foreground.addEventListener('pointerup',()=>gesture=null);foreground.addEventListener('pointercancel',()=>gesture=null);

$('#copy-parameters').addEventListener('click',async()=>{
  const payload={device:device().label,width:`${Math.round(state.width)}px`,maxWidth:`${Math.round(state.width)}px`,x:`${Math.round(state.x)}px`,y:`${Math.round(state.y)}px`,borderRadius:`${state.radius}px`,alignment:state.alignment};
  try{await navigator.clipboard.writeText(JSON.stringify(payload,null,2));$('#copy-status').textContent='已复制布局参数';}catch{$('#copy-status').textContent='复制失败，请手动复制上方参数';}
});
new ResizeObserver(fitStage).observe(viewport);fitStage();render();
