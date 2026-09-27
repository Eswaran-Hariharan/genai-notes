# 11. Agentic Architecture ⭐⭐⭐

> **In one sentence:** Agentic architecture is how you *assemble* an agent in production — wiring together tools, APIs, action groups, knowledge bases, human-in-the-loop checks, and (optionally) multiple cooperating agents.

**Interview goal:** Design an AWS troubleshooting agent.

---

## 11.1 The building blocks

```mermaid
flowchart TD
    ORCH[🧠 Orchestrator / Agent core] --> TOOLS[🔧 Tools]
    ORCH --> AG[📦 Action Groups]
    ORCH --> KB[(📚 Knowledge Base)]
    ORCH --> HITL[🙋 Human-in-the-loop]
    ORCH --> MEM[💾 Memory]
    ORCH --> GR[🛡️ Guardrails]
    AG --> API[APIs / Lambda]
    TOOLS --> API
```

| Block | Role |
|-------|------|
| **Tools** | Individual functions the agent can call (get data, take action) |
| **APIs** | The real systems behind tools (services, databases) |
| **Action Groups** | A *grouping* of related tools/APIs (Bedrock concept) |
| **Knowledge Bases** | RAG source for docs, policies, runbooks |
| **Human-in-the-loop** | Approval gate for risky/uncertain actions |
| **Memory** | Short- and long-term state |
| **Guardrails** | Safety filters and limits |

---

## 11.2 Tools & APIs

A **tool** is the agent-facing definition (name, description, input schema). Behind it sits a real **API** or function.

```mermaid
flowchart LR
    LLM -->|chooses tool| TOOLDEF["Tool definition<br/>(schema the LLM sees)"]
    TOOLDEF --> IMPL["Implementation<br/>(Lambda / microservice)"]
    IMPL --> SYS[Real system: DB, API, cloud service]
    SYS --> IMPL --> LLM
```

Design principles:
- **Read vs write** tools — writes need extra guardrails/approval.
- **Least privilege** — each tool gets only the permissions it needs.
- **Validate inputs** — treat LLM-generated arguments as untrusted.
- **Idempotency** for write actions where possible.
- **Clear descriptions** — the model picks tools by reading them.

---

## 11.3 Action Groups (Bedrock)

In **Amazon Bedrock Agents**, an **action group** bundles related actions the agent can perform. You define:
- An **API schema** (OpenAPI) describing the operations, and
- A **Lambda function** (or return-of-control to your app) that executes them.

```mermaid
flowchart TD
    AGENT[Bedrock Agent] --> AG1["Action Group: Orders<br/>(getOrder, refundOrder)"]
    AGENT --> AG2["Action Group: Diagnostics<br/>(checkSecurityGroup, checkLogs)"]
    AG1 --> L1[Lambda → Orders API]
    AG2 --> L2[Lambda → AWS APIs]
```

The agent reads the schemas, decides which action to call, Bedrock invokes your Lambda, and the result flows back into the reasoning loop.

---

## 11.4 Knowledge Bases in agents

Agents combine **acting** (tools) with **knowing** (RAG). A Knowledge Base lets the agent look up policies, runbooks, and documentation before acting.

```mermaid
flowchart LR
    Q[Task] --> AGENT
    AGENT -->|need info| KB[(Knowledge Base)]
    KB -->|relevant docs| AGENT
    AGENT -->|need action| TOOL[Tool/API]
    TOOL --> AGENT
    AGENT --> ANS[Grounded, actionable result]
```

Example: a troubleshooting agent retrieves the "EC2 connectivity runbook" from the KB, then executes the diagnostic tools it describes.

---

## 11.5 Human-in-the-loop (HITL)

For risky, ambiguous, or high-cost actions, pause and ask a human to approve.

```mermaid
flowchart TD
    A[Agent proposes action] --> R{Risky / low confidence?}
    R -->|No| DO[Execute automatically]
    R -->|Yes| H[Send to human for approval]
    H -->|Approved| DO
    H -->|Rejected| ALT[Choose alternative / stop]
```

When to require HITL:
- Irreversible actions (delete, refund, deploy to prod).
- Low model confidence.
- High cost or compliance-sensitive operations.

---

## 11.6 Single-agent vs Multi-agent

As tasks grow, one agent with 30 tools becomes confused. **Multi-agent** systems split work among specialized agents coordinated by an orchestrator/supervisor.

```mermaid
flowchart TD
    SUP[🧭 Supervisor / Orchestrator agent] --> A1[Network agent]
    SUP --> A2[Compute agent]
    SUP --> A3[Billing agent]
    A1 --> T1[Network tools]
    A2 --> T2[Compute tools]
    A3 --> T3[Billing tools]
    A1 & A2 & A3 --> SUP
    SUP --> RESULT[Combined answer]
```

| Pattern | Description |
|---------|-------------|
| **Supervisor / router** | A lead agent delegates to specialist sub-agents |
| **Sequential (pipeline)** | Agents hand off in order |
| **Collaborative** | Agents discuss/debate to reach consensus |

Trade-off: multi-agent adds capability but also **latency, cost, and complexity** — use only when a single agent can't cope.

---

## 11.7 Full agentic architecture

```mermaid
flowchart TD
    U[User] --> API[API layer + auth]
    API --> GRIN[Guardrails: input filter, prompt-injection check]
    GRIN --> AGENT[Agent orchestrator]
    AGENT --> LLM[Foundation model]
    AGENT --> MEM[(Memory store)]
    AGENT --> KB[(Knowledge Base / RAG)]
    AGENT --> AG[Action Groups → Lambdas/APIs]
    AG --> HITL{Risky? → human approval}
    HITL --> EXT[External systems]
    AGENT --> GROUT[Guardrails: output filter, PII, groundedness]
    GROUT --> U
    AGENT --> OBS[Tracing / metrics / logs]
```

---

## 11.8 Worked example — AWS troubleshooting agent

**Goal:** diagnose and (optionally) fix common AWS issues, e.g., "My EC2 instance is unreachable."

```mermaid
sequenceDiagram
    participant U as User
    participant A as Agent
    participant KB as Knowledge Base
    participant T as AWS diagnostic tools
    participant H as Human
    U->>A: "EC2 instance i-123 is unreachable"
    A->>KB: retrieve "EC2 connectivity runbook"
    KB->>A: steps: check SG, NACL, route table, instance state
    A->>T: check_security_group(i-123)
    T->>A: port 22 not open
    A->>T: check_instance_status(i-123)
    T->>A: running, ok
    A->>A: root cause = SG blocks SSH
    A->>H: propose "add inbound SSH rule?" (write action)
    H->>A: approve
    A->>T: update_security_group(...)
    T->>A: done
    A->>U: "Fixed: added SSH inbound rule. Cause was SG."
```

Design breakdown:
- **Knowledge Base** — runbooks, best practices, past incidents (RAG).
- **Action groups** — `Diagnostics` (read-only: describe SG, logs, status) and `Remediation` (write: update SG) — writes require **HITL**.
- **Guardrails** — restrict to allowed accounts/regions; block destructive commands.
- **Security** — least-privilege IAM role per tool; read tools separate from write tools.
- **Memory** — track what's already been checked in this incident.
- **Observability** — log every thought/action for audit.

---

## Practical / Interview Goal

✅ **Design an AWS troubleshooting agent.** Cover: goal & scope → Knowledge Base of runbooks → read-only diagnostic action group → write remediation action group behind human approval → guardrails + least-privilege IAM → memory + full tracing. Show the sequence diagram.

---

## Resources

- [Amazon Bedrock Agents — action groups](https://docs.aws.amazon.com/bedrock/latest/userguide/agents-action-create.html) *(rephrased for compliance)*
- [Multi-agent collaboration on Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/agents-multi-agent-collaboration.html) *(rephrased for compliance)*
- Next: [12 — MCP](12-mcp.md)
