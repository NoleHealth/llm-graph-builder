# LLM Graph Builder - Integrated Setup

This setup integrates the LLM Graph Builder with your existing Neo4j container in the coremind-shared network.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │     Neo4j       │
│   (port 3000)   │◄──►│   (port 8000)   │◄──►│  (existing)     │
│                 │    │                 │    │  neo4j-graph-db │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                    ┌─────────────────┐
                    │ coremind-shared │
                    │    network      │
                    └─────────────────┘
```

## �� Quick Start

### Prerequisites ✅
- ✅ Neo4j 5.25 (your existing container)
- ✅ APOC plugin installed
- ✅ Docker and Docker Compose
- 🔑 OpenAI API key (recommended)

### 1. Set Your API Keys

Edit `backend/.env` and add your API keys:

```bash
# Required for most functionality
OPENAI_API_KEY = "sk-your-openai-api-key-here"

# Optional - for additional extraction features  
DIFFBOT_API_KEY = "your-diffbot-api-key-here"
```

### 2. Start the Services

```bash
# Make sure your Neo4j is running
cd /home/nole/dev/shared/docker/neo4j
docker compose ps  # Should show neo4j-graph-db as healthy

# Start LLM Graph Builder
cd /home/nole/dev/shared/docker/llm-graph-builder
docker compose -f docker-compose.integrated.yml up -d
```

### 3. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Neo4j Browser:** http://localhost:7474 (existing)

## 🔧 Configuration

### Backend Configuration (`backend/.env`)

Key settings you might want to modify:

```bash
# Neo4j Connection (pre-configured for your setup)
NEO4J_URI = "neo4j://neo4j-graph-db:7687"
NEO4J_USERNAME = "neo4j"
NEO4J_PASSWORD = "neo4j123"

# Embedding Model (no API key needed)
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# Performance tuning
NUMBER_OF_CHUNKS_TO_COMBINE = 6
MAX_TOKEN_CHUNK_SIZE = 2000
```

### Frontend Configuration (`frontend/.env`)

Key settings:

```bash
# Backend connection
VITE_BACKEND_API_URL="http://localhost:8000"

# Available models (matches backend config)
VITE_LLM_MODELS_PROD="openai_gpt_4o_mini,openai_gpt_4o,diffbot"

# Data sources
VITE_REACT_APP_SOURCES="local,youtube,wiki,s3,web"
```

## 🎯 Usage Guide

### 1. Connect to Neo4j
- The backend automatically connects to your existing Neo4j
- No manual connection setup needed!

### 2. Upload Documents
- **Local files:** PDF, DOC, TXT, etc.
- **YouTube:** Paste video URLs
- **Wikipedia:** Enter article names
- **Web pages:** Enter URLs

### 3. Generate Knowledge Graph
- Select your preferred LLM model
- Click "Generate Graph"
- Monitor progress in the UI

### 4. Explore Your Graph
- Use the built-in graph viewer
- Open in Neo4j Browser: http://localhost:7474
- Try the chat interface for Q&A

## 🛠️ Useful Commands

### Service Management
```bash
# Start services
docker compose -f docker-compose.integrated.yml up -d

# Stop services  
docker compose -f docker-compose.integrated.yml down

# View logs
docker compose -f docker-compose.integrated.yml logs -f

# Restart a specific service
docker compose -f docker-compose.integrated.yml restart backend
```

### Troubleshooting
```bash
# Check if Neo4j is accessible
docker run --rm --network coremind-shared curlimages/curl:latest \
  curl -f http://neo4j-graph-db:7474

# Check backend connectivity to Neo4j
docker exec llm-backend curl -f http://neo4j-graph-db:7474

# View backend logs
docker logs llm-backend

# View frontend logs  
docker logs llm-frontend
```

### Development
```bash
# Rebuild after code changes
docker compose -f docker-compose.integrated.yml build

# Run backend in development mode
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn score:app --reload --host 0.0.0.0 --port 8000

# Run frontend in development mode
cd frontend
npm install
npm run dev
```

## 🔍 Available LLM Models

Configure these in `backend/.env`:

### OpenAI Models (requires OPENAI_API_KEY)
- `openai_gpt_4o` - Latest GPT-4o (best quality)
- `openai_gpt_4o_mini` - GPT-4o Mini (faster, cheaper)
- `openai_gpt_3.5` - GPT-3.5 Turbo (budget option)

### Other Models
- `diffbot` - Diffbot NLP (requires DIFFBOT_API_KEY)
- Local models via Ollama (see original README)

## 📊 Data Sources

### Local Files
- PDF, DOC, DOCX, TXT, HTML
- Drag and drop or file picker

### YouTube Videos  
- Automatic transcript extraction
- Paste video URLs

### Wikipedia
- Enter article titles
- Automatic content extraction

### Web Pages
- Enter URLs for web scraping
- Supports most text-based content

### AWS S3 (optional)
- Configure AWS credentials in backend/.env
- Upload from S3 buckets

## 🧠 Chat Modes

Configure in `frontend/.env` via `VITE_CHAT_MODES`:

- **vector** - Semantic similarity search
- **graph** - Graph traversal queries  
- **graph+vector** - Combined approach (recommended)
- **hybrid** - Advanced hybrid search

## 🚨 Common Issues

### Backend can't connect to Neo4j
```bash
# Ensure Neo4j is running and healthy
docker compose -f ../neo4j/docker-compose.yml ps

# Check network connectivity
docker network inspect coremind-shared
```

### Frontend can't reach backend
```bash
# Verify backend is running
curl http://localhost:8000/health

# Check backend logs
docker logs llm-backend
```

### Out of memory errors
```bash
# Reduce chunk sizes in backend/.env
NUMBER_OF_CHUNKS_TO_COMBINE = 3
MAX_TOKEN_CHUNK_SIZE = 1000

# Increase Neo4j memory in ../neo4j/.env
NEO4J_HEAP_MAX=2G
NEO4J_PAGECACHE=1G
```

## 🔗 Integration Benefits

This integrated setup provides:

✅ **Shared Neo4j Database** - Both your existing apps and LLM Graph Builder use the same Neo4j
✅ **Network Integration** - All services on coremind-shared network  
✅ **Persistent Data** - Knowledge graphs persist in your existing Neo4j volumes
✅ **Resource Efficiency** - Single Neo4j instance for all graph data
✅ **Easy Management** - Independent service lifecycles

## �� Next Steps

1. **Add API Keys** - Get OpenAI API key for best results
2. **Upload Sample Data** - Try with a PDF or YouTube video  
3. **Explore Graph** - Use Neo4j Browser to explore generated graphs
4. **Try Chat** - Test the Q&A functionality
5. **Customize Models** - Configure additional LLM providers as needed

## 🆘 Support

- **LLM Graph Builder Issues:** https://github.com/neo4j-labs/llm-graph-builder/issues
- **Neo4j Documentation:** https://neo4j.com/docs/
- **APOC Documentation:** https://neo4j.com/labs/apoc/

Happy Graph Building! 🎉
