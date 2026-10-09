<?php

namespace App\Services\Ai;

interface QuestionGeneratorInterface
{
    /**
     * @return array<int, array{question: string, type: string, points: int, explanation: ?string, options: array<int, array{key: string, text: string, is_correct: bool}>}>
     */
    public function generate(string $sourceText, int $count, string $questionType, string $difficulty): array;

    public function name(): string;
}
