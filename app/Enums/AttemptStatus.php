<?php

namespace App\Enums;

enum AttemptStatus: string
{
    case IN_PROGRESS = 'in_progress';
    case SUBMITTED = 'submitted';
    case EXPIRED = 'expired';
    case GRADING = 'grading';

    public function label(): string
    {
        return match ($this) {
            self::IN_PROGRESS => 'In Progress',
            self::SUBMITTED => 'Submitted',
            self::EXPIRED => 'Expired',
            self::GRADING => 'Grading',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::IN_PROGRESS => 'blue',
            self::SUBMITTED => 'green',
            self::EXPIRED => 'red',
            self::GRADING => 'yellow',
        };
    }
}
