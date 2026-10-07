import {env} from 'cloudflare:workers';
// Sites dispatch supplies identity headers. Public shell access must never expose the shared legacy wardrobe.
export function ownerAccess(req?:Request):Response|null{
 const owner=(env as unknown as Record<string,string>).THREADLING_OWNER_EMAIL;
 if(!owner)return Response.json({error:'Wardrobe access is being configured. Please try again shortly.'},{status:503,headers:{'Cache-Control':'no-store'}});
 const id=req?.headers.get('oai-authenticated-user-id'),email=req?.headers.get('oai-authenticated-user-email');
 if(!id||!email)return Response.json({error:'Sign in to open your wardrobe.',signIn:'/signin-with-chatgpt?return_to=/'},{status:401,headers:{'Cache-Control':'no-store'}});
 if(email.trim().toLowerCase()!==owner.trim().toLowerCase())return Response.json({error:'This wardrobe belongs to another account.'},{status:403,headers:{'Cache-Control':'no-store'}});
 return null;
}
