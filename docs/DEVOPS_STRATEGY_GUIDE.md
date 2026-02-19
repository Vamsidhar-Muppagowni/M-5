# DevOps Strategy & Meeting Guide

This document outlines the standard operating procedures for DevOps strategy meetings, ensuring clear communication, requirement gathering, and decision tracking.

## 1. Terminology & Definitions

To ensure everyone speaks the same language, we use the following terms:

*   **MoM (Minutes of Meeting)**: The official record of what was discussed, decided, and assigned during a meeting. This is the "record" you asked for.
*   **Requirements Specification**: A detailed document describing *what* needs to be built or achieved, distinct from *how* it will be built.
*   **RFC (Request for Comments)**: A proposal document used to gather feedback on a technical approach before a final decision is made.
*   **ADR (Architecture Decision Record)**: A short document capturing a single important architectural decision, along with its context and consequences.

## 2. Order of Work & Meeting Lifecycle

For any new project, feature, or infrastructure change, we follow this verified order of discussion:

### Phase 1: Discovery & Definition
**Goal:** Understand "Why" and "What".
1.  **Stakeholder Interview / Discovery Meeting**:
    *   **Attendees:** Product Owner, DevOps Strategist, Lead Dev.
    *   **Focus:** Business goals, constraints, budget, timeline.
    *   **Output:** High-level Requirements.

### Phase 2: Strategy & Design
**Goal:** Determine "How".
2.  **Technical Strategy Session**:
    *   **Attendees:** DevOps Strategist, Tech Leads.
    *   **Focus:** Cloud provider choice, CI/CD pipeline design, security compliance, scalability triggers.
    *   **Output:** Solution Architecture Diagram, Tech Stack Selection.

### Phase 3: Planning
**Goal:** Determine "Who" and "When".
3.  **Implementation Planning / Sprint Zero**:
    *   **Attendees:** DevOps Team, Developers.
    *   **Focus:** Breaking down the strategy into tasks (Jira/Trello tickets), estimating effort.
    *   **Output:** Backlog of tasks, Timeline.

### Phase 4: Execution & Review
**Goal:** Track progress and improve.
4.  **Weekly Status / Standup**:
    *   **Focus:** Blockers, progress updates.
5.  **Post-Implementation Review (Retrospective)**:
    *   **Focus:** What went well, what broke, how to improve next time.

---

## 3. Meeting Recording Templates

Use these templates to record your meetings. You can copy-paste these into your notes or documentation tool (Confluence, Notion, Markdown file).

### Template A: The "Strategy & Requirements" Meeting
**Best for:** Phase 1 & 2 meetings (Discovery and Strategy).

```markdown
# Meeting Record: [Topic/Project Name]
**Date:** YYYY-MM-DD
**Attendees:** [List Names]
**Facilitator:** [Name]

## 1. Objectives
*   What is the primary goal of this initiative?
*   [e.g., Reduce deployment time by 50%]

## 2. Key Requirements (The "What")
*   [ ] Requirement 1: [e.g., Must support 10k concurrent users]
*   [ ] Requirement 2: [e.g., Must be HIPAA compliant]

## 3. Technical Strategy & Methods (The "How")
*   **Infrastructure:** [e.g., AWS ECS Fargate]
*   **CI/CD Tool:** [e.g., GitHub Actions]
*   **Monitoring:** [e.g., Prometheus + Grafana]
*   **Security:** [e.g., VPC Peering, WAF]

## 4. Decisions Made
| Decision | Rationale | Status |
| :--- | :--- | :--- |
| Use Kubernetes | Need auto-scaling flexibility | **Approved** |
| Use PostgreSQL | Team familiarity | **Approved** |

## 5. Action Items
- [ ] [Who] will research [Topic] by [Date]
- [ ] [Who] will draft the architecture diagram by [Date]
```

### Template B: The "Operational Review" Meeting
**Best for:** Phase 4 meetings (Status checks, Incident reviews).

```markdown
# Operational Review: [Date]
**Attendees:** [List Names]

## 1. Metrics Review
*   **Uptime:** [e.g., 99.9%]
*   **Deployment Frequency:** [e.g., 5/week]
*   **Mean Time to Recovery (MTTR):** [e.g., 15 mins]

## 2. Incident Summary
*   *Were there any outages?*
    *   [Incident #1]: [Brief description and root cause]

## 3. Discussion Points
*   [Topic 1]
*   [Topic 2]

## 4. Action Items
- [ ] [Who] to fix [Bug]
- [ ] [Who] to update documentation
```
