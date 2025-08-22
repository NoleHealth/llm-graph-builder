# LLM Graph Builder Setup Instructions

This document provides step-by-step instructions for setting up the LLM Graph Builder with Neo4j integration after encountering common issues.

## Prerequisites

- Docker and Docker Compose installed
- Neo4j container running (separate container)
- Ports 3002 (frontend) and 8001 (backend) available

## Quick Start

### 1. Start Neo4j Container First
Ensure your Neo4j container is running and accessible:
```bash
cd /home/nole/dev/shared/docker/neo4j
docker compose up -d
```

Verify Neo4j is running:
```bash
docker ps | grep neo4j
# Should show: neo4j-graph-db container running on ports 7473-7474, 7687
```

### 2. Build and Start LLM Graph Builder
```bash
cd /home/nole/dev/shared/docker/llm-graph-builder
docker compose -f docker-compose.integrated.yml up --build -d
```

### 3. Verify Services
- **Frontend**: http://localhost:3002
- **Backend**: http://localhost:8001/health
- **Neo4j**: Should show connection to bolt://neo4j-graph-db:7687

## Common Issues and Solutions

### Issue 1: JavaScript Error "Cannot read properties of undefined (reading 'includes')"

**Root Cause**: Environment variables are undefined during frontend build, causing `.split()` or `.includes()` calls on undefined values.

**Solution Applied**:
1. **Enhanced Constants.ts** with defensive programming:
   ```typescript
   const safeEnvSplit = (envVar: string | undefined, defaultValue: string[]): string[] => {
     try {
       if (!envVar || envVar.trim() === '') {
         console.warn(`Environment variable is undefined or empty, using default:`, defaultValue);
         return defaultValue;
       }
       const result = envVar.split(',').map(item => item.trim()).filter(item => item.length > 0);
       console.log(`Successfully parsed environment variable:`, result);
       return result.length > 0 ? result : defaultValue;
     } catch (error) {
       console.error(`Error parsing environment variable:`, error);
       return defaultValue;
     }
   };
   ```

2. **Enhanced Error Boundary** in `ErrroBoundary.tsx`:
   - Added detailed error logging
   - Shows actual error messages to users
   - Detects environment variable related errors

### Issue 2: Network Error "ERR_NAME_NOT_RESOLVED" for llm-backend:8000

**Root Cause**: Frontend trying to connect to internal Docker hostname from browser.

**Solution Applied**:
1. **Updated docker-compose.integrated.yml**:
   ```yaml
   args:
     - VITE_BACKEND_API_URL=http://localhost:8001  # Changed from http://llm-backend:8000
   ```

2. **Enhanced Utils.ts** with proper fallback:
   ```typescript
   export const url = () => {
     let url = 'http://localhost:8001';  // Default fallback for browser access
     
     try {
       if (process.env.VITE_BACKEND_API_URL && process.env.VITE_BACKEND_API_URL.trim() !== '') {
         url = process.env.VITE_BACKEND_API_URL;
         console.log('Using VITE_BACKEND_API_URL:', url);
       }
     } catch (error) {
       console.error('Error processing VITE_BACKEND_API_URL:', error);
       console.log('Falling back to default URL:', url);
     }
     
     return !url || !url.match('/$') ? url : url.substring(0, url.length - 1);
   };
   ```

### Issue 3: Missing Backend API Endpoints

**Root Cause**: Frontend expects GET endpoints that didn't exist.

**Solution Applied**:
Added missing GET endpoints in `backend/score.py`:
```python
@app.get("/sources")
async def get_sources():
    sources = os.environ.get('VITE_REACT_APP_SOURCES', 'local,youtube,wiki,s3,web').split(',')
    return {"status": "Success", "data": [source.strip() for source in sources]}

@app.get("/llms_models")  
async def get_llm_models():
    env = os.environ.get('VITE_ENV', 'DEV')
    if env == 'PROD':
        models = os.environ.get('VITE_LLM_MODELS_PROD', 'openai_gpt_4o,openai_gpt_4o_mini,diffbot,gemini_1.5_flash').split(',')
    else:
        models = os.environ.get('VITE_LLM_MODELS', 'diffbot,openai_gpt_3.5,openai_gpt_4o').split(',')
    return {"status": "Success", "data": [model.strip() for model in models]}
```

### Issue 4: Docker Build Failures

**Root Cause**: Obsolete package names in Dockerfile.

**Solution Applied**:
Updated `backend/Dockerfile`:
```dockerfile
# Changed from libgl1-mesa-glx to libgl1-mesa-dri
RUN apt-get update && \
   apt-get install -y --no-install-recommends \
       libmagic1 \
       libgl1-mesa-dri \  # Fixed package name
       libreoffice \
       cmake \
       poppler-utils \
       tesseract-ocr && \
   apt-get clean && \
   rm -rf /var/lib/apt/lists/*
```

## Configuration

### Environment Variables (set in docker-compose.integrated.yml)

**Critical Variables**:
- `VITE_BACKEND_API_URL=http://localhost:8001` (for browser access)
- `VITE_REACT_APP_SOURCES=local,youtube,wiki,s3,web`
- `VITE_LLM_MODELS=diffbot,openai_gpt_3.5,openai_gpt_4o`
- `VITE_CHAT_MODES=vector,graph+vector,graph,fulltext`
- `VITE_SKIP_AUTH=true`

**Neo4j Connection** (backend container to Neo4j):
- `NEO4J_URI=neo4j://neo4j-graph-db:7687`
- `NEO4J_USERNAME=neo4j`
- `NEO4J_PASSWORD=neo4j123`
- `NEO4J_DATABASE=neo4j`

### Network Configuration

**Networks Used**:
- `neo4j-shared`: External network for Neo4j communication
- `llm-internal`: Internal network for frontend-backend communication

**Port Mapping**:
- Frontend: `3002:8080`
- Backend: `8001:8000`
- Neo4j: `7473-7474:7473-7474`, `7687:7687`

## Troubleshooting

### 1. Check Container Status
```bash
docker ps -a | grep -E "(llm|neo4j)"
```

### 2. Check Logs
```bash
# Frontend logs
docker logs llm-frontend --tail 20

# Backend logs  
docker logs llm-backend --tail 20

# Neo4j logs
docker logs neo4j-graph-db --tail 20
```

### 3. Test Connectivity
```bash
# Backend health
curl http://localhost:8001/health

# Backend endpoints
curl http://localhost:8001/sources
curl http://localhost:8001/llms_models

# Frontend loading
curl -I http://localhost:3002
```

### 4. Browser Console Debugging
Open browser console at http://localhost:3002 to see:
- Environment variable parsing logs
- Backend URL being used
- Any JavaScript errors with detailed stack traces

### 5. Common Error Messages and Solutions

**"Cannot read properties of undefined"**:
- Check browser console for environment variable warnings
- Rebuild frontend if needed

**"ERR_NAME_NOT_RESOLVED"**:
- Verify VITE_BACKEND_API_URL is set to `http://localhost:8001`
- Check docker-compose.integrated.yml configuration

**"Network Error"**:
- Ensure backend container is running: `docker ps | grep llm-backend`
- Test backend directly: `curl http://localhost:8001/health`

**"502 Bad Gateway"**:
- Backend container might be crashed, check logs
- Restart: `docker compose -f docker-compose.integrated.yml restart backend`

## File Modifications Made

### Key Files Modified:
1. `frontend/src/utils/Constants.ts` - Enhanced environment variable parsing
2. `frontend/src/utils/Utils.ts` - Fixed backend URL resolution
3. `frontend/src/components/UI/ErrroBoundary.tsx` - Enhanced error reporting
4. `backend/score.py` - Added missing GET endpoints  
5. `backend/Dockerfile` - Fixed obsolete package names
6. `docker-compose.integrated.yml` - Corrected VITE_BACKEND_API_URL

### Backup Strategy:
Before making changes, backup these files:
```bash
cp docker-compose.integrated.yml docker-compose.integrated.yml.backup
cp frontend/src/utils/Constants.ts frontend/src/utils/Constants.ts.backup
cp frontend/src/utils/Utils.ts frontend/src/utils/Utils.ts.backup
```

## Success Indicators

When everything is working correctly, you should see:
1. **Frontend loads** at http://localhost:3002 without JavaScript errors
2. **Neo4j connection** displayed: "Neo4j connection bolt://neo4j-graph-db:7687 / neo4j"
3. **Backend APIs** responding at http://localhost:8001/health
4. **Browser console** shows successful environment variable parsing
5. **All containers** in "Up" status with docker ps

## Notes for Future Updates

- Always use defensive programming for environment variables
- Test both browser console and server logs when troubleshooting
- Remember: browsers need `localhost:8001`, containers use `llm-backend:8000`
- Keep the enhanced error boundary and logging for easier debugging
- Environment variables are baked into the frontend build, so rebuild is needed for changes

---

**Last Updated**: August 2025  
**Tested With**: Docker Compose v2, Neo4j 5.x, Node 20