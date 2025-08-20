# Neo4j + LLM Graph Builder - User Guide

**Last Updated:** July 28, 2025  
**Environment:** WSL2/Windows 11  
**Status:** Production Ready ✅

## 🚀 Quick Start

### Prerequisites
- Docker Desktop with WSL2 backend enabled
- Windows 11 with WSL2 support
- Minimum 8GB RAM allocated to WSL2
- OpenAI API Key (recommended for best results)

### 30-Second Startup
```bash
# Navigate to project directory
cd /home/nole/dev/shared/docker

# Start Neo4j database
cd neo4j && docker compose up -d

# Start LLM Graph Builder  
cd ../llm-graph-builder && docker compose -f docker-compose.integrated.yml up -d

# Access the application
# Frontend: http://localhost:3002
# Neo4j Browser: http://localhost:7474
```

## 🏗️ Architecture Overview

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │     Neo4j       │
│ React + Nginx   │◄──►│ Python/FastAPI  │◄──►│ Graph Database  │
│ Port: 3002      │    │ Port: 8001      │    │ Ports: 7474,7687│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Service Endpoints
- **🌐 Frontend:** http://localhost:3002 - Main application interface
- **🔗 Backend API:** http://localhost:8001 - REST API and health checks  
- **🗄️ Neo4j Browser:** http://localhost:7474 - Database management interface
- **⚡ Neo4j Bolt:** bolt://localhost:7687 - Direct database connections

## 📋 Common Docker Commands

### Service Management

#### Start All Services
```bash
# Full stack startup (recommended order)
cd /home/nole/dev/shared/docker/neo4j
docker compose up -d

cd /home/nole/dev/shared/docker/llm-graph-builder  
docker compose -f docker-compose.integrated.yml up -d
```

#### Stop All Services
```bash
# Stop LLM Graph Builder first
cd /home/nole/dev/shared/docker/llm-graph-builder
docker compose -f docker-compose.integrated.yml down

# Stop Neo4j
cd /home/nole/dev/shared/docker/neo4j
docker compose down
```

#### Restart Individual Services
```bash
# Restart specific service
docker compose restart neo4j          # Neo4j database
docker compose restart llm-backend    # Backend API
docker compose restart llm-frontend   # Frontend web server
```

#### View Service Status
```bash
# Check all containers
docker ps | grep -E "(neo4j|llm-)"

# Detailed service information
docker compose ps                     # In service directory
docker stats neo4j-graph-db          # Resource usage
```

### Log Management

#### View Live Logs
```bash
# All services (combined)
docker compose logs -f

# Individual services
docker logs -f neo4j-graph-db        # Neo4j database
docker logs -f llm-backend           # Backend API
docker logs -f llm-frontend          # Frontend web server

# Last N lines only  
docker logs --tail=50 neo4j-graph-db
```

#### Search Logs
```bash
# Search for specific patterns
docker logs neo4j-graph-db 2>&1 | grep -i "error"
docker logs llm-backend 2>&1 | grep -i "exception"

# Export logs to file
docker logs neo4j-graph-db > neo4j_logs.txt
```

### Maintenance Commands

#### Update Images
```bash
# Pull latest images
docker compose pull

# Rebuild custom images
docker compose build --no-cache

# Update and restart
docker compose up -d --build
```

#### Clean Up Resources
```bash
# Remove stopped containers
docker container prune -f

# Remove unused images  
docker image prune -f

# Remove unused networks
docker network prune -f

# Full cleanup (be careful!)
docker system prune -af
```

#### Backup and Restore
```bash
# Create Neo4j backup
docker exec neo4j-graph-db neo4j-admin database dump neo4j --to-path=/backups/

# Copy backup from container
docker cp neo4j-graph-db:/backups/neo4j.dump ./neo4j-backup.dump

# Restore from backup (container must be stopped)
docker cp ./neo4j-backup.dump neo4j-graph-db:/backups/
docker exec neo4j-graph-db neo4j-admin database load neo4j --from-path=/backups/neo4j.dump --overwrite-destination
```

## 🔧 Configuration Management

### Environment Variables

#### Backend Configuration (`llm-graph-builder/backend/.env`)
```bash
# Neo4j Connection
NEO4J_URI=bolt://neo4j-graph-db:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=neo4j123
NEO4J_DATABASE=neo4j

# LLM API Keys (add your own)
OPENAI_API_KEY=sk-your-openai-api-key-here
DIFFBOT_API_KEY=your-diffbot-api-key-here

# Performance Tuning
EMBEDDING_MODEL=all-MiniLM-L6-v2
NUMBER_OF_CHUNKS_TO_COMBINE=6
MAX_TOKEN_CHUNK_SIZE=2000

# Optional: Tracing and Monitoring
LANGCHAIN_TRACING_V2=TRUE
LANGCHAIN_PROJECT=llm-graph-builder
LANGCHAIN_API_KEY=your-langchain-api-key
```

#### Frontend Configuration (`llm-graph-builder/frontend/.env`)
```bash
# Backend Connection
VITE_BACKEND_API_URL=http://llm-backend:8000

# Available Features
VITE_REACT_APP_SOURCES=local,youtube,wiki,s3,web
VITE_LLM_MODELS=diffbot,openai_gpt_3.5,openai_gpt_4o
VITE_CHAT_MODES=vector,graph+vector,graph,hybrid

# UI Configuration
VITE_SKIP_AUTH=true
VITE_ENV=DEV
VITE_BATCH_SIZE=2
VITE_CHUNK_SIZE=5242880
```

#### Neo4j Configuration (`neo4j/.env`)
```bash
# Authentication
NEO4J_AUTH=neo4j/neo4j123

# Memory Settings (adjust for your system)
NEO4J_HEAP_INITIAL=512m
NEO4J_HEAP_MAX=1G
NEO4J_PAGECACHE=512m

# APOC Plugin Settings (already configured)
NEO4J_dbms_security_procedures_unrestricted=gds.*,apoc.*
```

### Port Configuration

#### Default Ports
```bash
# External (accessible from Windows host)
3002    # Frontend web interface
7474    # Neo4j HTTP browser
7687    # Neo4j Bolt protocol
8001    # Backend REST API

# Internal (container-to-container only)  
8000    # Backend internal port
8080    # Frontend internal port
```

#### Changing Ports (if conflicts occur)
```yaml
# In docker-compose.yml files, modify port mappings:
ports:
  - "NEW_PORT:INTERNAL_PORT"

# Example: Change frontend from 3002 to 3005
ports:
  - "3005:8080"
```

## 🧪 Health Checks and Monitoring

### Service Health Endpoints

#### Quick Health Check
```bash
# All services health check
curl -s http://localhost:8001/health && echo " ✅ Backend OK"
curl -s http://localhost:7474 > /dev/null && echo " ✅ Neo4j OK"  
curl -s http://localhost:3002 > /dev/null && echo " ✅ Frontend OK"
```

#### Detailed Backend Status
```bash
# Comprehensive backend health check
curl -X POST http://localhost:8001/backend_connection_configuration | jq '.'

# Expected response:
{
  "status": "Success",
  "data": {
    "connection": "true",
    "write_access": true,
    "gds_status": false,
    "uri": "bolt://neo4j-graph-db:7687"
  }
}
```

#### Neo4j Database Status
```bash
# Connect to Neo4j and run basic queries
docker exec neo4j-graph-db cypher-shell -u neo4j -p neo4j123 << 'EOF'
// Show database information
CALL db.info() YIELD name, value RETURN name, value LIMIT 10;

// Check APOC availability  
SHOW PROCEDURES YIELD name WHERE name CONTAINS 'apoc' RETURN count(name) as apoc_count;

// Show current data  
MATCH (n) RETURN labels(n) as labels, count(n) as count ORDER BY count DESC LIMIT 10;
EOF
```

### Performance Monitoring

#### Resource Usage
```bash
# Container resource usage
docker stats --no-stream neo4j-graph-db llm-backend llm-frontend

# Disk usage
docker system df

# Network usage
docker network ls
docker network inspect neo4j-shared
```

#### WSL2 System Resources
```bash
# WSL2 memory usage
cat /proc/meminfo | grep -E "(MemTotal|MemAvailable|MemFree)"

# Disk space
df -h /

# CPU usage
top -bn1 | grep -E "(load average|Cpu)"
```

## 📚 User Operations Guide

### Using the LLM Graph Builder

#### 1. **Access the Application**
1. Open browser to http://localhost:3002
2. Application should load without login (authentication disabled)
3. Main interface shows data source options

#### 2. **Configure API Keys** (First Time Setup)
1. Add your OpenAI API key to `backend/.env`
2. Restart backend: `docker compose restart llm-backend`
3. Verify connection in the UI settings

#### 3. **Upload Documents**
```bash
# Supported formats:
- PDF files (documents, research papers)
- DOC/DOCX files (Microsoft Word documents)  
- TXT files (plain text)
- YouTube videos (paste URLs)
- Wikipedia articles (enter article names)
- Web pages (paste URLs)
```

#### 4. **Generate Knowledge Graphs**
1. Select your uploaded files
2. Choose LLM model (OpenAI GPT-4o recommended)  
3. Configure extraction settings (optional)
4. Click "Generate Graph"
5. Monitor progress in real-time

#### 5. **Explore Generated Graphs**
- **In-App Viewer:** Built-in graph visualization
- **Neo4j Browser:** http://localhost:7474 for advanced queries
- **Chat Interface:** Ask questions about your data

### Chat Modes Explained

#### **Vector Mode**
- Semantic similarity search
- Best for: Finding related concepts
- Use case: "Find documents similar to this topic"

#### **Graph Mode**  
- Graph traversal and relationship queries
- Best for: Understanding connections
- Use case: "How are these entities connected?"

#### **Graph+Vector Mode** (Recommended)
- Combines both approaches
- Best for: Comprehensive search
- Use case: General question answering

#### **Hybrid Mode**
- Advanced multi-modal search
- Best for: Complex queries
- Use case: Research and analysis tasks

### Troubleshooting Common Issues

#### **Frontend Shows "Something went wrong"**
```bash
# Check backend connectivity
curl http://localhost:8001/health

# Restart frontend with logs
docker compose restart llm-frontend
docker logs -f llm-frontend
```

#### **Backend Can't Connect to Neo4j**
```bash
# Verify Neo4j is running
docker logs neo4j-graph-db --tail=10

# Test connection manually
docker exec llm-backend ping neo4j-graph-db

# Check network connectivity
docker network inspect neo4j-shared
```

#### **APOC Procedures Not Available**
```bash
# Check APOC installation
docker exec neo4j-graph-db ls -la /var/lib/neo4j/plugins/

# Verify APOC version matches Neo4j
docker logs neo4j-graph-db | grep -i apoc

# Should see: apoc-2025.06.2-core.jar (matches Neo4j 2025.06.2)
```

#### **Out of Memory Errors**
```bash
# Check WSL2 memory allocation
wsl --status

# Increase WSL2 memory in .wslconfig (Windows user directory)
[wsl2]
memory=8GB

# Adjust Neo4j memory settings in neo4j/.env
NEO4J_HEAP_MAX=2G
NEO4J_PAGECACHE=1G
```

#### **Port Conflicts**
```bash
# Find processes using ports
netstat -tulnp | grep -E "(3002|7474|7687|8001)"

# Kill conflicting processes (be careful)
sudo kill -9 <PID>

# Or change ports in docker-compose.yml files
```

## 🔐 Security Considerations

### Production Deployment

#### **Change Default Passwords**
```bash
# Neo4j authentication (in neo4j/.env)
NEO4J_AUTH=neo4j/your-secure-password

# Update backend configuration accordingly
NEO4J_PASSWORD=your-secure-password
```

#### **Enable Authentication**
```bash  
# Frontend authentication (in frontend/.env)
VITE_SKIP_AUTH=false
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
```

#### **Network Security**
```bash
# Restrict external access (bind to localhost only)
ports:
  - "127.0.0.1:7474:7474"  # Neo4j HTTP
  - "127.0.0.1:3002:8080"  # Frontend
```

#### **SSL/TLS Configuration**
```bash
# Add SSL certificates to nginx configuration
# Update frontend/nginx/nginx.local.conf
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

## 📊 Performance Tuning

### WSL2 Optimization

#### **System Configuration**
```bash
# Windows .wslconfig file (C:\Users\<username>\.wslconfig)
[wsl2]
memory=8GB
processors=4
swap=2GB
localhostForwarding=true
```

#### **Docker Desktop Settings**
- Resources → Memory: 6GB minimum
- Resources → CPU: 4 cores recommended  
- Resources → Disk: 64GB minimum
- Features → WSL2 Integration: Enabled

### Neo4j Performance

#### **Memory Tuning** (for larger datasets)
```bash
# neo4j/.env - adjust based on available RAM
NEO4J_HEAP_INITIAL=1G
NEO4J_HEAP_MAX=4G  
NEO4J_PAGECACHE=2G

# For WSL2, keep total under 70% of allocated memory
```

#### **Query Optimization**
```cypher
// Create indexes for better performance
CREATE INDEX FOR (n:Document) ON (n.id);
CREATE INDEX FOR (n:Entity) ON (n.name);
CREATE TEXT INDEX FOR (n:Chunk) ON (n.text);
```

### Backend Performance

#### **Python/FastAPI Tuning**
```bash
# backend/.env - processing optimization
NUMBER_OF_CHUNKS_TO_COMBINE=3        # Reduce for low memory
MAX_TOKEN_CHUNK_SIZE=1000            # Smaller chunks for speed
UPDATE_GRAPH_CHUNKS_PROCESSED=10     # More frequent updates
```

#### **Concurrent Processing**
```bash
# Docker resource limits (in docker-compose.yml)
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '2.0'
```

## 🚀 Advanced Usage

### Custom LLM Models

#### **Adding New Models**
```bash
# Add model configuration to backend/.env
LLM_MODEL_CONFIG_custom_model="model_name,api_key_env_var"

# Update frontend model list
VITE_LLM_MODELS="existing_models,custom_model"

# Restart services
docker compose restart llm-backend llm-frontend
```

#### **Local Models (Ollama)**
```bash
# Install Ollama separately
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# Configure in backend/.env
LLM_MODEL_CONFIG_ollama_llama3="llama3,http://host.docker.internal:11434"
```

### Data Import/Export

#### **Bulk Data Import**
```bash
# Copy files to Neo4j import directory
docker cp /path/to/data.csv neo4j-graph-db:/var/lib/neo4j/import/

# Import via Cypher
docker exec neo4j-graph-db cypher-shell -u neo4j -p neo4j123 << 'EOF'
LOAD CSV WITH HEADERS FROM 'file:///data.csv' AS row
CREATE (n:Document {title: row.title, content: row.content});
EOF
```

#### **Graph Export**  
```bash
# Export to JSON
curl -X POST http://localhost:8001/export/graph -o graph_export.json

# Export Neo4j dump
docker exec neo4j-graph-db neo4j-admin database dump neo4j --to-path=/backups/
docker cp neo4j-graph-db:/backups/neo4j.dump ./
```

### Integration with External Tools

#### **Jupyter Notebooks**
```python
# Connect to Neo4j from Jupyter
from neo4j import GraphDatabase

driver = GraphDatabase.driver("bolt://localhost:7687", 
                             auth=("neo4j", "neo4j123"))

# Query example
with driver.session() as session:
    result = session.run("MATCH (n) RETURN count(n) as total_nodes")
    print(f"Total nodes: {result.single()['total_nodes']}")
```

#### **API Integration**
```bash
# Backend API examples
curl -X GET "http://localhost:8001/docs"           # API documentation
curl -X POST "http://localhost:8001/upload"        # File upload
curl -X GET "http://localhost:8001/files"          # List files  
curl -X POST "http://localhost:8001/chat"          # Chat interface
```

## 📞 Support and Maintenance

### Regular Maintenance Tasks

#### **Weekly**
- Check container logs for errors
- Monitor disk space usage
- Update API keys if needed
- Backup important graphs

#### **Monthly**  
- Update Docker images
- Clean up unused containers/images
- Review performance metrics
- Update documentation

#### **Quarterly**
- Security audit and password updates
- Performance optimization review
- Dependency updates
- Disaster recovery testing

### Getting Help

#### **Documentation Resources**
- **Neo4j Docs:** https://neo4j.com/docs/
- **APOC Guide:** https://neo4j.com/labs/apoc/
- **LLM Graph Builder:** https://github.com/neo4j-labs/llm-graph-builder
- **Docker Docs:** https://docs.docker.com/

#### **Community Support**
- **Neo4j Community:** https://community.neo4j.com/
- **GitHub Issues:** https://github.com/neo4j-labs/llm-graph-builder/issues
- **Stack Overflow:** Tags: neo4j, docker, llm-graph-builder

#### **Professional Support**
- **Neo4j Support:** For enterprise deployments
- **Docker Support:** For containerization issues
- **OpenAI Support:** For API-related questions

---

**Guide Version:** 1.0  
**Last Updated:** July 28, 2025  
**Next Review:** August 28, 2025