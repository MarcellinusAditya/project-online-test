<?php

namespace App\Exports;

use App\Enums\AttemptEventType;
use App\Models\Test;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AttemptsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected Test $test;

    protected array $filters;

    protected array $suspiciousTypes = [];

    public function __construct(Test $test, array $filters = [])
    {
        $this->test = $test;
        $this->filters = $filters;
        $this->suspiciousTypes = [
            AttemptEventType::FULLSCREEN_EXITED->value,
            AttemptEventType::TAB_HIDDEN->value,
            AttemptEventType::WINDOW_BLUR->value,
            AttemptEventType::WARNING_ISSUED->value,
        ];
    }

    public function collection()
    {
        return $this->test->attempts()
            ->filtered($this->filters)
            ->withCount(['events as warnings_count' => fn($q) => $q->whereIn('event_type', $this->suspiciousTypes)])
            ->with('test')
            ->latest()
            ->get();
    }

    public function headings(): array
    {
        return [
            'No',
            'Participant Name',
            'Participant ID',
            'Test Title',
            'Status',
            'Score (%)',
            'Correct',
            'Wrong',
            'Unanswered',
            'Warnings',
            'Time Spent (sec)',
            'Started At',
            'Submitted At',
        ];
    }

    public function map($attempt): array
    {
        static $no = 0;
        $no++;

        return [
            $no,
            $attempt->participant_name,
            $attempt->participant_identifier,
            $attempt->test->title,
            $attempt->status->value,
            $attempt->score,
            $attempt->total_correct,
            $attempt->total_wrong,
            $attempt->total_unanswered,
            $attempt->warnings_count ?? 0,
            $attempt->time_spent_seconds,
            $attempt->started_at?->format('Y-m-d H:i:s'),
            $attempt->submitted_at?->format('Y-m-d H:i:s'),
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
        return 'Participants';
    }
}
