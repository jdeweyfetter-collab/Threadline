import {account,sameOrigin,response,failure,AccountError,ownMedia} from '@/lib/account';
import {db} from '@/db/store';
import {readPrivateData} from '@/db/private-data';
import {logIndividualWear} from '@/db/closet-repository';
export async function GET(req:Request){try{const user=await account(req);return response(await readPrivateData(user.id))}catch(e){return failure(e)}}
export async function POST(req:Request){try{const user=await account(req);sameOrigin(req);const p:any=await req.json();const d=db();
 if(p.action==='wear'){await logIndividualWear(user.id,{ownedId:p.id,date:new Date().toISOString().slice(0,10),notes:p.occasion||''});return response(await readPrivateData(user.id))}
 if(p.action!=='post')throw new AccountError('Use your private closet to manage garments. Prototype social actions are unavailable.',403);
 const ids=[...new Set<string>(Array.isArray(p.ownedIds)?p.ownedIds:[])];if(!ids.length||ids.length>20)throw new AccountError('Choose 1–20 garments from your closet.');
 const rows=[];for(const id of ids){if(typeof id!=='string')throw new AccountError('Invalid garment.');const item:any=await d.prepare('SELECT o.id,o.variantId,g.slot FROM owned o JOIN variants v ON o.variantId=v.id JOIN garments g ON v.garmentId=g.id WHERE o.id=? AND o.userId=?').bind(id,user.id).first();if(!item)throw new AccountError('Garment not found.',404);rows.push(item)}
 const media=typeof p.media==='string'?p.media:'';if(media&&!await ownMedia(media,user.id))throw new AccountError('Photo not found.',404);
 const id=crypto.randomUUID(),now=new Date().toISOString(),occasion=typeof p.occasion==='string'?p.occasion.slice(0,100):'Everyday';
 const statements=[d.prepare('INSERT INTO outfits (id,userId,caption,occasion,media,mediaType,created) VALUES (?,?,?,?,?,?,?)').bind(id,user.id,typeof p.caption==='string'?p.caption.slice(0,1500):'',occasion,media,p.mediaType==='video'?'video':'image',now)];
 for(const item of rows){statements.push(d.prepare('INSERT INTO outfitItems (id,outfitId,variantId,ownedId,slot) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),id,item.variantId,item.id,item.slot));if(p.logWear)statements.push(d.prepare('INSERT INTO wears (id,ownedId,outfitId,date,occasion,notes) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),item.id,id,now.slice(0,10),occasion,''))}await d.batch(statements);return response(await readPrivateData(user.id));
 }catch(e){return failure(e)}}
