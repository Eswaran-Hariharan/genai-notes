# 24. AWS GenAI Stack — Bedrock, AgentCore & SageMaker

> **In one sentence:** AWS gives you three layers for AI — **Bedrock** (use foundation models + managed GenAI features), **AgentCore** (deploy and operate AI agents securely at scale), and **SageMaker** (build, train, and host your own ML/AI models) — and they work together end to end.

**Interview goal:** Explain what each service does, when to use which, and draw a secure end-to-end AWS GenAI architecture with guardrails.

> **Diagram note:** The diagrams use AWS-style color coding and icon-emojis so they read like AWS architecture diagrams in any Mermaid viewer. Orange 🟧 = AI/ML services, blue 🟦 = compute/app, green 🟩 = storage/data, red 🟥 = security.

---

## 24.1 The three layers at a glance

```mermaid
flowchart TD
    subgraph L1["🟧 Bedrock — Foundation Model layer"]
    B["Amazon Bedrock<br/>models · Knowledge Bases · Guardrails"]
    end
    subgraph L2["🟧 AgentCore — Agent operations layer"]
    A["Amazon Bedrock AgentCore<br/>runtime · memory · gateway · identity"]
    end
    subgraph L3["🟧 SageMaker — Build-your-own-model layer"]
    S["Amazon SageMaker AI<br/>train · fine-tune · host models"]
    end

    A -->|calls models| B
    S -->|custom model| B
    B -.serves.-> A

    style B fill:#ED7100,color:#fff,stroke:#B85B00
    style A fill:#ED7100,color:#fff,stroke:#B85B00
    style S fill:#ED7100,color:#fff,stroke:#B85B00
```

| Layer | Service | Use when you want to… | Effort |
|-------|---------|------------------------|--------|
| **Consume models** | **Bedrock** | Call ready foundation models, add RAG + guardrails | Lowest |
| **Operate agents** | **AgentCore** | Run agents in production securely at scale | Medium |
| **Own the model** | **SageMaker** | Train/fine-tune/host custom or open-source models | Highest |

> **Mental model:** Bedrock = "rent a brain." SageMaker = "build your own brain." AgentCore = "give the brain hands, memory, and a secure workplace."

---

## 24.2 Amazon Bedrock (recap + focus)

Bedrock is the **serverless gateway to foundation models** plus managed GenAI building blocks. (Full detail in [13 — AWS Bedrock](13-aws-bedrock.md).)

```mermaid
flowchart LR
    APP["🟦 Your app"] --> API["🟧 Bedrock API"]
    API --> FM["🟧 Foundation Models<br/>Claude · Nova · Llama · Titan"]
    API --> KB["🟧 Knowledge Bases<br/>(managed RAG)"]
    API --> GR["🟥 Guardrails<br/>(safety layer)"]
    KB --> VS["🟩 Vector store<br/>OpenSearch / Aurora"]

    style API fill:#ED7100,color:#fff
    style FM fill:#ED7100,color:#fff
    style KB fill:#ED7100,color:#fff
    style GR fill:#C7131F,color:#fff
    style VS fill:#3F8624,color:#fff
    style APP fill:#146EB4,color:#fff
```

Key concepts:
- **Foundation models** via one API (text, embeddings, image, multimodal).
- **Knowledge Bases** = managed RAG (ingest, chunk, embed, retrieve).
- **Guardrails** = configurable safety (denied topics, PII, content filters, grounding checks).
- **Model customization** = fine-tuning / continued pre-training (see [19](19-fine-tuning-customization.md)).
- **Data privacy** = your data isn't used to train the base models.

---

## 24.3 Amazon Bedrock AgentCore

**AgentCore** is a set of services to **securely deploy and operate AI agents at scale** — it removes the months of infra work (session management, identity, memory, observability) so you focus on the agent's logic. It is **framework-agnostic** (works with agents built in LangGraph, CrewAI, Strands, etc.) and **model-agnostic**.

> Content rephrased from AWS announcements for licensing compliance.

### Why it exists
Building a demo agent is easy; running one in production needs session isolation, memory, secure tool access, identity, and observability. AgentCore provides these as modular, managed building blocks.

### Core components
```mermaid
flowchart TD
    AC["🟧 Amazon Bedrock AgentCore"]
    AC --> RT["⚙️ Runtime<br/>serverless, session isolation<br/>(per-session microVMs)"]
    AC --> MEM["🧠 Memory<br/>short- & long-term state"]
    AC --> GW["🔌 Gateway<br/>turn APIs/Lambdas into agent tools (MCP)"]
    AC --> ID["🔐 Identity<br/>OAuth2 / secure access"]
    AC --> OBS["📊 Observability<br/>traces & metrics → CloudWatch"]
    AC --> TOOLS["🛠️ Built-in tools<br/>Code Interpreter · Browser"]

    style AC fill:#ED7100,color:#fff
    style RT fill:#232F3E,color:#fff
    style MEM fill:#232F3E,color:#fff
    style GW fill:#232F3E,color:#fff
    style ID fill:#C7131F,color:#fff
    style OBS fill:#232F3E,color:#fff
    style TOOLS fill:#232F3E,color:#fff
```

| Component | What it does | Maps to concept in… |
|-----------|--------------|---------------------|
| **Runtime** | Serverless agent execution with **per-session isolation** and fast cold starts | [10 Agents](10-ai-agents.md), [17 Multi-Tenant](17-multi-tenant-ai.md) |
| **Memory** | Managed short-term (session) and long-term memory | [10 Agents §10.6](10-ai-agents.md) |
| **Gateway** | Converts existing APIs/Lambdas into agent tools, often via **MCP** | [11 Agentic](11-agentic-architecture.md), [12 MCP](12-mcp.md) |
| **Identity** | Secure identity & access (OAuth2) for agents and tools | [14 Security](14-ai-security.md) |
| **Observability** | Built-in tracing/metrics to **CloudWatch** | [15 Observability](15-ai-evaluation-observability.md) |
| **Code Interpreter / Browser** | Sandboxed tools so agents can run code / browse the web | [11 Agentic](11-agentic-architecture.md) |

### Bedrock Agents vs AgentCore (common confusion)
- **Bedrock Agents** — a managed way to *build* an agent inside Bedrock (action groups + KB + guardrails). Great for simpler, Bedrock-native agents. (See [11](11-agentic-architecture.md).)
- **AgentCore** — infrastructure to *operate* agents (any framework/model) securely at scale: runtime isolation, memory, gateway, identity, observability. Use it when you need production-grade ops and portability.

---

## 24.4 Amazon SageMaker AI

**SageMaker** is the full **ML platform** for when you want to build, train, fine-tune, and host your own models (including open-source LLMs) rather than only consuming Bedrock's.

```mermaid
flowchart LR
    DATA["🟩 Data (S3)"] --> PREP["📓 SageMaker Studio<br/>notebooks / prep"]
    PREP --> TRAIN["🏋️ Training jobs<br/>train / fine-tune"]
    TRAIN --> REG["📦 Model Registry"]
    REG --> EP["🚀 Endpoints<br/>real-time / async / serverless"]
    EP --> APP["🟦 Your app"]
    TRAIN --> JS["🟧 JumpStart<br/>pretrained & open-source models"]
    JS --> EP

    style DATA fill:#3F8624,color:#fff
    style PREP fill:#232F3E,color:#fff
    style TRAIN fill:#232F3E,color:#fff
    style REG fill:#232F3E,color:#fff
    style EP fill:#ED7100,color:#fff
    style JS fill:#ED7100,color:#fff
    style APP fill:#146EB4,color:#fff
```

Key concepts:
- **Studio** — IDE for notebooks, data prep, experiments.
- **Training jobs** — managed, scalable training/fine-tuning on GPUs.
- **JumpStart** — deploy/fine-tune popular open-source and foundation models.
- **Model Registry** — version and govern models.
- **Endpoints** — host models for inference (real-time, async, serverless, batch).
- **Pipelines** — MLOps automation (build → train → deploy).

### When Bedrock vs SageMaker?
```mermaid
flowchart TD
    Q{Do you need to own/customize<br/>the model deeply?} 
    Q -->|No — just use top models| BR["🟧 Bedrock<br/>fastest, serverless"]
    Q -->|Yes — custom/open-source,<br/>full control, special model| SM["🟧 SageMaker<br/>train & host yourself"]
    BR -.can serve custom models via.-> SM
    style BR fill:#ED7100,color:#fff
    style SM fill:#ED7100,color:#fff
    style Q fill:#146EB4,color:#fff
```

- **Bedrock** — you want managed, top-tier models with minimal ops.
- **SageMaker** — you need a specific/open-source model, deep customization, or to host your own weights. A SageMaker-trained model can also be imported into Bedrock.

---

## 24.5 End-to-end architecture (all three + security)

This is the diagram to be able to draw. It shows a user request flowing through security, an agent operated by AgentCore, using Bedrock models + RAG, with a custom SageMaker model available, and guardrails/observability wrapping everything.

```mermaid
flowchart TB
    USER["👤 User / Client app"]

    subgraph EDGE["🟥 Access & Security layer"]
    direction LR
    APIGW["🟪 API Gateway"]
    AUTH["🔐 Cognito / IAM<br/>authN + authZ"]
    end

    subgraph AGENT["🟧 AgentCore — Agent operations (secure, scalable)"]
    direction TB
    RT["⚙️ Runtime<br/>session isolation"]
    MEM["🧠 Memory"]
    GW["🔌 Gateway → tools (MCP)"]
    ACID["🔐 Identity"]
    end

    subgraph BEDROCK["🟧 Bedrock — Models & RAG"]
    direction TB
    GRIN["🟥 Guardrails (input)"]
    FM["🤖 Foundation Models"]
    KB["📚 Knowledge Bases"]
    GROUT["🟥 Guardrails (output)"]
    end

    subgraph DATA["🟩 Data & Tools"]
    direction LR
    S3["🪣 S3 (documents)"]
    VDB["🔎 Vector store<br/>OpenSearch/Aurora"]
    LAMBDA["λ Lambda / APIs (tools)"]
    end

    subgraph CUSTOM["🟧 SageMaker (optional custom model)"]
    EP["🚀 Model endpoint"]
    end

    subgraph SEC["🟥 Cross-cutting Security & Ops"]
    direction LR
    KMS["🔑 KMS encryption"]
    PL["🔒 PrivateLink / VPC"]
    CW["📊 CloudWatch / CloudTrail"]
    end

    USER --> APIGW --> AUTH --> RT
    RT --> MEM
    RT --> ACID
    RT --> GW
    GW --> LAMBDA
    RT --> GRIN --> FM
    FM --> KB
    KB --> VDB
    S3 -->|ingest| KB
    FM --> GROUT --> RT
    RT -->|specialized task| EP
    RT --> USER

    AGENT -.observability.-> CW
    BEDROCK -.encrypted.-> KMS
    DATA -.private network.-> PL

    style USER fill:#146EB4,color:#fff
    style APIGW fill:#8C4FFF,color:#fff
    style AUTH fill:#C7131F,color:#fff
    style RT fill:#232F3E,color:#fff
    style MEM fill:#232F3E,color:#fff
    style GW fill:#232F3E,color:#fff
    style ACID fill:#C7131F,color:#fff
    style GRIN fill:#C7131F,color:#fff
    style FM fill:#ED7100,color:#fff
    style KB fill:#ED7100,color:#fff
    style GROUT fill:#C7131F,color:#fff
    style S3 fill:#3F8624,color:#fff
    style VDB fill:#3F8624,color:#fff
    style LAMBDA fill:#ED7100,color:#fff
    style EP fill:#ED7100,color:#fff
    style KMS fill:#C7131F,color:#fff
    style PL fill:#C7131F,color:#fff
    style CW fill:#232F3E,color:#fff
```

### Reading the flow (step by step)
1. **User → API Gateway → Cognito/IAM** — request enters through a secured edge; authenticate and authorize (derive tenant/user identity here).
2. **AgentCore Runtime** — runs the agent in an isolated session; pulls **Memory** and verifies **Identity**.
3. **Gateway → Lambda/APIs** — the agent calls tools securely (often via MCP).
4. **Input Guardrails → Foundation Model** — the prompt passes safety checks, then the Bedrock model reasons.
5. **Knowledge Bases → Vector store** — RAG retrieves relevant chunks (documents ingested from **S3**).
6. **SageMaker endpoint** — for a specialized task, the agent calls a custom-hosted model.
7. **Output Guardrails** — the response is checked (PII, harmful content, grounding) before returning.
8. **KMS / PrivateLink / CloudWatch / CloudTrail** — encryption, private networking, and full observability/audit wrap the whole system.

---

## 24.6 Security & Guardrails across the stack

Security is layered (defense in depth — see [14 — AI Security](14-ai-security.md)). Here's how each AWS piece contributes.

```mermaid
flowchart TD
    L1["🟥 Network: VPC · PrivateLink · TLS"] --> L2["🟥 Identity: IAM · Cognito · AgentCore Identity (OAuth2)"]
    L2 --> L3["🟥 Data: KMS encryption · S3/Vector-DB tenant filtering · PII redaction"]
    L3 --> L4["🟥 Prompt: Guardrails input filter · injection/jailbreak defense"]
    L4 --> L5["🟥 Model: Guardrails output filter · grounding checks"]
    L5 --> L6["🟥 Tools: Gateway authZ · least-privilege Lambda · human approval"]
    L6 --> L7["🟥 Isolation: AgentCore per-session microVMs (multi-tenant safe)"]
    L7 --> L8["🟥 Monitoring: CloudTrail audit · CloudWatch metrics · alerts"]

    style L1 fill:#C7131F,color:#fff
    style L2 fill:#C7131F,color:#fff
    style L3 fill:#C7131F,color:#fff
    style L4 fill:#C7131F,color:#fff
    style L5 fill:#C7131F,color:#fff
    style L6 fill:#C7131F,color:#fff
    style L7 fill:#C7131F,color:#fff
    style L8 fill:#C7131F,color:#fff
```

| Layer | AWS mechanism |
|-------|---------------|
| **Network** | VPC, **PrivateLink** (traffic never touches the public internet), TLS |
| **Identity** | **IAM** least privilege, **Cognito** for users, **AgentCore Identity** (OAuth2) for agents/tools |
| **Data** | **KMS** encryption at rest, S3/vector-DB **tenant filtering**, **Guardrails PII** redaction |
| **Prompt** | **Bedrock Guardrails** input filters block denied topics, injection, jailbreaks (see [14 §14.2/§14.2.1](14-ai-security.md)) |
| **Model output** | Guardrails **content filters** + **contextual grounding checks** (anti-hallucination) |
| **Tools** | **AgentCore Gateway** authorization, least-privilege **Lambda** roles, human-in-the-loop for risky actions |
| **Isolation** | **AgentCore Runtime** per-session microVMs → strong tenant isolation |
| **Audit/Monitor** | **CloudTrail** (audit), **CloudWatch** (metrics/logs/alarms), AgentCore Observability |

### Guardrails focus (the safety net)
```mermaid
flowchart LR
    IN["User input"] --> G1["🟥 Guardrail: input<br/>denied topics · injection · PII"]
    G1 --> M["🤖 Model / Agent"]
    M --> G2["🟥 Guardrail: output<br/>harmful content · PII · grounding"]
    G2 --> OUT["Safe response"]
    style G1 fill:#C7131F,color:#fff
    style G2 fill:#C7131F,color:#fff
    style M fill:#ED7100,color:#fff
```

Bedrock Guardrails can be attached to models, Bedrock Agents, and used alongside AgentCore, giving one consistent policy layer.

---

## 24.7 Choosing the right service (decision guide)

```mermaid
flowchart TD
    START{What do you need?} 
    START -->|Answer questions / RAG with<br/>top models, minimal ops| BR["🟧 Bedrock"]
    START -->|Run production agents<br/>securely at scale, any framework| AC["🟧 AgentCore"]
    START -->|Train/fine-tune/host<br/>your own or open-source model| SM["🟧 SageMaker"]
    BR --- COMBO["Often combined:<br/>AgentCore runs the agent →<br/>calls Bedrock models + RAG →<br/>optionally a SageMaker endpoint"]
    AC --- COMBO
    SM --- COMBO
    style BR fill:#ED7100,color:#fff
    style AC fill:#ED7100,color:#fff
    style SM fill:#ED7100,color:#fff
    style START fill:#146EB4,color:#fff
    style COMBO fill:#232F3E,color:#fff
```

- Start with **Bedrock** for most GenAI apps.
- Add **AgentCore** when agents go to production and need isolation, memory, secure tools, identity, and observability.
- Bring in **SageMaker** when you must own the model (custom/open-source, deep tuning, special hosting).

---

## Practical / Interview Goal

✅ **Explain and draw the AWS GenAI stack end to end.**
> "AWS gives me three layers. Bedrock is the serverless gateway to foundation models with managed RAG (Knowledge Bases) and Guardrails. AgentCore operates agents in production — Runtime with per-session isolation, Memory, Gateway to expose tools via MCP, Identity for secure access, and built-in Observability — and it's framework- and model-agnostic. SageMaker is for when I need to train, fine-tune, or host my own model. End to end: a user hits API Gateway with Cognito/IAM auth; AgentCore Runtime runs the agent, loads memory, and calls tools through Gateway; the prompt passes input Guardrails to a Bedrock model that does RAG over a vector store fed from S3, with an optional SageMaker endpoint for specialized tasks; output Guardrails check the response; and KMS, PrivateLink, CloudTrail, and CloudWatch wrap the whole thing for encryption, private networking, audit, and observability."

---

## Resources

- [Amazon Bedrock AgentCore — developer guide](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/) *(rephrased for compliance)*
- [Introducing Amazon Bedrock AgentCore (AWS blog)](https://aws.amazon.com/blogs/aws/introducing-amazon-bedrock-agentcore-securely-deploy-and-operate-ai-agents-at-any-scale/) *(rephrased for compliance)*
- [Amazon SageMaker AI documentation](https://docs.aws.amazon.com/sagemaker/) *(rephrased for compliance)*
- [Amazon Bedrock documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html) *(rephrased for compliance)*
- Related: [13 — AWS Bedrock](13-aws-bedrock.md), [11 — Agentic Architecture](11-agentic-architecture.md), [12 — MCP](12-mcp.md), [14 — AI Security](14-ai-security.md), [19 — Fine-Tuning](19-fine-tuning-customization.md)
- Back to [README / index](README.md)
