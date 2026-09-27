# 1. AI & GenAI Fundamentals

> **In one sentence:** Generative AI is a type of machine learning that *creates* new content (text, images, code) by learning patterns from massive amounts of data, instead of just classifying or predicting a label.

**Interview goal:** Be able to explain the GenAI landscape and architecture in 5–10 minutes.

---

## 1.1 The big picture: AI vs ML vs DL vs GenAI

These terms are often used interchangeably, but they are nested inside each other like Russian dolls.

```mermaid
flowchart TD
    AI["🤖 Artificial Intelligence (AI)<br/>Any technique that makes machines mimic human intelligence"]
    ML["📊 Machine Learning (ML)<br/>Systems that learn patterns from data instead of being hand-coded"]
    DL["🧠 Deep Learning (DL)<br/>ML using multi-layer neural networks"]
    GEN["✨ Generative AI (GenAI)<br/>DL models that generate new content"]

    AI --> ML --> DL --> GEN
```

| Term | What it means | Everyday example |
|------|---------------|------------------|
| **AI** | The broad goal: machines doing "smart" things | A chess program, a thermostat that learns |
| **ML** | Machines learn rules **from data** rather than being explicitly programmed | Spam filter, Netflix recommendations |
| **DL** | ML using **deep neural networks** (many layers) | Face recognition, speech-to-text |
| **GenAI** | DL that **produces** new text, images, audio, or code | ChatGPT, Midjourney, GitHub Copilot |

**Key mental model:**
- Traditional ML mostly answers *"Which category is this?"* or *"What number comes next?"* (discriminative).
- GenAI answers *"Create something new that fits this pattern."* (generative).

---

## 1.2 Discriminative vs Generative models

```mermaid
flowchart LR
    subgraph Discriminative
    A[Input: an email] --> B[Model] --> C[Output: Spam / Not Spam]
    end
    subgraph Generative
    D[Input: 'Write an email'] --> E[Model] --> F[Output: A brand new email]
    end
```

- **Discriminative** — learns the *boundary* between classes. Example: is this a cat or a dog?
- **Generative** — learns the *distribution* of the data so it can produce new samples. Example: draw a new cat that has never existed.

---

## 1.3 What is a Large Language Model (LLM)?

An **LLM** is a generative model trained on huge amounts of text to predict the next word (token) in a sequence. By doing this billions of times, it learns grammar, facts, reasoning patterns, and style.

- **"Large"** = billions of parameters (the internal numbers it learns) + huge training data.
- **"Language Model"** = its core job is to predict likely text.

> Everything an LLM does — answering questions, writing code, summarizing — is built on top of one simple skill: **predict the next token.**

Examples: GPT-4, Claude, Llama, Amazon Nova, Titan.

---

## 1.4 Foundation Models

A **foundation model** is a large model trained on broad data that can be *adapted* to many downstream tasks. It's the "base" you build on.

```mermaid
flowchart TD
    FM["Foundation Model<br/>(trained once on huge data)"] --> T1[Chatbot]
    FM --> T2[Summarizer]
    FM --> T3[Code assistant]
    FM --> T4[Search / RAG]
```

- Trained once (very expensive), reused many times (cheap).
- Can be **text**, **image**, **multimodal** (text + image + audio), etc.
- On AWS, foundation models are served through **Amazon Bedrock**.

**Why they matter:** Instead of training your own model from scratch (millions of dollars), you take a foundation model and adapt it with prompts, retrieval (RAG), or fine-tuning.

---

## 1.5 Training vs Inference

This is one of the most important distinctions to get right.

```mermaid
flowchart LR
    subgraph Training [Training — done once, very expensive]
    D[Huge dataset] --> M1[Model adjusts billions of parameters]
    end
    subgraph Inference [Inference — every time you use it, cheaper]
    P[Your prompt] --> M2[Frozen model] --> R[Generated answer]
    end
    M1 -.produces.-> M2
```

| | **Training** | **Inference** |
|---|---|---|
| **What** | Teaching the model by adjusting its parameters | Using the trained model to answer |
| **When** | Once (or occasionally, to fine-tune) | Every single request |
| **Cost** | Extremely high (GPUs, weeks/months) | Per-request (what you pay Bedrock/OpenAI) |
| **Analogy** | Studying for years to become a doctor | The doctor seeing a patient |

**Fine-tuning** is a lighter form of extra training on your own data to specialize a foundation model. It sits between "full training" and "just prompting."

**Ways to adapt a foundation model (cheapest → most expensive):**
1. **Prompt engineering** — just change the wording.
2. **RAG** — feed the model relevant documents at query time.
3. **Fine-tuning** — retrain on your data.
4. **Full pretraining** — build a model from scratch (almost never done by companies).

---

## 1.6 The modern GenAI application stack

```mermaid
flowchart TD
    U[User] --> APP[Your Application<br/>e.g. Spring Boot service]
    APP --> PE[Prompt + context]
    PE --> FM[Foundation Model via Bedrock]
    APP --> KB[(Knowledge Base / Vector DB)]
    KB -.retrieved docs.-> PE
    APP --> TOOLS[Tools / APIs<br/>the model can call]
    FM --> R[Response] --> U
```

This diagram is the "skeleton" behind almost every topic in these notes — RAG adds the knowledge base, agents add the tools, security wraps around it all.

---

## 1.7 Common terms cheat sheet

| Term | Meaning |
|------|---------|
| **Parameter** | An internal learned number; more parameters ≈ more capacity |
| **Token** | A chunk of text (~¾ of a word) the model reads/writes |
| **Prompt** | The input text you send to the model |
| **Hallucination** | When the model confidently makes up wrong information |
| **Context window** | How much text the model can "see" at once |
| **Multimodal** | Handles more than one data type (text + images + audio) |

---

## Practical / Interview Goal

✅ **Explain the GenAI architecture in 5–10 minutes.** Practice this out loud:
1. AI ⊃ ML ⊃ DL ⊃ GenAI.
2. LLMs predict the next token; scaled up, that becomes reasoning + writing.
3. Foundation models are trained once and adapted many ways.
4. Training (once, costly) vs inference (per request).
5. Real apps = model + prompt + retrieved knowledge + tools.

---

## Resources

- Course: *AI A-Z 2026* (Udemy) — foundations section.
- [What is Generative AI? — AWS](https://aws.amazon.com/what-is/generative-ai/) *(content rephrased from official AWS overview for compliance)*
- Next: [02 — LLM Fundamentals](02-llm-fundamentals.md)
