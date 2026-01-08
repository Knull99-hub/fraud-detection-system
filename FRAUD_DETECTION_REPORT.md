# TECHNICAL REPORT: FRAUD DETECTION SYSTEM

**Subject**: System Architecture and Functionality Overview

---

## 1. Executive Summary
The Fraud Detection System is a real-time financial monitoring platform designed to identify fraudulent transactions using Machine Learning (XGBoost/LightGBM) and high-throughput event streaming (Apache Kafka). The system achieves sub-second latency for fraud classification and provides a secure, interactive dashboard for monitoring.

---

## 2. Infrastructure Architecture
The system leverages containerization for consistency and scalability:

*   **Apache Kafka**: Acts as the central nervous system for event streaming.
*   **Redis**: Provides in-memory risk-score caching to reduce ML inference load.
*   **PostgreSQL**: Serves as the persistent source of truth for all processed transactions and historical analytics.
*   **Docker Compose**: Orchestrates these services to ensure a reproducible environment.

---

## 3. Backend Services Layer
The backend is built with Python 3.12 and follows an asynchronous processing model:

### 3.1 Authenticated API Gateway (FastAPI)
*   **Security**: Implements JWT (JSON Web Token) authentication with OAuth2.
*   **Endpoints**: Provides RESTful interfaces for health monitoring, real-time statistics, and raw transaction retrieval.
*   **CORS Management**: Configured for secure cross-origin resource sharing with the frontend dashboard.

### 3.2 Real-Time Processing (Kafka Producer/Consumer)
*   **Producer**: Simulates live credit card traffic by streaming data from the test dataset into Kafka topics.
*   **Consumer/Classifier**: The "Decision Engine" that consumes Kafka events, performs ML inference, and logs the results to both Redis and PostgreSQL.

---

## 4. Frontend Dashboard (Next.js 14)
A premium, dark-mode monitoring interface designed for real-time visibility:

*   **Tech Stack**: React 18, Next.js 14 (App Router), Tailwind CSS, Framer Motion.
*   **Live Data Integration**: Uses persistent polling to fetch the latest analytics from the FastAPI backend.
*   **Visualization**: Utilizes Recharts for dynamic fraud trend analysis and Lucide for state-based iconography.
*   **Security Integration**: Enforces authorized access via the JWT login portal.

---

## 5. Transaction Lifecycle
1.  **Ingestion**: Transaction data enters the pipeline through the Kafka Producer.
2.  **Streaming**: Kafka holds the message until a Consumer is available.
3.  **Inference**: The ML model analyzes the transaction (Amount, Location, Time).
4.  **Logging**: The decision (Safe/Fraud) is saved to the PostgreSQL database.
5.  **Visualization**: The Dashboard polls the DB and displays the new entry in the Live Feed.

---

## 6. Security Protocol
*   **Token Refresh**: Tokens expire every 30 minutes to maintain session security.
*   **Password Hashing**: Implements `bcrypt` (Blowfish-based hashing) for administrative credentials.
*   **Endpoint Protection**: All data-sensitive routes require a valid `Bearer` token in the HTTP header.

---
**Prepared by**: Antigravity AI  
**Repository**: `fraud-detection-system`
