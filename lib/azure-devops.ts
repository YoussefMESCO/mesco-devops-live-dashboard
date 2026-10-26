import { priorityGroup } from "./priority";
const organization = process.env.AZURE_DEVOPS_ORGANIZATION || "MescoMBDTeam";
const pat = process.env.AZURE_DEVOPS_PAT;
const base = `https://dev.azure.com/${organization}`;
function headers(){ if(!pat) throw new Error("AZURE_DEVOPS_PAT is not configured"); return { Authorization:`Basic ${Buffer.from(`:${pat}`).toString("base64")}`, "Content-Type":"application/json" }; }
async function ado(url:string, init?:RequestInit){ const r=await fetch(url,{...init,headers:{...headers(),...(init?.headers||{})},cache:"no-store"}); if(!r.ok) throw new Error(`Azure DevOps ${r.status}: ${await r.text()}`); return r.json(); }
function stateClass(state="", tags=""){
  const s=state.toLowerCase(), t=tags.toLowerCase();
  if(t.includes("blocked")) return "blocked";
  if(["closed","done","completed","resolved"].includes(s)) return "completed";
  if(["active","committed","in progress","doing"].includes(s)) return "active";
  if(["removed","cancelled","canceled"].includes(s)) return "cancelled";
  return "planned";
}
function splitTags(value?:string){ return value ? value.split(";").map(x=>x.trim()).filter(Boolean) : []; }
export async function getAnalytics(){
  const projectsPayload=await ado(`${base}/_apis/projects?$top=1000&api-version=7.1`);
  const projects=await Promise.all(projectsPayload.value.map(async (project:any)=>{
    const projectUrl=`${base}/${encodeURIComponent(project.name)}`;
    const wiql=await ado(`${projectUrl}/_apis/wit/wiql?$top=20000&api-version=7.1`,{method:"POST",body:JSON.stringify({query:`SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = '${String(project.name).replaceAll("'","''")}' ORDER BY [System.Id]`})});
    const ids=(wiql.workItems||[]).map((x:any)=>x.id);
    const items:any[]=[];
    for(let i=0;i<ids.length;i+=200){
      const batch=await ado(`${projectUrl}/_apis/wit/workitemsbatch?api-version=7.1`,{method:"POST",body:JSON.stringify({ids:ids.slice(i,i+200),errorPolicy:"Omit",fields:["System.Id","System.Title","System.WorkItemType","System.State","System.AssignedTo","System.Tags","System.ChangedDate","System.AreaPath","System.IterationPath","Microsoft.VSTS.Common.Priority"]})});
      items.push(...(batch.value||[]));
    }
    const counts={completed:0,active:0,planned:0,cancelled:0,blocked:0}; const ownerCount=new Map<string,number>(); const tagSet=new Set<string>(); let updated="";
    for(const item of items){ const f=item.fields||{}; const c=stateClass(f["System.State"],f["System.Tags"]); counts[c as keyof typeof counts]++;
      const owner=f["System.AssignedTo"]?.displayName || f["System.AssignedTo"] || "Unassigned"; ownerCount.set(owner,(ownerCount.get(owner)||0)+1);
      splitTags(f["System.Tags"]).forEach(x=>tagSet.add(x)); const changed=f["System.ChangedDate"]||""; if(changed>updated) updated=changed;
    }
    const owner=[...ownerCount.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0] || "Unassigned";
    return { id:project.id,name:project.name,group:priorityGroup(project.name),total:items.length,...counts,owner,tags:[...tagSet].sort(),updated:updated||"No work items",url:`${projectUrl}/_workitems`,workItems:items.map((item:any)=>{const f=item.fields||{};return {id:item.id,project:project.name,title:f["System.Title"]||"",type:f["System.WorkItemType"]||"",state:f["System.State"]||"",status:stateClass(f["System.State"],f["System.Tags"]),owner:f["System.AssignedTo"]?.displayName||f["System.AssignedTo"]||"Unassigned",tags:splitTags(f["System.Tags"]),changedDate:f["System.ChangedDate"]||null,areaPath:f["System.AreaPath"]||"",iterationPath:f["System.IterationPath"]||"",priority:f["Microsoft.VSTS.Common.Priority"]||null,url:`${projectUrl}/_workitems/edit/${item.id}`};})};
  }));
  return {organization,generatedAt:new Date().toISOString(),projects,workItems:projects.flatMap((x:any)=>x.workItems)};
}
