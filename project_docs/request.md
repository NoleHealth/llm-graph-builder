# fix 2 docker containers

1. `neo4j` folder: Neo4j Graph Database Docker Setup
    READ `https://neo4j.com/docs/operations-manual/current/docker/introduction/`
    APOC is required for the second container: `https://neo4j.com/labs/apoc/`
2. `llm-graph-builder` folder: LLM Knowledge Graph Builder

    READ `https://github.com/neo4j-labs/llm-graph-builder`

3. The prior dev left this for you: `llm-graph-builder/project_docs/RESUME_KICK_OFF_01.md`.
    - The mention of `coremind-shared` may be inacurate. That should be removed from the equation.
    - The front end is only displaying "There was a problem" type of message

I am trying to get this setup in my docker engine / wsl environment.
There are several other containers running taking popular ports.
You need to evaluate the environment. Ensure no ports or other resources will conflict.

use fetch, context7 mcp tool, and or the gitingest-mcp mcp tool to find the up to date best practices to 

**Diagnose and fix the Neo4j < - > LLM Knowledge Graph Builder docker setup correctly.**

Execute the diagnosis, repair, and validation with full autonomous development.

Create and maintain document(s) in the `llm-graph-builder/project_docs` folder summarizing your diagnosis, fix.

Create a "User Guide" document
    Include common docker commands and operational guidelings for both Neo4j and LLM Knowledge Graph Builder

Create a "Neo4j - Claude Code Integration" document
    Keep this document high-level.
    Consider it as making an argument for or against detailing key points
        example: rate of benifit vs rate of increased maintenance.
    explore your thoughts on how Neo4j graph(s) could be used to optimize information retrieval and token managment within the claude code cli (you).
        - Product Framework rules and guides
        - Feature Requirements
        - Source Code Map Index
        - others?

    Consider custom sub-agents: `https://docs.anthropic.com/en/docs/claude-code/sub-agents`

    Consider available Neo4j MCP Tools: `https://neo4j.com/developer/genai-ecosystem/model-context-protocol-mcp/#neo4j`

    
