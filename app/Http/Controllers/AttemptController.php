<?php

namespace App\Http\Controllers;

use App\Enums\AttemptEventType;
use App\Enums\AttemptStatus;
use App\Models\Attempt;
use App\Models\AttemptAnswer;
use App\Models\AttemptEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttemptController extends Controller
{
    public function show(string $id)
    {
        $attempt = Attempt::with(['test.questions.options', 'answers'])->findOrFail($id);

        if ($attempt->isExpired() && $attempt->status === AttemptStatus::IN_PROGRESS) {
            $attempt->update(['status' => AttemptStatus::EXPIRED]);
            AttemptEvent::log($attempt, AttemptEventType::TEST_EXPIRED);
        }

        if (! $attempt->isActive()) {
            return redirect()->route('attempt.result', $attempt->id);
        }

        $questions = $attempt->test->questions->map(function ($question) use ($attempt) {
            $answer = $attempt->answers->firstWhere('question_id', $question->id);
            return [
                'id' => $question->id,
                'question' => $question->question,
                'type' => $question->type,
                'points' => $question->pivot->points ?? $question->points,
                'options' => $question->options->map(fn($option) => [
                    'id' => $option->id,
                    'key' => $option->key,
                    'text' => $option->text,
                ]),
                'selected_option_id' => $answer?->question_option_id,
                'answer_text' => $answer?->answer_text,
            ];
        });

        return Inertia::render('Attempt/Take', [
            'attempt' => [
                'id' => $attempt->id,
                'test_id' => $attempt->test_id,
                'test_title' => $attempt->test->title,
                'participant_name' => $attempt->participant_name,
                'started_at' => $attempt->started_at->toIso8601String(),
                'expires_at' => $attempt->expires_at->toIso8601String(),
                'remaining_seconds' => $attempt->remaining_seconds,
                'status' => $attempt->status->value,
            ],
            'questions' => $questions,
            'current_question_index' => 0,
        ]);
    }

    public function saveAnswer(Request $request, string $attemptId)
    {
        $attempt = Attempt::findOrFail($attemptId);

        if (! $attempt->isActive()) {
            return response()->json(['error' => 'Attempt is no longer active'], 422);
        }

        $request->validate([
            'question_id' => 'required|exists:questions,id',
            'question_option_id' => 'nullable|exists:question_options,id',
            'answer_text' => 'nullable|string',
        ]);

        $answer = $attempt->answers()->updateOrCreate(
            [
                'attempt_id' => $attempt->id,
                'question_id' => $request->question_id,
            ],
            [
                'question_option_id' => $request->question_option_id,
                'answer_text' => $request->answer_text,
            ]
        );

        AttemptEvent::log($attempt, AttemptEventType::ANSWER_SAVED, [
            'question_id' => $request->question_id,
        ]);

        return response()->json(['success' => true, 'answer_id' => $answer->id]);
    }

    public function submit(Request $request, string $attemptId)
    {
        $attempt = Attempt::findOrFail($attemptId);

        if (! $attempt->isActive()) {
            return response()->json(['error' => 'Attempt is no longer active'], 422);
        }

        $attempt->update([
            'status' => AttemptStatus::SUBMITTED,
            'submitted_at' => now(),
            'time_spent_seconds' => $attempt->started_at->diffInSeconds(now()),
        ]);

        AttemptEvent::log($attempt, AttemptEventType::TEST_SUBMITTED);

        $this->gradeAttempt($attempt);

        return redirect()->route('attempt.result', $attempt->id);
    }

    public function result(string $id)
    {
        $attempt = Attempt::with(['test', 'answers.question.options', 'answers.questionOption'])->findOrFail($id);

        $answers = $attempt->answers->map(function ($answer) {
            return [
                'id' => $answer->id,
                'question_id' => $answer->question_id,
                'question' => $answer->question->question,
                'type' => $answer->question->type,
                'points' => $answer->question->pivot->points ?? $answer->question->points,
                'options' => $answer->question->options->map(fn($option) => [
                    'id' => $option->id,
                    'key' => $option->key,
                    'text' => $option->text,
                    'is_correct' => $option->is_correct,
                ]),
                'selected_option_id' => $answer->question_option_id,
                'selected_option_key' => $answer->questionOption?->key,
                'answer_text' => $answer->answer_text,
                'is_correct' => $answer->is_correct,
                'points_awarded' => $answer->points_awarded,
                'feedback' => $answer->feedback,
                'is_graded' => $answer->is_graded,
            ];
        });

        return Inertia::render('Attempt/Result', [
            'attempt' => [
                'id' => $attempt->id,
                'test_title' => $attempt->test->title,
                'participant_name' => $attempt->participant_name,
                'participant_identifier' => $attempt->participant_identifier,
                'status' => $attempt->status->value,
                'score' => $attempt->score,
                'total_correct' => $attempt->total_correct,
                'total_wrong' => $attempt->total_wrong,
                'total_unanswered' => $attempt->total_unanswered,
                'time_spent_seconds' => $attempt->time_spent_seconds,
                'started_at' => $attempt->started_at->toIso8601String(),
                'submitted_at' => $attempt->submitted_at?->toIso8601String(),
                'show_result' => $attempt->test->show_result,
            ],
            'answers' => $answers,
        ]);
    }

    private function gradeAttempt(Attempt $attempt): void
    {
        $answers = $attempt->answers()->with(['question.options', 'questionOption'])->get();

        $totalCorrect = 0;
        $totalWrong = 0;
        $totalUnanswered = 0;
        $totalScore = 0;
        $totalPossible = 0;

        foreach ($answers as $answer) {
            $question = $answer->question;
            $maxPoints = $question->pivot->points ?? $question->points;
            $totalPossible += $maxPoints;

            if ($question->type === 'multiple_choice') {
                if ($answer->question_option_id === null) {
                    $totalUnanswered++;
                    $answer->update([
                        'is_correct' => false,
                        'points_awarded' => 0,
                        'is_graded' => true,
                    ]);
                    continue;
                }

                $correctOption = $question->options()->where('is_correct', true)->first();
                $isCorrect = $correctOption && $answer->question_option_id === $correctOption->id;

                if ($isCorrect) {
                    $totalCorrect++;
                    $totalScore += $maxPoints;
                    $answer->update([
                        'is_correct' => true,
                        'points_awarded' => $maxPoints,
                        'is_graded' => true,
                    ]);
                } else {
                    $totalWrong++;
                    $answer->update([
                        'is_correct' => false,
                        'points_awarded' => 0,
                        'is_graded' => true,
                    ]);
                }
            } else {
                if ($answer->answer_text === null || trim($answer->answer_text) === '') {
                    $totalUnanswered++;
                    $answer->update([
                        'is_correct' => false,
                        'points_awarded' => 0,
                        'is_graded' => false,
                    ]);
                } else {
                    $answer->update([
                        'is_correct' => null,
                        'points_awarded' => 0,
                        'is_graded' => false,
                    ]);
                }
            }
        }

        $score = $totalPossible > 0 ? round(($totalScore / $totalPossible) * 100) : 0;

        $attempt->update([
            'score' => $score,
            'total_correct' => $totalCorrect,
            'total_wrong' => $totalWrong,
            'total_unanswered' => $totalUnanswered,
        ]);
    }
}
