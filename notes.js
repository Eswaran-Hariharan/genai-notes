// Manifest of all notes. Order defines nav + prev/next.
// stars: difficulty/importance (0-3), group: landing-page section.
window.NOTES = [
  { file: "notes/01-ai-genai-fundamentals.md",           num: "01", title: "AI & GenAI Fundamentals",            stars: 0, group: "Foundations" },
  { file: "notes/02-llm-fundamentals.md",                num: "02", title: "LLM Fundamentals",                   stars: 0, group: "Foundations" },
  { file: "notes/03-transformers.md",                    num: "03", title: "Transformers",                       stars: 0, group: "Foundations" },
  { file: "notes/04-prompt-engineering.md",              num: "04", title: "Prompt Engineering",                 stars: 0, group: "Foundations" },
  { file: "notes/05-embeddings.md",                      num: "05", title: "Embeddings",                         stars: 0, group: "Foundations" },
  { file: "notes/06-rag-fundamentals.md",                num: "06", title: "RAG Fundamentals",                   stars: 1, group: "Retrieval (RAG)" },
  { file: "notes/07-advanced-rag.md",                    num: "07", title: "Advanced RAG",                       stars: 1, group: "Retrieval (RAG)" },
  { file: "notes/08-rag-production-design.md",           num: "08", title: "RAG Production Design",              stars: 3, group: "Retrieval (RAG)" },
  { file: "notes/09-rag-evaluation.md",                  num: "09", title: "RAG Evaluation",                     stars: 0, group: "Retrieval (RAG)" },
  { file: "notes/10-ai-agents.md",                       num: "10", title: "AI Agents",                          stars: 3, group: "Agents" },
  { file: "notes/11-agentic-architecture.md",            num: "11", title: "Agentic Architecture",              stars: 3, group: "Agents" },
  { file: "notes/12-mcp.md",                             num: "12", title: "MCP — Model Context Protocol",       stars: 3, group: "Agents" },
  { file: "notes/13-aws-bedrock.md",                     num: "13", title: "AWS Bedrock",                        stars: 3, group: "AWS & Platform" },
  { file: "notes/24-aws-bedrock-agentcore-sagemaker.md", num: "24", title: "AWS GenAI Stack — Bedrock, AgentCore & SageMaker", stars: 0, group: "AWS & Platform" },
  { file: "notes/14-ai-security.md",                     num: "14", title: "AI Security",                        stars: 3, group: "Production" },
  { file: "notes/15-ai-evaluation-observability.md",     num: "15", title: "AI Evaluation & Observability",      stars: 0, group: "Production" },
  { file: "notes/16-ai-system-design.md",                num: "16", title: "AI System Design",                   stars: 3, group: "Production" },
  { file: "notes/17-multi-tenant-ai.md",                 num: "17", title: "Multi-Tenant AI",                    stars: 3, group: "Production" },
  { file: "notes/20-responsible-ai-governance.md",       num: "20", title: "Responsible AI & Governance",        stars: 0, group: "Production" },
  { file: "notes/21-cost-optimization.md",               num: "21", title: "Cost Optimization & Token Economics", stars: 0, group: "Production" },
  { file: "notes/18-handson-mock-revision.md",           num: "18", title: "Hands-on, Mock & Revision",          stars: 0, group: "Practice" },
  { file: "notes/19-fine-tuning-customization.md",       num: "19", title: "Fine-Tuning & Customization",        stars: 0, group: "Practice" },
  { file: "notes/22-python-for-ai.md",                   num: "22", title: "Python for AI",                      stars: 0, group: "Practice" },
  { file: "notes/23-fastapi-for-ai.md",                  num: "23", title: "FastAPI for AI",                     stars: 0, group: "Practice" },
];

// Landing-page section order.
window.GROUPS = ["Foundations", "Retrieval (RAG)", "Agents", "AWS & Platform", "Production", "Practice"];
