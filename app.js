// ─── THEME ───
var currentTheme = localStorage.getItem('webos_theme') || 'dark';
function applyTheme(theme) {
  document.body.classList.remove('theme-dark','theme-light');
  document.body.classList.add('theme-'+theme);
  var btn = document.getElementById('themeBtn');
  if(btn) btn.textContent = theme==='dark' ? '🌙' : '☀️';
  currentTheme = theme;
  try{ localStorage.setItem('webos_theme',theme); }catch(e){}
}
function toggleTheme(){ applyTheme(currentTheme==='dark'?'light':'dark'); }
applyTheme(currentTheme);

// ─── AUTH ───
var STORAGE_KEY='webos_users', currentUser=null, selectedUser=null;
function getUsers(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY))||[]; }catch(e){ return []; } }
function saveUsers(u){ try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(u)); }catch(e){} }
var selectedAv='👤';
function pickAv(el){
  document.querySelectorAll('.avatarOpt').forEach(function(e){ e.classList.remove('picked'); });
  el.classList.add('picked'); selectedAv=el.getAttribute('data-av');
}
function showTab(t){
  document.getElementById('tabLogin').className='tabBtn'+(t==='login'?' on':'');
  document.getElementById('tabReg').className='tabBtn'+(t==='register'?' on':'');
  document.getElementById('panelLogin').style.display=t==='login'?'':'none';
  document.getElementById('panelReg').style.display=t==='register'?'':'none';
  if(t==='login') renderUsersList();
}
function renderUsersList(){
  var users=getUsers(), box=document.getElementById('usersList');
  if(!users.length){ box.innerHTML='<div style="color:rgba(255,255,255,0.35);font-size:12px;padding:10px 0 14px;text-align:center">No hay perfiles creados.<br>Creá uno en "Crear perfil".</div>'; selectedUser=null; return; }
  box.innerHTML=users.map(function(u,i){
    return '<div class="userCard" id="uc'+i+'" onclick="selectUser('+i+')">'+
      '<div class="userAvatar">'+u.avatar+'</div>'+
      '<div><div class="userName">'+u.fullname+'</div><div class="userSub">@'+u.username+'</div></div></div>';
  }).join('');
  selectUser(0);
}
function selectUser(i){
  document.querySelectorAll('.userCard').forEach(function(c){ c.classList.remove('sel'); });
  var card=document.getElementById('uc'+i);
  if(card){ card.classList.add('sel'); selectedUser=getUsers()[i]; }
}
function doLogin(){
  var err=document.getElementById('loginError');
  if(!selectedUser){ err.textContent='Seleccioná un usuario.'; return; }
  var pass=document.getElementById('lp').value;
  if(pass===selectedUser.password){
    err.textContent=''; currentUser=selectedUser;
    document.getElementById('lp').value='';
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('desktop').classList.remove('hidden');
    document.getElementById('startBtn').textContent='⊞ '+currentUser.fullname;
    startClock(); buildPC(); buildNet(); buildPrinters(); buildSheet();
  } else {
    err.textContent='❌ Contraseña incorrecta.';
    document.getElementById('lp').value=''; document.getElementById('lp').focus();
  }
}
function doRegister(){
  var err=document.getElementById('regError'), ok=document.getElementById('regSuccess');
  err.textContent=''; ok.textContent='';
  var fullname=document.getElementById('rName').value.trim();
  var username=document.getElementById('rUser').value.trim().toLowerCase().replace(/\s+/g,'');
  var pass=document.getElementById('rPass').value, pass2=document.getElementById('rPass2').value;
  if(!fullname){ err.textContent='Ingresá tu nombre completo.'; return; }
  if(!username||username.length<3){ err.textContent='El usuario debe tener al menos 3 caracteres.'; return; }
  if(pass.length<4){ err.textContent='La contraseña debe tener al menos 4 caracteres.'; return; }
  if(pass!==pass2){ err.textContent='Las contraseñas no coinciden.'; return; }
  var users=getUsers();
  if(users.find(function(u){ return u.username===username; })){ err.textContent='Ese nombre de usuario ya existe.'; return; }
  users.push({fullname:fullname,username:username,password:pass,avatar:selectedAv,created:new Date().toLocaleDateString('es-AR')});
  saveUsers(users); ok.textContent='✅ Perfil creado. Ya podés iniciar sesión.';
  document.getElementById('rName').value=''; document.getElementById('rUser').value='';
  document.getElementById('rPass').value=''; document.getElementById('rPass2').value='';
  setTimeout(function(){ showTab('login'); ok.textContent=''; },1500);
}
document.getElementById('lp').addEventListener('keydown',function(e){ if(e.key==='Enter') doLogin(); });
document.getElementById('rPass2').addEventListener('keydown',function(e){ if(e.key==='Enter') doRegister(); });
renderUsersList();

// ─── CLOCK ───
function startClock(){
  function tick(){
    var now=new Date();
    var ar=new Date(now.toLocaleString('en-US',{timeZone:'America/Argentina/Buenos_Aires'}));
    var h=String(ar.getHours()).padStart(2,'0'), m=String(ar.getMinutes()).padStart(2,'0'), s=String(ar.getSeconds()).padStart(2,'0');
    var days=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    var months=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    document.getElementById('tbClock').innerHTML=h+':'+m+':'+s+'<br><span style="font-size:10px;opacity:0.7">'+days[ar.getDay()]+', '+ar.getDate()+' '+months[ar.getMonth()]+' '+ar.getFullYear()+'</span>';
  }
  tick(); setInterval(tick,1000);
}

// ─── WINDOW MANAGER ───
var openWins={}, zTop=300;
var titles={mypc:'🖥️ Mi PC',notepad:'📝 Editor',spreadsheet:'📊 Planilla',network:'🌐 Redes',printers:'🖨️ Impresoras',paint:'🎨 Paint',ai:'🤖 IA'};
function openApp(app){
  var w=document.getElementById('win-'+app); if(!w) return;
  w.classList.remove('hidden'); w.style.zIndex=++zTop;
  openWins[app]=true; updateTB();
}
function closeWin(app){ document.getElementById('win-'+app).classList.add('hidden'); delete openWins[app]; updateTB(); }
function minWin(app){ document.getElementById('win-'+app).classList.add('hidden'); updateTB(); }
function maxWin(id){
  var w=document.getElementById(id);
  if(w._maxed){ w.style.cssText=w._prev; w._maxed=false; }
  else{ w._prev=w.style.cssText; w.style.width='100%'; w.style.height='calc(100% - 42px)'; w.style.left='0'; w.style.top='0'; w._maxed=true; }
}
function doLogout(){
  if(!confirm('¿Cerrar sesión de '+(currentUser?currentUser.fullname:'')+' ?')) return;
  currentUser=null; selectedUser=null; openWins={};
  document.querySelectorAll('.win').forEach(function(w){ w.classList.add('hidden'); });
  document.getElementById('desktop').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('startBtn').textContent='⊞ Inicio';
  renderUsersList(); document.getElementById('lp').value='';
}
function updateTB(){
  var bar=document.getElementById('taskbarApps'); bar.innerHTML='';
  Object.keys(openWins).forEach(function(app){
    var btn=document.createElement('button'); btn.className='tbApp';
    var w=document.getElementById('win-'+app);
    if(w&&!w.classList.contains('hidden')) btn.classList.add('active');
    btn.textContent=titles[app]||app;
    btn.onclick=function(){
      var ww=document.getElementById('win-'+app);
      if(ww.classList.contains('hidden')){ ww.classList.remove('hidden'); ww.style.zIndex=++zTop; btn.classList.add('active'); }
      else{ ww.classList.add('hidden'); btn.classList.remove('active'); }
    };
    bar.appendChild(btn);
  });
}

// ─── DRAG ───
function startDrag(e,id){
  var el=document.getElementById(id);
  var sx=e.clientX-el.offsetLeft, sy=e.clientY-el.offsetTop;
  el.style.zIndex=++zTop;
  function move(ev){ el.style.left=(ev.clientX-sx)+'px'; el.style.top=(ev.clientY-sy)+'px'; }
  function up(){ document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',up); }
  document.addEventListener('mousemove',move); document.addEventListener('mouseup',up);
}

// ─── ICON DRAG ───
var _iconDragging=false, _iconDragMoved=false;
function iconDragStart(e,app){
  e.stopPropagation();
  var el=document.getElementById('icon-'+app);
  var sx=e.clientX-el.offsetLeft, sy=e.clientY-el.offsetTop;
  _iconDragging=true; _iconDragMoved=false;
  function move(ev){
    _iconDragMoved=true;
    el.style.left=(ev.clientX-sx)+'px';
    el.style.top=(ev.clientY-sy)+'px';
  }
  function up(){
    _iconDragging=false;
    document.removeEventListener('mousemove',move);
    document.removeEventListener('mouseup',up);
  }
  document.addEventListener('mousemove',move);
  document.addEventListener('mouseup',up);
}
function iconClick(e,app){
  if(_iconDragMoved){ _iconDragMoved=false; return; }
  openApp(app);
}

// ─── MY PC ───
function switchPcTab(tab){
  document.getElementById('pcTabInfo').style.display = tab==='info' ? '' : 'none';
  document.getElementById('pcTabErgo').style.display = tab==='ergo' ? '' : 'none';
  document.getElementById('pcTab-info').className = 'pcTab'+(tab==='info'?' on':'');
  document.getElementById('pcTab-ergo').className = 'pcTab'+(tab==='ergo'?' on':'');
  if(tab==='ergo') buildErgo();
}
function buildPC(){
  var ram=navigator.deviceMemory||4, cores=navigator.hardwareConcurrency||'N/D';
  var ua=navigator.userAgent;
  var cpu=/Intel/i.test(ua)?'Intel Core':(/AMD/i.test(ua)?'AMD':'Procesador genérico');
  var browser=/Edg/i.test(ua)?'Microsoft Edge':(/Chrome/i.test(ua)?'Google Chrome':(/Firefox/i.test(ua)?'Firefox':'Safari'));
  var used=38;
  document.getElementById('pcInfo').innerHTML=
    card('⚙️ Procesador',[['Sistema','WebOS Argentina 1.0'],['Procesador',cpu+' ('+navigator.platform+')'],['Núcleos lógicos',cores+' núcleos'],['Arquitectura','x86-64']])+
    card('🧠 Memoria RAM',[['Capacidad',ram+' GB (deviceMemory API)'],['Tipo','DDR4 3200 MHz'],['Uso estimado','~35%']],35)+
    card('💾 Almacenamiento',[['Capacidad total','256 GB SSD'],['Usado',used+' GB'],['Libre',(256-used)+' GB']],Math.round(used/256*100))+
    card('🖥️ Pantalla & Sistema',[['Resolución',screen.width+'×'+screen.height+' px'],['Profundidad color',screen.colorDepth+' bits'],['Navegador',browser],['Idioma',navigator.language||'es-AR']]);
}
function card(title,rows,pct){
  var s='<div class="pcc"><h3>'+title+'</h3>';
  rows.forEach(function(r){ s+='<div class="pcs2"><span style="color:#666">'+r[0]+'</span><span style="font-weight:500">'+r[1]+'</span></div>'; });
  if(pct!==undefined) s+='<div class="pbl" style="margin-top:6px"><div class="pbf" style="width:'+pct+'%"></div></div>';
  return s+'</div>';
}

// ─── ERGONOMÍA ───
function buildErgo(){
  var tips = [
    {
      icon:'🪑', title:'Postura y silla', sub:'Sentarse correctamente',
      items:[
        'La espalda debe apoyarse completamente en el respaldo de la silla, manteniendo la columna recta.',
        'Los pies deben apoyarse planos en el suelo (o en un reposapiés), con las rodillas en ángulo de ~90°.',
        'Los muslos deben estar paralelos al suelo, sin presión bajo los muslos.',
        'Los hombros relajados, codos en ángulo de 90°-110° apoyados levemente en el escritorio.',
        'No cruzar las piernas durante períodos largos: dificulta la circulación sanguínea.'
      ]
    },
    {
      icon:'🖥️', title:'Distancia y posición del monitor', sub:'Cuidado visual',
      items:[
        'La distancia ideal al monitor es entre 50 y 70 cm (aproximadamente el largo de tu brazo extendido).',
        'La parte superior del monitor debe estar a la altura de los ojos o ligeramente por debajo.',
        'Inclinar el monitor 10°-20° hacia atrás reduce la fatiga del cuello.',
        'Evitá usar la pantalla de costado: siempre debería estar frente a vos.',
        'En laptops, usá un soporte externo para elevar la pantalla y un teclado/mouse externos.'
      ]
    },
    {
      icon:'💡', title:'Iluminación', sub:'Ambiente adecuado',
      items:[
        'La luz natural debe entrar por los costados del monitor, nunca por detrás ni de frente (genera reflejos).',
        'Usá cortinas o persianas para controlar la luz solar directa en pantalla.',
        'La iluminación artificial del ambiente debe ser difusa, no fluorescente directa sobre la pantalla.',
        'El brillo del monitor debe ser similar al del entorno: ni muy brillante ni muy oscuro.',
        'Activá el modo "luz cálida" o "Night Light" después de las 18hs para reducir la luz azul.'
      ]
    },
    {
      icon:'👁️', title:'Regla 20-20-20 para los ojos', sub:'Descanso visual',
      items:[
        'Cada 20 minutos, mirá un objeto a 20 pies (~6 metros) de distancia durante 20 segundos.',
        'Parpadeá conscientemente: frente a pantallas parpadeamos hasta un 60% menos de lo normal.',
        'Activá la reducción de luz azul en el sistema operativo o usá filtros físicos.',
        'Si usás lentes, considerá unos específicos para pantalla (filtro anti-luz azul).',
        'Realizá movimientos oculares suaves: de izquierda a derecha y en círculos para relajar los músculos.'
      ]
    },
    {
      icon:'⌨️', title:'Teclado y mouse', sub:'Posición de las manos',
      items:[
        'Las muñecas deben estar rectas al tipear, no dobladas hacia arriba ni hacia abajo.',
        'El mouse debe estar al mismo nivel que el teclado, sin necesitar estirar el brazo.',
        'Usá un reposamuñecas de gel para descansar entre períodos de escritura (no mientras tipeás).',
        'El teclado debe estar a 5-10 cm del borde del escritorio para apoyar los antebrazos.',
        'Considerá un teclado ergonómico partido si tenés molestias frecuentes en las muñecas.'
      ]
    },
    {
      icon:'🏃', title:'Movimiento y pausas activas', sub:'Bienestar general',
      items:[
        'Levantate y caminá al menos 5 minutos cada hora de trabajo frente a la pantalla.',
        'Realizá estiramientos de cuello, hombros y espalda cada 30 minutos.',
        'Evitá usar el celular en posición encorvada (cuello hacia adelante): se llama "text neck".',
        'El ejercicio regular fuera del trabajo mejora notablemente la resistencia a malas posturas.',
        'Configurá alarmas o recordatorios para hacer pausas: el cuerpo suele ignorar las señales de cansancio.'
      ]
    }
  ];

  var html = '<div class="ergo-wrap">';
  html += '<div class="ergo-hero"><h2>🪑 Guía de Ergonomía Computacional</h2><p>Adoptá buenos hábitos posturales para cuidar tu salud y mejorar tu productividad frente a la pantalla.</p></div>';

  tips.forEach(function(t){
    html += '<div class="ergo-card">';
    html += '<div class="ergo-card-header"><div class="ergo-card-icon">'+t.icon+'</div><div><div class="ergo-card-title">'+t.title+'</div><div class="ergo-card-sub">'+t.sub+'</div></div></div>';
    t.items.forEach(function(item){
      html += '<div class="ergo-tip"><div class="ergo-tip-dot"></div><span>'+item+'</span></div>';
    });
    html += '</div>';
  });

  html += '<div class="ergo-card" style="background:#f0fdf4;border-color:#86efac">';
  html += '<div class="ergo-card-header"><div class="ergo-card-icon">📏</div><div><div class="ergo-card-title">Medidas rápidas de referencia</div><div class="ergo-card-sub">Tabla de distancias ideales</div></div></div>';
  var medidas = [['Distancia a la pantalla','50 – 70 cm','good'],['Altura del monitor','A nivel de ojos','good'],['Ángulo de rodillas','~90°','good'],['Ángulo de codos','90° – 110°','good'],['Pausa recomendada','5 min / hora','warn'],['Horas máx. continuas','2 horas','warn'],['Pantalla frente a ventana','Nunca','bad']];
  medidas.forEach(function(m){
    html += '<div class="pcs2"><span style="color:#555">'+m[0]+'</span><span><strong>'+m[1]+'</strong><span class="ergo-badge '+m[2]+'">'+{good:'✓ Ideal',warn:'⚠ Atención',bad:'✗ Evitar'}[m[2]]+'</span></span></div>';
  });
  html += '</div></div>';

  document.getElementById('ergoContent').innerHTML = html;
}

// ─── NOTEPAD ───
function fmt(cmd,bid){
  document.execCommand(cmd,false,null);
  document.getElementById(bid).classList.toggle('on');
  document.getElementById('ntEditor').focus();
}
function saveDoc(){
  var c=document.getElementById('ntEditor').innerHTML;
  var k='webos_doc_'+Date.now();
  try{ localStorage.setItem(k,c); }catch(e){}
  alert('✅ Documento guardado localmente.\nClave: '+k);
}
function printDoc(){
  var c=document.getElementById('ntEditor').innerHTML;
  var w=window.open('','_blank');
  if(w){ w.document.write('<html><body style="font-family:serif;padding:40px;max-width:800px;margin:auto">'+c+'</body></html>'); w.document.close(); w.print(); }
}

// ─── SPREADSHEET ───
var ROWS=20,COLS=10,cellData={},selCells=new Set(),lastSel=null;
var fbarEditing=false;
var cellEditMode=false; // true cuando una celda está en modo edición (2do click)

function buildSheet(){
  var cols='ABCDEFGHIJ'.split('');
  var h='<thead><tr><th class="rh">#</th>';
  cols.forEach(function(c){ h+='<th>'+c+'</th>'; });
  h+='</tr></thead><tbody>';
  for(var r=1;r<=ROWS;r++){
    h+='<tr><th class="rh">'+r+'</th>';
    for(var c=0;c<COLS;c++){
      var id=cols[c]+r;
      // td maneja click/dblclick; el input está deshabilitado hasta 2do click
      h+='<td id="td-'+id+'" onclick="selCell(event,\''+id+'\')" ondblclick="editCell(\''+id+'\')">'+
         '<input id="c-'+id+'" onchange="cChanged(\''+id+'\')" onblur="cellBlur(\''+id+'\')" onkeydown="cellKey(event,\''+id+'\')" style="font-size:11px;pointer-events:none" tabindex="-1" readonly></td>';
    }
    h+='</tr>';
  }
  h+='</tbody>';
  document.getElementById('shTbl').innerHTML=h;

  var fbar=document.getElementById('fbar');
  fbar.addEventListener('focus',function(){ fbarEditing=true; });
  fbar.addEventListener('blur',function(){ setTimeout(function(){ fbarEditing=false; },150); });
  fbar.addEventListener('keydown',function(e){ if(e.key==='Enter'){ applyFml(); fbar.blur(); } if(e.key==='Escape'){ fbarEditing=false; fbar.blur(); } });
}

function editCell(id){
  // 2do click (o dblclick): activar edición real
  var inp=document.getElementById('c-'+id);
  if(!inp) return;
  inp.removeAttribute('readonly');
  inp.style.pointerEvents='auto';
  inp.tabIndex=0;
  // Mostrar valor raw (fórmula) al editar
  inp.value=cellData[id]||inp.value||'';
  inp.focus();
  cellEditMode=true;
}

function cellBlur(id){
  // Al perder foco, volver a modo solo-lectura visual
  var inp=document.getElementById('c-'+id);
  if(!inp) return;
  inp.setAttribute('readonly','');
  inp.style.pointerEvents='none';
  inp.tabIndex=-1;
  cellEditMode=false;
  cChanged(id);
}

function cellKey(e,id){
  if(e.key==='Enter'||e.key==='Tab'){
    e.preventDefault();
    document.getElementById('c-'+id).blur();
  }
  if(e.key==='Escape'){
    var inp=document.getElementById('c-'+id);
    inp.value=cellData[id]||'';
    inp.blur();
  }
}

function cellFocus(e,id){
  if(fbarEditing){
    e.preventDefault();
    var fbar=document.getElementById('fbar');
    var val=fbar.value;
    var pos=fbar.selectionStart;
    var before=val.slice(0,pos), after=val.slice(pos);
    before=before.replace(/[A-Z]\d+$/,'');
    fbar.value=before+id+after;
    document.querySelectorAll('.sht td').forEach(function(td){ td.style.outline=''; });
    var td=document.getElementById('td-'+id); if(td) td.style.outline='2px solid #f97316';
    setTimeout(function(){ fbar.focus(); var l=fbar.value.length; fbar.setSelectionRange(l,l); },10);
    return;
  }
}

function selCell(e,id){
  if(fbarEditing){
    var fbar=document.getElementById('fbar');
    var val=fbar.value;
    val=val.replace(/[A-Z]\d*$/,'');
    fbar.value=val+id;
    document.querySelectorAll('.sht td').forEach(function(td){ td.style.outline=''; });
    var td=document.getElementById('td-'+id); if(td) td.style.outline='2px solid #f97316';
    setTimeout(function(){ fbar.focus(); var l=fbar.value.length; fbar.setSelectionRange(l,l); },10);
    return;
  }
  // 1er click: solo seleccionar (resaltar) sin editar
  if(!e.shiftKey) selCells.clear();
  selCells.add(id); lastSel=id;
  document.querySelectorAll('.sht td').forEach(function(td){ td.style.outline=''; });
  selCells.forEach(function(cid){ var td=document.getElementById('td-'+cid); if(td) td.style.outline='2px solid #667eea'; });
  var inp=document.getElementById('c-'+id);
  if(inp) document.getElementById('fbar').value=cellData[id]||inp.value||'';
}
function cChanged(id){ var val=document.getElementById('c-'+id).value; cellData[id]=val; evalCell(id); }
function evalCell(id){
  var f=cellData[id]; if(!f) return;
  var inp=document.getElementById('c-'+id); if(!inp) return;
  if(f.charAt(0)==='='){
    try{
      var expr=f.slice(1);
      expr=expr.replace(/SUMA\(([A-Z]\d+):([A-Z]\d+)\)/gi,function(_,a,b){ return rngSum(a,b); });
      expr=expr.replace(/[A-Z]\d+/g,function(ref){ var i=document.getElementById('c-'+ref); return i?(parseFloat(i.value)||0):0; });
      var res=Function('"use strict";return('+expr+')')();
      inp.value=isNaN(res)?'#ERR':res;
    }catch(e){ inp.value='#ERR'; }
  }
}
function rngSum(a,b){
  var ca=a.charCodeAt(0)-65,ra=parseInt(a.slice(1)),cb=b.charCodeAt(0)-65,rb=parseInt(b.slice(1));
  var cols='ABCDEFGHIJ',s=0;
  for(var r=ra;r<=rb;r++) for(var c=ca;c<=cb;c++){ var i=document.getElementById('c-'+cols[c]+r); if(i) s+=parseFloat(i.value)||0; }
  return s;
}
function applyFml(){
  if(!lastSel) return;
  var f=document.getElementById('fbar').value, inp=document.getElementById('c-'+lastSel);
  if(inp){ inp.value=f; cellData[lastSel]=f; evalCell(lastSel); }
}
function shFmt(cmd){
  selCells.forEach(function(id){
    var i=document.getElementById('c-'+id); if(!i) return;
    if(cmd==='bold') i.style.fontWeight=i.style.fontWeight==='bold'?'':'bold';
    if(cmd==='italic') i.style.fontStyle=i.style.fontStyle==='italic'?'':'italic';
  });
}
function shBg(c){ selCells.forEach(function(id){ var td=document.getElementById('td-'+id); if(td) td.style.background=c; }); }
function shTxt(c){ selCells.forEach(function(id){ var i=document.getElementById('c-'+id); if(i) i.style.color=c; }); }

// ─── NETWORK ───
function buildNet(){
  var online=navigator.onLine;
  var badge=online?'<span class="nbadge">● Conectado</span>':'<span class="nbadge" style="background:#fee2e2;color:#dc2626">○ Sin conexión</span>';
  document.getElementById('netBody').innerHTML=
    '<div class="ncs">'+
    '<div class="ncc"><h3>Estado de conexión</h3>'+
    badge+
    '<div class="ntp">'+
    '<button class="ntpill on" id="pw" onclick="swNet(\'wifi\')">📶 WiFi / Celular</button>'+
    '<button class="ntpill" id="pe" onclick="swNet(\'eth\')">📡 Info técnica</button>'+
    '</div><div class="ni" id="niBox">'+netHTML('wifi')+'</div></div></div>'+
    '<div class="nd">'+
    '<div class="ndd"><h4>🏠 PAN — Red de Área Personal</h4><p>Alcance 1-10 m, para dispositivos personales. Ej: Bluetooth entre celular y auriculares.</p></div>'+
    '<div class="ndd"><h4>🏢 LAN — Red de Área Local</h4><p>Conecta dispositivos en un edificio. Alta velocidad y bajo costo. Ej: red de oficina u hogar.</p></div>'+
    '<div class="ndd"><h4>🏙️ MAN — Red de Área Metropolitana</h4><p>Cubre una ciudad (hasta ~50 km). Ej: red de fibra de una empresa de telecomunicaciones.</p></div>'+
    '<div class="ndd"><h4>🌍 WAN — Red de Área Amplia</h4><p>Cubre países o continentes. La mayor es Internet, usando infraestructura de telecomunicaciones.</p></div>'+
    '</div>';
}
function netHTML(t){
  var cn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  if(t==='wifi'){
    var type=cn?cn.effectiveType:'desconocido';
    var downlink=cn?cn.downlink:'N/D';
    var rtt=cn?cn.rtt:'N/D';
    var saveData=cn?(cn.saveData?'Activado':'Desactivado'):'N/D';
    var online=navigator.onLine?'Sí':'No';
    var lang=navigator.language||'es-AR';
    var platform=navigator.platform||'N/D';
    var cores=navigator.hardwareConcurrency||'N/D';
    return row('Estado',navigator.onLine?'✅ En línea':'❌ Sin conexión')+
           row('Tipo de red',cn?(cn.type||type):type)+
           row('Velocidad estimada',downlink!=='N/D'?downlink+' Mbps':'N/D')+
           row('Latencia estimada',rtt!=='N/D'?rtt+' ms':'N/D')+
           row('Ahorro de datos',saveData)+
           row('Idioma del dispositivo',lang)+
           row('Plataforma',platform)+
           row('Núcleos CPU',cores);
  }
  // Info técnica del navegador
  var ua=navigator.userAgent;
  var browser=/Edg/i.test(ua)?'Microsoft Edge':(/Chrome/i.test(ua)?'Google Chrome':(/Firefox/i.test(ua)?'Firefox':'Safari'));
  var proto=location.protocol==='https:'?'HTTPS (seguro)':'HTTP';
  return row('Navegador',browser)+
         row('Protocolo',proto)+
         row('Host',location.hostname||'local')+
         row('Cookies',navigator.cookieEnabled?'Habilitadas':'Deshabilitadas')+
         row('User Agent',ua.substring(0,40)+'...')+
         row('Pantalla',screen.width+'×'+screen.height+' px')+
         row('Zona horaria',Intl.DateTimeFormat().resolvedOptions().timeZone);
}
function row(k,v){ return '<div><span>'+k+'</span><strong>'+v+'</strong></div>'; }
function swNet(t){
  document.getElementById('pw').className='ntpill'+(t==='wifi'?' on':'');
  document.getElementById('pe').className='ntpill'+(t==='eth'?' on':'');
  document.getElementById('niBox').innerHTML=netHTML(t==='wifi'?'wifi':'eth');
}

// ─── PRINTERS ───
var printers=[
  {name:'HP LaserJet Pro M404',status:'online',type:'Láser'},
  {name:'Epson L380',status:'offline',type:'Tinta'},
  {name:'Canon PIXMA G3110',status:'online',type:'Tinta'}
];
var pQueue=[
  {doc:'Informe_ventas.pdf',pages:5,s:'printing'},
  {doc:'Contrato_2024.docx',pages:12,s:'waiting'},
  {doc:'Foto_empresa.jpg',pages:1,s:'waiting'}
];
function buildPrinters(){
  var pl=printers.map(function(p){
    return '<div class="pri"><div><div class="prn">🖨️ '+p.name+'</div><div style="font-size:10px;color:#999">'+p.type+'</div></div>'+
    '<span class="pst '+(p.status==='online'?'pon':'pof')+'">'+(p.status==='online'?'● En línea':'○ Desconectada')+'</span></div>';
  }).join('');
  var ql=pQueue.map(function(q){
    return '<div class="qi"><div>📄 '+q.doc+'<div style="font-size:10px;color:#aaa">'+q.pages+' pág.</div></div>'+
    '<span class="qs '+(q.s==='printing'?'qp':'qw')+'">'+(q.s==='printing'?'Imprimiendo':'En espera')+'</span></div>';
  }).join('');
  document.getElementById('printerBody').innerHTML=
    '<div class="prs"><div class="prc"><h3>Impresoras instaladas</h3>'+pl+
    '<button class="appBtn pri" style="width:100%;margin-top:9px" onclick="togAddPrinter()">+ Agregar impresora</button>'+
    '<div id="apForm" class="apf" style="display:none">'+
    '<input id="npName" placeholder="Nombre de la impresora">'+
    '<select id="npType"><option>Láser</option><option>Tinta</option><option>Multifunción</option><option>Térmica</option></select>'+
    '<button class="appBtn pri" onclick="addPrinter()" style="width:100%">Agregar</button></div></div>'+
    '<div class="prc"><h3>Cola de impresión ('+pQueue.length+' trabajos)</h3>'+ql+
    '<div style="display:flex;gap:7px;margin-top:9px;flex-wrap:wrap">'+
    '<button class="appBtn pri" onclick="printNext()">🖨️ Imprimir</button>'+
    '<button class="appBtn dng" onclick="clearQ()">🗑️ Limpiar</button>'+
    '<button class="appBtn" onclick="addToQ()">+ Agregar</button>'+
    '</div></div></div>';
}
function togAddPrinter(){ var f=document.getElementById('apForm'); if(f) f.style.display=f.style.display==='none'?'block':'none'; }
function addPrinter(){
  var n=document.getElementById('npName').value.trim(), t=document.getElementById('npType').value;
  if(!n){ alert('Ingrese un nombre'); return; }
  printers.push({name:n,status:'offline',type:t}); alert('✅ Impresora "'+n+'" agregada'); buildPrinters();
}
function printNext(){
  if(!pQueue.length){ alert('La cola está vacía'); return; }
  var j=pQueue.shift(); alert('🖨️ Imprimiendo: '+j.doc+'\n('+j.pages+' páginas)');
  if(pQueue.length) pQueue[0].s='printing'; buildPrinters();
}
function clearQ(){ pQueue=[]; buildPrinters(); }
function addToQ(){
  var n=prompt('Nombre del documento:','NuevoDoc.pdf'); if(!n) return;
  var p=parseInt(prompt('Número de páginas:','1'))||1;
  pQueue.push({doc:n,pages:p,s:'waiting'}); buildPrinters();
}

// ═══════════════════════════════════════
// ─── PAINT ───
// ═══════════════════════════════════════
var paintTool='brush', paintColor='#000000', paintSize=4;
var paintDrawing=false, paintLastX=0, paintLastY=0;
var paintShapeStart={x:0,y:0};
var paintSnapshot=null;

var PALETTE=['#000000','#ffffff','#808080','#c0c0c0',
             '#ff0000','#800000','#ff6600','#ff9900',
             '#ffff00','#808000','#00ff00','#008000',
             '#00ffff','#008080','#0000ff','#000080',
             '#ff00ff','#800080','#ff69b4','#a52a2a',
             '#ffd700','#7fffd4','#dda0dd','#f0e68c'];

function initPaint(){
  // Paleta de colores
  var pal=document.getElementById('paintColorPalette');
  if(!pal||pal.dataset.init) return;
  pal.dataset.init='1';
  PALETTE.forEach(function(c,i){
    var d=document.createElement('div');
    d.className='pcolor'+(i===0?' sel':'');
    d.style.background=c;
    d.title=c;
    d.onclick=function(){ setPaintColor(c); };
    pal.appendChild(d);
  });
}

function setPaintColor(c){
  paintColor=c;
  document.getElementById('paintCurrColor').style.background=c;
  document.getElementById('paintColorPicker').value=c;
  document.querySelectorAll('.pcolor').forEach(function(d){
    d.classList.toggle('sel', d.style.background===hexToRgb(c)||d.title===c);
  });
}
function hexToRgb(hex){
  var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return 'rgb('+r+', '+g+', '+b+')';
}

function setPaintTool(t){
  paintTool=t;
  document.querySelectorAll('.ptBtn[id^="pt-"]').forEach(function(b){ b.classList.remove('active'); });
  var btn=document.getElementById('pt-'+t);
  if(btn) btn.classList.add('active');
  var canvas=document.getElementById('paintCanvas');
  if(canvas) canvas.style.cursor=(t==='eraser')?'cell':(t==='fill')?'crosshair':(t==='text')?'text':'crosshair';
  // Ocultar input de texto si cambiamos de herramienta
  var ti=document.getElementById('paintTextInput');
  if(ti) ti.style.display='none';
}

function updateBrushSize(v){ paintSize=parseInt(v); document.getElementById('brushSizeVal').textContent=v; }

function getCanvasPos(e){
  var canvas=document.getElementById('paintCanvas');
  var rect=canvas.getBoundingClientRect();
  var scaleX=canvas.width/rect.width, scaleY=canvas.height/rect.height;
  return { x:(e.clientX-rect.left)*scaleX, y:(e.clientY-rect.top)*scaleY };
}

function paintStart(e){
  var pos=getCanvasPos(e);
  var canvas=document.getElementById('paintCanvas');
  var ctx=canvas.getContext('2d');

  if(paintTool==='text'){
    var ti=document.getElementById('paintTextInput');
    var rect=canvas.getBoundingClientRect();
    ti.style.display='block';
    ti.style.left=(e.clientX)+'px';
    ti.style.top=(e.clientY-10)+'px';
    ti.style.color=paintColor;
    ti.style.fontSize=Math.max(12,paintSize*3)+'px';
    ti.dataset.x=pos.x; ti.dataset.y=pos.y;
    ti.value=''; ti.focus();
    return;
  }

  if(paintTool==='fill'){
    floodFill(ctx, Math.round(pos.x), Math.round(pos.y), paintColor);
    return;
  }

  paintDrawing=true;
  paintLastX=pos.x; paintLastY=pos.y;
  paintShapeStart={x:pos.x,y:pos.y};

  if(paintTool==='brush'||paintTool==='eraser'){
    ctx.beginPath();
    ctx.arc(pos.x,pos.y,paintSize/2,0,Math.PI*2);
    ctx.fillStyle=paintTool==='eraser'?'#ffffff':paintColor;
    ctx.fill();
  }

  // Captura snapshot para shapes
  if(paintTool==='line'||paintTool==='rect'||paintTool==='circle'){
    paintSnapshot=ctx.getImageData(0,0,canvas.width,canvas.height);
  }
}

function paintMove(e){
  if(!paintDrawing) return;
  var pos=getCanvasPos(e);
  var canvas=document.getElementById('paintCanvas');
  var ctx=canvas.getContext('2d');

  if(paintTool==='brush'||paintTool==='eraser'){
    ctx.beginPath();
    ctx.moveTo(paintLastX,paintLastY);
    ctx.lineTo(pos.x,pos.y);
    ctx.strokeStyle=paintTool==='eraser'?'#ffffff':paintColor;
    ctx.lineWidth=paintSize;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.stroke();
    paintLastX=pos.x; paintLastY=pos.y;
  } else if(paintTool==='line'){
    ctx.putImageData(paintSnapshot,0,0);
    ctx.beginPath(); ctx.moveTo(paintShapeStart.x,paintShapeStart.y); ctx.lineTo(pos.x,pos.y);
    ctx.strokeStyle=paintColor; ctx.lineWidth=paintSize; ctx.lineCap='round'; ctx.stroke();
  } else if(paintTool==='rect'){
    ctx.putImageData(paintSnapshot,0,0);
    ctx.beginPath();
    ctx.rect(paintShapeStart.x,paintShapeStart.y,pos.x-paintShapeStart.x,pos.y-paintShapeStart.y);
    ctx.strokeStyle=paintColor; ctx.lineWidth=paintSize; ctx.stroke();
  } else if(paintTool==='circle'){
    ctx.putImageData(paintSnapshot,0,0);
    var rx=(pos.x-paintShapeStart.x)/2, ry=(pos.y-paintShapeStart.y)/2;
    var cx=paintShapeStart.x+rx, cy=paintShapeStart.y+ry;
    ctx.beginPath(); ctx.ellipse(cx,cy,Math.abs(rx),Math.abs(ry),0,0,Math.PI*2);
    ctx.strokeStyle=paintColor; ctx.lineWidth=paintSize; ctx.stroke();
  }
}

function paintEnd(e){
  paintDrawing=false; paintSnapshot=null;
}

function paintTextConfirm(e){
  if(e.key==='Enter'){
    var ti=document.getElementById('paintTextInput');
    var text=ti.value; if(!text){ ti.style.display='none'; return; }
    var canvas=document.getElementById('paintCanvas');
    var ctx=canvas.getContext('2d');
    ctx.fillStyle=paintColor;
    ctx.font=Math.max(12,paintSize*3)+'px Segoe UI';
    ctx.fillText(text, parseFloat(ti.dataset.x), parseFloat(ti.dataset.y));
    ti.style.display='none';
  }
  if(e.key==='Escape'){ document.getElementById('paintTextInput').style.display='none'; }
}

function paintClear(){
  var canvas=document.getElementById('paintCanvas');
  var ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height);
}

function paintSave(){
  var canvas=document.getElementById('paintCanvas');
  // Fondo blanco
  var tmp=document.createElement('canvas');
  tmp.width=canvas.width; tmp.height=canvas.height;
  var tctx=tmp.getContext('2d');
  tctx.fillStyle='#fff'; tctx.fillRect(0,0,tmp.width,tmp.height);
  tctx.drawImage(canvas,0,0);
  var a=document.createElement('a');
  a.href=tmp.toDataURL('image/png');
  a.download='webos-paint-'+Date.now()+'.png';
  a.click();
}

// Flood fill (balde de pintura)
function floodFill(ctx,startX,startY,fillColorHex){
  var canvas=ctx.canvas;
  var imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
  var data=imgData.data;
  var width=canvas.width, height=canvas.height;
  function getIdx(x,y){ return (y*width+x)*4; }
  var sr=data[getIdx(startX,startY)],sg=data[getIdx(startX,startY)+1],sb=data[getIdx(startX,startY)+2],sa=data[getIdx(startX,startY)+3];
  var fr=parseInt(fillColorHex.slice(1,3),16),fg=parseInt(fillColorHex.slice(3,5),16),fb=parseInt(fillColorHex.slice(5,7),16);
  if(sr===fr&&sg===fg&&sb===fb) return;
  var stack=[[startX,startY]];
  var visited=new Uint8Array(width*height);
  while(stack.length){
    var p=stack.pop(); var x=p[0],y=p[1];
    if(x<0||x>=width||y<0||y>=height) continue;
    if(visited[y*width+x]) continue;
    var idx=getIdx(x,y);
    if(Math.abs(data[idx]-sr)>30||Math.abs(data[idx+1]-sg)>30||Math.abs(data[idx+2]-sb)>30) continue;
    visited[y*width+x]=1;
    data[idx]=fr; data[idx+1]=fg; data[idx+2]=fb; data[idx+3]=255;
    stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }
  ctx.putImageData(imgData,0,0);
}

// Inicializar paint cuando se abre
var _origOpenApp=openApp;
openApp=function(app){
  _origOpenApp(app);
  if(app==='paint'){
    setTimeout(function(){
      initPaint();
      var canvas=document.getElementById('paintCanvas');
      var ctx=canvas.getContext('2d');
      // Fondo blanco inicial
      if(!canvas.dataset.init){
        canvas.dataset.init='1';
        ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height);
      }
    },50);
  }
};

// ═══════════════════════════════════════
// ─── AI ASSISTANT ───
// ═══════════════════════════════════════
var aiHistory=[];
// Para usar la IA real, reemplazá esta variable con tu API key de Anthropic
// Obtené una en: https://console.anthropic.com/
var AI_API_KEY = '';  // <-- pegá tu API key acá: 'sk-ant-...'

function aiInputKey(e){
  if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); aiSend(); }
}

function aiClearChat(){
  aiHistory=[];
  document.getElementById('aiMessages').innerHTML=
    '<div class="aiMsg bot"><div class="aiAvatar">🤖</div>'+
    '<div class="aiBubble">Chat limpiado. ¿En qué te puedo ayudar?</div></div>';
}

async function aiSend(){
  var input=document.getElementById('aiInput');
  var text=input.value.trim(); if(!text) return;
  input.value='';

  aiAddMsg('user', text);
  aiHistory.push({role:'user',content:text});

  var btn=document.getElementById('aiSendBtn');
  btn.disabled=true; btn.style.opacity='0.5';

  var typingId='aiTyping_'+Date.now();
  var msgs=document.getElementById('aiMessages');
  msgs.innerHTML+='<div class="aiMsg bot aiTyping" id="'+typingId+'">'+
    '<div class="aiAvatar">🤖</div>'+
    '<div class="aiBubble"><div class="aiDots">'+
    '<div class="aiDot"></div><div class="aiDot"></div><div class="aiDot"></div>'+
    '</div></div></div>';
  msgs.scrollTop=msgs.scrollHeight;

  if(!AI_API_KEY){
    setTimeout(function(){
      var typingEl=document.getElementById(typingId);
      if(typingEl) typingEl.remove();
      aiAddMsg('bot',
        '⚠️ Para usar el Asistente IA necesitás configurar tu API key de Anthropic.\n\n'+
        '📋 Pasos:\n'+
        '1. Creá una cuenta en console.anthropic.com\n'+
        '2. Generá una API key\n'+
        '3. Abrí el archivo app.js y buscá la línea:\n   var AI_API_KEY = \'\'\n'+
        '4. Pegá tu key ahí entre las comillas\n\n'+
        '⚡ Nota: la llamada a la API requiere un servidor backend o extensión del navegador que permita CORS para dominio anthropic.com.');
      btn.disabled=false; btn.style.opacity='1';
      msgs.scrollTop=msgs.scrollHeight;
    }, 600);
    return;
  }

  try{
    var response=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-api-key': AI_API_KEY,
        'anthropic-version':'2023-06-01',
        'anthropic-dangerous-direct-browser-access':'true'
      },
      body:JSON.stringify({
        model:'claude-sonnet-4-20250514',
        max_tokens:1000,
        system:'Sos el asistente IA integrado en WebOS Argentina, un sistema operativo web educativo. Respondé siempre en español argentino, de manera clara, amigable y concisa. Podés ayudar con tecnología, programación, matemáticas, redacción, preguntas generales y cualquier tema que el usuario necesite.',
        messages:aiHistory
      })
    });
    var data=await response.json();
    if(data.error){ throw new Error(data.error.message||'Error de API'); }
    var reply=(data.content&&data.content[0]&&data.content[0].text)||'No pude generar una respuesta. Intentá de nuevo.';
    var typingEl=document.getElementById(typingId);
    if(typingEl) typingEl.remove();
    aiAddMsg('bot', reply);
    aiHistory.push({role:'assistant',content:reply});
  } catch(err){
    var typingEl=document.getElementById(typingId);
    if(typingEl) typingEl.remove();
    var msg=err.message||'';
    if(msg.toLowerCase().indexOf('fetch')!==-1||msg.toLowerCase().indexOf('cors')!==-1||msg.toLowerCase().indexOf('network')!==-1){
      aiAddMsg('bot','❌ Error de conexión (CORS): los navegadores bloquean llamadas directas a la API de Anthropic por seguridad.\n\nPara resolverlo necesitás:\n• Servir el proyecto desde un servidor backend (Node.js, Python, etc.)\n• O usar una extensión que permita CORS\n\nDetalle: '+msg);
    } else {
      aiAddMsg('bot','❌ Error: '+msg);
    }
  }

  btn.disabled=false; btn.style.opacity='1';
  msgs.scrollTop=msgs.scrollHeight;
}

function aiAddMsg(role, text){
  var msgs=document.getElementById('aiMessages');
  var avatar=role==='user'?(currentUser?currentUser.avatar:'👤'):'🤖';
  var div=document.createElement('div');
  div.className='aiMsg '+role;
  // Escapar HTML básico
  var safe=text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  div.innerHTML='<div class="aiAvatar">'+avatar+'</div><div class="aiBubble">'+safe+'</div>';
  msgs.appendChild(div);
  msgs.scrollTop=msgs.scrollHeight;
}
