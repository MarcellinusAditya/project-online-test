# Online Test Platform — AI Coding Project Plan

## 1. Project Overview

Build a web-based online testing platform that can be used for:

- Teacher/student learning assessments
- Employee assessments
- Psychological tests
- Recruitment tests
- General online examinations

The platform has two main actors:

1. **Test Provider**
   - Creates and manages tests
   - Creates questions manually
   - Generates questions using AI from PDF/material
   - Reviews generated questions
   - Publishes test rooms
   - Reviews participant results
   - Exports results to Excel

2. **Test Participant**
   - Opens a test room
   - Enters a test token
   - Enters participant identity
   - Takes the test
   - Submits answers
   - Receives result if enabled

---

# 2. Main Product Flow

## Provider Flow

```text
Register/Login
    ↓
Dashboard
    ↓
Create Test
    ↓
Create Questions
    ├── Manual
    └── AI from PDF
           ↓
       AI Generation
           ↓
       Review Questions
           ↓
       Approve Questions
    ↓
Configure Test
    ↓
Publish Test
    ↓
Generate Test Token
    ↓
Share Token
    ↓
Monitor Participants
    ↓
Review Results
    ↓
Export Excel
```

## Participant Flow

```text
Open Test URL
    ↓
Enter Test Token
    ↓
Validate Test
    ↓
Enter Participant Name
    ↓
Start Test
    ↓
Fullscreen
    ↓
Answer Questions
    ↓
Auto Save Answers
    ↓
Submit
    ↓
Automatic Grading
    ↓
Result
```

---

# 3. MVP Scope

## Authentication

- Provider registration
- Provider login
- Provider logout
- Provider profile
- Authentication middleware
- Authorization using policies

Participants do not need accounts for MVP.

Participant identity:

- Name
- Optional identifier/student number/email

---

# 4. Test Management

Provider can:

- Create test
- Edit test
- Delete test
- Duplicate test
- View test
- Publish test
- Unpublish test
- Archive test

Test fields:

```text
id
user_id
title
description
token
start_at
end_at
duration_minutes
status
show_result
created_at
updated_at
```

Test statuses:

```text
draft
published
archived
```

Do not store `ongoing` and `finished` as permanent status if they can be calculated from timestamps.

Test availability should be determined from:

```text
published
AND
current_time >= start_at
AND
current_time <= end_at
```

---

# 5. Question Management

Support two question types for MVP:

```text
multiple_choice
essay
```

## Multiple Choice

Fields:

```text
question
options
correct_answer
points
explanation
```

Each question must have exactly one correct answer.

Example:

```text
Question:
What is 5 + 5?

A. 5
B. 10
C. 15
D. 20

Correct:
B
```

## Essay

Fields:

```text
question
points
```

Essay answers are manually graded in MVP.

AI essay grading is NOT part of MVP.

---

# 6. Question Bank

Questions should not be tightly coupled to a single test.

Create a reusable Question Bank system.

Structure:

```text
Question Bank
    ↓
Questions
    ↓
Tests
```

A question can be reused in multiple tests.

Recommended tables:

```text
question_banks
questions
question_options
test_questions
```

`test_questions` should act as the pivot between tests and questions.

This allows:

- Reusing questions
- Ordering questions
- Different points per test if required later

Minimum fields:

```text
test_questions
- id
- test_id
- question_id
- sort_order
- points
```

---

# 7. AI Question Generation

AI generation is a core product feature.

Provider can choose:

```text
Generate with AI
```

Input:

```text
PDF
```

Configuration:

```text
source_type:
    material
    existing_questions

question_type:
    multiple_choice
    essay

number_of_questions

difficulty:
    easy
    medium
    hard

language
```

---

# 8. AI Generation Flow

Do NOT directly insert AI-generated questions into production questions.

Use this flow:

```text
Upload PDF
    ↓
Store PDF
    ↓
Extract Text
    ↓
Clean Text
    ↓
Chunk Text if necessary
    ↓
Create AI Generation Job
    ↓
Queue
    ↓
AI Service
    ↓
LLM
    ↓
Structured JSON
    ↓
Validate Response
    ↓
Save Generated Questions as Draft
    ↓
Provider Review
    ↓
Approve
    ↓
Move/Create Question Bank Questions
```

AI-generated questions must always be reviewable before being used in a published test.

---

# 9. AI Architecture

Do not call the LLM directly from controllers.

Create an abstraction:

```php
interface QuestionGeneratorInterface
{
    public function generate(
        string $content,
        array $options
    ): array;
}
```

Implementation:

```text
OpenAiQuestionGenerator
```

Future implementations can be:

```text
GeminiQuestionGenerator
ClaudeQuestionGenerator
LocalLlmQuestionGenerator
```

Business logic must depend on:

```text
QuestionGeneratorInterface
```

not directly on OpenAI.

---

# 10. AI Output Format

AI must return structured JSON.

Example:

```json
{
  "questions": [
    {
      "question": "Apa fungsi utama jantung?",
      "type": "multiple_choice",
      "options": [
        {
          "key": "A",
          "text": "Memompa darah"
        },
        {
          "key": "B",
          "text": "Menyaring darah"
        },
        {
          "key": "C",
          "text": "Menghasilkan oksigen"
        },
        {
          "key": "D",
          "text": "Mencerna makanan"
        }
      ],
      "correct_answer": "A",
      "explanation": "Jantung berfungsi memompa darah ke seluruh tubuh.",
      "points": 5
    }
  ]
}
```

Validate the AI response before saving it.

Invalid AI output must never directly reach the production question tables.

---

# 11. AI Generation Tables

Create:

```text
ai_generations
```

Suggested fields:

```text
id
user_id
source_type
source_file_path
model
prompt_version
options
status
error_message
started_at
completed_at
created_at
updated_at
```

Statuses:

```text
pending
processing
completed
failed
cancelled
```

Generated questions can either be stored in a temporary generation table or associated with `ai_generation_id`.

Recommended:

```text
ai_generated_questions
```

Fields:

```text
id
ai_generation_id
question
type
options_json
correct_answer
explanation
points
status
created_at
updated_at
```

Status:

```text
draft
approved
rejected
```

---

# 12. PDF Processing

MVP does not require RAG.

Initial architecture:

```text
PDF
 ↓
Text Extraction
 ↓
Text Cleaning
 ↓
Chunking
 ↓
LLM
```

Do not implement vector database or embeddings in MVP.

RAG can be added in a later phase when documents become large or source traceability is required.

---

# 13. Test Room

Every published test has a token.

Example:

```text
UGR-20260826-X8K2
```

Token must be generated securely.

Do not use sequential IDs as public tokens.

Participant access:

```text
/join
```

or:

```text
/test/{token}
```

Recommended:

```text
/join
```

Participant enters:

```text
Token
```

Backend validates:

```text
token exists
test exists
test is published
current time is inside test availability window
```

---

# 14. Test Attempt

Create:

```text
attempts
```

Fields:

```text
id
test_id
participant_name
participant_identifier
started_at
expires_at
submitted_at
status
score
total_points
created_at
updated_at
```

Statuses:

```text
active
submitted
expired
```

---

# 15. Timer

Timer must be server-authoritative.

When participant starts:

```text
started_at = now()
expires_at = started_at + duration
```

Frontend timer is only for display.

Backend must always verify:

```text
now() <= expires_at
```

If:

```text
now() >= expires_at
```

automatically submit/expire the attempt.

Never trust client-side timer values.

---

# 16. Answer Auto Save

Create:

```text
attempt_answers
```

Fields:

```text
id
attempt_id
question_id
answer
is_correct
points
answered_at
created_at
updated_at
```

Answers must be saved continuously.

When participant selects an option:

```text
Frontend
    ↓
API/Inertia request
    ↓
Backend validation
    ↓
Save answer
```

Do not wait until final submission to save answers.

This protects against:

- Browser refresh
- Network interruption
- Browser crash
- Accidental navigation

---

# 17. Participant Test UI

The test interface must contain:

```text
Test title
Timer
Question number
Question
Options
Question navigation
Progress
Previous button
Next button
Submit button
```

Question navigation:

```text
1  2  3  4  5  6  7 ...
```

Visual states:

```text
answered
unanswered
current
```

---

# 18. Anti-Cheat MVP

Browser-based anti-cheating cannot guarantee that participants cannot access other applications.

Implement deterrence and event logging.

## Fullscreen

Request fullscreen when test begins.

Detect:

```text
fullscreenchange
```

When participant exits fullscreen:

```text
record event
show warning
```

## Tab Switching

Use:

```text
visibilitychange
```

Detect when:

```text
document.visibilityState === 'hidden'
```

Record:

```text
tab_hidden
```

## Window Focus

Use:

```text
blur
focus
```

Record suspicious activity.

---

# 19. Attempt Events

Create:

```text
attempt_events
```

Fields:

```text
id
attempt_id
event_type
metadata
created_at
```

Events:

```text
test_started
fullscreen_entered
fullscreen_exited
tab_hidden
tab_visible
window_blur
window_focus
answer_changed
test_submitted
timeout
```

This allows future anti-cheating analytics.

---

# 20. Automatic Grading

For multiple choice:

```text
participant_answer === correct_answer
```

Calculate:

```text
correct
wrong
unanswered
score
total_points
```

Example:

```text
20 questions
18 correct
2 wrong

Score = 90
```

Essay:

```text
status = pending_manual_review
```

Provider can manually assign:

```text
score
feedback
```

AI essay grading is future development.

---

# 21. Result Dashboard

Provider can see:

```text
Total participants
Average score
Highest score
Lowest score
Pass rate
```

Participant result table:

```text
Participant
Score
Correct
Wrong
Unanswered
Duration
Status
```

Provider can open participant details:

```text
Question
Participant answer
Correct answer
Points
```

For essay:

```text
Participant answer
Score
Feedback
```

---

# 22. Excel Export

Implement Excel export using Laravel Excel.

Export columns:

```text
Participant
Identifier
Test
Started At
Submitted At
Duration
Total Questions
Correct
Wrong
Unanswered
Score
Status
```

Optional second sheet:

```text
Question Details
```

---

# 23. Frontend Architecture

Use:

```text
React
TypeScript
Inertia.js
Tailwind CSS
Vite
```

Recommended structure:

```text
resources/js/
├── components/
│   ├── ui/
│   ├── test/
│   ├── question/
│   ├── participant/
│   └── dashboard/
│
├── layouts/
│   ├── AuthLayout.tsx
│   ├── DashboardLayout.tsx
│   └── TestLayout.tsx
│
├── pages/
│   ├── Auth/
│   ├── Dashboard/
│   ├── Tests/
│   ├── Questions/
│   ├── AI/
│   ├── Results/
│   └── Participant/
│
├── hooks/
│   ├── useTimer.ts
│   ├── useFullscreen.ts
│   ├── useVisibility.ts
│   └── useAutoSave.ts
│
├── types/
│
└── utils/
```

Use TypeScript instead of JavaScript.

---

# 24. Backend Architecture

Use Laravel service-oriented structure.

Recommended:

```text
app/
├── Actions/
├── Http/
│   ├── Controllers/
│   ├── Requests/
│   └── Resources/
│
├── Models/
├── Services/
│   ├── Test/
│   ├── Question/
│   ├── Attempt/
│   ├── Grading/
│   ├── AI/
│   └── PDF/
│
├── Jobs/
│   ├── GenerateQuestionsJob.php
│   └── ProcessPdfJob.php
│
├── Policies/
├── Enums/
└── Support/
```

Do not put complex business logic inside controllers.

Controllers should coordinate:

```text
Request
 ↓
Validation
 ↓
Service/Action
 ↓
Response
```

---

# 25. Laravel Enums

Use PHP backed enums for important statuses.

Example:

```php
enum TestStatus: string
{
    case DRAFT = 'draft';
    case PUBLISHED = 'published';
    case ARCHIVED = 'archived';
}
```

Other enums:

```text
QuestionType
AttemptStatus
AiGenerationStatus
AiGeneratedQuestionStatus
AttemptEventType
```

---

# 26. API / Routes

Use web routes for Inertia pages.

Example:

```text
/dashboard

/tests
/tests/create
/tests/{test}
/tests/{test}/edit

/tests/{test}/questions
/tests/{test}/questions/create

/tests/{test}/publish

/tests/{test}/results

/tests/{test}/export
```

Participant:

```text
/join
/test/{token}
/attempt/{attempt}
/attempt/{attempt}/submit
```

AI:

```text
/tests/{test}/ai/generate
/ai-generations/{generation}
/ai-generations/{generation}/approve
/ai-generations/{generation}/reject
```

Use authorization policies for provider-owned resources.

---

# 27. Database Design

Initial database:

```text
users

tests
questions
question_options
test_questions
question_banks

attempts
attempt_answers
attempt_events

ai_generations
ai_generated_questions
```

Relationships:

```text
User
 └── hasMany Tests

Test
 ├── belongsTo User
 ├── belongsToMany Questions
 └── hasMany Attempts

Question
 ├── belongsTo QuestionBank
 ├── hasMany QuestionOptions
 └── belongsToMany Tests

Attempt
 ├── belongsTo Test
 ├── hasMany AttemptAnswers
 └── hasMany AttemptEvents
```

---

# 28. Database Rules

Use foreign keys.

Use indexes for:

```text
tests.user_id
tests.token
tests.status

questions.question_bank_id

test_questions.test_id
test_questions.question_id

attempts.test_id
attempts.status

attempt_answers.attempt_id
attempt_answers.question_id

attempt_events.attempt_id

ai_generations.user_id
ai_generations.status
```

Token must have a unique index.

---

# 29. Validation Rules

Never trust frontend validation.

All important validation must happen server-side.

Examples:

Test:

```text
title required
duration > 0
start_at < end_at
```

Multiple choice:

```text
minimum 2 options
exactly 1 correct answer
question required
points >= 0
```

Attempt:

```text
test must be published
test must be active
attempt must belong to participant/session
attempt must not already be submitted
current time must not exceed expires_at
```

---

# 30. Security Requirements

Implement:

- CSRF protection
- Authentication
- Authorization policies
- Rate limiting
- Input validation
- File MIME validation
- File size limits
- Secure random test tokens
- Secure PDF storage
- Prevent unauthorized question access
- Prevent unauthorized result access

Do not expose internal database IDs unnecessarily in public participant URLs.

---

# 31. PDF Security

Uploaded PDF must:

- Validate MIME type
- Validate extension
- Limit file size
- Store outside public directory where possible
- Generate unique file names
- Never execute uploaded files
- Sanitize extracted text

---

# 32. Queue Architecture

AI generation must use Laravel Queue.

Flow:

```text
Provider uploads PDF
        ↓
Create ai_generation
        ↓
Dispatch Job
        ↓
Redis Queue
        ↓
Worker
        ↓
Extract PDF
        ↓
Generate AI Questions
        ↓
Validate JSON
        ↓
Save results
        ↓
Update status = completed
```

Frontend should poll the generation status or use a future websocket implementation.

MVP can use polling.

---

# 33. Environment Variables

Expected environment configuration:

```env
APP_NAME=
APP_URL=

DB_CONNECTION=
DB_HOST=
DB_PORT=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

REDIS_HOST=
REDIS_PORT=

QUEUE_CONNECTION=redis

FILESYSTEM_DISK=

AI_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=
```

Never commit API keys.

---

# 34. Testing Strategy

Create automated tests for critical business logic.

## Feature Tests

Test:

```text
Provider can create test
Provider cannot access another provider's test
Provider can create question
Provider can publish test
Participant can join using valid token
Participant cannot join invalid token
Participant cannot join expired test
Participant can start attempt
Participant can save answer
Participant can submit attempt
Attempt cannot submit twice
Expired attempt cannot submit normally
MCQ is graded correctly
Essay requires manual grading
```

## AI Tests

Do not make automated tests depend on real LLM responses.

Mock:

```text
QuestionGeneratorInterface
```

and return deterministic JSON.

---

# 35. UI Pages

## Provider

```text
/auth/login
/auth/register

/dashboard

/tests
/tests/create
/tests/{id}
/tests/{id}/edit

/tests/{id}/questions
/tests/{id}/questions/create
/tests/{id}/questions/{question}/edit

/tests/{id}/ai
/tests/{id}/ai/{generation}

tests/{id}/results
tests/{id}/results/{attempt}
```

## Participant

```text
/join
/test/{token}
/attempt/{id}
```

---

# 36. Dashboard MVP

Dashboard cards:

```text
Total Tests
Published Tests
Total Participants
Average Score
```

Recent tests:

```text
Test
Status
Participants
Created At
Actions
```

Do not build advanced analytics yet.

---

# 37. UX Requirements

Provider UI should prioritize:

```text
Create Test
    ↓
Add Questions
    ↓
Review
    ↓
Publish
```

AI generation should have clear progress:

```text
Uploading PDF...
Extracting content...
Generating questions...
Validating questions...
Ready for review
```

Never show a blank screen while the AI job is running.

---

# 38. Error Handling

Implement consistent error responses.

For AI:

```text
PDF extraction failed
AI provider unavailable
AI response invalid
Rate limit exceeded
Generation timeout
```

Generation status must become:

```text
failed
```

and store:

```text
error_message
```

Provider should be able to retry failed generations.

---

# 39. Logging

Log important events:

```text
AI generation started
AI generation completed
AI generation failed
Attempt started
Attempt submitted
Attempt expired
Test published
Test unpublished
```

Do not log sensitive API keys or unnecessary participant data.

---

# 40. MVP Development Order

Build in this exact order.

## Phase 1 — Project Foundation

- Initialize Laravel
- Configure React + Inertia
- Configure TypeScript
- Configure Tailwind
- Configure database
- Configure Redis
- Configure Queue
- Setup authentication
- Setup base layouts
- Setup code formatting/linting

---

## Phase 2 — Test Management

Implement:

- Test model
- Migration
- Factory
- Seeder
- CRUD
- Policy
- Test status
- Test scheduling
- Token generation
- Publish/unpublish

---

## Phase 3 — Question Management

Implement:

- Question model
- Question option model
- Question bank
- Test-question pivot
- MCQ CRUD
- Essay CRUD
- Question ordering

---

## Phase 4 — Participant Engine

Implement:

- Join test
- Token validation
- Participant identity
- Attempt creation
- Start test
- Server-side timer
- Question navigation
- Answer autosave
- Submit test
- Timeout handling

---

## Phase 5 — Grading

Implement:

- MCQ automatic grading
- Essay manual grading
- Score calculation
- Result storage
- Result dashboard

---

## Phase 6 — Anti-Cheat

Implement:

- Fullscreen
- Fullscreen exit detection
- Tab visibility detection
- Window blur/focus
- Attempt events
- Warning system

Do not claim this provides complete anti-cheating protection.

---

## Phase 7 — Excel

Implement:

- Result export
- Question-level export
- Excel formatting
- Download authorization

---

## Phase 8 — AI

Implement:

- PDF upload
- PDF extraction
- Text cleaning
- Chunking
- AI service abstraction
- OpenAI provider
- Structured output validation
- Queue job
- AI generation status
- Generated question preview
- Approve/reject
- Save approved questions

---

# 41. Definition of Done — MVP

The MVP is considered complete when this entire scenario works:

```text
Provider
    ↓
Login
    ↓
Create "Matematika Dasar"
    ↓
Upload PDF
    ↓
Generate 20 questions using AI
    ↓
Review generated questions
    ↓
Approve questions
    ↓
Publish test
    ↓
Receive token
```

Then:

```text
Participant
    ↓
Open /join
    ↓
Enter token
    ↓
Enter name
    ↓
Start
    ↓
Fullscreen
    ↓
Answer 20 questions
    ↓
Answers auto-save
    ↓
Timer expires
    ↓
Automatic submit
    ↓
MCQ automatically graded
```

Then:

```text
Provider
    ↓
Open Results
    ↓
See participant scores
    ↓
Review essay answers
    ↓
Enter manual score
    ↓
Export Excel
```

---

# 42. Important Development Rules for AI Coding Assistant

The coding assistant MUST follow these rules:

### Rule 1 — Do not implement everything at once

Implement the project incrementally by phase.

After each phase:

```text
Code
→ Test
→ Fix
→ Continue
```

### Rule 2 — Do not introduce unnecessary technologies

Do not add:

- Microservices
- Kubernetes
- GraphQL
- Vector database
- WebSocket
- RAG
- Separate Node backend
- Separate Go backend

unless explicitly requested.

### Rule 3 — Follow Laravel conventions

Use:

- Form Requests
- Policies
- Eloquent relationships
- Services/Actions
- Jobs
- Events where appropriate
- Enums
- API Resources where appropriate
- Database transactions

Avoid putting business logic inside controllers.

### Rule 4 — Use TypeScript

Do not create new React files using plain JavaScript.

### Rule 5 — Do not trust client-side data

Important values must always be validated server-side.

Especially:

```text
timer
score
correct answer
test availability
participant identity
test token
attempt status
```

### Rule 6 — AI output is untrusted

Never directly trust LLM output.

Always:

```text
LLM
 ↓
Schema validation
 ↓
Business validation
 ↓
Database
```

### Rule 7 — AI generation must be asynchronous

Never block a normal HTTP request while generating a large number of questions.

Use:

```text
Laravel Job + Redis Queue
```

### Rule 8 — Keep AI provider replaceable

Application code should depend on:

```text
QuestionGeneratorInterface
```

rather than OpenAI-specific code.

---

# 43. Future Development — NOT MVP

Keep these features outside MVP:

```text
AI Essay Grading
AI Feedback
AI Question Quality Evaluation

Question Randomization
Option Randomization
Question Pool

Advanced Analytics
Question Difficulty Analytics
Question Discrimination Analytics

Webcam Monitoring
Face Detection
Face Recognition
Screen Monitoring

Browser Lockdown
Mobile App

RAG
Vector Database
Knowledge Base

Organization / Multi Tenant
Teacher Roles
Admin Roles
Student Accounts

Subscription
Payment
Usage Limits

Public Question Marketplace

Certificate Generation
```

---

# 44. Future SaaS Architecture

If the product becomes SaaS, introduce:

```text
Organization
    ↓
Users
    ├── Owner
    ├── Admin
    └── Teacher
```

Then:

```text
Organization
 ├── Question Banks
 ├── Tests
 ├── Participants
 └── Results
```

At that stage, introduce multi-tenancy.

Do NOT over-engineer multi-tenancy during MVP unless it is a hard business requirement.

---

# 45. Recommended Initial Tech Stack

```text
Backend:
Laravel
PHP 8.3+

Frontend:
React
TypeScript
Inertia.js
Tailwind CSS
Vite

Database:
PostgreSQL
(or existing MySQL installation)

Queue:
Redis
Laravel Horizon

Storage:
S3 / Cloudflare R2

AI:
OpenAI API

PDF:
PHP PDF text extraction library

Excel:
Laravel Excel

Testing:
PHPUnit / Pest
Laravel Feature Tests
Vitest where needed

Development:
Docker
Git
GitHub

CI:
GitHub Actions
```

---

# 46. First Milestone

The first coding milestone should NOT start with AI.

Start with:

```text
Laravel setup
    ↓
Authentication
    ↓
Test CRUD
    ↓
Question CRUD
    ↓
Participant join
    ↓
Attempt
    ↓
Timer
    ↓
Autosave
    ↓
Submit
    ↓
Grading
```

Once this works end-to-end, implement AI generation.

The core principle is:

> **The testing engine must work completely without AI. AI is an enhancement layer, not a dependency of the test engine.**

---

# 47. First Task for Coding Assistant

When starting implementation, the coding assistant should first:

1. Inspect the existing repository.
2. Determine whether the project is a new Laravel project or an existing application.
3. Check PHP/Laravel versions.
4. Check Node/NPM versions.
5. Check existing frontend setup.
6. Check database configuration.
7. Check whether Redis is available.
8. Do not overwrite existing configuration without confirmation.
9. Create the initial project architecture.
10. Implement Phase 1 only.
11. Run tests and build checks.
12. Report what was changed before continuing to Phase 2.

The assistant should **not automatically implement all phases in one response**.

---

# 48. Suggested Initial Repository Structure

```text
project/
├── app/
│   ├── Actions/
│   ├── Enums/
│   ├── Http/
│   ├── Jobs/
│   ├── Models/
│   ├── Policies/
│   ├── Services/
│   │   ├── AI/
│   │   ├── Attempt/
│   │   ├── Grading/
│   │   ├── PDF/
│   │   ├── Question/
│   │   └── Test/
│   └── Support/
│
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
│
├── resources/
│   ├── js/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── types/
│   │   └── utils/
│   └── views/
│
├── routes/
│   ├── web.php
│   └── api.php
│
├── tests/
│   ├── Feature/
│   │   ├── Test/
│   │   ├── Question/
│   │   ├── Attempt/
│   │   ├── Grading/
│   │   └── AI/
│   └── Unit/
│
├── docker/
│
├── .env.example
├── docker-compose.yml
└── PROJECT_PLAN.md
```

---

# 49. Product Principle

The system should follow this architecture:

```text
                     ┌───────────────┐
                     │   AI Layer    │
                     │               │
                     │ PDF → Questions│
                     └───────┬───────┘
                             │
                             ▼
┌──────────────┐      ┌───────────────┐
│   Provider   │─────▶│ Question Bank │
└──────────────┘      └───────┬───────┘
                               │
                               ▼
                        ┌────────────┐
                        │    Test    │
                        └─────┬──────┘
                              │
                              ▼
                       ┌─────────────┐
                       │   Attempt   │
                       └──────┬──────┘
                              │
                              ▼
                       ┌─────────────┐
                       │   Grading   │
                       └──────┬──────┘
                              │
                              ▼
                       ┌─────────────┐
                       │   Result    │
                       └─────────────┘
```

The most important architectural boundary is:

```text
AI Generation
      ≠
Test Execution
```

AI can fail without causing an already-published test to fail.

This separation will make the platform much easier to maintain, test, scale, and eventually turn into a SaaS product.