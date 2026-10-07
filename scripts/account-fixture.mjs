// Test-only Supabase Auth double. Application routes, cookies, SQL, and ownership run unchanged.
export function fakeAuth(){
 const people=new Map(),tokens=new Map();
 globalThis.fetch=async(url,options={})=>{const u=new URL(url);const p=options.body?JSON.parse(options.body):{};const bearer=options.headers?.Authorization?.slice(7);const user=tokens.get(bearer);const json=(d,s=200)=>Response.json(d,{status:s});
 const issue=u=>{const a=crypto.randomUUID(),r=crypto.randomUUID();tokens.set(a,u);tokens.set(r,u);return {access_token:a,refresh_token:r,expires_in:3600,user:u}};
 if(u.pathname.endsWith('/signup')){if(!people.has(p.email))people.set(p.email,{id:crypto.randomUUID(),email:p.email,password:p.password,email_confirmed_at:null});return json({confirmation_sent_at:new Date().toISOString()})}
 if(u.pathname.endsWith('/token')){if(u.searchParams.get('grant_type')==='refresh_token'){const found=tokens.get(p.refresh_token);return found?json(issue(found)):json({},401)}const found=people.get(p.email);if(!found||found.password!==p.password)return json({},401);if(!found.email_confirmed_at)return json({error_code:'email_not_confirmed'},401);return json(issue(found))}
 if(u.pathname.endsWith('/user'))return user?json(user):json({},401);
 if(u.pathname.endsWith('/logout'))return json({});throw Error('Unexpected auth request '+u.pathname);
 };
 return {confirm(email){const u=people.get(email);if(!u)throw Error('User missing');u.email_confirmed_at=new Date().toISOString()},people,tokens};
}
export async function createTestAccount(api,email='owner@test.invalid'){
 const headers={Origin:'http://test','Content-Type':'application/json'};
 const signup=await api.POST(new Request('http://test/api/account',{method:'POST',headers,body:JSON.stringify({action:'signup',email,password:'Test-password-123'})}));if(signup.status!==200)throw Error(await signup.text());
 globalThis.__fakeAuth.confirm(email);
 const login=await api.POST(new Request('http://test/api/account',{method:'POST',headers,body:JSON.stringify({action:'signin',email,password:'Test-password-123'})}));if(login.status!==200)throw Error(await login.text());
 return {Origin:'http://test',Cookie:login.headers.get('Set-Cookie').split(';')[0]};
}
