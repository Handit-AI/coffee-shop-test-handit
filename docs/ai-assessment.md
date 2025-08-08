# Handit-AI Coffee Shop Test Audit Report

## Overview

This audit focuses on the use of prompts within the Handit-AI Coffee Shop Test repository, specifically targeting the OpenAI GPT-3.5-turbo model. The primary goal is to identify potential risks such as jailbreak susceptibility, prompt injection vectors, PII leakage, bias, and safety gaps. Additionally, we assess determinism issues, missing output schemas, and opportunities for improvement.

## Detected Stack

- **Providers**: OpenAI
- **Frameworks**: None detected

### Usage Notes
The repository uses the OpenAI GPT-3.5-turbo model with a single prompt designed for a sales agent role in a coffee shop context. The prompt is dynamic, incorporating an `inventoryContext` variable to tailor responses based on current inventory.

## Prompt Inventory

| File Path          | Type     | Role   | Chars | Variables         |
|--------------------|----------|--------|-------|-------------------|
| services/openai.js | Variable | System | 278   | inventoryContext  |

## Deep Findings

### Prompt in `services/openai.js`

- **Jailbreak Susceptibility**: **High**
  - **Rationale**: The prompt encourages aggressive sales tactics, which could be manipulated by users to generate inappropriate or unethical sales strategies.
  - **Recommendation**: Implement input validation and context checks to ensure the model's responses remain within ethical guidelines.

- **Prompt Injection Vectors**: **Medium**
  - **Rationale**: The use of dynamic variables like `inventoryContext` without strict validation can lead to injection attacks where malicious inputs alter the intended behavior.
  - **Recommendation**: Sanitize and validate all inputs to prevent injection attacks.

- **PII Leakage**: **Low**
  - **Rationale**: The current prompt does not directly handle personal identifiable information, but future expansions could introduce risks.
  - **Recommendation**: Establish guidelines for handling PII and ensure any future prompts adhere to these guidelines.

- **Bias**: **Medium**
  - **Rationale**: The prompt's focus on upselling and pushing expensive options may lead to biased interactions that prioritize profit over customer satisfaction.
  - **Recommendation**: Balance sales strategies with customer-centric approaches to mitigate bias.

- **Safety Gaps**: **High**
  - **Rationale**: The directive to "never say no" could lead to unsafe or unethical sales practices.
  - **Recommendation**: Introduce constraints that allow the model to decline requests that are unreasonable or unsafe.

## Actionable Improvements

1. **Implement Input Validation**:
   - Ensure all dynamic inputs like `inventoryContext` are sanitized.
   - Example: Use regex or predefined lists to validate inventory items.

2. **Enhance Ethical Guidelines**:
   - Modify the prompt to include ethical sales practices.
   - Example: "Always prioritize customer satisfaction and ethical sales practices."

3. **Introduce Safety Constraints**:
   - Allow the model to decline unsafe or unethical requests.
   - Example: "If a request is unreasonable or unsafe, offer a polite alternative."

4. **Bias Mitigation**:
   - Balance upselling with customer needs.
   - Example: "Suggest items based on customer preferences and needs, not just price."

5. **Logging and Monitoring**:
   - Implement logging to track model outputs for compliance and quality assurance.

## Hygiene & Safety Checklist

- **Determinism**: Ensure consistent outputs for similar inputs by controlling randomness in model responses.
- **Input Validation**: Sanitize all inputs, especially dynamic variables like `inventoryContext`.
- **Schemas**: Define output schemas to standardize responses and facilitate validation.
- **Logging**: Implement comprehensive logging for auditing and debugging purposes.
- **Red Teaming**: Conduct regular red teaming exercises to identify and mitigate potential vulnerabilities.

By addressing these findings and implementing the recommended improvements, the Handit-AI Coffee Shop Test can enhance its reliability, safety, and ethical standards.