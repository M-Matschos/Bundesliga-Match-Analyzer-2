---
name: Design Oracle Agent Modules
description: Design multi-agent architecture with clear communication protocols, state management, and feedback loops. Specifies module interfaces for the orchestration layer.
---

# Design Oracle Agent Modules

Create modular designs for the Match Oracle's agent ecosystem, ensuring clear separation of concerns and robust inter-agent communication for decision intelligence workflows.

## Module Design Framework

### 1. Core Agent Modules
- **Orchestrator Module**: Central coordinator receiving market data, triggering analyses, managing state
- **Prediction Module**: Ensemble model serving predictions with confidence intervals
- **Validation Module**: Real-time outcome verification, model drift detection, feedback generation
- **Capital Module**: Portfolio optimization, Kelly sizing, drawdown constraints
- **Decision Module**: Hard constraints, kill-switch logic, value bet identification

### 2. Communication Patterns
- **Request-response**: Synchronous calls (prediction requests, capital allocation)
- **Event streams**: Asynchronous match events, outcome notifications
- **Feedback loops**: Model learning signals with outcome data
- **State synchronization**: Shared portfolio state across agents

### 3. Interface Specifications
- Data contracts (message schemas)
- Timeout configurations
- Retry logic and circuit breakers
- Error propagation rules

## Commands

### `/module-design create [--agent=AGENT_NAME] [--pattern=TYPE]`
Design a new agent module with specified communication pattern. Generates:
- Agent class skeleton with type hints
- Message schema definitions
- State management code
- Interface documentation

**Example**: `/module-design create --agent=ensemble-validator --pattern=event-stream`

### `/module-design analyze-coupling [--system=SYSTEM_PATH]`
Analyze module coupling and dependencies. Reports:
- Coupling metrics between agents
- Circular dependency detection
- Message flow bottlenecks
- Suggestions for decoupling

### `/module-design generate-interfaces`
Generate TypeScript/Python interfaces for all agent-to-agent communication. Includes validation decorators and serialization helpers.

## Best Practices

- **Single responsibility**: Each module owns one decision concern
- **Clear contracts**: Explicit message schemas and timeout expectations
- **Stateless where possible**: Minimize shared state, prefer event-driven updates
- **Testability**: Design modules for isolated unit testing
- **Observability**: Include logging/tracing points for debugging

## Requirements

- Architecture documentation or existing design patterns
- Agent identification and responsibilities
- Expected message volumes and latencies
- Existing state management approach
