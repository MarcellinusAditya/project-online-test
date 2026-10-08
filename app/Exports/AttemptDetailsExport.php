<?php

namespace App\Exports;

use App\Models\Test;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AttemptDetailsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected Test $test;

    public function __construct(Test $test)
    {
        $this->test = $test;
    }

    public function collection()
    {
        $pivotPoints = $this->test->questions()
            ->get()
            ->mapWithKeys(fn($q) => [$q->id => ($q->pivot->points ?? $q->points)]);

        $attempts = $this->test->attempts()
            ->with(['answers.question.options', 'answers.questionOption'])
            ->latest()
            ->get();

        $rows = collect();

        foreach ($attempts as $attempt) {
            foreach ($attempt->answers as $answer) {
                $rows->push([
                    'attempt' => $attempt,
                    'answer' => $answer,
                    'max_points' => $pivotPoints[$answer->question_id] ?? $answer->question->points,
                ]);
            }
        }

        return $rows;
    }

    public function headings(): array
    {
        return [
            'Participant Name',
            'Participant ID',
            'Question',
            'Question Type',
            'Participant Answer',
            'Correct Answer',
            'Is Correct',
            'Points Awarded',
            'Max Points',
            'Feedback',
        ];
    }

    public function map($row): array
    {
        $attempt = $row['attempt'];
        $answer = $row['answer'];
        $question = $answer->question;
        $maxPoints = $row['max_points'];

        $questionType = $question->type instanceof \BackedEnum ? $question->type->value : (string) $question->type;

        // Participant's answer text
        if ($questionType === 'multiple_choice') {
            $participantAnswer = $answer->questionOption
                ? "[{$answer->questionOption->key}] {$answer->questionOption->text}"
                : '-';
            $correctOption = $question->options->firstWhere('is_correct', true);
            $correctAnswer = $correctOption
                ? "[{$correctOption->key}] {$correctOption->text}"
                : '-';
        } else {
            $participantAnswer = $answer->answer_text ?? '-';
            $correctAnswer = '-';
        }

        $maxPoints = $row['max_points'];

        return [
            $attempt->participant_name,
            $attempt->participant_identifier,
            $question->question,
            $question->type->value ?? (string) $question->type,
            $participantAnswer,
            $correctAnswer,
            $answer->is_correct === null ? 'Pending' : ($answer->is_correct ? 'Yes' : 'No'),
            $answer->points_awarded,
            $maxPoints,
            $answer->feedback,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }

    public function title(): string
    {
        return 'Question Details';
    }
}
