# 7. Advanced RAG ⭐

> **In one sentence:** Basic RAG often retrieves the wrong or noisy chunks; advanced RAG uses smarter **chunking, filtering, hybrid search, query rewriting, and reranking** to make retrieval far more accurate.

**Interview goal:** Answer *"How would you improve poor RAG results?"*

---

## 7.1 Where basic RAG fails

```mermaid
flowchart TD
    Q[Question] --> R[Retrieval]
    R --> BAD1["Retrieves irrelevant chunks"]
    R --> BAD2["Misses the chunk with the answer"]
    R --> BAD3["Answer split across chunk boundaries"]
    R --> BAD4["Keyword-only match fails on synonyms"]
    R --> BAD5["Right doc, wrong version / wrong tenant"]
```

Advanced RAG techniques target each of these failure modes. Below is a toolkit — you rarely need all of them, so diagnose first (see [09 — RAG Evaluation](09-rag-evaluation.md)).

---

## 7.2 Chunking strategies

Chunking quality is the #1 driver of RAG accuracy. Options:

| Strategy | How it works | Best for |
|----------|--------------|----------|
| **Fixed-size** | Split every N tokens, with overlap | Simple, uniform text |
| **Recursive / structural** | Split on natural boundaries (paragraph → sentence) | Most documents |
| **Semantic chunking** | Split where the *meaning* changes (embedding shifts) | Dense, varied content |
| **Document-based** | Respect structure: headings, sections, tables, code blocks | Technical docs, manuals |
| **Sentence-window** | Embed single sentences, but return neighbors as context | High precision needs |
| **Parent-child (hierarchical)** | Embed small chunks, but feed the larger parent to the LLM | Best of both: precise match + full context |

```mermaid
flowchart LR
    subgraph ParentChild["Parent-Child chunking"]
    P["Parent chunk (large, full context)"] --> C1["Child (small)"]
    P --> C2["Child (small)"]
    P --> C3["Child (small)"]
    end
    Q[Query] -->|matches| C2
    C2 -->|but we send| P
    P --> LLM
```

**Overlap:** keep 10–20% overlap so a sentence spanning a boundary isn't lost.

**Tuning tip:** start ~300–500 tokens with overlap, then evaluate and adjust.

---

## 7.3 Metadata filtering

Store metadata with each chunk (`date`, `author`, `product`, `tenant_id`, `access_level`, `doc_version`) and **filter before or during** vector search.

```mermaid
flowchart LR
    Q[Query + filters<br/>tenant=Acme, year>=2024] --> VDB[(Vector DB)]
    VDB --> F["Search only within matching subset"]
    F --> R[Relevant + allowed chunks]
```

Why it's essential:
- **Security / multi-tenancy** — only search a tenant's own data (see [17 — Multi-Tenant AI](17-multi-tenant-ai.md)).
- **Freshness** — restrict to recent documents.
- **Precision** — narrow to the right product/region/language.

---

## 7.4 Hybrid search

Combine **semantic (vector) search** with **keyword (lexical / BM25) search** and merge the results.

```mermaid
flowchart TD
    Q[Query] --> V[Vector search<br/>meaning]
    Q --> K[Keyword search<br/>exact terms: IDs, codes, names]
    V --> M[Merge & score<br/>e.g. Reciprocal Rank Fusion]
    K --> M
    M --> R[Best of both]
```

- **Vector search** wins on synonyms and paraphrases.
- **Keyword search** wins on exact matches: error codes, product SKUs, function names, acronyms.
- **Hybrid** gets both — usually the biggest single accuracy boost.

---

## 7.5 Query rewriting / transformation

The user's raw question is often a poor search query. Rewrite it first.

| Technique | What it does |
|-----------|--------------|
| **Query expansion** | Add synonyms/related terms |
| **Query decomposition** | Split a complex question into sub-questions, retrieve for each |
| **Multi-query** | Generate several rephrasings, retrieve for all, merge |
| **HyDE** (Hypothetical Document Embeddings) | Ask the LLM to draft a hypothetical answer, embed *that*, and search — often matches real docs better |
| **Conversational rewrite** | Turn "what about pricing?" into "what is the pricing of product X?" using chat history |

```mermaid
flowchart LR
    Q["'what about the refund?'"] --> RW[LLM rewrite]
    RW --> Q2["'What is the refund policy<br/>for product X purchased in 2024?'"]
    Q2 --> RET[Retrieval]
```

---

## 7.6 Reranking

Retrieve a **large** candidate set (e.g., top 50) quickly, then use a smarter, slower **reranker model** (a cross-encoder) to re-score and keep only the best (e.g., top 5).

```mermaid
flowchart LR
    Q[Query] --> RET[Fast retrieval<br/>top 50 candidates]
    RET --> RR[Reranker<br/>reads query + each chunk together]
    RR --> TOP[Top 5 most relevant]
    TOP --> LLM
```

- **Retriever** = fast but approximate (compares independent vectors).
- **Reranker** = slow but precise (reads the query and chunk *together*).
- Big precision boost; examples: Cohere Rerank, cross-encoder models.

---

## 7.7 Putting it together — an advanced RAG pipeline

```mermaid
flowchart TD
    Q[User question] --> QR[Query rewriting]
    QR --> HS[Hybrid search + metadata filter]
    HS --> CAND[Top 50 candidates]
    CAND --> RR[Rerank → top 5]
    RR --> CTX[Assemble context<br/>parent-child expansion]
    CTX --> LLM[LLM generation]
    LLM --> A[Grounded answer + citations]
```

---

## 7.8 Diagnosing "poor RAG results" (interview gold)

Split the problem into **retrieval** vs **generation**:

```mermaid
flowchart TD
    P[Poor RAG answer] --> Q1{Were the right<br/>chunks retrieved?}
    Q1 -->|No| RETR[Fix RETRIEVAL:<br/>chunking, hybrid search,<br/>query rewrite, reranking, metadata]
    Q1 -->|Yes| Q2{Did the LLM use<br/>them correctly?}
    Q2 -->|No| GEN[Fix GENERATION:<br/>better prompt, grounding,<br/>lower temperature, bigger model]
```

Fix checklist by symptom:
- **Missing the answer** → better chunking, hybrid search, query rewriting, retrieve more + rerank.
- **Retrieves junk** → metadata filtering, reranking, cleaner ingestion.
- **Right chunks, wrong answer** → improve the prompt, enforce grounding, lower temperature.
- **Answer cut off / lacks context** → parent-child chunking, increase overlap.
- **Can't verify** → add citations and evaluation (see [09](09-rag-evaluation.md)).

---

## Practical / Interview Goal

✅ **Answer "How would you improve poor RAG results?"**
> "First I'd measure whether the failure is in retrieval or generation. If retrieval: improve chunking (try parent-child/semantic), add hybrid search for exact terms, apply metadata filtering, rewrite the query, and add a reranker on a larger candidate set. If generation: tighten the prompt to force grounding, lower temperature, and possibly use a stronger model. Then re-run evaluation to confirm the fix."

---

## Resources

- [Amazon Bedrock — retrieval & advanced chunking](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-chunking-parsing.html) *(rephrased for compliance)*
- Next: [08 — RAG Production Design](08-rag-production-design.md)
