const mapping: Record<string,string> = {
  "MG Operation":"MG Operation", "MG Operation BL Extractor Agent":"MG Operation", "MGOperationCustomizations":"MG Operation", "OperationBackend":"MG Operation",
  "MG Supply":"MG Supply", "MGSupplyV2":"MG Supply", "MGSupplyBackEnd":"MG Supply",
  "IST":"IST", "D365FO":"D365FO", "Mesco Portal":"MG Portal",
  "D365FOMiddleware_ClientSide":"Middleware", "D365FOMiddleware_Nestbackend":"Middleware", "D365FO_FreeTextinvoiceIntegration":"Middleware", "Tax Portal Middleware":"Middleware"
};
export function priorityGroup(projectName:string){ return mapping[projectName] ?? "Other projects"; }
