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
                $keys = ['A', 'B', 'C', 'D', 'E', 'F'];
                foreach (array_slice($rawOptions, 0, 6) as $i => $opt) {
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
                // Guarantee exactly one correct answer, keeping the AI's
                // chosen position (randomized) instead of forcing key A.
                // Exception: exam-convert drafts carry no source key (all
                // false) — leave them so the provider picks the key.
                $trueIndexes = [];
                foreach ($options as $i => $opt) {
                    if (! empty($opt['is_correct'])) {
                        $trueIndexes[] = $i;
                    }
                }
                if ($trueIndexes === []) {
                    $explicitNoKey = ($item['no_known_key'] ?? false) === true;
                    if (! $explicitNoKey) {
                        $options[array_rand($options)]['is_correct'] = true;
                    }
                } else {
                    $keep = $trueIndexes[0];
                    foreach ($options as $i => $opt) {
                        $options[$i]['is_correct'] = ($i === $keep);
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
