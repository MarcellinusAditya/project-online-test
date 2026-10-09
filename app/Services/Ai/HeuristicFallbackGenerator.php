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
        $mode = SourceTypeDetector::detect($sourceText);

        // Exam sheets already contain real questions: parse them verbatim
        // (never cloze-ify). The source text carries no answer key, so leave
        // is_correct=false and keep the original A-E order — the provider
        // picks the key during review.
        if ($mode === SourceTypeDetector::MODE_EXAM_CONVERT) {
            try {
                return ExamTextParser::parse($sourceText, $count, $questionType, $difficulty);
            } catch (\Throwable) {
                // Fall through to material-style generation below.
            }
        }

        return $this->generateFromMaterial($sourceText, $count, $questionType, $difficulty);
    }

    /**
     * Shuffle option order so the correct answer lands on a random key.
     */
    public static function randomizeCorrectPosition(array $options): array
    {
        $texts = array_map(fn($o) => $o['text'], $options);
        $correctText = null;
        foreach ($options as $o) {
            if (! empty($o['is_correct'])) {
                $correctText = $o['text'];
                break;
            }
        }
        if ($correctText === null) {
            $correctText = $texts[0];
        }

        shuffle($texts);

        $keys = ['A', 'B', 'C', 'D', 'E', 'F'];
        $result = [];
        foreach (array_slice($texts, 0, count($options)) as $i => $text) {
            $result[] = [
                'key' => $keys[$i],
                'text' => $text,
                'is_correct' => $text === $correctText,
            ];
        }

        return $result;
    }

    private function generateFromMaterial(string $sourceText, int $count, string $questionType, string $difficulty): array
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
            $options = self::randomizeCorrectPosition($options);

            $points = $difficulty === 'easy' ? 5 : ($difficulty === 'hard' ? 10 : 7);

            $drafts[] = [
                'question' => $masked,
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
