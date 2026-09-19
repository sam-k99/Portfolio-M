export interface Blog {
  title: string;
  description: string;
  content: string;
  tags: string[];
  date: string;
  readTime: string;
}

export const blogs: Blog[] = [
  {
    title: "Building a Self-Healing Data Pipeline",
    description:
      "Data pipelines break constantly, usually because someone changed a column name upstream. Here's how I built an agent that detects the break, fixes the SQL, tests it, and opens a pull request on its own.",
    tags: ["Data Engineering", "AI Agents", "LangGraph", "dbt"],
    date: "2026-08-22",
    readTime: "5 min read",
    content: `Data pipelines break all the time. It's one of the most common pain points in data engineering.

An upstream API renames a column — say \`user_dob\` becomes \`date_of_birth\` — and suddenly the entire analytics pipeline crashes. A data engineer has to drop everything, dig through logs, figure out what changed, rewrite the SQL, and open a pull request. It's slow, repetitive, manual toil.

So I wanted to see if that whole process could be automated.

The end result: an agent that detects a broken pipeline, diagnoses the schema mismatch causing it, rewrites the affected SQL, runs the data quality tests to confirm the fix works, and then opens a GitHub pull request for a human to review. Here's how I built it, and what actually got in the way.

---

## Why This Happens in the First Place

Most modern data stacks lean on tools like dbt to transform raw data, and dbt runs on hardcoded SQL. The moment the underlying database schema shifts without warning, those models fail. This is usually called schema drift, and it's the kind of thing that turns into a broken dashboard, a confused executive, and an engineer stuck reading error logs for the rest of their afternoon. I wanted a system that could absorb that shock without a human needing to step in first.

---

## The Stack

I built this with Python, PostgreSQL, dbt, Docker, and LangGraph, with an LLM sitting at the center of it.

Docker keeps everything isolated and reproducible so the setup behaves the same on any machine. dbt was the right transformation layer because its error output is structured and predictable — exactly the kind of thing an LLM can parse reliably. And LangGraph was the piece that let the agent behave in a loop rather than a straight line: try something, fail, read the new error, try again.

---

## Setting Up the Infrastructure

The first step was just getting a working environment. A Docker Compose file spins up Postgres, and a custom Dockerfile builds an Airflow image with dbt and the right Python dependencies baked in, so nothing touches the host machine directly.

For data, I used a small Python script built on the Faker library to generate mock e-commerce records and load them into a raw table in Postgres. On top of that sit two dbt models — a staging model that selects from the raw table, and a mart model that aggregates daily revenue — along with standard dbt tests checking that order IDs are unique and non-null.

At that point, I had a normal, healthy pipeline. Nothing broken yet.

---

## Breaking It on Purpose

To test a self-healing system, you need something to actually break. So I wrote a small script — I called it the schema breaker — that connects to Postgres and randomly mutates the schema: renaming a column, changing a type, or dropping a column outright. Once it runs, the dbt models fail immediately, because the SQL is still written for the schema that no longer exists.

---

## Giving the Agent Hands

An LLM by itself is just a brain that outputs text. It can't touch a database or edit a file on its own — it needs tools to act through. So I wrote a small Python module giving the agent five capabilities: inspect the live database schema, read the broken dbt SQL file, overwrite that file with corrected SQL, run the dbt tests and return the output, and push changes to GitHub. Every one of these tools returns a plain string, since a string is the only thing the model can actually read back.

---

## Building the Brain

For the reasoning loop, I used LangGraph to build a ReAct-style agent — reasoning and acting in alternating steps. The system prompt frames it as an experienced data engineer: inspect the database, read the broken file, rewrite the SQL, then verify with tests.

LangGraph handles the actual execution loop. The agent reads the error, decides to inspect the schema, reads that result, decides to rewrite the file, then runs the tests. If the tests still fail, it reads the new error and loops back to try again — this cyclical behavior was the whole reason LangGraph made sense here over a simple linear chain.

---

## Making It Feel Like Real Engineering

Having an AI silently overwrite local files is a fun demo, but it's not how any real team would want it running. No serious codebase lets an agent push straight to production. So I added a fifth tool purely for Git operations. Once the agent's fix passes the dbt tests, this tool creates a new branch, commits the fixed file, and pushes it up as a pull request — keeping a human in the loop before anything actually ships.

---

## What Actually Went Wrong Along the Way

None of this came together cleanly. A few things kept breaking:

**Python version conflicts.** Some of the database drivers wouldn't compile against the system Python version. Using \`pyenv\` to install a clean, isolated Python version for just this project fixed it.

**Docker permission mismatches.** Airflow runs as a specific user ID inside its container, while the local files belong to the host user. That mismatch meant the container couldn't read or write the dbt files until I explicitly set \`AIRFLOW_UID\` to match the host user.

**Silent dbt failures.** Running dbt inside the Airflow container sometimes failed with no error output at all, due to shared library conflicts. Running dbt locally instead, pointed at the Dockerized database over localhost, made the failures visible again.

**Messy repeated runs.** Running the whole demo more than once left the database and SQL files in an inconsistent state — the schema breaker would fail because a column was already renamed from the last run. I ended up writing a one-click reset script that wipes the Docker volumes, rebuilds the database, resets the SQL file, and then runs the full break-and-heal cycle from a clean slate every time.

**API rate limits.** Larger models on free-tier API access hit token limits quickly. Switching to a smaller model with a higher rate limit, and trimming how much text the test tool returned, solved it.

---

## Where This Leaves Me

This project convinced me that LLMs are genuinely useful outside of chat interfaces — as agents that operate on real infrastructure, not just conversation. Combining dbt, LangGraph, and basic GitOps gets you a system that can absorb a class of failure that normally eats an engineer's afternoon, while still respecting the guardrail of a human reviewing the pull request before anything reaches production.

If there's one thing I took from this: building something that removes a real operational headache teaches you far more than building another chatbot wrapper ever will.

*that story's for the next blog.*`,
  },


  
  {
    title: "LLM Gateway - Documentation",
    description:
      "Every company is building AI apps right now, but they are bleeding money on API costs and risking data leaks. Here's how to build a gateway that secures, caches, and routes prompts to the cheapest model.",
    tags: ["LLM", "FastAPI", "Docker", "Gateway"],
    date: "2026-08-16",
    readTime: "4 min read",
    content: `Every company is building AI apps right now, but they are bleeding money on API costs and risking data leaks. When you send a prompt to a large language model provider, you pay per token. If a user asks a simple question like what is two plus two, you still pay the full price. Worse, a user might type their social security number into the prompt, sending private data to a third party server.

The solution is an LLM Gateway. It is a middleman API that sits between your application and the LLM provider. It intercepts every prompt, secures it, caches it, and routes it to the cheapest possible model.

## How to Build It

### Step 1: The Core API Setup

First, create a folder for your project and set up a Python virtual environment. Install FastAPI, Uvicorn, and the OpenAI Python library. We will use the OpenAI library but point it to Mistral AI. Mistral has a generous free tier and is fully compatible with the OpenAI code format.

Create a file named main.py. You need to create a FastAPI application with a chat completions endpoint. This endpoint must accept the exact same JSON format that OpenAI uses. This way, any application built for OpenAI can just change its URL and use your gateway instead.

Inside your code, initialize the OpenAI client but set the base URL to the Mistral API. Load your Mistral API key from an environment file so it stays secret. When the endpoint receives a request, pass it directly to the Mistral client and return the response.

### Step 2: Dynamic Model Routing

Right now, every prompt goes to the same model. To save money, you need to classify the prompt. If it is a simple greeting, route it to a cheap fast model. If it is a complex coding request, route it to an expensive smart model.

Create a function that looks at the user prompt. Convert the prompt to lowercase. Check if it contains keywords like code, write, build, or explain. If it does, return the name of the expensive model. If the prompt is short and has no keywords, return the name of the cheap model. Before sending the request to Mistral, run the prompt through this function to decide which model to use.

### Step 3: Security and Guardrails

You must protect against data leaks. A user might type their email or social security number. You also need to block hackers from using prompt injection, which is when someone types ignore previous instructions to hijack the AI.

Create a security module. Use Python regular expressions to find patterns that look like emails or social security numbers. If found, replace them with the word REDACTED. Next, check the prompt for known injection phrases. If an injection is detected, block the request and return an error message. Run every prompt through this security check before routing it.

### Step 4: Semantic Caching

This is where you save the most money. If 100 people ask what is the capital of France, you should only pay the LLM for the first question. The other 99 should get a cached answer instantly.

You will use Redis to store the prompts and answers. But you cannot just do a basic text match. You need semantic matching. If someone asks tell me the capital city of France, that means the same thing, and we should still return the cached answer.

To do this, you use Mistral to generate an embedding for the prompt. An embedding is a list of numbers that represents the meaning of the text. You store that list of numbers in Redis. When a new prompt comes in, you generate its embedding and compare it to the ones in Redis using NumPy. We use a math formula called cosine similarity to check how similar they are. If the similarity is over 85 percent, we return the cached answer and bypass the LLM completely. If it is under 85 percent, we send it to the LLM and save the new prompt and answer to Redis.

### Step 5: Observability with Prometheus

Companies need to know how much money you are saving them. We will use Prometheus to track metrics. Install the Prometheus FastAPI instrumentator. It will automatically track the number of HTTP requests. We also need custom metrics. Create counters for cache hits and cache misses. Every time your code returns a cached answer, increment the hit counter. Create a histogram to track how many tokens the LLM is using. Expose these metrics at a slash metrics endpoint.

### Step 6: Dockerization

The last step is to package everything so it can be run by just one single command. Create a Dockerfile. Use the official Python slim image. Copy your requirements file and install dependencies. Then copy your source code.

Create a docker-compose file. Define three services. The first is your gateway application built from your Dockerfile. Map it to port 8000. The second is Redis, using the official Redis image. The third is Prometheus, using the official Prometheus image. Add a dependency so the gateway waits for Redis to start before booting.

Run docker compose up. You now have a fully containerized enterprise LLM Gateway.`,
  },




  {
    title: "Anomaly Engine -full guide",
    description:
      "Fraud detection is broken. Most companies rely on batch processing or static rules that hackers can easily bypass. Here's how to build a real-time streaming pipeline paired with an autonomous agent that catches bots in milliseconds and filters out false positives.",
    tags: ["Kafka", "Machine Learning", "LangGraph", "FastAPI"],
    date: "2026-09-13",
    readTime: "4 min read",
    content: `Fraud detection is broken. Most companies rely on batch processing, meaning they analyze yesterday's data today. By the time a fraudulent transaction or a bot attack is detected, the money is already gone. The alternative is static rules, like blocking a user if they make five requests a minute. Hackers easily bypass static rules by setting their bots to four requests a minute.

The solution is a real-time streaming pipeline paired with an autonomous agent. This system ingests live user events, scores them using unsupervised machine learning in milliseconds, and triggers an AI investigator to analyze the threat.

Here is exactly how to build this using Apache Kafka, scikit-learn, LangGraph, and FastAPI.

### Step 01: The Streaming Backbone

The system starts with data ingestion. Instead of sending user events directly to a database, which would crash under high traffic, the events are sent to Apache Kafka. Kafka acts as a massive shock absorber. It holds thousands of events in a queue so the downstream systems are not overwhelmed.

A Python script acts as a data simulator. It generates realistic user clickstream events, such as logins, page views, and cart additions. To ensure the machine learning model actually has anomalies to catch, the simulator is programmed to occasionally inject bot behavior. A bot event is characterized by an impossibly fast processing time, like five milliseconds, and a burst of twenty requests in one second.

These events are published to a Kafka topic named raw-user-events. At this stage, the data is just sitting in the queue waiting to be processed.

### Step 02: The Machine Learning Detection Engine

The next component is a Kafka consumer. Its job is to pull events from the queue and score them.

For the machine learning model, an Isolation Forest is the industry standard for real-time anomaly detection. Unlike traditional models that try to learn what normal data looks like, an Isolation Forest isolates anomalies. It builds random decision trees. Anomalies, being rare and different, get isolated very close to the root of the tree. This makes the mathematical computation incredibly fast, taking less than a millisecond per event.

The model cannot run on raw text. The consumer must first extract numerical features from the event. It calculates the processing time, the time since the user's last action, and a numerical code for the action type.

Crucially, the model requires a warmup phase. Unsupervised models do not know what an anomaly is until they learn what normal looks like. The system buffers the first two hundred events it receives. It uses these to train the Isolation Forest. Once trained, it switches to scoring mode. Every new event is scored. If the model returns a negative one, the event is an anomaly. The consumer immediately pushes this flagged event to a second Kafka topic named flagged-anomalies.

### Step 03: The Autonomous AI Investigator

The machine learning model is fast, but it is dumb. It only looks at numbers. It might flag a human user who took three seconds to type their password as an anomaly, simply because three seconds is slower than the baseline. This creates false positives.

To solve this, a second Kafka consumer listens to the flagged-anomalies topic. When an anomaly arrives, it triggers an agent. This agent acts as a virtual Security Operations Center analyst.

The agent is built using LangGraph. LangGraph allows the creation of a state machine, meaning the AI operates in a continuous loop of reasoning rather than just generating text. When the agent receives an anomaly, it analyzes the context. It looks at the processing time and the action type.

The agent then categorizes the threat. If it sees a processing time of five milliseconds, it knows this is a machine and labels it a high threat, recommending an immediate IP block. If it sees a processing time of three seconds on a login page, it recognizes this is just a slow human typing on a phone, labels it a low threat, and recommends monitoring only. The agent outputs this analysis as a structured JSON report.

### Step 04: The Live Dashboard and Observability

For an engineering team to trust an autonomous system, they need to see it working. A FastAPI backend is used to create a live dashboard.

The FastAPI server exposes a WebSocket endpoint. As the AI agent reasons through the threat analysis, it streams its thoughts and decisions to the frontend via WebSockets. The dashboard displays a live console showing the AI categorizing the threats in real-time.

This observability layer is critical. It proves the system is actually processing data and provides visibility into the AI decision-making process.

## Conclusion

Building an anomaly engine is not just about training a model. It requires orchestrating streaming data, real-time machine learning inference, and autonomous AI agents. By combining Kafka for ingestion, an Isolation Forest for detection, and LangGraph for investigation, the system achieves true AIOps. It catches bots in milliseconds and filters out false positives automatically, saving human engineers from hours of manual triage.


## Please consider giving a star if it helps you. Thanks for visiting.`

  },
];
