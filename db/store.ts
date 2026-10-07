import { env } from 'cloudflare:workers';
import { seed } from '@/lib/seed';
export const tables=Object.keys(seed);
export function db(){if(!env.DB)throw new Error('Storage is temporarily unavailable.');return env.DB;}
export async function initialize(){
 const d=db();const present=await d.prepare('SELECT id FROM users WHERE id = ?').bind('me').first();if(present)return;
 const statements=[];for(const table of tables)for(const row of seed[table]){const keys=Object.keys(row);statements.push(d.prepare(`INSERT OR IGNORE INTO ${table} (${keys.join(',')}) VALUES (${keys.map(()=>'?').join(',')})`).bind(...keys.map(k=>row[k])))}
 // Single atomic seed batch avoids readers observing a half-initialized graph.
 await d.batch(statements);
}
export async function readAll(){await initialize();const results=await db().batch(tables.map(t=>db().prepare(`SELECT * FROM ${t}`)));return Object.fromEntries(tables.map((t,i)=>[t,results[i].results]));}
