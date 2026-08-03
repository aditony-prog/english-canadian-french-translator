# FRADI Project Status

## Project Overview

FRADI is an internal ADI Canadian French localization platform.

Current capabilities:

- English → Canadian French translation
- Azure Translator integration
- Azure OpenAI length optimization
- Maximum output length enforcement
- Do Not Translate support
- Translation Glossary support
- Glossary persistence
- Glossary Compliance scoring
- Translation Quality dashboard
- Soft Glossary Enforcement

---

## Environment

### Frontend

Hosted as:

Azure Static Web App

Files:

- index.html
- style.css
- script.js

Development:

- VS Code
- GitHub Desktop

---

### Backend

Hosted as:

Azure Function App

Name:

adi-translator-api

Primary function:

translate

File:

api/translate/index.js

Important:

The Azure Function is NOT connected to Deployment Center.

Backend updates require:

1. Modify local file
2. Commit
3. Push
4. Copy code into Azure Portal
5. Save Function

---

## Translation Flow

Frontend

Glossary
↓
script.js
↓
Azure Function

Backend

Azure Translator
↓
Soft Glossary Enforcement
↓
Length Optimization
↓
Return Translation

---

## Completed Features

### Phase 1

- Translation
- Length optimization
- Do Not Translate

### Phase 2

- Glossary persistence
- Glossary Compliance
- Quality Dashboard

### Phase 3A

- Glossary transport
- Backend glossary reception
- Soft Glossary Enforcement

Verified by:

Glossary:

Customer=ZEBRA_TEST

Input:

Customer

Result:

ZEBRA_TEST

This proved glossary terms now influence translations.

---

## Current UI Feedback

Desired improvements:

### High Priority

- Remove non-functional Swap Languages button
- Make Translate primary CTA
- Reduce prominence of Copy buttons
- Eliminate excess whitespace

### Potential Improvements

- Move Translation Quality into French output panel
- Remove standalone Translation Quality card
- Convert Glossary into popup/modal
- Convert Do Not Translate into popup/modal
- Add glossary match explanations
- Add glossary entry counter

---

## Future Feature Ideas

### Phase 3B

Glossary Match Details

Example:

✅ Customer → Client
✅ Account → Compte
✅ Product → Produit

### Phase 4

Document Upload

Potential:

- TXT upload
- DOCX upload
- DOCX export
- Batch translation

### Analytics

Potential:

- Application Insights
- Translation count
- Glossary usage metrics
- Microsoft Clarity

---

## Naming Candidates

Favorites:

- FRADI
- FRADI Studio
- FRADI AI
- ADI Localize
- CanADIan Translator

Current favorite:

FRADI