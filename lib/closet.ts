export const categories=['Tops','Bottoms','Jackets / Outerwear','Shoes','Dresses','Accessories'] as const;
export const extraCategories=['Knitwear','Activewear','Underwear & sleepwear','Other'] as const;
export type Category=typeof categories[number]|typeof extraCategories[number];
export const categoryOptions=[
 {label:'Tops',value:'Tops'},
 {label:'Bottoms',value:'Bottoms'},
 {label:'Outerwear',value:'Jackets / Outerwear'},
 {label:'Dresses / One-pieces',value:'Dresses'},
 {label:'Footwear',value:'Shoes'},
 {label:'Accessories',value:'Accessories'},
 {label:'Activewear',value:'Activewear'},
 {label:'Other',value:'Other'},
] as const;
export function normalizeCategory(value:string){return ({Outerwear:'Jackets / Outerwear',Footwear:'Shoes','Dresses / One-pieces':'Dresses','Dresses & jumpsuits':'Dresses'} as Record<string,string>)[value]||value}
export type GarmentPhoto={id:string;url:string;kind:'garment'|'label'|'detail'|'worn'|'product'|'other'};
export type GarmentMetadata={name:string;category:string;subcategory:string;brand:string;colors:string[];pattern:string;size:string;materials:string[];purchasePrice:number|null;purchaseDate:string;source:string;condition:string;seasons:string[];styles:string[];fit:string;measurements:string;country:string;era:string;notes:string;photos:string[];photoAssets?:GarmentPhoto[];primaryPhotoId?:string};
export type ClosetItem=GarmentMetadata&{id:string;variantId:string;created:string;legacy:boolean};
export type WearEvent={id:string;ownedId:string;date:string;notes:string;occasion?:string;outfitId?:string|null};
export type ClosetData={items:ClosetItem[];events:WearEvent[]};
export const blankGarment=():GarmentMetadata=>({name:'',category:'',subcategory:'',brand:'',colors:[],pattern:'',size:'',materials:[],purchasePrice:null,purchaseDate:'',source:'',condition:'',seasons:[],styles:[],fit:'',measurements:'',country:'',era:'',notes:'',photos:[],photoAssets:[],primaryPhotoId:''});
export function photoId(url:string){let hash=2166136261;for(let i=0;i<url.length;i++)hash=Math.imul(hash^url.charCodeAt(i),16777619);return 'photo-'+(hash>>>0).toString(16)}
export function garmentPhotos(item:Pick<GarmentMetadata,'photos'|'photoAssets'>):GarmentPhoto[]{return item.photos.map(url=>item.photoAssets?.find(p=>p.url===url)||{id:photoId(url),url,kind:'garment'})}
export function primaryPhoto(item:Pick<GarmentMetadata,'photos'|'photoAssets'|'primaryPhotoId'>){return garmentPhotos(item).find(p=>p.id===item.primaryPhotoId)?.url||item.photos[0]||''}
export function withPhotos(item:GarmentMetadata,assets:GarmentPhoto[],primaryId?:string):GarmentMetadata{const id=assets.some(p=>p.id===primaryId)?primaryId:assets[0]?.id||'';const ordered=[...assets].sort((a,b)=>Number(b.id===id)-Number(a.id===id));return {...item,photoAssets:ordered,photos:ordered.map(p=>p.url),primaryPhotoId:id}}
export function displayName(item:Pick<GarmentMetadata,'name'|'category'|'subcategory'>){return item.name.trim()||item.subcategory||({Tops:'Untitled top',Bottoms:'Untitled bottoms','Jackets / Outerwear':'Untitled jacket',Shoes:'Untitled shoes',Dresses:'Untitled dress',Accessories:'Untitled accessory'} as Record<string,string>)[normalizeCategory(item.category)]||'Untitled garment'}
export function todayLocal(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function dateLabel(date:string){return new Date(date.slice(0,10)+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
export function money(value:number|null){return value===null?'Not available':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value)}
export function calculateCostPerWear(price:number|null,count:number):number|null{return price===null||!Number.isFinite(price)||price<0||count<=0?null:price/count}
export function wearStats(item:Pick<ClosetItem,'id'|'purchasePrice'>,events:WearEvent[]){const history=events.filter(e=>e.ownedId===item.id).sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));return {count:history.length,lastWorn:history[0]?.date||null,costPerWear:calculateCostPerWear(item.purchasePrice,history.length),history}}
export function indexWears(events:WearEvent[]){const map=new Map<string,WearEvent[]>();for(const e of events){const list=map.get(e.ownedId)||[];list.push(e);map.set(e.ownedId,list)}for(const list of map.values())list.sort((a,b)=>b.date.localeCompare(a.date));return map}
export function normalizeSearchQuery(q:string){return q.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
export function matchesItem(item:ClosetItem,q:string){const hay=normalizeSearchQuery([item.name,item.category,item.subcategory,item.brand,item.colors.join(' '),item.pattern,item.size,item.materials.join(' '),item.styles.join(' '),item.seasons.join(' '),item.notes,item.source,item.fit,item.era,item.country].join(' '));return normalizeSearchQuery(q).split(' ').filter(Boolean).every(t=>hay.includes(t))}
export type ClosetFilters={query:string;category:string;color:string;material:string;season:string;sort:string};
export function filterCloset(items:ClosetItem[],events:WearEvent[],f:ClosetFilters){const byWear=indexWears(events);const summary=new Map(items.map(i=>{const h=byWear.get(i.id)||[];return [i.id,{count:h.length,last:h[0]?.date||'',cost:calculateCostPerWear(i.purchasePrice,h.length)}]}));return items.filter(i=>(!f.category||normalizeCategory(i.category)===f.category)&&matchesItem(i,f.query)&&(!f.color||i.colors.includes(f.color))&&(!f.material||i.materials.includes(f.material))&&(!f.season||i.seasons.includes(f.season))).sort((a,b)=>{const x=summary.get(a.id)!,y=summary.get(b.id)!;if(f.sort==='name')return displayName(a).localeCompare(displayName(b));if(f.sort==='wears')return y.count-x.count;if(f.sort==='least')return x.count-y.count;if(f.sort==='last')return y.last.localeCompare(x.last);if(f.sort==='cost'){if(x.cost===null)return y.cost===null?0:1;if(y.cost===null)return -1;return x.cost-y.cost}return b.created.localeCompare(a.created)||b.id.localeCompare(a.id)})}
export function validDate(value:string){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number(value.slice(0,4))>=1900&&Number(value.slice(0,4))<=2100&&!Number.isNaN(Date.parse(value))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value}
export function validateMetadata(raw:any):GarmentMetadata{
 if(!raw||typeof raw!=='object')throw Error('Your garment details are missing.');
 let result=blankGarment();
 for(const key of ['name','category','subcategory','brand','pattern','size','purchaseDate','source','condition','fit','measurements','country','era','notes'] as const){if(raw[key]!==undefined&&typeof raw[key]!=='string')throw Error(`Check the ${key} field.`);result[key]=(raw[key]||'').trim().slice(0,key==='notes'?4000:500)}
 for(const key of ['colors','materials','seasons','styles','photos'] as const){if(!Array.isArray(raw[key])||raw[key].length>(key==='photos'?8:30)||raw[key].some((v:any)=>typeof v!=='string'))throw Error(`Check your ${key}.`);result[key]=[...new Set<string>(raw[key].map((v:string)=>v.trim().slice(0,key==='photos'?200:80)).filter(Boolean))]}
 result.category=normalizeCategory(result.category);if(!result.category)throw Error('Select a garment category.');
 if(!result.photos.length)throw Error('Add at least one photograph.');
 if(raw.photoAssets!==undefined){if(!Array.isArray(raw.photoAssets)||raw.photoAssets.length>8)throw Error('Check your photo gallery.');const ids=new Set<string>();result.photoAssets=raw.photoAssets.map((p:any)=>{if(!p||typeof p.id!=='string'||!/^[-a-zA-Z0-9]{1,80}$/.test(p.id)||ids.has(p.id)||!result.photos.includes(p.url))throw Error('Check your photo gallery.');ids.add(p.id);return {id:p.id,url:p.url,kind:['garment','label','detail','worn','product','other'].includes(p.kind)?p.kind:'garment'}})}
 const assets=garmentPhotos(result);if(raw.primaryPhotoId&&!assets.some(p=>p.id===raw.primaryPhotoId))throw Error('Choose an available primary photo.');result=withPhotos(result,assets,raw.primaryPhotoId);
 if(raw.purchasePrice===''||raw.purchasePrice===undefined||raw.purchasePrice===null)result.purchasePrice=null;else{if(typeof raw.purchasePrice!=='number'||!Number.isFinite(raw.purchasePrice)||raw.purchasePrice<0||raw.purchasePrice>1000000)throw Error('Enter a valid purchase price, or leave it blank.');result.purchasePrice=raw.purchasePrice}
 if(result.purchaseDate&&!validDate(result.purchaseDate))throw Error('Enter a valid purchase date.');return result;
}
