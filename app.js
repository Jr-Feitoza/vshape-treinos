/* =========================================================
   V-SHAPE — motor comum das Fases 1, 2 e 3
   Cada página declara antes deste arquivo: FASE, ORDEM, TREINOS,
   RESPIRA_PADRAO e as funções de montagem próprias da fase
   (exercicioHTML, restTimerHTML…). Tudo o mais vive aqui.
   ========================================================= */
/* =========================================================
   ESTADO (localStorage)
   ========================================================= */
const LS = {
  pesos:`vshape_f${FASE.n}_pesos`,
  rotacao:`vshape_f${FASE.n}_rotacao`,
  semana:`vshape_f${FASE.n}_semana`,
  feitoHoje:`vshape_f${FASE.n}_feitohoje`,
  freq:`vshape_f${FASE.n}_freq`
};
const load = (k,def)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):def; }catch(e){ return def; } };
const save = (k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} };

let pesos   = load(LS.pesos, {});
let rotacao = load(LS.rotacao, {proximo:ORDEM[0], hist:[]});
let freq    = load(LS.freq, 1);
let semana  = load(LS.semana, 1);                       // 1..4 (= semanas 9..12)
const DELOAD_FATOR = 0.5; // deload = 50% do peso atual

/* =========================================================
   HELPERS
   ========================================================= */
const san = v => String(v==null?"":v).replace(/[<>&]/g,"");
const el = (tag,cls,html)=>{ const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; };
const hoje = ()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const fmtData = iso => { const [y,m,d]=iso.split('-'); return `${d}/${m}`; };
const addDias = (iso,n)=>{ const [y,m,d]=iso.split('-').map(Number); const dt=new Date(y,m-1,d+n); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; };
// Backup importado: mantém só o que tem o formato esperado (o resto é descartado)
const DATA_RE=/^\d{4}-\d{2}-\d{2}$/;
const numOk = v => typeof v==='number' && isFinite(v);
function validarBackup(d){
  const ok={};
  if(!d||typeof d!=='object') return ok;
  if(d.pesos&&typeof d.pesos==='object'){
    ok.pesos={};
    Object.entries(d.pesos).forEach(([k,p])=>{
      if(!p||!numOk(p.atual)) return;
      ok.pesos[k]=numOk(p.anterior)?{atual:p.atual,anterior:p.anterior}:{atual:p.atual};
    });
  }
  if(d.rotacao&&typeof d.rotacao==='object'){
    const r=d.rotacao;
    ok.rotacao={
      proximo: ORDEM.includes(r.proximo)?r.proximo:ORDEM[0],
      hist: Array.isArray(r.hist)?r.hist.filter(h=>h&&ORDEM.includes(h.t)&&DATA_RE.test(h.d)).slice(0,12):[]
    };
    if(DATA_RE.test(r.dataPrevista)) ok.rotacao.dataPrevista=r.dataPrevista;
    if(DATA_RE.test(r.atrasadoDe)) ok.rotacao.atrasadoDe=r.atrasadoDe;
  }
  if([1,2,3].includes(d.freq)) ok.freq=d.freq;
  if([1,2,3,4].includes(d.semana)) ok.semana=d.semana;
  if(d.feitoHoje&&typeof d.feitoHoje==='object'){
    ok.feitoHoje={};
    Object.entries(d.feitoHoje).forEach(([k,v])=>{ if(ORDEM.includes(k)&&DATA_RE.test(v)) ok.feitoHoje[k]=v; });
  }
  return ok;
}

function ajustarPrevisao(){
  let mudou=false;
  if(!rotacao.dataPrevista){ rotacao.dataPrevista=hoje(); mudou=true; }
  if(rotacao.dataPrevista < hoje()){ rotacao.atrasadoDe=rotacao.atrasadoDe||rotacao.dataPrevista; rotacao.dataPrevista=hoje(); mudou=true; }
  if(rotacao.dataPrevista > hoje() && rotacao.atrasadoDe){ rotacao.atrasadoDe=null; mudou=true; }
  if(mudou) save(LS.rotacao,rotacao);
}
function textoPrevisao(){
  const dp=rotacao.dataPrevista;
  if(!dp) return '';
  if(dp===hoje()) return rotacao.atrasadoDe
    ? `previsto <b>hoje</b> · <span class="prev-atraso">atrasado desde ${san(fmtData(rotacao.atrasadoDe))}</span>`
    : `previsto <b>hoje</b>`;
  return `previsto p/ ${san(fmtData(dp))}`;
}

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(t._to); t._to=setTimeout(()=>t.classList.remove('show'),1800);
}

function videoPosterHTML(id, alt){
  return `<a class="video-poster" data-vid="${id}" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener" aria-label="Assistir ${alt} no YouTube"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="${alt}" loading="lazy"><div class="play-btn">▶</div></a>`;
}

/* =========================================================
   RENDER
   ========================================================= */
function pranchaHTML(seg){
  return `<div class="prancha-timer" data-serie-atual="1" data-serie-total="3" data-segundos="${seg}" role="timer" aria-label="Cronômetro de prancha">
    <div class="timer-serie">Série <span class="serie-num">1</span> de 3</div>
    <div class="timer-relogio" aria-live="polite">${String(Math.floor(seg/60)).padStart(2,'0')}:${String(seg%60).padStart(2,'0')}</div>
    <div class="timer-progress"><div class="timer-progress-bar"></div></div>
    <div class="timer-controls">
      <button class="timer-btn timer-btn-start" type="button">▶ Iniciar</button>
      <button class="timer-btn timer-btn-pause" type="button" hidden>⏸ Pausar</button>
      <button class="timer-btn timer-btn-next" type="button" hidden>Próxima série ▶</button>
      <button class="timer-btn timer-btn-reset" type="button">↻ Resetar</button>
    </div>
    <div class="timer-series">
      <span class="serie-dot active" title="Série 1"></span>
      <span class="serie-dot" title="Série 2"></span>
      <span class="serie-dot" title="Série 3"></span>
    </div>
  </div>`;
}

function pesoTrackHTML(key, label){
  const lbl = label ? `<label class="pt-nome">${label}</label>` : `<label>Carga:</label>`;
  return `<div class="peso-track" data-key="${key}">
    <div class="pt-top">
      ${lbl}
      <input type="text" inputmode="decimal" step="0.5" min="0" class="peso-input" placeholder="—">
      <span class="un">kg</span>
      <button class="peso-save" type="button">salvar</button>
    </div>
    <div class="peso-info"></div>
    <div class="peso-deload" hidden></div>
  </div>`;
}

function render(){
  const tabs=document.getElementById('tabs');
  const main=document.getElementById('main');
  tabs.innerHTML=''; main.innerHTML='';
  ORDEM.forEach((id,i)=>{
    const t=TREINOS[id];
    const sub=t.nome.split('—')[1].trim();
    const btn=el('button','tab-btn'+(i===0?' active':''),`${id}<span class="tab-sub">${sub}</span>`);
    btn.dataset.tab=id;
    btn.setAttribute('role','tab'); btn.setAttribute('aria-selected',String(i===0));
    tabs.appendChild(btn);

    const restSeg = t.descanso.includes('1 min') || t.descanso.includes('1min') ? 60 : 45;
    const sec=el('section','tab-content'+(i===0?' active':''));
    sec.id='tab-'+id;
    const exHTML = t.ex.map((ex,idx)=>exercicioHTML(id,idx,ex,restSeg)).join('');
    sec.innerHTML=`<div class="treino-header">
        <h2>${t.nome}</h2>
        <div class="foco">${t.foco}</div>
        <div class="meta"><span>🔁 ${t.dia}</span><span>⏱ ${t.dur}</span><span>📈 ${t.reps} · ${t.descanso}${FASE.metaDescanso}</span></div>
        <button class="btn-feito" type="button" data-feito="${id}">✓ Marquei este treino hoje</button>
      </div>${exHTML}${FASE.extraTreino?FASE.extraTreino():''}`;
    main.appendChild(sec);
  });

  wireTabs();
  wireVideos();
  wirePesos();
  wireRest();
  wireFeito();
  wireAccordion();
  setupPranchaTimer();
  aplicarPesosSalvos();
  atualizarPainel();
}

/* =========================================================
   WIRING
   ========================================================= */
function wireAccordion(){
  document.querySelectorAll('details.exercicio').forEach(d=>{
    d.addEventListener('toggle',()=>{
      if(!d.open) return;
      const sec=d.closest('.tab-content')||document;
      sec.querySelectorAll('details.exercicio[open]').forEach(o=>{ if(o!==d) o.open=false; });
    });
  });
}

function wireTabs(){
  document.querySelectorAll('nav.tabs button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const tab=btn.dataset.tab;
      document.querySelectorAll('nav.tabs button').forEach(b=>{ b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
      btn.classList.add('active'); btn.setAttribute('aria-selected','true');
      document.getElementById('tab-'+tab).classList.add('active');
      window.scrollTo({top:0,behavior:'smooth'});
    });
  });
}

function wireVideos(){
  document.querySelectorAll('.video-poster').forEach(p=>{
    p.addEventListener('click',e=>{
      if(e.metaKey||e.ctrlKey||e.shiftKey) return;
      e.preventDefault();
      const vid=p.dataset.vid;
      if(!vid||p.querySelector('iframe')) return;
      const iframe=document.createElement('iframe');
      iframe.src='https://www.youtube-nocookie.com/embed/'+vid+'?autoplay=1&rel=0';
      iframe.allow='autoplay; encrypted-media; picture-in-picture';iframe.setAttribute('sandbox','allow-scripts allow-same-origin allow-presentation');
      iframe.allowFullscreen=true;
      iframe.title=p.querySelector('img')?.alt||'Video';
      p.appendChild(iframe);
      setTimeout(()=>{ p.querySelector('img')?.remove(); p.querySelector('.play-btn')?.remove(); },200);
    });
  });
}

/* ---- Peso tracker ---- */
function wirePesos(){
  document.querySelectorAll('.peso-track').forEach(pt=>{
    const key=pt.dataset.key;
    const input=pt.querySelector('.peso-input');
    const btn=pt.querySelector('.peso-save');
    const salvar=()=>{
      const txt=input.value.trim().replace(',','.'); // aceita vírgula ou ponto
      const val=/^\d+(\.\d+)?$/.test(txt)?parseFloat(txt):NaN;
      if(isNaN(val)||val<=0){ toast('Digite uma carga válida'); return; }
      const cur=pesos[key]||{};
      if(cur.atual!=null && cur.atual!==val){ cur.anterior=cur.atual; }
      cur.atual=val;
      pesos[key]=cur;
      save(LS.pesos,pesos);
      renderPesoInfo(pt,key);
      toast('Carga salva: '+val+'kg');
    };
    btn.addEventListener('click',salvar);
    input.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); salvar(); }});
  });
}

function renderPesoInfo(pt,key){
  const info=pt.querySelector('.peso-info');
  const dl=pt.querySelector('.peso-deload');
  const p=pesos[key];
  if(!p||p.atual==null){ info.innerHTML='<span class="prog-same">Registre sua carga pra acompanhar a evolução.</span>'; dl.hidden=true; return; }
  let html=`Atual: <b>${san(p.atual)}kg</b>`;
  if(p.anterior!=null){
    const diff=+(p.atual-p.anterior).toFixed(1);
    if(diff>0) html+=` · anterior ${san(p.anterior)}kg <span class="prog-up">✓ +${san(diff)}kg</span>`;
    else if(diff<0) html+=` · anterior ${san(p.anterior)}kg <span class="prog-down">▼ ${san(diff)}kg</span>`;
    else html+=` · <span class="prog-same">manteve</span>`;
  }
  info.innerHTML=html;
  // deload
  if(semana===4){
    dl.hidden=false;
    dl.innerHTML=`⚠️ Deload: use ~<b>${san(Math.round(p.atual*DELOAD_FATOR*2)/2)}kg</b> (${Math.round(DELOAD_FATOR*100)}%), mesmas reps.`;
  } else { dl.hidden=true; }
}

function aplicarPesosSalvos(){
  document.querySelectorAll('.peso-track').forEach(pt=>{
    const key=pt.dataset.key;
    if(pesos[key]&&pesos[key].atual!=null) pt.querySelector('.peso-input').value=pesos[key].atual;
    renderPesoInfo(pt,key);
  });
}

/* ---- Rest timer inline ---- */
let _audioCtx=null;
function beep(freq,dur){
  try{
    if(!_audioCtx) _audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    const osc=_audioCtx.createOscillator(), gain=_audioCtx.createGain();
    osc.connect(gain); gain.connect(_audioCtx.destination);
    osc.frequency.value=freq;
    gain.gain.setValueAtTime(0.3,_audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001,_audioCtx.currentTime+dur/1000);
    osc.start(); osc.stop(_audioCtx.currentTime+dur/1000);
  }catch(e){}
}
function vibrar(p){ if('vibrate' in navigator) try{ navigator.vibrate(p);}catch(e){} }
// Mantém a tela acesa enquanto algum timer roda (Wake Lock API; sem suporte, não faz nada)
const _timersAtivos=new Set(); let _wakeLock=null;
async function pedirWakeLock(){
  if(!('wakeLock' in navigator) || _wakeLock || document.visibilityState!=='visible') return;
  try{
    _wakeLock=await navigator.wakeLock.request('screen');
    _wakeLock.addEventListener('release',()=>{ _wakeLock=null; });
    if(!_timersAtivos.size){ _wakeLock.release().catch(()=>{}); _wakeLock=null; }
  }catch(e){ _wakeLock=null; }
}
function telaAcesa(dono,on){
  if(on) _timersAtivos.add(dono); else _timersAtivos.delete(dono);
  if(_timersAtivos.size) pedirWakeLock();
  else if(_wakeLock){ _wakeLock.release().catch(()=>{}); _wakeLock=null; }
}
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible'&&_timersAtivos.size) pedirWakeLock(); });

function wireRest(){
  document.querySelectorAll('.rest-btn[data-rest]').forEach(btn=>{
    const base=parseInt(btn.dataset.rest);
    const label=btn.textContent;
    btn.addEventListener('click',()=>{
      if(btn._iv){
        clearInterval(btn._iv); btn._iv=null; telaAcesa(btn,false);
        btn.classList.remove('rodando','fim'); btn.textContent=label; return;
      }
      beep(0,1);
      const fim=Date.now()+base*1000; // conta pelo relógio: não atrasa com a tela apagada
      let s=base;
      btn.classList.add('rodando'); btn.classList.remove('fim');
      btn.textContent=s+'s'; telaAcesa(btn,true);
      btn._iv=setInterval(()=>{
        const novo=Math.ceil((fim-Date.now())/1000);
        if(novo===s) return;
        s=novo;
        if(s<=3&&s>0) beep(660,90);
        if(s<=0){
          clearInterval(btn._iv); btn._iv=null; telaAcesa(btn,false);
          beep(1200,450); vibrar([200,100,200]);
          btn.classList.remove('rodando'); btn.classList.add('fim'); btn.textContent='✓ vai!';
          setTimeout(()=>{ btn.classList.remove('fim'); btn.textContent=label; },2500);
          return;
        }
        btn.textContent=s+'s';
      },250);
    });
  });
}

/* ---- Marcar treino feito / rotação ---- */
function marcarTreino(id){
  const feitos=load(LS.feitoHoje,{});
  // guarda o estado anterior pro "Desfazer último registro" (1 nível)
  rotacao.desfazer={t:id,d:hoje(),proximo:rotacao.proximo,dataPrevista:rotacao.dataPrevista||null,atrasadoDe:rotacao.atrasadoDe||null,feitoAntes:feitos[id]||null};
  rotacao.hist=rotacao.hist||[];
  rotacao.hist.unshift({t:id,d:hoje()});
  rotacao.hist=rotacao.hist.slice(0,12);
  rotacao.proximo=ORDEM[(ORDEM.indexOf(id)+1)%ORDEM.length];
  rotacao.dataPrevista=addDias(hoje(),freq);
  rotacao.atrasadoDe=null;
  save(LS.rotacao,rotacao);
  feitos[id]=hoje(); save(LS.feitoHoje,feitos);
  const quando = rotacao.dataPrevista===hoje() ? 'hoje' : fmtData(rotacao.dataPrevista);
  toast(`${id} concluído! Próximo: ${rotacao.proximo} (${quando})`);
  vibrar([100,50,100]);
  atualizarPainel();
}
function desfazerRegistro(){
  const u=rotacao.desfazer;
  if(!u){ toast('Nada pra desfazer'); return; }
  if(!confirm(`Desfazer o registro de ${u.t} (${fmtData(u.d)})? A rotação volta pra como estava antes.`)) return;
  const i=(rotacao.hist||[]).findIndex(h=>h.t===u.t&&h.d===u.d);
  if(i>=0) rotacao.hist.splice(i,1);
  rotacao.proximo=u.proximo; rotacao.dataPrevista=u.dataPrevista; rotacao.atrasadoDe=u.atrasadoDe;
  rotacao.desfazer=null; save(LS.rotacao,rotacao);
  const feitos=load(LS.feitoHoje,{});
  if(u.feitoAntes) feitos[u.t]=u.feitoAntes; else delete feitos[u.t];
  save(LS.feitoHoje,feitos);
  toast(`Registro desfeito — próximo: ${rotacao.proximo}`);
  atualizarPainel();
}
function wireFeito(){
  document.querySelectorAll('[data-feito]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const id=btn.dataset.feito;
      if(load(LS.feitoHoje,{})[id]===hoje() && !confirm(`${id} já foi registrado hoje. Registrar de novo?`)) return;
      marcarTreino(id);
    });
  });
}

/* =========================================================
   PAINEL
   ========================================================= */
function atualizarPainel(){
  ajustarPrevisao();
  document.getElementById('proximoTag').textContent=rotacao.proximo;
  document.getElementById('btnDesfazer').disabled=!rotacao.desfazer;
  document.getElementById('previsaoInfo').innerHTML=textoPrevisao();
  const fs=document.getElementById('freqSel'); if(fs) fs.value=String(freq);
  // semana buttons
  document.querySelectorAll('#semanaBtns button').forEach(b=>{
    b.classList.toggle('on', parseInt(b.dataset.sem)===semana);
  });
  document.getElementById('deloadBanner').hidden = (semana!==4);
  // marcar abas feitas hoje
  const feitos=load(LS.feitoHoje,{});
  document.querySelectorAll('nav.tabs button').forEach(b=>{
    b.classList.toggle('feito', feitos[b.dataset.tab]===hoje());
  });
  document.querySelectorAll('[data-feito]').forEach(b=>{
    const done=feitos[b.dataset.feito]===hoje();
    b.classList.toggle('done',done);
    b.textContent = done ? '✓ Concluído hoje — toque pra registrar de novo' : '✓ Marquei este treino hoje';
  });
  // histórico
  const hl=document.getElementById('histLine');
  if(rotacao.hist&&rotacao.hist.length){
    hl.innerHTML='<span>Últimos:</span> '+rotacao.hist.slice(0,6).map(h=>`${san(h.t)} <span>(${san(fmtData(h.d))})</span>`).join(' · ');
  } else hl.innerHTML='<span>Nenhum treino registrado ainda.</span>';
  // atualiza info de todos os pesos
  document.querySelectorAll('.peso-track').forEach(pt=>renderPesoInfo(pt,pt.dataset.key));
}

function irParaProximo(){
  const id=rotacao.proximo;
  const btn=document.querySelector(`nav.tabs button[data-tab="${id}"]`);
  if(btn) btn.click();
}

/* ---- Painel actions ---- */
function wirePainel(){
  document.querySelectorAll('#semanaBtns button').forEach(b=>{
    b.addEventListener('click',()=>{ semana=parseInt(b.dataset.sem); save(LS.semana,semana); atualizarPainel(); toast('Semana '+(semana+FASE.semanaOffset)+(semana===4?' · DELOAD':'')); });
  });
  document.getElementById('irProximo').addEventListener('click',irParaProximo);
  document.getElementById('freqSel').addEventListener('change',e=>{
    freq=parseInt(e.target.value)||1; save(LS.freq,freq);
    toast('Frequência: '+(freq===1?'todo dia':'a cada '+freq+' dias'));
  });
  document.getElementById('btnReset').addEventListener('click',()=>{
    if(!confirm('Resetar a rotação e o histórico? (As cargas salvas serão mantidas)')) return;
    rotacao={proximo:ORDEM[0],hist:[]}; save(LS.rotacao,rotacao);
    save(LS.feitoHoje,{});
    atualizarPainel(); toast('Rotação resetada — começa no '+ORDEM[0]);
  });
  document.getElementById('btnDesfazer').addEventListener('click',desfazerRegistro);
  document.getElementById('btnExportar').addEventListener('click',()=>{
    const dump={pesos,semana,rotacao,freq,feitoHoje:load(LS.feitoHoje,{}),_exportado:hoje()};
    const blob=new Blob([JSON.stringify(dump,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='vshape-fase'+FASE.n+'-backup-'+hoje()+'.json';
    a.click(); URL.revokeObjectURL(a.href);
    toast('Backup exportado');
  });
  document.getElementById('btnImportar').addEventListener('click',()=>document.getElementById('fileImport').click());
  document.getElementById('fileImport').addEventListener('change',e=>{
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{
      try{
        const d=validarBackup(JSON.parse(r.result));
        if(d.pesos){ pesos=d.pesos; save(LS.pesos,pesos); }
        if(d.rotacao){ rotacao=d.rotacao; save(LS.rotacao,rotacao); }
        if(d.semana){ semana=d.semana; save(LS.semana,semana); }
        if(d.freq){ freq=d.freq; save(LS.freq,freq); }
        if(d.feitoHoje){ save(LS.feitoHoje,d.feitoHoje); }
        aplicarPesosSalvos(); atualizarPainel();
        toast('Backup importado ✓');
      }catch(err){ toast('Arquivo inválido'); }
    };
    r.readAsText(f);
    e.target.value='';
  });

  // Modal lembrete
  const modal=document.getElementById('modalLembrete');
  const fechar=()=>{ modal.hidden=true; };
  document.getElementById('modalMarcar').addEventListener('click',()=>{ marcarTreino(rotacao.proximo); fechar(); });
  document.getElementById('modalIr').addEventListener('click',()=>{ fechar(); irParaProximo(); });
  document.getElementById('modalDepois').addEventListener('click',fechar);
  modal.addEventListener('click',e=>{ if(e.target===modal) fechar(); });
}

function checarLembrete(){
  ajustarPrevisao();
  const feitos=load(LS.feitoHoje,{});
  const vencido = rotacao.dataPrevista <= hoje();
  const jaFeitoHoje = feitos[rotacao.proximo]===hoje();
  if(vencido && !jaFeitoHoje){
    document.getElementById('modalTxt').innerHTML =
      `Está previsto o treino <b>${san(rotacao.proximo)}</b> pra hoje${rotacao.atrasadoDe?` <span class="prev-atraso">(atrasado desde ${san(fmtData(rotacao.atrasadoDe))})</span>`:''}. Já treinou?`;
    document.getElementById('modalLembrete').hidden=false;
  }
}

/* =========================================================
   TIMER DA PRANCHA
   ========================================================= */
function setupPranchaTimer(){
  document.querySelectorAll('.prancha-timer').forEach(t=>{
    if(t._wired) return; t._wired=true;
    const segundos=parseInt(t.dataset.segundos)||FASE.pranchaPadrao;
    const totalSeries=parseInt(t.dataset.serieTotal)||3;
    let serieAtual=1, restante=segundos, intervalId=null, pausado=false, descansoIv=null, fim=0;
    const REST_ENTRE_SERIES=15;
    const $=sel=>t.querySelector(sel);
    const elRelogio=$('.timer-relogio'), elSerieNum=$('.serie-num'), elBar=$('.timer-progress-bar');
    const elStart=$('.timer-btn-start'), elPause=$('.timer-btn-pause'), elNext=$('.timer-btn-next'), elReset=$('.timer-btn-reset');
    const elDots=t.querySelectorAll('.serie-dot');
    const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
    const render=()=>{ elRelogio.textContent=fmt(restante); elSerieNum.textContent=serieAtual; elBar.style.width=((1-restante/segundos)*100)+'%'; };
    const setEstado=c=>{ t.classList.remove('rodando','pausado','pronto','completo'); if(c)t.classList.add(c); };
    const iniciar=()=>{
      if(!_audioCtx) beep(0,1);
      pausado=false; setEstado('rodando'); elStart.hidden=true; elPause.hidden=false; elPause.textContent='⏸ Pausar';
      fim=Date.now()+restante*1000; telaAcesa(t,true); // conta pelo relógio: não atrasa com a tela apagada
      intervalId=setInterval(()=>{
        const novo=Math.max(0,Math.ceil((fim-Date.now())/1000));
        if(novo===restante) return;
        restante=novo; render();
        if(restante<=3&&restante>0) beep(660,100);
        if(restante<=0){
          clearInterval(intervalId); intervalId=null; beep(1200,500); vibrar([200,100,200]);
          elDots[serieAtual-1].classList.remove('active'); elDots[serieAtual-1].classList.add('done');
          if(serieAtual<totalSeries){
            elPause.hidden=true; elNext.hidden=false; elNext.textContent='Pular descanso ▶'; setEstado('pronto');
            const fimDesc=Date.now()+REST_ENTRE_SERIES*1000;
            let d=REST_ENTRE_SERIES; elBar.style.width='0%'; elRelogio.textContent='⏱ '+d+'s';
            descansoIv=setInterval(()=>{
              const nd=Math.ceil((fimDesc-Date.now())/1000);
              if(nd===d) return;
              d=nd;
              if(d<=3&&d>0) beep(660,90);
              if(d<=0){ clearInterval(descansoIv); descansoIv=null; proxima(); return; }
              elRelogio.textContent='⏱ '+d+'s';
            },250);
          }
          else{ elPause.hidden=true; elNext.hidden=true; setEstado('completo'); elRelogio.textContent='✓'; elBar.style.width='100%'; vibrar([100,50,100,50,200]); telaAcesa(t,false); }
        }
      },250);
    };
    const pausar=()=>{ if(intervalId){ clearInterval(intervalId); intervalId=null; pausado=true; telaAcesa(t,false); setEstado('pausado'); elPause.textContent='▶ Retomar'; beep(440,100); } else if(pausado){ iniciar(); } };
    const resetar=()=>{ if(intervalId)clearInterval(intervalId); if(descansoIv){clearInterval(descansoIv);descansoIv=null;} intervalId=null; pausado=false; telaAcesa(t,false); serieAtual=1; restante=segundos; setEstado(null); elStart.hidden=false; elPause.hidden=true; elNext.hidden=true; elNext.textContent='Próxima série ▶'; elDots.forEach(d=>d.classList.remove('active','done')); elDots[0].classList.add('active'); render(); };
    const proxima=()=>{ if(descansoIv){clearInterval(descansoIv);descansoIv=null;} serieAtual++; elDots[serieAtual-1].classList.add('active'); restante=segundos; elNext.hidden=true; elNext.textContent='Próxima série ▶'; render(); iniciar(); };
    elStart.addEventListener('click',iniciar); elPause.addEventListener('click',pausar); elReset.addEventListener('click',resetar); elNext.addEventListener('click',proxima);
    render();
  });
}

/* =========================================================
   PWA + INIT
   ========================================================= */
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{ navigator.serviceWorker.register('./sw.js').catch(()=>{}); });
}
render();
wirePainel();
checarLembrete();
