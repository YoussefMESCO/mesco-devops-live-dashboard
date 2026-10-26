# MESCO DevOps Live Dashboard

Next.js + TypeScript dashboard that retrieves every Azure DevOps project, queries its work items with WIQL, loads details in batches of 200, and supports filtering by group, owner/task manager, and tag.

## Security
Never commit a PAT. Create a new organization-scoped, read-only PAT with `Project and Team: Read` and `Work Items: Read`. Store it only in `.env.local` and Vercel Environment Variables.

## Local setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Vercel
Import the GitHub repository, then add `AZURE_DEVOPS_ORGANIZATION` and `AZURE_DEVOPS_PAT` under Project Settings > Environment Variables. Deploy again after adding variables.

## Production recommendation
The included PAT integration is the fastest deployment path. For long-term production, replace it with Microsoft Entra OAuth or a service principal.
