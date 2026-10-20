<?php

namespace App\Exports;

use App\Models\Test;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class TestResultsExport implements WithMultipleSheets
{
    protected Test $test;

    protected array $filters;

    public function __construct(Test $test, array $filters = [])
    {
        $this->test = $test;
        $this->filters = $filters;
    }

    public function sheets(): array
    {
        return [
            new AttemptsExport($this->test, $this->filters),
            new AttemptDetailsExport($this->test, $this->filters),
        ];
    }
}
