import {env} from 'cloudflare:workers';
import {account,sameOrigin,response,failure,ownMedia,AccountError,type Profile} from '@/lib/account';
import {db} from '@/db/store';
async function read(userId:string){return await db().prepare('SELECT * FROM profiles WHERE user_id=?').bind(userId).first<Profile>()}
function ownRequest(req:Request,userId:string){const requested=new URL(req.url).searchParams.get('user_id');if(requested&&requested!==userId)throw new AccountError('Profile not found.',404)}
export async function GET(req:Request){try{const user=await account(req);ownRequest(req,user.id);return response({profile:await read(user.id),email:user.email})}catch(e){return failure(e)}}
export async function POST(req:Request){try{
 const user=await account(req);sameOrigin(req);ownRequest(req,user.id);const raw=await req.json();if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new AccountError('Enter your profile details.');const p=raw as Record<string,unknown>;
 if(p.user_id!==undefined&&p.user_id!==user.id)throw new AccountError('Profile not found.',404);
 if(typeof p.display_name!=='string'||!p.display_name.trim()||p.display_name.trim().length>80)throw new AccountError('Enter a display name between 1 and 80 characters.');
 const name=p.display_name.trim();const username=typeof p.username==='string'?p.username.trim().toLowerCase():'';
 if(username&&!/^[a-z0-9_]{3,30}$/.test(username))throw new AccountError('Use 3–30 letters, numbers, or underscores for your handle.');
 if(typeof p.avatar_url!=='string')throw new AccountError('Choose a profile photo or leave it empty.');
 if(p.avatar_url){if(!await ownMedia(p.avatar_url,user.id))throw new AccountError('Photo not found.',404);const key=new URL(p.avatar_url,req.url).searchParams.get('key')!;const image=await env.BUCKET?.head(key);if(!image||!['image/jpeg','image/png','image/webp'].includes(image.httpMetadata?.contentType||''))throw new AccountError('Choose a JPEG, PNG, or WebP photo.');}
 try{await db().prepare("INSERT INTO profiles (user_id,display_name,username,avatar_url,bio,created_at) VALUES (?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET display_name=excluded.display_name,username=excluded.username,avatar_url=excluded.avatar_url").bind(user.id,name,username||null,p.avatar_url,'',new Date().toISOString()).run()}catch(e){if(/UNIQUE constraint failed: profiles.username/i.test(String(e)))throw new AccountError('That handle is unavailable. Choose another.',409);throw e}
 return response({profile:await read(user.id),email:user.email});
 }catch(e){return failure(e)}}
