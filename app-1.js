const API_BASE='https://skdjbifmtleiogbkqwid.supabase.co/functions/v1';
const LOGO_URL=`${API_BASE}/dwd-brand-asset?name=logo`;
const WAVE_URL=`${API_BASE}/dwd-brand-asset?name=wave`;
const app=document.getElementById('app');
const qs=new URLSearchParams(location.search);
const token=(qs.get('order')||'').trim();
const returning=qs.get('return')==='1';
const route=(location.pathname.replace(/\/+$/, '')||'/');
const DEV=['localhost','127.0.0.1'].includes(location.hostname);
const qa=DEV?(qs.get('qa')||''):'';
let state={view:null,phase:1,loading:true,error:'',terms:null,invoice:null};

const icons={
  arrow:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  check:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>`,
  chevron:`<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`,
  external:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>`,
  download:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/></svg>`,
  refresh:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M20 7h-5V2M4 17h5v5M5.1 9A7 7 0 0 1 17 5l3 2M18.9 15A7 7 0 0 1 7 19l-3-2"/></svg>`
};
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const str=(o,...keys)=>{for(const k of keys){const v=o?.[k];if(typeof v==='string'&&v.trim())return v.trim();if(typeof v==='number'&&Number.isFinite(v))return String(v)}return''};
const num=(o,...keys)=>{for(const k of keys){const v=o?.[k];if(typeof v==='number'&&Number.isFinite(v))return v;if(typeof v==='string'&&v.trim()){const n=Number(v.replace(/\s/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.'));if(Number.isFinite(n))return n}}return null};
const money=(v,c='EUR')=>v==null?'—':new Intl.NumberFormat('nl-NL',{style:'currency',currency:c,minimumFractionDigits:2}).format(v);
const dateFmt=(v,time=false)=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return esc(v);return new Intl.DateTimeFormat('nl-NL',time?{dateStyle:'long',timeStyle:'short'}:{dateStyle:'long'}).format(d)};
const statusOf=v=>str(v?.order,'status','payment_status','state').toUpperCase();
const termsVersion=v=>str(v?.acceptance,'terms_version','accepted_terms_version')||str(v?.terms,'version','terms_version');
const invoiceNumber=v=>str(v?.invoices?.[0],'invoice_number','number');
const priceOf=o=>{const website=num(o,'website_amount_ex_vat');const care=num(o,'care_amount_ex_vat');const subtotal=num(o,'checkout_subtotal_ex_vat','subtotal_ex_vat')??(website!=null&&care!=null?website+care:null);const rate=num(o,'vat_rate','tax_rate');const vat=num(o,'checkout_vat_amount','vat_amount','tax_amount')??(subtotal!=null&&rate!=null?subtotal*(rate/100):null);const total=num(o,'checkout_total_inc_vat','today_total','total_incl_vat','total_amount')??(subtotal!=null&&vat!=null?subtotal+vat:null);return{website,care,subtotal,rate,vat,total,recurring:care!=null&&rate!=null?care*(1+rate/100):null}};
const friendly={order_locked:'Je opdracht is al bevestigd. Je gegevens kunnen daarom niet meer worden gewijzigd.',required_field_missing:'Vul alle verplichte velden in.',invalid_email:'Vul een geldig e-mailadres in.',invalid_country_code:'Controleer de landcode.',order_not_found:'Deze opdracht kon niet worden gevonden. Controleer je persoonlijke link.',public_token_required:'De persoonlijke link is onvolledig.',agreement_required:'Je moet akkoord gaan voordat je kunt betalen.',customer_data_not_confirmed:'Controleer eerst je gegevens.',invoice_not_found:'Deze factuur is nog niet beschikbaar.',terms_not_found:'Deze versie van de voorwaarden is niet gevonden.',payment_database_error:'De betaling is aangemaakt, maar kon niet goed worden opgeslagen. Neem contact met ons op.',mollie_create_failed:'De betaling kon niet worden gestart. Er is niets afgeschreven.',server_not_configured:'De betaalomgeving is tijdelijk niet beschikbaar.'};
function friendlyError(code,status){const k=String(code||'').toLowerCase().trim();if(friendly[k])return friendly[k];for(const [a,b] of Object.entries(friendly))if(k.includes(a))return b;if(status===404)return friendly.order_not_found;if(status>=500)return'Er ging iets mis aan onze kant. Probeer het over een moment opnieuw.';return'Er ging iets mis. Probeer het opnieuw of mail info@dewebsitedokters.nl.'}
async function post(endpoint,body){const r=await fetch(`${API_BASE}/${endpoint}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});let d={};try{d=await r.json()}catch{}if(!r.ok||d.ok===false)throw Object.assign(new Error(friendlyError(d.error||d.code||d.message,r.status)),{code:String(d.error||d.code||'').toLowerCase(),status:r.status});return d}
async function loadOrder(){if(qa)return mockOrder(qa);return post('dwd-order-view',{public_token:token})}
const termsPdf=v=>`${API_BASE}/dwd-terms-document?version=${encodeURIComponent(v)}&download=1`;
const orderPdf=t=>`${API_BASE}/dwd-order-document?order=${encodeURIComponent(t)}&download=1`;
const invoicePdf=n=>`${API_BASE}/dwd-invoice-document?invoice=${encodeURIComponent(n)}&download=1`;

function shell(content,step=1,compact=false){return `<div class="page"><div class="plus plus-a">+</div><div class="plus plus-b">+</div><header class="header"><a class="brand" href="${token?`/?order=${encodeURIComponent(token)}`:`/`}">${DEV?`<span class="dev-logo">DWD</span>`:`<img src="${LOGO_URL}" alt="">`}<span>DE WEBSITE DOKTERS</span></a></header><main class="main${compact?` compact`:``}">${route===`/`?progress(step):``}${content}</main><div id="brand-wave" class="wave" aria-hidden="true"></div></div>`}
function progress(step){const names=['Opdracht','Gegevens','Bevestigen','Betaald'];return `<nav class="progress" aria-label="Voortgang"><ol>${names.map((n,i)=>`<li class="${i+1===step?`active`:i+1<step?`done`:``}" ${i+1===step?`aria-current="step"`:``}><span class="step-num">${String(i+1).padStart(2,`0`)}</span><span>${n}</span></li>`).join(``)}</ol></nav>`}
function initWave(){const el=document.getElementById('brand-wave');if(!el||DEV)return;const img=new Image();img.decoding='async';img.onload=()=>{if(img.naturalWidth>0){el.classList.add('ready')}};img.onerror=()=>{};img.src=WAVE_URL}
function stateView(title,msg,action=''){return `<div class="state"><div class="state-mark">!</div><h1>${esc(title)}</h1><p>${esc(msg)}</p>${action}</div>`}
function loading(msg='Gegevens laden…'){return `<div class="state"><div class="spinner"></div><p>${esc(msg)}</p></div>`}
function set(html){app.innerHTML=html;initWave();bindCommon()}
function bindCommon(){document.querySelectorAll('[data-accordion]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.accordion;const panel=document.getElementById(id);const open=btn.getAttribute('aria-expanded')==='true';btn.setAttribute('aria-expanded',String(!open));panel?.classList.toggle('open',!open)}))}
