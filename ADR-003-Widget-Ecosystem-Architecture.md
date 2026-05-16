# ADR-003: Widget Ecosystem & SSOT 16.2 Integration

## Status
Accepted - 2026-04-19

## Context
In the EAI Classroom application, the Digital Board (Digibord) and the Teacher Dashboard contain a feature called "Widgets". Initially, the codebase contained a catalog of 31 conceptual widgets, of which ~85% were empty placeholder shells without backing logic. Furthermore, the application seeks to align closely with the SSOT 16.2.0-governed framework, which dictates strict AI Interaction Protocols, Bandwidth Contracts, and Command Policies.

We need an architectural decision on how to clean up the widget catalog, differentiate between "dumb" operational tools and "smart" AI-driven pedagogical tools, and bind the smart tools firmly to the EAI 16.2 SSOT.

## Decision

1.  **Widget Bifurcation:** The Widget Ecosystem will be split into two distinct tiers:
    *   **Tier 1: Operational Tools (Dumb Widgets):** Purely client-side utility tools that do not engage the AI backend or pedagogical SSOT logic. These include tools essential for classroom management (e.g., *Timer*, *Clock*, *Namenkiezer*).
    *   **Tier 2: EAI Tools (Smart Widgets):** Pedagogical widgets that *must* route their interaction through the backend. They operate under the exact constraints of the `ssot-16.2.json` (such as checking `logic_gates`, respecting `MAX_TD`, and routing via defined `/commands`).

2.  **SSOT 16.2 Binding:** 
    *   Every Smart Widget request must include the session's active phase and the chosen SSOT `/command` reference.
    *   The backend (`/api/ai/...`) will evaluate the command against the 16.2 `bandwidth_contract` and `command_profiles` prior to invoking the Gemini API.
    *   The raw Gemini prompt will be explicitly guarded by the `didactic_diagnostics` context extracted from the SSOT.

3.  **Catalog Reduction:** 
    *   The 31 conceptual widgets in `WidgetRegistry.tsx` will be pruned. We will execute a "Quality over Quantity" reduction, eliminating "empty shell" concepts and focusing strictly on delivering a handful of highly polished Tier 1 and Tier 2 widgets.

## Consequences
*   **Positive:** The application's didactic structure becomes fully compliant with SSOT 16.2.0. The Digibord becomes a reliable, production-ready tool rather than an unfulfilled mockup.
*   **Negative/Constraints:** Creating new AI widgets requires careful pairing with an SSOT command and strict adherence to the intervention model, adding overhead to future feature development.
