# Knowledge Base Definition: Customer Service & AI Reply

## Definition
The Customer Service & AI Reply module is designed to bridge language barriers and automate customer interactions. It utilizes the corporate knowledge base to provide accurate and consistent support.

## Boundaries
- **Input**: Customer messages (various languages), corporate documents (FAQ, product manuals).
- **Output**: Translated messages, AI-generated reply suggestions, automated site responses.
- **Exclusions**: Does not replace human agents for complex, high-stakes negotiations (provides "Needs Human" flags).

## File Logic
1. **Manual Assist**: Users paste customer messages and get AI-translated suggestions.
2. **Auto-Reply**: The site-embedded chat widget calls the AI with the project's knowledge base context.
3. **Logs**: All interactions (AI and human) are logged for quality assurance.
4. **Extension**: A Chrome extension allows using the knowledge base on third-party platforms like WhatsApp and Gmail.

## AI Recognition Hints
- Maintain a helpful, polite, and professional tone.
- If the knowledge base does not contain an answer, politely ask for the customer's contact information for human follow-up.
- Ensure translations are contextually accurate for B2B/B2C scenarios.
