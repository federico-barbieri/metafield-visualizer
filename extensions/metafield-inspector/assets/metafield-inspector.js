(function(){
'use strict';
var C=window.__MF_INSPECTOR||{},P=new URLSearchParams(location.search),
dm=!!(window.Shopify&&window.Shopify.designMode),db=P.get('mf_debug')==='1',fo=!!C.enabled;
if(!dm&&!db&&fo===false)return;
var PB=C.proxyBase||'/apps/mf-inspector',HD=200,mc=new Map(),rc=new Map(),
ap=null,pin=false,ht=null,ch=null;
function xh(c){
if(c.dataset.productHandle)return c.dataset.productHandle;
if(c.dataset.handle)return c.dataset.handle;
var l=c.querySelector('a[href*="/products/"]')||c.closest('a[href*="/products/"]');
if(l){var m=l.getAttribute('href').match(/\/products\/([^/?#]+)/);if(m)return m[1];}
var j=c.querySelector('script[type="application/json"]');
if(j){try{var d=JSON.parse(j.textContent);if(d.handle)return d.handle;if(d.product&&d.product.handle)return d.product.handle;}catch(_){}}
return null;}
var CS=['[data-product-handle]','[data-handle]','.product-card','.product-item','.grid-product',
'.card--product','.card-product','product-card','.product-grid-item','.collection-product',
'.product-card-wrapper','.grid__item[data-product-id]'];
function fc(el){
if(!el||!el.closest)return null;
for(var i=0;i<CS.length;i++){var c=el.closest(CS[i]);if(c&&xh(c))return c;}
var lk=el.closest('a[href*="/products/"]');
if(lk){var p=lk.parentElement;for(var i=0;i<5&&p&&p!==document.body;i++){
if(p.querySelector('img')&&p.children.length>1&&xh(p))return p;p=p.parentElement;}
if(xh(lk))return lk;}return null;}
async function fm(h){if(mc.has(h))return mc.get(h);
try{var r=await fetch(PB+'/metafields?handle='+encodeURIComponent(h));
if(!r.ok)throw new Error('HTTP '+r.status);var d=await r.json();mc.set(h,d);return d;
}catch(e){return{metafields:[],error:e.message};}}
async function fr(){if(rc.has('a'))return rc.get('a');
try{var r=await fetch(PB+'/references');if(!r.ok)throw new Error('HTTP '+r.status);
var d=await r.json();rc.set('a',d);return d;}catch(e){return{references:{}};}}
function ce(t,c){var e=document.createElement(t);if(c)e.className=c;return e;}
function cp(h,data,refs){
var pn=ce('div','mfi-panel');pn.setAttribute('data-handle',h);
var hd=ce('div','mfi-header'),ti=ce('span','mfi-title');
ti.textContent=data.product?data.product.title:h;
var ct=ce('div','mfi-controls'),pb=ce('button','mfi-pin');
pb.title='Pin';pb.textContent='\u{1F4CC}';
pb.onclick=function(e){e.stopPropagation();pin=!pin;pn.classList.toggle('mfi-pinned',pin);
pb.textContent=pin?'\u{1F4CD}':'\u{1F4CC}';};
var cb=ce('button','mfi-close');cb.title='Close';cb.textContent='\u2715';
cb.onclick=function(e){e.stopPropagation();pin=false;rp();};
ct.appendChild(pb);ct.appendChild(cb);hd.appendChild(ti);hd.appendChild(ct);pn.appendChild(hd);
var hr=ce('div','mfi-handle-row'),ht2=ce('span','mfi-handle-tag');ht2.textContent=h;
var cn=ce('span','mfi-count');cn.textContent=data.metafields.length+' metafield'+(data.metafields.length!==1?'s':'');
hr.appendChild(ht2);hr.appendChild(cn);pn.appendChild(hr);
if(data.error){var er=ce('div','mfi-error');er.textContent='Error: '+data.error;pn.appendChild(er);}
var gp={};for(var i=0;i<data.metafields.length;i++){var mf=data.metafields[i];
if(!gp[mf.namespace])gp[mf.namespace]=[];gp[mf.namespace].push(mf);}
var bd=ce('div','mfi-body'),ns=Object.keys(gp).sort();
for(var n=0;n<ns.length;n++){var g=ce('div','mfi-group'),nl=ce('div','mfi-namespace');
nl.textContent=ns[n];g.appendChild(nl);var fs=gp[ns[n]];
for(var f=0;f<fs.length;f++){var mf=fs[f],rw=ce('div','mfi-row '+(mf.value?'mfi-populated':'mfi-empty'));
var kl=ce('div','mfi-key-line'),kn=ce('span','mfi-key');kn.textContent=mf.key;
var tt=ce('span','mfi-type');tt.textContent=mf.type;kl.appendChild(kn);kl.appendChild(tt);rw.appendChild(kl);
var ve=ce('div','mfi-value'),dv=mf.value||'(empty)',tr=dv.length>100?dv.substring(0,100)+'\u2026':dv;
ve.textContent=tr;
if(dv.length>100){ve.classList.add('mfi-truncated');
ve.addEventListener('click',(function(d,t){return function(){
if(this.classList.contains('mfi-expanded')){this.textContent=t;this.classList.remove('mfi-expanded');}
else{this.textContent=d;this.classList.add('mfi-expanded');}};})(dv,tr));}
rw.appendChild(ve);
var rk=mf.namespace+'.'+mf.key,frs=refs.references?refs.references[rk]:null;
if(frs&&frs.length>0){var rc2=ce('div','mfi-refs');
for(var r=0;r<frs.length;r++){var tg=ce('span','mfi-ref-tag');
tg.textContent=frs[r].file+':'+frs[r].line;tg.title='Referenced in '+frs[r].file+' at line '+frs[r].line;
rc2.appendChild(tg);}rw.appendChild(rc2);}
g.appendChild(rw);}bd.appendChild(g);}
if(data.metafields.length===0&&!data.error){var em=ce('div','mfi-empty-state');
em.textContent='No metafields found for this product.';bd.appendChild(em);}
pn.appendChild(bd);md(pn,hd);return pn;}
function md(pn,hd){var dr=false,sx,sy,sl,st;
hd.onmousedown=function(e){if(e.target.tagName==='BUTTON')return;dr=true;sx=e.clientX;sy=e.clientY;
var r=pn.getBoundingClientRect();sl=r.left;st=r.top;pn.style.transition='none';e.preventDefault();};
document.addEventListener('mousemove',function(e){if(!dr)return;
pn.style.left=sl+(e.clientX-sx)+'px';pn.style.top=st+(e.clientY-sy)+'px';
pn.style.right='auto';pn.style.bottom='auto';});
document.addEventListener('mouseup',function(){if(dr){dr=false;pn.style.transition='';}});}
function pp(pn,el){var r=el.getBoundingClientRect(),pw=380,ph=500,
l=r.right+12,t=r.top;
if(l+pw>window.innerWidth)l=r.left-pw-12;
if(l<0)l=Math.max(8,(window.innerWidth-pw)/2);
if(t+ph>window.innerHeight)t=Math.max(8,window.innerHeight-ph-8);
pn.style.left=l+window.scrollX+'px';pn.style.top=t+window.scrollY+'px';}
function sp(h,el){if(ap&&ch===h)return;if(pin)return;rp();ch=h;
var ld=ce('div','mfi-panel mfi-loading');
ld.innerHTML='<div class="mfi-header"><span class="mfi-title">Loading\u2026</span></div>'+
'<div class="mfi-loader-body">Fetching metafields for <strong>'+h+'</strong></div>';
pp(ld,el);document.body.appendChild(ld);ap=ld;
Promise.all([fm(h),fr()]).then(function(rs){if(ch!==h)return;rp();
var pn=cp(h,rs[0],rs[1]);pp(pn,el);document.body.appendChild(pn);ap=pn;});}
function rp(){if(ap&&!pin){ap.remove();ap=null;ch=null;}}
var hCard=null,lt=null;
function tryDismiss(){clearTimeout(lt);lt=setTimeout(function(){
if(pin)return;
var overCard=hCard&&hCard.matches(':hover');
var overPanel=ap&&ap.matches(':hover');
if(!overCard&&!overPanel)rp();},500);}
function cancelDismiss(){clearTimeout(lt);clearTimeout(ht);}
document.addEventListener('mouseover',function(e){
if(e.target.closest&&e.target.closest('.mfi-panel')){cancelDismiss();return;}
var c=fc(e.target);if(!c)return;
if(c===hCard&&ap)return;
cancelDismiss();hCard=c;var h=xh(c);if(!h)return;
ht=setTimeout(function(){sp(h,c);},HD);},false);
document.addEventListener('mouseout',function(e){
var rt=e.relatedTarget;
if(rt&&rt.closest){
if(rt.closest('.mfi-panel'))return;
if(hCard&&hCard.contains(rt))return;}
clearTimeout(ht);tryDismiss();},false);
if(location.pathname.match(/^\/products\/[^/]+/)){var pm=location.pathname.match(/\/products\/([^/?#]+)/);
if(pm){var ph2=pm[1],btn=ce('button','mfi-page-btn');btn.innerHTML='&#128269; Inspect Metafields';
btn.onclick=function(){var a=ce('div');a.style.cssText='position:fixed;right:20px;top:80px;width:1px;height:1px;pointer-events:none;';
document.body.appendChild(a);pin=false;sp(ph2,a);pin=true;setTimeout(function(){a.remove();},100);};
document.body.appendChild(btn);}}
})();
