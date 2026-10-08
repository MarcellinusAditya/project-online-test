<?php

namespace App\Exports;

use App\Models\Test;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class TestResultsExport implements WithMultipleSheets
{
    protected Test $test;

    public function __construct(Test $test)
    {
        $this->test = $test;
    }

    public function sheets(): array
    {
        return [
            new AttemptsExport($this->test),
            new AttemptDetailsExport($this->test),
        ];
    }
}
