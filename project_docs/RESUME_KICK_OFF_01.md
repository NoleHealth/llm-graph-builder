# LLM Graph Builder Frontend Error - Developer Handoff Document

**Date:** July 28, 2025  
**Project:** Neo4j LLM Graph Builder Integration  
**Status:** Backend Functional, Frontend Runtime Error  
**Next Developer:** Continue troubleshooting frontend JavaScript runtime error

## Current Problem Statement

The LLM Graph Builder application has been successfully deployed with Docker Compose, and the backend API is fully functional and connected to Neo4j. However, the frontend displays a generic error page with "Something went wrong - Sorry there was a problem loading this page" despite the React application loading initially.

### Browser Console Error (Primary Issue)

```javascript
TypeError: Cannot read properties of undefined (reading 'includes')
    at index-456c5005.js:324:23008
    at Array.map (<anonymous>)
    at index-456c5005.js:324:22758
    at Object.useMemo (index-456c5005.js:38:23365)
    at Yi.useMemo (index-456c5005.js:9:6253)
    at rF (index-456c5005.js:324:22729)
```

This suggests that some configuration array or string that the frontend expects to be defined is `undefined`, and the code is trying to call `.includes()` on it.

## Infrastructure Overview

### Current Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│    Backend      │────│     Neo4j       │
│ (nginx:alpine)  │    │  (Python/FastAPI) │    │ (neo4j:2025.06.2)│
│ Port: 3002      │    │  Port: 8001     │    │ Ports: 7474,7687│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Network Configuration

- **Neo4j**: Connected to `coremind-shared` + `neo4j_neo4j-internal`
- **Backend**: Connected to `coremind-shared` + `llm-graph-builder_llm-internal`
- **Frontend**: Connected to `llm-graph-builder_llm-internal` only

**⚠️ POTENTIAL ISSUE**: Mixed network topology may be causing communication problems.

## Completed Troubleshooting Steps

### 1. Fixed Backend-Frontend Communication ✅

**Problem**: Frontend was configured to connect to `localhost:8001` instead of the Docker service name.

**Solution Applied**:

```bash
# Changed frontend/.env from:
VITE_BACKEND_API_URL="http://localhost:8001"
# To:
VITE_BACKEND_API_URL="http://llm-backend:8000"
```

**Result**: Backend API communication now works correctly.

### 2. Fixed Neo4j APOC Configuration ✅

**Problem**: Neo4j was blocking APOC procedures with sandbox restrictions.

**Solution Applied**:

```yaml
# Added to neo4j/docker-compose.yml:
- NEO4J_dbms_security_procedures_unrestricted=gds.*,apoc.*
```

**Result**: Backend can now successfully connect to Neo4j and run APOC queries.

### 3. Verified Service Health ✅

**Backend Status**:

```bash
curl http://localhost:8001/health
# Returns: {"healthy":true}

curl -X POST http://localhost:8001/backend_connection_configuration
# Returns: {"status":"Success","data":{"connection":"true"},...}
```

**Neo4j Status**: ✅ Healthy and accessible  
**Container Communication**: ✅ Inter-service networking functional

## Current Environment Configuration

### Frontend Environment Variables

```bash
VITE_BACKEND_API_URL="http://llm-backend:8000"
VITE_REACT_APP_SOURCES="local,youtube,wiki,s3,web"
VITE_LLM_MODELS="diffbot,openai_gpt_3.5,openai_gpt_4o"
VITE_ENV="DEV"
VITE_SKIP_AUTH=true
# ... (see frontend/.env for complete list)
```

### Backend Environment Variables

```bash
NEO4J_URI=bolt://neo4j-graph-db:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=neo4j123
NEO4J_DATABASE=neo4j
```

### Neo4j Configuration

```yaml
NEO4J_AUTH=neo4j/neo4j123
NEO4J_dbms_security_procedures_unrestricted=gds.*,apoc.*
# APOC plugin enabled and unrestricted
```

## Key Files and Locations

### Project Structure

```
/home/nole/dev/shared/docker/
├── neo4j/
│   ├── docker-compose.yml          # Neo4j service configuration
│   └── .env                        # Neo4j environment variables
└── llm-graph-builder/
    ├── docker-compose.integrated.yml # Main application stack
    ├── frontend/
    │   ├── .env                    # Frontend build-time variables
    │   └── nginx/                  # Nginx configuration templates
    ├── backend/
    │   └── .env                    # Backend runtime variables
    └── project_docs/               # This documentation
```

### Service Endpoints

- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:8001
- **Neo4j Browser**: http://localhost:7474
- **Backend Health**: http://localhost:8001/health
- **Backend API Docs**: http://localhost:8001/docs

## Suspected Root Causes

### 1. Network Configuration Issue (HIGH PRIORITY)

The mixed network topology where backend connects to both `coremind-shared` and the internal LLM network, while frontend only connects to the internal network, may be causing routing or DNS resolution issues.

### 2. Frontend Environment Variable Missing/Malformed (HIGH PRIORITY)

The JavaScript error suggests that `VITE_REACT_APP_SOURCES` or similar configuration array is undefined. The frontend expects:

```javascript
// Somewhere in the code, this is likely failing:
someConfigArray.includes("something"); // TypeError if someConfigArray is undefined
```

### 3. Build-time vs Runtime Environment Variables (MEDIUM PRIORITY)

Vite environment variables are embedded at build time. If the frontend was built with different environment variables than what's currently configured, a rebuild is required.

## Next Steps for Developer

### Immediate Actions (Priority Order)

1. **Test Network Configuration**

   ```bash
   # Remove coremind-shared network from backend temporarily
   # Edit docker-compose.integrated.yml and remove coremind-shared from backend networks
   # Test if this resolves the frontend error
   ```

2. **Investigate Frontend Environment Variables**

   ```bash
   # Check what environment variables are actually embedded in the build
   docker exec llm-frontend cat /usr/share/nginx/html/index.html
   # Look for embedded VITE_ variables in the JavaScript files
   ```

3. **Force Frontend Rebuild**

   ```bash
   # If environment variables are incorrect, rebuild frontend
   docker compose -f docker-compose.integrated.yml build --no-cache frontend
   docker compose -f docker-compose.integrated.yml up -d
   ```

4. **Debug JavaScript Runtime**
   ```bash
   # Access browser dev tools on http://localhost:3002
   # Look for network failures in Network tab
   # Check if API calls to backend are successful
   ```

### Debugging Commands

```bash
# Check container networking
docker network ls
docker network inspect llm-graph-builder_llm-internal
docker network inspect coremind-shared

# Check environment variables in containers
docker exec llm-frontend env | grep VITE_
docker exec llm-backend env | grep NEO4J

# Check API connectivity from frontend container
docker exec llm-frontend curl -v http://llm-backend:8000/health

# Rebuild and restart services
cd /home/nole/dev/shared/docker/llm-graph-builder
docker compose -f docker-compose.integrated.yml down
docker compose -f docker-compose.integrated.yml build --no-cache
docker compose -f docker-compose.integrated.yml up -d

# Monitor logs
docker compose -f docker-compose.integrated.yml logs -f frontend
docker compose -f docker-compose.integrated.yml logs -f backend
```

### Files to Examine

1. **Frontend Configuration**:

   - `frontend/.env`
   - `frontend/vite.config.ts`
   - `frontend/src/` (source code)

2. **Docker Configuration**:

   - `docker-compose.integrated.yml`
   - `frontend/Dockerfile`

3. **Nginx Configuration**:
   - `frontend/nginx/nginx.local.conf`

## Testing Checklist

- [ ] Remove `coremind-shared` network from backend and test
- [ ] Verify frontend environment variables are correctly embedded
- [ ] Check browser Network tab for failed API requests
- [ ] Verify JavaScript console errors point to specific missing configuration
- [ ] Test frontend rebuild with current environment configuration
- [ ] Validate that all required VITE\_ environment variables are defined
- [ ] Check if frontend can successfully load initial configuration from backend

## Success Criteria

✅ **Backend API functional** - Complete  
✅ **Neo4j connectivity** - Complete  
🔄 **Frontend loads without JavaScript errors** - In Progress  
🔄 **Frontend can display UI and interact with backend** - Pending

## Repository Information

- **Repository**: shared-docker-stacks (NoleHealth)
- **Branch**: main
- **Last Working Commit**: Current (backend functionality confirmed)
- **Environment**: Development/Docker Compose

## Contact Information

Previous developer completed backend integration and Neo4j configuration successfully. The infrastructure is solid, and the issue appears to be frontend-specific configuration or network-related.
