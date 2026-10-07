export const dynamic='force-dynamic';
export async function GET(){return Response.json({configured:!!process.env.SUPABASE_URL,url:process.env.SUPABASE_URL||'',key:process.env.SUPABASE_PUBLISHABLE_KEY||''})}
