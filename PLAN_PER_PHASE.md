# Online Test Platform — Development Plan Per Phase

## Phase 1 — Project Foundation

### Goal
Setup project infrastructure dan development environment.

### Tasks
1. **Initialize Laravel Project**
   - Install Laravel latest
   - Configure `.env` (database, Redis, queue)
   - Setup PostgreSQL/MySQL

2. **Configure Frontend Stack**
   - Install React + Inertia.js
   - Setup TypeScript
   - Configure Tailwind CSS
   - Setup Vite

3. **Authentication Setup**
   - Install Laravel Breeze (React)
   - Configure login/register
   - Setup middleware

4. **Base Layouts**
   - Create `AuthLayout.tsx`
   - Create `DashboardLayout.tsx`
   - Create basic navigation

5. **Development Tools**
   - Setup ESLint + Prettier
   - Configure PHP CS Fixer
   - Setup Git hooks

### Deliverables
- [x] Laravel project running
- [x] React + Inertia working
- [x] Authentication functional
- [x] Base layouts ready

---

## Phase 2 — Test Management

### Goal
Provider bisa membuat, mengelola, dan publish test.

### Tasks
1. **Database Design**
   - Create `tests` migration
   - Fields: id, user_id, title, description, token, start_at, end_at, duration_minutes, status, show_result

2. **Models & Relationships**
   - Create `Test` model
   - Setup `belongsTo(User)` relationship
   - Create `TestStatus` enum (draft, published, archived)

3. **CRUD Operations**
   - Create TestController
   - Create TestRequest (validation)
   - Create test pages (index, create, edit, show)

4. **Authorization**
   - Create TestPolicy
   - Provider hanya bisa akses test sendiri

5. **Token Generation**
   - Generate secure random token (contoh: UGR-20260826-X8K2)
   - Unique index on token

6. **Publish/Unpublish**
   - Toggle status draft → published
   - Validate test sebelum publish

### Deliverables
- [x] Test CRUD functional
- [x] Token generation working
- [x] Authorization policies active

---

## Phase 3 — Question Management

### Goal
Provider bisa membuat dan mengelola soal.

### Tasks
1. **Database Design**
   - Create `question_banks` table
   - Create `questions` table
   - Create `question_options` table
   - Create `test_questions` pivot table

2. **Models**
   - QuestionBank model
   - Question model
   - QuestionOption model
   - QuestionType enum (multiple_choice, essay)

3. **MCQ CRUD**
   - Create question with options
   - Validate minimum 2 options
   - Validate exactly 1 correct answer
   - Set points

4. **Essay CRUD**
   - Create essay question
   - Set points

5. **Question Bank**
   - Reusable questions across tests
   - Question ordering (sort_order)

6. **Test-Question Association**
   - Add questions to test
   - Custom points per test (optional)

### Deliverables
- [x] Question CRUD working
- [x] Question bank functional
- [x] Test-question association ready

---

## Phase 4 — Participant Engine

### Goal
Participant bisa join test dan mengerjakan soal.

### Tasks
1. **Database Design**
   - Create `attempts` table
   - Create `attempt_answers` table
   - Create `attempt_events` table

2. **Join Flow**
   - `/join` page
   - Token validation
   - Check test availability (published + time window)
   - Enter participant identity (name, identifier)

3. **Attempt Creation**
   - Create attempt record
   - Set `started_at = now()`
   - Set `expires_at = started_at + duration`

4. **Test UI**
   - Timer display (countdown)
   - Question navigation (1, 2, 3, ...)
   - Question display
   - Options display
   - Previous/Next buttons
   - Submit button

5. **Answer Auto Save**
   - Auto save when option selected
   - API endpoint for saving
   - Backend validation

6. **Timer System**
   - Server-authoritative timer
   - Auto-submit when expired
   - Never trust client-side timer

7. **Submit Flow**
   - Manual submit
   - Auto submit on timeout
   - Prevent double submit

### Deliverables
- [x] Join flow working
- [x] Attempt creation functional
- [x] Test UI complete
- [x] Auto-save working
- [x] Timer system accurate

---

## Phase 5 — Grading

### Goal
Automatic grading untuk MCQ, manual grading untuk essay.

### Tasks
1. **MCQ Grading**
   - Compare participant_answer === correct_answer
   - Calculate score
   - Store is_correct, points

2. **Essay Grading**
   - Status: pending_manual_review
   - Provider can assign score
   - Provider can add feedback

3. **Score Calculation**
   - Total correct
   - Total wrong
   - Total unanswered
   - Final score

4. **Result Dashboard**
   - Total participants
   - Average score
   - Highest/lowest score
   - Pass rate

5. **Participant Result Table**
   - List all participants
   - Score, correct, wrong, duration
   - Link to detail

6. **Result Detail**
   - Question by question review
   - Participant answer vs correct answer
   - Points awarded

### Deliverables
- [x] MCQ auto-grading working
- [x] Essay manual grading functional
- [x] Result dashboard complete

---

## Phase 6 — Anti-Cheat

### Goal
Basic deterrence dan event logging.

### Tasks
1. **Fullscreen**
   - Request fullscreen on start
   - Detect fullscreenchange
   - Log event when exit

2. **Tab Switching**
   - Use visibilitychange API
   - Detect when hidden
   - Record tab_hidden event

3. **Window Focus**
   - Detect blur/focus
   - Record suspicious activity

4. **Event Logging**
   - Store all events in attempt_events
   - Event types: test_started, fullscreen_entered/exited, tab_hidden/visible, window_blur/focus

5. **Warning System**
   - Show warning when suspicious activity detected
   - Log warning count

### Deliverables
- [x] Fullscreen detection working
- [x] Tab switching detection
- [x] Event logging active

---

## Phase 7 — Excel Export

### Goal
Export results ke Excel.

### Tasks
1. **Install Laravel Excel**
   - Configure package

2. **Export Columns**
   - Participant, Identifier, Test
   - Started At, Submitted At, Duration
   - Total Questions, Correct, Wrong, Unanswered
   - Score, Status

3. **Question Details Sheet**
   - Optional second sheet
   - Question, Answer, Correct, Points

4. **Download Authorization**
   - Only test owner can export

5. **Excel Formatting**
   - Proper headers
   - Number formatting
   - Date formatting

### Deliverables
- [x] Excel export working
- [x] Authorization enforced

---

## Phase 8 — AI Generation

### Goal
Provider bisa generate soal dari PDF menggunakan AI.

### Tasks
1. **PDF Upload**
   - Upload form
   - Validate MIME type
   - Validate file size
   - Store securely

2. **PDF Processing**
   - Extract text (PHP library)
   - Clean text
   - Chunk if necessary

3. **AI Service Abstraction**
   - Create `QuestionGeneratorInterface`
   - Implement `OpenAiQuestionGenerator`

4. **Queue Job**
   - Create `GenerateQuestionsJob`
   - Use Redis queue
   - Track status (pending, processing, completed, failed)

5. **AI Output Validation**
   - Validate JSON structure
   - Business validation
   - Save as draft (ai_generated_questions)

6. **Review Flow**
   - Preview generated questions
   - Approve → move to question bank
   - Reject → discard

7. **Status Tracking**
   - Show progress to provider
   - Polling for status updates

### Deliverables
- [x] PDF upload working
- [x] AI generation functional
- [x] Review flow complete
- [x] Questions saved to bank

---

## Phase 9 — Question Bank Management

**Status: selesai (13 Oktober 2026, `feature/phase-9-question-bank`)**

### Goal
Soal dapat dikelola sebagai library reusable di luar test dan diimpor ke test mana pun.

### Tasks
1. **Question Bank CRUD** — halaman Index/Create/Edit/Show, pencarian + paginasi
2. **Authorization** — `QuestionBankPolicy` owner-only
3. **Reusable Import** — clone soal + opsi dari bank ke test tujuan (file gambar di-copy, `sort_order` lanjutan)
4. **Integrasi UI** — menu sidebar aktif, tombol "From Bank" di workspace soal test

### Deliverables
- [x] Question bank CRUD working
- [x] Ownership policy enforced
- [x] Import/clone into test working

---

## Phase 10 — Results Enhancement

**Status: selesai (19 Oktober 2026, `feature/phase-10-results-enhancement`)**

### Goal
Dashboard hasil global, statistik per test yang lengkap, dan export yang bisa difilter.

### Tasks
1. **Passing Score** — kolom `passing_score` per test (migration + form Create/Edit)
2. **Global Results** — halaman `/results`: ringkasan semua test (peserta, completed, rata-rata, pass rate) + tabel per test
3. **Per-Test Results** — filter status peserta, kartu pass rate/unanswered, tombol export
4. **Export Enhancement** — filter status & rentang tanggal, opsi CSV selain Excel
5. **Sidebar** — menu Results aktif

### Deliverables
- [x] Passing score configurable
- [x] Global results dashboard working
- [x] Per-test filters working
- [x] Filtered Excel/CSV export working

---

## Phase 11 — Settings

**Status: selesai (20 Oktober 2026, `feature/phase-11-settings`)**

### Goal
Preferensi user, default test, dan integrasi.

### Tasks
1. **Profile** — nama, email, avatar, ubah password (sebagian sudah ada di halaman Profile)
2. **Test Defaults** — durasi default, jumlah soal default, auto-publish, default show_result
3. **Appearance** — tema (light/dark/system), bahasa (id/en)
4. **Notifications** — email saat ada attempt baru, ringkasan harian/mingguan
5. **API / Integrations** — API key management, webhook hasil test
6. **Danger Zone** — hapus akun, export data

### Deliverables
- [x] Settings pages working
- [x] Test defaults applied on create
- [x] Notification preferences saved
- [x] Appearance (light/dark/system) applied app-wide
- [x] Webhook + summary email integration

**Ditunda ke Phase 12:** API key management (Sanctum) dan language id/en.

---

## Development Order Summary

```
Phase 1: Foundation (Setup)
    ↓
Phase 2: Test Management (CRUD)
    ↓
Phase 3: Question Management (CRUD)
    ↓
Phase 4: Participant Engine (Join, Timer, Auto-save)
    ↓
Phase 5: Grading (Auto + Manual)
    ↓
Phase 6: Anti-Cheat (Detection, Logging)
    ↓
Phase 7: Excel Export
    ↓
Phase 8: AI Generation (PDF → Questions)
    ↓
Phase 9: Question Bank (Reusable Library)  ✅
    ↓
Phase 10: Results Enhancement  ✅
    ↓
Phase 11: Settings  ✅
```

## Key Principles

1. **Test engine must work without AI** — AI is enhancement, not dependency
2. **Server-side validation always** — Never trust client data
3. **Implement incrementally** — Code → Test → Fix → Continue
4. **Follow Laravel conventions** — Form Requests, Policies, Services, Jobs
5. **Use TypeScript** — No plain JavaScript in React
