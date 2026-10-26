import { getAnalytics } from "@/lib/azure-devops";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(){ try { return Response.json(await getAnalytics(),{headers:{"Cache-Control":"s-maxage=120, stale-while-revalidate=600"}}); } catch(error){ console.error(error); return Response.json({error:error instanceof Error?error.message:"Unknown error"},{status:500}); } }
