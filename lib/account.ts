import {env} from 'cloudflare:workers';
import {db,initialize} from '@/db/store';
export type Profile={user_id:string;display_name:string;username:string|null;avatar_url:string;bio:string;created_at:string};
export type Account={id:string;email:string};
export class AccountError extends Error{constructor(message:string,public status=400){super(message)}}
const COOKIE='__Host-threadling_session';
const settings=()=>env as unknown as Record<string,string>;
export const privateHeaders={'Cache-Control':'private, no-store','Vary':'Cookie'};
export function response(value:unknown,status=200,extra:Record<string,string>={}){return Response.json(value,{status,headers:{...privateHeaders,...extra}})}
export function failure(e:unknown){return response({error:e instanceof AccountError?e.message:'Something went wrong. Please try again.'},e instanceof AccountError?e.status:503)}
export function sameOrigin(req:Request){if(req.headers.get('origin')!==new URL(req.url).origin)throw new AccountError('Please submit this form from Threadling.',403)}
async function hash(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),v=>v.toString(16).padStart(2,'0')).join('')}
export async function authCall(path:string,body?:unknown,token?:string){
 const config=settings();if(!config.SUPABASE_URL||!config.SUPABASE_PUBLISHABLE_KEY)throw new AccountError('Account setup is not finished yet.',503);
 const r=await fetch(config.SUPABASE_URL+'/auth/v1'+path,{method:body===undefined?'GET':'POST',headers:{apikey:config.SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(12000)});
 const data:any=await r.json().catch(()=>({}));
 if(!r.ok){const code=data.error_code||data.code;if(code==='email_address_not_authorized'||code==='unexpected_failure')throw new AccountError('Email delivery is not configured yet. Please contact the site owner.',503);if(code==='email_not_confirmed')throw new AccountError('Confirm your email address before signing in.',401);if(r.status===429)throw new AccountError('Too many attempts. Please wait a few minutes and try again.',429);throw new AccountError('Unable to sign in. Check your email and password, or confirm your email first.',401)}
 return data;
}
function cookie(req:Request){return req.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||''}
export async function sessionHash(req:Request){const token=cookie(req);return /^[a-f0-9]{64}$/.test(token)?hash(token):null}
export const clearCookie=()=>`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
export async function establishSession(req:Request,tokens:any){
 if(!tokens.access_token||!tokens.refresh_token)throw new AccountError('Please confirm your email, then sign in.',401);
 const user=await authCall('/user',undefined,tokens.access_token);if(!user.id||!user.email_confirmed_at)throw new AccountError('Confirm your email before signing in.',401);
 await initialize();const d=db();
 await d.prepare('INSERT OR IGNORE INTO users (id,name,bio) VALUES (?,?,?)').bind(user.id,'','').run();
 const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');
 const old=await sessionHash(req);const expiry=Date.now()+30*86400000;
 await d.batch([d.prepare('DELETE FROM account_sessions WHERE expires_at < ? OR id=?').bind(Date.now(),old||''),d.prepare('INSERT INTO account_sessions (id,user_id,access_token,refresh_token,token_expires_at,expires_at) VALUES (?,?,?,?,?,?)').bind(await hash(token),user.id,tokens.access_token,tokens.refresh_token,Date.now()+(tokens.expires_in||3600)*1000,expiry)]);
 return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`;
}
export async function account(req:Request):Promise<Account>{
 const id=await sessionHash(req);if(!id)throw new AccountError('Sign in to open your wardrobe.',401);
 const d=db();const session:any=await d.prepare('SELECT * FROM account_sessions WHERE id=? AND expires_at>?').bind(id,Date.now()).first();if(!session)throw new AccountError('Your session has ended. Please sign in again.',401);
 let access=session.access_token;
 if(session.token_expires_at<Date.now()+30000){const tokens=await authCall('/token?grant_type=refresh_token',{refresh_token:session.refresh_token});access=tokens.access_token;await d.prepare('UPDATE account_sessions SET access_token=?,refresh_token=?,token_expires_at=? WHERE id=?').bind(access,tokens.refresh_token,Date.now()+tokens.expires_in*1000,id).run()}
 const user=await authCall('/user',undefined,access);if(user.id!==session.user_id||!user.email_confirmed_at)throw new AccountError('Please sign in again.',401);
 // Recheck after network validation so a concurrent logout cannot resurrect a session.
 if(!await d.prepare('SELECT id FROM account_sessions WHERE id=?').bind(id).first())throw new AccountError('Please sign in again.',401);
 return {id:user.id,email:user.email};
}
export async function signOut(req:Request){const id=await sessionHash(req);if(!id)return;const s:any=await db().prepare('SELECT access_token FROM account_sessions WHERE id=?').bind(id).first();await db().prepare('DELETE FROM account_sessions WHERE id=?').bind(id).run();if(s)await authCall('/logout?scope=local',{},s.access_token).catch(()=>{});}
export async function ownMedia(url:string,userId:string){const key=url.match(/^\/api\/media\?key=(uploads\/[a-f0-9-]{36})$/)?.[1];return !!key&&!!await db().prepare('SELECT key FROM media_owners WHERE key=? AND user_id=?').bind(key,userId).first()}
