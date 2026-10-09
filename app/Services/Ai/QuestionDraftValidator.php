<?php

namespace App\Services\Ai;

class QuestionDraftValidator
{
    /**
     * @return array<int, array>
     *
     * @throws \RuntimeException
     */
    public static function validate(string $rawJson, int $expectedCount, string $questionType): array
    {
        $decoded = json_decode($rawJson, true);

        if (! is_array($decoded)) {
            // Try to salvage a JSON array buried in prose.
            if (preg_match('/\[.*\]/s', $rawJson, $m)) {
                $decoded = json_decode($m[0], true);
            }
        }

        if (isset($decoded['questions']) && is_array($decoded['questions'])) {
            $decoded = $decoded['questions'];
        }

        if (! is_array($decoded) || $decoded === []) {
            throw new \RuntimeException('AI returned an empty or invalid question list.');
        }

        $items = array_slice(array_values($decoded), 0, $expectedCount);
        $validated = [];

        foreach ($items as $item) {
            if (! is_array($item) || empty($item['question']) || ! is_string($item['question'])) {
                continue;
            }

            $type = $item['type'] ?? $questionType;
            if (! in_array($type, ['multiple_choice', 'essay'], true)) {
                $type = 'multiple_choice';
            }

            $points = (int) ($item['points'] ?? 5);
            $points = max(1, min(100, $points));

            $options = [];
            if ($type === 'multiple_choice') {
                $rawOptions = is_array($item['options'] ?? null) ? array_values($item['options']) : [];
                $keys = ['A', 'B', 'C', 'D'];
                foreach (array_slice($rawOptions, 0, 4) as $i => $opt) {
                    $options[] = [
                        'key' => $keys[$i],
                        'text' => (string) ($opt['text'] ?? 'Option '.$keys[$i]),
                        'is_correct' => (bool) ($opt['is_correct'] ?? false),
                    ];
                }
                while (count($options) < 4) {
                    $i = count($options);
                    $options[] = ['key' => $keys[$i], 'text' => 'Option '.$keys[$i], 'is_correct' => false];
                }
                // Guarantee exactly one correct answer.
                $hasCorrect = collect($options)->contains('is_correct', true);
                if (! $hasCorrect) {
                    $options[0]['is_correct'] = true;
                } else {
                    $firstTrue = true;
                    foreach ($options as $i => $opt) {
                        if ($opt['is_correct'] && ! $firstTrue) {
                            $options[$i]['is_correct'] = false;
                        } elseif ($opt['is_correct']) {
                            $firstTrue = false;
                        }
                    }
                }
            }

            $validated[] = [
                'question' => trim($item['question']),
                'type' => $type,
                'points' => $points,
                'explanation' => isset($item['explanation']) && is_string($item['explanation']) ? $item['explanation'] : null,
                'options' => $options,
            ];
        }

        if ($validated === []) {
            throw new \RuntimeException('AI output failed business validation (no usable questions).');
        }

        return $validated;
    }
}
