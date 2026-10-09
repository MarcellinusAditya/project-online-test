<?php

namespace App\Services\Ai;

/**
 * Offline fallback generator: builds deterministic draft questions from the
 * extracted text so the feature works without any external API key.
 */
class HeuristicFallbackGenerator implements QuestionGeneratorInterface
{
    public function name(): string
    {
        return 'heuristic-fallback';
    }

    public function generate(string $sourceText, int $count, string $questionType, string $difficulty): array
    {
        $sentences = preg_split('/(?<=[.!?])\s+/', preg_replace('/\s+/', ' ', trim($sourceText)));
        $sentences = array_values(array_filter(array_map('trim', $sentences ?: []), fn($s) => mb_strlen($s) > 40));

        if ($sentences === []) {
            throw new \RuntimeException('Not enough readable text to generate questions.');
        }

        $drafts = [];
        $i = 0;
        while (count($drafts) < $count && $i < count($sentences) * 2) {
            $sentence = $sentences[$i % count($sentences)];
            $i++;

            if ($questionType === 'essay' && count($drafts) % 2 === 0) {
                $drafts[] = [
                    'question' => "Explain in your own words: {$sentence}",
                    'type' => 'essay',
                    'points' => 10,
                    'explanation' => null,
                    'options' => [],
                ];
                continue;
            }

            // Build a cloze-style MCQ from a keyword in the sentence.
            $words = preg_split('/\s+/', $sentence);
            $keywords = array_values(array_filter($words, fn($w) => mb_strlen(trim($w, ".,;:()\"'")) >= 6));
            if (count($keywords) < 3) {
                continue;
            }
            $answer = trim($keywords[0], ".,;:()\"'");
            $masked = str_replace($answer, '_____', $sentence);
            $distractors = array_slice(array_map(fn($w) => trim($w, ".,;:()\"'"), $keywords), 1, 3);

            $options = [
                ['key' => 'A', 'text' => $answer, 'is_correct' => true],
            ];
            foreach (['B', 'C', 'D'] as $idx => $key) {
                $options[] = ['key' => $key, 'text' => $distractors[$idx] ?? "Alternative {$key}", 'is_correct' => false];
            }

            $points = $difficulty === 'easy' ? 5 : ($difficulty === 'hard' ? 10 : 7);

            $drafts[] = [
                'question' => "Complete the statement ({$difficulty}): {$masked}",
                'type' => 'multiple_choice',
                'points' => $points,
                'explanation' => "Based on the material: \"{$sentence}\"",
                'options' => $options,
            ];
        }

        if ($drafts === []) {
            throw new \RuntimeException('Could not derive questions from the provided text.');
        }

        return array_slice($drafts, 0, $count);
    }
}
