(() => {
 'use strict';
 const $ = id => document.getElementById(id), canvas=$('pes');
 if(!canvas) return;
 const ctx=canvas.getContext('2d');
 if(!ctx) { $('stage-copy').textContent='This browser cannot draw the surfaces. Read the scientific overview below.'; return; }
 let mode='fluorescence', topology='peaked', progress=0, playing=false, last=0, yaw=-.65, pitch=.55, zoom=1, flat=false, approach=0;
 let stageIndex=-1, width=600, height=430, frames=[], stages=[], fitScale=40, offsetX=300, offsetY=300;
 const colors=['#83c7ff','#efc96c','#d3a3fa'];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const isCI=()=>mode==='reaction'||mode==='intersection';
 function energy(s,x,y) {
  if(isCI()) {const tilt=mode==='intersection'&&topology==='sloped'?1.4:0, delta=mode==='intersection'&&topology==='avoided'?.35:0; return 2+.3*(x*x+y*y)+tilt*x+(s===0?-1:1)*Math.sqrt(x*x+y*y+delta*delta);}
  return s===0?.35*(x+1)**2+.25*y*y:s===1?3+.35*(x-.8)**2+.30*y*y:2+.30*(x+1)**2+.30*y*y;
 }
 const point=(x,y,s)=>[x,y,energy(s,x,y),s];
 function setup() {
  const generic='System-dependent; no physical time is calculated by this model.';
  const ground=['Ground-state preparation','Begin near an S₀ minimum. The bright marker labels nuclear configuration on an electronic-state surface.','s0','No photon exchange',generic];
  const absorption=['Absorption · Franck–Condon excitation','The electronic state changes while the nuclear coordinates are held fixed. The vertical arrow represents photon absorption.','s1','↑ Photon absorbed',generic];
  const relaxation=['Excited-state relaxation','Nuclear motion takes the system away from the Franck–Condon region. This prescribed path illustrates relaxation, not a computed trajectory.','s1','Energy redistribution / relaxation',generic];
  const fluor=['Fluorescence · S₁ → S₀','Photon emission connects the excited singlet to the ground singlet at approximately the same nuclear geometry.','s0','↓ Photon emitted · fluorescence','Illustrative singlet population lifetime: τ = 5 ns. Not a prediction or a universal value.'];
  const relaxGS=['Ground-state relaxation','The molecule relaxes toward the ground-state minimum after emission. Excess vibrational energy may be transferred to the environment.','s0','Vibrational relaxation',generic];
  if(mode==='fluorescence') {
   frames=[point(-1,0,0),point(-1,0,1),point(.8,0,1),point(.8,0,1),point(.8,0,0),point(-1,0,0)];
   stages=[ground,absorption,relaxation,['Excited-state residence','Competing radiative and nonradiative processes determine the population lifetime. This marker is not a probability distribution.','s1','Waiting time is illustrative','Example τ = 5 ns; playback duration is independent of τ.'],fluor,relaxGS];
  } else if(mode==='triplet') {
   const crossing=(1.16-Math.sqrt(1.16**2-4*.05*.924))/.1;
   frames=[point(-1,0,0),point(-1,0,1),point(crossing,0,1),point(crossing,0,2),point(-1,0,2),point(-1,0,2),point(-1,0,0)];
   stages=[ground,absorption,relaxation,['Intersystem crossing · S₁ → T₁','Population changes spin multiplicity near a singlet/triplet crossing. These spin-diabatic surfaces omit explicit spin–orbit coupling; passage here is selected, not guaranteed.','t1','No photon · spin character changes',generic],['Triplet relaxation','The marker moves toward the T₁ minimum after intersystem crossing. Nuclear coordinates change while triplet character is retained.','t1','Relaxation on T₁',generic],['Triplet residence','A triplet population may survive longer than a singlet population. Quenching and other competing decay channels can shorten its lifetime.','t1','Waiting time is illustrative','Example triplet population lifetime: τ = 1 ms. Strongly system- and environment-dependent.'],['Phosphorescence · T₁ → S₀','Radiative decay connects triplet and singlet states. It is spin-forbidden in a pure-spin description; spin–orbit mixing can allow emission.','s0','↓ Photon emitted · phosphorescence','Illustrative τ = 1 ms. Animation is time-compressed and not rate-based.']];
  } else {
   const angle=mode==='intersection'?approach*Math.PI/180:0;
   const x=-1.5*Math.cos(angle),y=-1.5*Math.sin(angle);
   const sign=$('branch').value==='return'?1:-1;
   const gap=mode==='intersection'&&topology==='avoided';
   const ci=['Intersection region · internal conversion','The singlet surfaces become degenerate at g = h = 0. A nonradiative change of electronic state is illustrated here. Real transfer probability requires dynamics.','s0','No emitted photon · same-spin transfer',generic];
   if(mode==='reaction') {
    frames=[point(x,y,0),point(x,y,1),point(0,0,1),point(0,0,0),point(sign*x,sign*y,0)];
    stages=[['Initial configuration','Start on the lower surface of an illustrative two-state model. The horizontal coordinates are abstract nuclear displacements.','s0','Lower singlet surface',generic],absorption,['Approach the CI','Motion on the upper surface reduces the electronic energy gap. The two displayed coordinates resolve the local branching plane.','s1','Approaching degeneracy',generic],ci,['Outgoing ground-state path','A selected outgoing direction is shown. Depending on the molecular landscape, relaxation can restore reactant or lead to photoproduct; this local model does not assign chemical identities or yields.','s0','Selected path, not a predicted product',generic]];
   } else {
    frames=[point(x,y,1),point(0,0,1),point(0,0,gap?1:0),point(-x,-y,gap?1:0)];
    stages=[['Approach in the branching plane','Rotate the approach direction to inspect different cuts through this local model. g and h are idealized orthogonalized degeneracy-lifting coordinates.','s1','Upper surface',generic],['Near the intersection region',gap?'The gap remains nonzero at the origin. There is no conical intersection in this displayed model.':'At the origin, the two eigenvalues meet. The intersection extends as a seam in the full nuclear-coordinate space.','s1',gap?'Finite gap · 0.70 arbitrary energy units':'Zero gap at g = h = 0',generic],gap?['Gapped comparison','The marker stays on the upper adiabatic surface. A nonzero gap does not rule out all nonadiabatic transitions, but none are modelled here.','s1','No imposed state transfer',generic]:ci,['Outgoing direction',gap?'The marker continues on the upper surface across the gapped region.':'This prescribed lower-surface path is an illustration, not a dynamically selected branch. Sloped topography alone does not establish reaction yield.',gap?'s1':'s0','Prescribed motion',generic]];
   }
  }
  $('scene-name').textContent=isCI()?'Local two-state intersection model':mode==='triplet'?'Singlet and triplet landscapes':'Singlet-state landscape';
  $('ci-options').hidden=mode!=='intersection'; $('branch-options').hidden=mode!=='reaction';
  $('topology-description').textContent=topology==='peaked'?'Peaked: the upper surface rises in every branching-plane direction near the CI.':topology==='sloped'?'Sloped: the mean-plane tilt creates directions along which the upper surface descends from the CI.':'Gapped comparison: the degeneracy is lifted; this is not a conical intersection.';
  $('steps').replaceChildren(...stages.map((s,i)=>{const b=document.createElement('button');b.textContent=s[0].split(' · ')[0];b.addEventListener('click',()=>seek((i+.5)/stages.length));return b;}));
  stageIndex=-1; update();
 }
 function location(t) {
  const scaled=t*stages.length, i=Math.min(stages.length-1,Math.floor(scaled)), u=Math.min(1,scaled-i);
  const a=frames[Math.max(0,i-1)],b=frames[i];
  const x=a[0]+(b[0]-a[0])*u,y=a[1]+(b[1]-a[1])*u;
  // Travel stays on the selected surface; state transitions interpolate vertically at fixed geometry.
  const z=a[3]===b[3]?energy(b[3],x,y):a[2]+(b[2]-a[2])*u;
  return {p:[x,y,z],i};
 }
 function update() {
  const {i}=location(progress);
  if(i!==stageIndex) {
   stageIndex=i; const s=stages[i];
   $('stage-number').textContent=`Step ${i+1} / ${stages.length}`;$('stage-title').textContent=s[0];$('stage-copy').textContent=s[1];$('event').textContent=s[3];$('physical-time').textContent=s[4];
   document.querySelectorAll('[data-state]').forEach(el=>el.classList.toggle('active',el.dataset.state===s[2]));
   [...$('steps').children].forEach((el,j)=>el.setAttribute('aria-pressed',String(i===j)));
  }
  $('timeline').value=Math.round(progress*1000);$('progress-value').value=Math.round(progress*100)+'%'; draw();
 }
 function rawProjection(p) {
  const [x,y,z]=p;
  if(flat)return [x,-z,0];
  const u=x*Math.cos(yaw)-y*Math.sin(yaw),v=x*Math.sin(yaw)+y*Math.cos(yaw);
  return [u,v*Math.sin(pitch)-z*Math.cos(pitch),v*Math.cos(pitch)+z*Math.sin(pitch)];
 }
 function project(p){const q=rawProjection(p);return [offsetX+q[0]*fitScale,offsetY+q[1]*fitScale,q[2]];}
 function fit(count){
  const bounds=[rawProjection([-2.1,-1.9,5]),rawProjection([2.2,-1.9,0]),rawProjection([-2.1,2,0])];
  for(let s=0;s<count;s++)for(let i=0;i<=18;i++)for(let j=0;j<=18;j++){
   const x=-2+4*i/18,y=flat?0:-1.8+3.6*j/18;bounds.push(rawProjection([x,y,energy(s,x,y)]));
  }
  const xs=bounds.map(p=>p[0]),ys=bounds.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  fitScale=Math.min((width-70)/(maxX-minX),(height-55)/(maxY-minY))*zoom;
  offsetX=width/2-(minX+maxX)/2*fitScale;offsetY=height/2-(minY+maxY)/2*fitScale;
 }
 function line(points,color,weight=1,dash=[]) {ctx.strokeStyle=color;ctx.lineWidth=weight;ctx.setLineDash(dash);ctx.beginPath();points.forEach((p,i)=>{const q=project(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.stroke();ctx.setLineDash([]);}
 function label(text,p,color='#dce6f5') {const q=project(p);ctx.fillStyle=color;ctx.font='12px system-ui';ctx.fillText(text,q[0]+5,q[1]-6);}
 function draw() {
  ctx.clearRect(0,0,width,height);
  const count=mode==='triplet'?3:2;
  fit(count);
  if(flat) {
   for(let s=0;s<count;s++){const pts=[];for(let j=0;j<=80;j++){const x=-2+4*j/80;pts.push([x,0,energy(s,x,0)]);}line(pts,colors[s],2);}
   label('2D slice: y / h = 0',[-2,0,-.5]);
  } else {
   const polys=[],n=18;
   for(let s=0;s<count;s++)for(let i=0;i<n;i++)for(let j=0;j<n;j++){
    const x=-2+4*i/n,y=-1.8+3.6*j/n,dx=4/n,dy=3.6/n;
    const ps=[[x,y],[x+dx,y],[x+dx,y+dy],[x,y+dy]].map(([a,b])=>project([a,b,energy(s,a,b)]));
    polys.push({ps,s,d:ps.reduce((sum,p)=>sum+p[2],0)/4});
   }
   polys.sort((a,b)=>b.d-a.d);
   for(const {ps,s} of polys){ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=colors[s]+'18';ctx.fill();ctx.strokeStyle=colors[s]+'55';ctx.lineWidth=.55;ctx.stroke();}
  }
  line([[-2.1,-1.9,0],[2.2,-1.9,0]],'#62768e');line([[-2.1,-1.9,0],[-2.1,2,0]],'#62768e');line([[-2.1,-1.9,0],[-2.1,-1.9,5]],'#62768e');
  label(isCI()?'g':'q₁',[2.2,-1.9,0]);label(isCI()?'h':'q₂',[-2.1,2,0]);label('Energy',[-2.1,-1.9,5]);
  for(let s=0;s<count;s++)label(s===0?'S₀':s===1?'S₁':'T₁',[1.6,.5,energy(s,1.6,.5)],colors[s]);
  if(isCI()){
   const gap=mode==='intersection'&&topology==='avoided';
   if(!gap){const p=project([0,0,2]);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p[0],p[1],7,0,Math.PI*2);ctx.stroke();label('CI',[0,0,2.1]);}
  }
  const trace=[];for(let j=0;j<=90;j++)trace.push(location(progress*j/90).p);line(trace,'#ffffff',2,[4,3]);
  const {p}=location(progress),q=project(p);ctx.beginPath();ctx.arc(q[0],q[1],7,0,Math.PI*2);ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#14243b';ctx.lineWidth=2;ctx.stroke();
  const i=location(progress).i;
  if(i>0 && frames[i][3]!==frames[i-1][3] && Math.abs(frames[i][2]-frames[i-1][2])>.1){
   const a=project(frames[i-1]),b=project(frames[i]);
   ctx.strokeStyle='#ffffff';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
   const angle=Math.atan2(b[1]-a[1],b[0]-a[0]);ctx.beginPath();ctx.moveTo(b[0]-10*Math.cos(angle-.4),b[1]-10*Math.sin(angle-.4));ctx.lineTo(b[0],b[1]);ctx.lineTo(b[0]-10*Math.cos(angle+.4),b[1]-10*Math.sin(angle+.4));ctx.stroke();
   ctx.fillStyle='#fff';ctx.font='13px Georgia';ctx.fillText('hν',b[0]+12,(a[1]+b[1])/2);
  }
 }
 function resize(){const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);width=rect.width;height=rect.height;canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
 function pause(){playing=false;$('play').textContent='Play pathway';}
 function seek(t){pause();progress=Math.max(0,Math.min(1,t));update();}
 function tick(now){if(!playing)return;const dt=Math.min(80,now-last);last=now;progress=Math.min(1,progress+dt/20000*Number($('speed').value));update();if(progress===1)pause();else requestAnimationFrame(tick);}
 $('play').addEventListener('click',()=>{if(playing){pause();return;}if(progress>=1)progress=0;playing=true;last=performance.now();$('play').textContent='Pause';requestAnimationFrame(tick);});
 $('timeline').addEventListener('input',()=>seek(Number($('timeline').value)/1000));$('replay').addEventListener('click',()=>seek(0));
 $('previous').addEventListener('click',()=>seek((Math.max(0,stageIndex-1)+.5)/stages.length));$('next').addEventListener('click',()=>seek((Math.min(stages.length-1,stageIndex+1)+.5)/stages.length));
 document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{pause();mode=b.dataset.mode;progress=0;document.querySelectorAll('[data-mode]').forEach(a=>a.setAttribute('aria-pressed',String(a===b)));setup();}));
 $('topology').addEventListener('change',()=>{pause();topology=$('topology').value;progress=0;setup();});
 $('approach').addEventListener('input',()=>{approach=Number($('approach').value);$('approach-value').value=approach+'°';pause();setup();});
 $('branch').addEventListener('change',()=>{pause();setup();});
 $('zoom').addEventListener('input',()=>{zoom=Number($('zoom').value)/100;draw();});
 $('flat').addEventListener('click',()=>{flat=!flat;$('flat').setAttribute('aria-pressed',String(flat));$('flat').textContent=flat?'Return to 3D':'2D energy view';$('approach').disabled=flat;if(flat){approach=0;$('approach').value=0;$('approach-value').value='0°';pause();setup();}draw();});
 $('reset-view').addEventListener('click',()=>{yaw=-.65;pitch=.55;zoom=1;$('zoom').value=100;draw();});
 let drag=null;
 canvas.addEventListener('pointerdown',e=>{if(flat)return;drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-drag[0])*.008;pitch=Math.max(.15,Math.min(1.2,pitch+(e.clientY-drag[1])*.005));drag=[e.clientX,e.clientY];draw();});
 const release=()=>{drag=null;};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
 canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')yaw-=.1;if(e.key==='ArrowRight')yaw+=.1;if(e.key==='ArrowUp')pitch=Math.min(1.2,pitch+.1);if(e.key==='ArrowDown')pitch=Math.max(.15,pitch-.1);draw();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});reduced.addEventListener('change',()=>{if(reduced.matches)pause();});
 // No autoplay, including for visitors who request reduced motion.
 setup();new ResizeObserver(resize).observe(canvas);resize();
})();
