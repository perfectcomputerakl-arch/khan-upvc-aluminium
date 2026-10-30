const $=id=>document.getElementById(id);
const defaults={
 aluminium:{profiles:[["Economy Series",280],["Standard Series",360],["Premium Series",470],["Heavy Series",590]],glass:[["Clear",95],["Tinted",135],["Reflective",165],["Frosted",150],["Toughened",260],["Double Glazed (DGU)",520]]},
 upvc:{profiles:[["60mm Standard",480],["70mm Premium",620],["Multi-chamber Heavy",760]],glass:[["Clear",95],["Tinted",135],["Reflective",165],["Frosted",150],["Toughened",260],["Double Glazed (DGU)",520]]}
};
let rates=JSON.parse(localStorage.getItem('khanRates')||'null')||{
 aluminium: {profiles:[280,360,470,590],glass:[95,135,165,150,260,520]},
 upvc:{profiles:[480,620,760],glass:[95,135,165,150,260,520]},
 mesh:85,hardware:450,lock:550,installation:75,transport:500,wastage:0.08,partitionFrameless:320
};
const fmt=n=>'₹ '+Math.round(n).toLocaleString('en-IN');
function fillOptions(){
 const m=$('material').value,p=$('profile'),g=$('glass');
 p.innerHTML=defaults[m].profiles.map((x,i)=>`<option value="${i}">${x[0]} — ₹${rates[m].profiles[i]}/sq.ft.</option>`).join('');
 g.innerHTML=defaults[m].glass.map((x,i)=>`<option value="${i}">${x[0]} — ₹${rates[m].glass[i]}/sq.ft.</option>`).join('');
}
function getPanels(){let v=$('panels').value;if(v!=='Auto')return +v;let t=$('tracks').value;return t==='3'?3:t==='2'?2:1}
function render(){
 const product=$('product').value,mat=$('material').value,w=Math.max(.5,+$('width').value||.5),h=Math.max(.5,+$('height').value||.5),area=w*h;
 const track=$('tracks').value,panels=getPanels(),profile=+$('profile').value,glass=+$('glass').value,thick=+$('thickness').value;
 const isPart=product==='partition',style=$('partitionStyle').value;
 $('trackWrap').classList.toggle('hidden',product==='partition');
 $('partitionOptions').classList.toggle('hidden',!isPart);
 const label=product==='window'?'Window':product==='door'?'Door':'Partition';
 const trackName=track==='fixed'?'Fixed':track==='casement'?'Casement':track+' Track Sliding';
 $('previewTitle').textContent=(isPart?'Framed / Frameless ':trackName+' ')+mat.toUpperCase()+' '+label;
 $('widthLabel').textContent=w+' ft';$('heightLabel').textContent=h+' ft';$('areaLabel').textContent=area.toFixed(2)+' sq.ft.';
 drawPreview(w,h,product,track,panels,mat);
 // Illustrative estimating formula; rates can be edited in Rate Master.
 const perimeter=2*(w+h),profileRate=rates[mat].profiles[profile]||0,glassRate=(rates[mat].glass[glass]||0)*(thick/5);
 const profileCost=area*profileRate*(product==='door'?1.18:1)*(track==='3'?1.22:track==='2'?1.10:1);
 const glassCost=area*glassRate;
 const hardwareCost=$('lock').checked?rates.lock*(product==='partition'?0:product==='door'?1.35:1):0;
 const meshCost=$('mesh').checked&&product==='window'?area*rates.mesh:0;
 const frameAccessories=perimeter*(mat==='upvc'?85:65)+hardwareCost;
 const partitionExtra=isPart&&style==='toughened'?area*rates.partitionFrameless:0;
 const wastage=(profileCost+glassCost)*rates.wastage;
 const install=$('installation').checked?area*rates.installation:0;
 const transport=$('transport').checked?rates.transport:0;
 const subtotal=profileCost+glassCost+frameAccessories+meshCost+partitionExtra+wastage+install+transport;
 const qty=Math.max(1,+$('qty').value||1),total=subtotal*qty;
 $('total').textContent=fmt(total);$('perUnit').textContent='Per unit: '+fmt(subtotal);
 const rows=[['Profile / frame material',profileCost],['Glass ('+defaults[mat].glass[glass][0]+', '+thick+'mm)',glassCost],['Accessories & hardware',frameAccessories],['Mosquito mesh',meshCost],['Partition glass system extra',partitionExtra],['Wastage ('+Math.round(rates.wastage*100)+'%)',wastage],['Installation',install],['Transportation',transport]];
 $('breakdown').innerHTML=rows.filter(r=>r[1]>0).map(r=>`<div class="break-row"><span>${r[0]}</span><b>${fmt(r[1]*qty)}</b></div>`).join('')+`<div class="break-row"><span>Quantity</span><b>${qty}</b></div><div class="break-row total-row"><span>Grand total (estimate)</span><b>${fmt(total)}</b></div>`;
 window.currentEstimate={product,label,mat,w,h,area,track:trackName,profile:defaults[mat].profiles[profile][0],glass:defaults[mat].glass[glass][0],thick,panels,qty,total,subtotal};
}
function drawPreview(w,h,product,track,panels,mat){
 const svg=$('productPreview'),frame=mat==='upvc'?'#f5f7f4':'#687b82',stroke=mat==='upvc'?'#9aa9a5':'#344f5c';
 let x=85,y=45,bw=430,bh=315;
 let count=product==='partition'?Math.max(1,panels):track==='3'?3:track==='2'?2:1;
 let panes='';
 for(let i=0;i<count;i++){
  let pw=bw/count,xx=x+i*pw;
  panes+=`<rect x="${xx+7}" y="${y+7}" width="${pw-14}" height="${bh-14}" fill="#b9d8d9" stroke="${stroke}" stroke-width="5"/><path d="M${xx+15} ${y+bh-20} L${xx+pw-15} ${y+20}" stroke="#ffffff" stroke-opacity=".45" stroke-width="3"/>`;
  if(track==='casement'||product==='door')panes+=`<circle cx="${xx+pw-22}" cy="${y+bh/2}" r="5" fill="#53666d"/>`;
 }
 let mullions='';for(let i=1;i<count;i++)mullions+=`<line x1="${x+i*bw/count}" y1="${y}" x2="${x+i*bw/count}" y2="${y+bh}" stroke="${stroke}" stroke-width="8"/>`;
 let bottom=track==='3'?`<line x1="${x}" y1="${y+bh-9}" x2="${x+bw}" y2="${y+bh-9}" stroke="${stroke}" stroke-width="4"/>`:'';
 svg.innerHTML=`<defs><linearGradient id="glass" x2="1" y2="1"><stop stop-color="#e1f2ee"/><stop offset="1" stop-color="#76a9b1"/></linearGradient></defs><ellipse cx="300" cy="390" rx="220" ry="17" fill="#dce8e5"/><rect x="${x-12}" y="${y-12}" width="${bw+24}" height="${bh+24}" rx="2" fill="${frame}" stroke="${stroke}" stroke-width="6"/>${panes.replaceAll('#b9d8d9','url(#glass)')}${mullions}${bottom}<line x1="${x}" y1="${y+bh+35}" x2="${x+bw}" y2="${y+bh+35}" stroke="#5c7a80" stroke-width="1"/><path d="M${x} ${y+bh+30}v10 M${x+bw} ${y+bh+30}v10" stroke="#5c7a80"/><text x="300" y="415" text-anchor="middle" font-size="12" fill="#587078">${w} ft × ${h} ft • ${count} panel(s)</text>`;
}
function buildRateEditor(){
 let html='';
 for(const m of ['aluminium','upvc']){
  defaults[m].profiles.forEach((p,i)=>html+=`<label>${m.toUpperCase()} ${p[0]} (₹/sq.ft.)<input type="number" min="0" id="r_${m}_p${i}" value="${rates[m].profiles[i]}"></label>`);
  defaults[m].glass.forEach((g,i)=>html+=`<label>${m.toUpperCase()} ${g[0]} glass (₹/sq.ft.)<input type="number" min="0" id="r_${m}_g${i}" value="${rates[m].glass[i]}"></label>`);
 }
 [['mesh','Mosquito mesh (₹/sq.ft.)'],['hardware','Accessories reference (₹)'],['lock','Lock & handle set (₹)'],['installation','Installation (₹/sq.ft.)'],['transport','Transportation (₹/job)'],['wastage','Wastage (decimal, e.g. 0.08)'],['partitionFrameless','Frameless partition extra (₹/sq.ft.)']].forEach(([k,t])=>html+=`<label>${t}<input type="number" step="${k==='wastage'?'0.01':'1'}" min="0" id="r_${k}" value="${rates[k]}"></label>`);
 $('rateGrid').innerHTML=html;
}
function saveRates(){
 for(const m of ['aluminium','upvc']){
  defaults[m].profiles.forEach((p,i)=>rates[m].profiles[i]=Math.max(0,+$('r_'+m+'_p'+i).value||0));
  defaults[m].glass.forEach((g,i)=>rates[m].glass[i]=Math.max(0,+$('r_'+m+'_g'+i).value||0));
 }
 ['mesh','hardware','lock','installation','transport','wastage','partitionFrameless'].forEach(k=>rates[k]=Math.max(0,+$('r_'+k).value||0));
 localStorage.setItem('khanRates',JSON.stringify(rates));$('savedMsg').textContent='Rates saved in this browser ✓';fillOptions();render();
}
['product','material','width','height','tracks','profile','glass','thickness','panels','partitionStyle','mesh','lock','installation','transport','qty'].forEach(id=>$(id).addEventListener('input',()=>{if(id==='material')fillOptions();render()}));
$('calculate').addEventListener('click',render);$('saveRates').addEventListener('click',saveRates);
$('defaultRates').addEventListener('click',()=>{localStorage.removeItem('khanRates');location.reload()});
$('resetBtn').addEventListener('click',()=>{ $('product').value='window';$('material').value='aluminium';$('width').value=4;$('height').value=3;$('tracks').value='2';$('thickness').value='5';$('panels').value='Auto';$('qty').value=1;$('mesh').checked=false;$('lock').checked=true;$('installation').checked=true;$('transport').checked=false;fillOptions();render()});
$('printBtn').addEventListener('click',()=>window.print());
$('whatsappBtn').addEventListener('click',()=>{let e=window.currentEstimate;let msg=`Assalamualaikum, KHAN UPVC & Aluminium ke liye enquiry:%0AProduct: ${e.label}%0AMaterial: ${e.mat}%0ASize: ${e.w} ft x ${e.h} ft%0AConfiguration: ${e.track}%0AProfile: ${e.profile}%0AGlass: ${e.glass} ${e.thick}mm%0AQuantity: ${e.qty}%0AEstimated total: ${fmt(e.total)}%0AKripya final quotation share karein.`;window.open('https://wa.me/917875867861?text='+msg,'_blank')});
$('year').textContent=new Date().getFullYear();fillOptions();buildRateEditor();render();
