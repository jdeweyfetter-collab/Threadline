import {account,authCall,establishSession,signOut,clearCookie,sameOrigin,response,failure,AccountError} from '@/lib/account';
import {db} from '@/db/store';
async function rateLimit(req:Request,email:string){
 const ip=req.headers.get('cf-connecting-ip')||'unknown';const now=Date.now();const window=Math.floor(now/600000);
 for(const value of ['ip:'+ip,'email:'+email.toLowerCase()]){const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),v=>v.toString(16).padStart(2,'0')).join('');const key=window+':'+digest;
 const row:any=await db().prepare('INSERT INTO auth_attempts (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,now+600000).first();if(row.count>20)throw new AccountError('Too many attempts. Please wait ten minutes.',429)}
 await db().prepare('DELETE FROM auth_attempts WHERE expires_at<?').bind(now).run();
}
export async function GET(req:Request){try{const user=await account(req);return response(user)}catch(e){return failure(e)}}
export async function POST(req:Request){try{
 sameOrigin(req);const p:any=await req.json();
 if(p.action==='signout'){await signOut(req);return response({ok:true},200,{'Set-Cookie':clearCookie()})}
 if(p.action==='signin'||p.action==='signup'){
 const email=typeof p.email==='string'?p.email.trim():'';const password=typeof p.password==='string'?p.password:'';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw new AccountError('Enter a valid email address.');
 if(password.length<8||password.length>128)throw new AccountError('Use a password between 8 and 128 characters.');await rateLimit(req,email);
 const result=await authCall(p.action==='signup'?'/signup?redirect_to='+encodeURIComponent(new URL(req.url).origin+'/'):'/token?grant_type=password',{email,password});
 if(p.action==='signup'&&!result.access_token)return response({confirmationRequired:true,message:'Check your email to confirm your account, then return here to sign in.'});
 return response({ok:true},200,{'Set-Cookie':await establishSession(req,result)});
 }
 throw new AccountError('Unknown account action.');
 }catch(e){return failure(e)}}
