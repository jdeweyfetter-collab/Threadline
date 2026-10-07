import {ownMedia,AccountError} from '@/lib/account';
import {env} from 'cloudflare:workers';
import {db,initialize} from './store';
import {blankGarment,validateMetadata,validDate,normalizeCategory,withPhotos,garmentPhotos,type ClosetItem,type GarmentMetadata} from '@/lib/closet';
const legacyCategories:Record<string,string>={Shirts:'Tops','T-shirts':'Tops',Trousers:'Bottoms',Footwear:'Footwear',Knitwear:'Knitwear',Outerwear:'Outerwear',Accessories:'Accessories'};
export async function readCloset(userId:string){
 await initialize();const d=db();
 const result=await d.prepare('SELECT o.*,g.name AS modelName,g.category AS modelCategory,g.material AS modelMaterial,g.image AS modelImage,v.color AS modelColor,b.name AS modelBrand FROM owned o JOIN variants v ON o.variantId=v.id JOIN garments g ON v.garmentId=g.id LEFT JOIN brands b ON b.id=g.brandId WHERE o.userId=? ORDER BY o.created DESC,o.id').bind(userId).all();
 const items=result.results.map((r:any):ClosetItem=>{const catalog=JSON.parse(r.catalogData||'{}');const legacy=!catalog.category;const m=legacy?{...blankGarment(),name:r.modelName,category:legacyCategories[r.modelCategory]||'Other',brand:['Threadline study collection','Unidentified vintage'].includes(r.modelBrand)?'':r.modelBrand||'',size:r.size,materials:[r.modelMaterial],colors:[r.modelColor],purchasePrice:r.price,purchaseDate:r.purchased,condition:r.condition,measurements:r.measurements,notes:r.notes,photos:[r.image||r.modelImage].filter(Boolean)}:catalog;const normalized=withPhotos({...blankGarment(),...m,category:normalizeCategory(m.category)},garmentPhotos(m),m.primaryPhotoId);return {...normalized,id:r.id,variantId:r.variantId,created:r.created,legacy:/^o[1-8]$/.test(r.id)}});
 const wears=await d.prepare('SELECT w.id,w.ownedId,w.date,w.notes,w.occasion,w.outfitId FROM wears w JOIN owned o ON w.ownedId=o.id WHERE o.userId=? ORDER BY w.date DESC').bind(userId).all();return {items,events:wears.results};
}
async function checkPhotos(m:GarmentMetadata,existing:any,userId:string){
 const existingUrls=existing?JSON.parse(existing.catalogData||'{}').photos||[existing.image,existing.modelImage]:[];
 for(const url of m.photos){if(existingUrls.includes(url)&&url.startsWith('/images/'))continue;const match=url.match(/^\/api\/media\?key=(uploads\/[a-f0-9-]{36})$/);if(!match)throw Error('Upload a photograph before saving.');if(!await ownMedia(url,userId))throw new AccountError('One photograph is unavailable.',404);const object=await env.BUCKET?.head(match[1]);if(!object||!object.httpMetadata?.contentType?.startsWith('image/'))throw Error('One photograph is unavailable. Please upload it again.')}
}
export async function saveClosetItem(userId:string,raw:any,id?:string,requestId?:string){
 await initialize();const d=db();const metadata=validateMetadata(raw);
 const existing=id?await d.prepare('SELECT o.*,g.image AS modelImage FROM owned o JOIN variants v ON o.variantId=v.id JOIN garments g ON v.garmentId=g.id WHERE o.id=? AND o.userId=?').bind(id,userId).first():null;
 if(id&&!existing)throw new AccountError('This garment could not be found.',404);await checkPhotos(metadata,existing,userId);
 const now=new Date().toISOString();const resultId=id||requestId||crypto.randomUUID();if(!/^[a-zA-Z0-9-]{1,80}$/.test(resultId))throw Error('Invalid garment identifier.');
 if(existing){await d.prepare('UPDATE owned SET catalogData=?,image=?,size=?,price=?,purchased=?,condition=?,measurements=?,notes=? WHERE id=? AND userId=?').bind(JSON.stringify(metadata),metadata.photos[0],metadata.size,metadata.purchasePrice??0,metadata.purchaseDate,metadata.condition,metadata.measurements,metadata.notes,resultId,userId).run()}
 else{
 // Personal instance metadata is authoritative. Provisional links preserve older outfit compatibility only.
 const collision=await d.prepare('SELECT userId FROM owned WHERE id=?').bind(resultId).first<any>();if(collision&&collision.userId!==userId)throw new AccountError('This garment could not be found.',404);
 const gid='personal-'+resultId,vid=gid+'-variant';
 const slot=({Tops:'Upper body',Bottoms:'Lower body',Shoes:'Feet','Jackets / Outerwear':'Outer layer',Knitwear:'Outer layer',Accessories:'Accessories'} as Record<string,string>)[metadata.category]||'Upper body';
 await d.batch([
 d.prepare('INSERT OR IGNORE INTO garments (id,brandId,name,category,description,image,slot,material,construction,source,scope) VALUES (?,NULL,?,?,?,?,?,?,?,?,?)').bind(gid,metadata.name||'Unidentified garment',metadata.category,'Personal, unverified garment record.',metadata.photos[0],slot,'Unknown','Unknown','','personal'),
 d.prepare('INSERT OR IGNORE INTO variants (id,garmentId,name,color,era) VALUES (?,?,?,?,?)').bind(vid,gid,'Unidentified','Unknown','Unknown'),
 d.prepare('INSERT OR IGNORE INTO owned (id,userId,variantId,size,sizeSystem,price,purchased,condition,measurements,notes,image,visibility,catalogData,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(resultId,userId,vid,metadata.size,'Unspecified',metadata.purchasePrice??0,metadata.purchaseDate,metadata.condition,metadata.measurements,metadata.notes,metadata.photos[0],'Private',JSON.stringify(metadata),now)]);
 }
 return {id:resultId,...await readCloset(userId)};
}
export async function logIndividualWear(userId:string,raw:any){
 await initialize();const d=db();if(!raw||typeof raw.ownedId!=='string'||!validDate(raw.date||''))throw Error('Choose a valid wear date.');
 if(!await d.prepare('SELECT id FROM owned WHERE id=? AND userId=?').bind(raw.ownedId,userId).first())throw new AccountError('This garment could not be found.',404);
 const id=raw.requestId||crypto.randomUUID();if(typeof id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(id))throw Error('Invalid wear identifier.');
 const prior:any=await d.prepare('SELECT ownedId FROM wears WHERE id=?').bind(id).first();if(prior&&prior.ownedId!==raw.ownedId)throw new AccountError('Invalid wear identifier.',409);
 if(raw.notes!==undefined&&typeof raw.notes!=='string')throw Error('Wear note must be text.');
 await d.prepare('INSERT OR IGNORE INTO wears (id,ownedId,outfitId,date,occasion,notes) VALUES (?,?,NULL,?,?,?)').bind(id,raw.ownedId,raw.date,'Individual wear',(raw.notes||'').trim().slice(0,2000)).run();return readCloset(userId);
}
