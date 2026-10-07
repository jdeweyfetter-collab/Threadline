import {db} from './store';
// Legacy prototype compatibility: every private collection is scoped before serialization.
export async function readPrivateData(userId:string){
 const d=db();const queries:Record<string,[string,unknown[]]>={
 users:['SELECT * FROM users WHERE id=?',[userId]],
 owned:['SELECT * FROM owned WHERE userId=?',[userId]],
 outfits:['SELECT * FROM outfits WHERE userId=?',[userId]],
 outfitItems:['SELECT i.* FROM outfitItems i JOIN outfits o ON i.outfitId=o.id WHERE o.userId=?',[userId]],
 wears:['SELECT w.* FROM wears w JOIN owned o ON w.ownedId=o.id WHERE o.userId=?',[userId]],
 garments:["SELECT g.* FROM garments g WHERE g.scope='canonical' OR EXISTS (SELECT 1 FROM owned o JOIN variants v ON o.variantId=v.id WHERE v.garmentId=g.id AND o.userId=?)",[userId]],
 variants:["SELECT v.* FROM variants v JOIN garments g ON v.garmentId=g.id WHERE g.scope='canonical' OR EXISTS (SELECT 1 FROM owned o WHERE o.variantId=v.id AND o.userId=?)",[userId]],
 collections:['SELECT * FROM collections WHERE userId=?',[userId]],
 collectionItems:['SELECT i.* FROM collectionItems i JOIN collections c ON i.collectionId=c.id WHERE c.userId=?',[userId]],
 };
 const result:Record<string,any>={};for(const [key,[sql,args]] of Object.entries(queries))result[key]=(await d.prepare(sql).bind(...args).all()).results;
 for(const key of ['brands','authorities','stores','editorials'])result[key]=(await d.prepare(`SELECT * FROM ${key}`).all()).results;
 for(const key of ['follows','comments','reactions','listings','suggestions'])result[key]=[];
 return result;
}
