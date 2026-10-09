<?php

namespace App\Services\Ai;

class SourceTypeDetector
{
    public const MODE_EXAM_CONVERT = 'exam_convert';

    public const MODE_MATERIAL_GENERATE = 'material_generate';

    /**
     * Decide whether the extracted text is an exam sheet (questions already
     * present → convert verbatim) or study material (→ generate new questions).
     */
    public static function detect(string $text): string
    {
        $numbered = preg_match_all('/^\s*\d{1,3}[\.\)]\s+\S/m', $text);
        $options = preg_match_all('/^\s*[A-E][\.\)]\s+\S/m', $text);

        $keywords = [
            'pilihan ganda', 'pilihlah', 'berilah tanda', 'isilah titik',
            'uraian', 'jawablah', 'kerjakan soal', 'multiple choice',
            'petunjuk umum', 'jumlah soal', 'bentuk soal',
        ];
        $lower = mb_strtolower($text);
        $keywordHits = 0;
        foreach ($keywords as $kw) {
            if (str_contains($lower, $kw)) {
                $keywordHits++;
            }
        }

        if ($numbered >= 3 && $options >= $numbered) {
            return self::MODE_EXAM_CONVERT;
        }

        if ($numbered >= 5 && $options >= 4) {
            return self::MODE_EXAM_CONVERT;
        }

        if ($numbered >= 2 && $keywordHits >= 2) {
            return self::MODE_EXAM_CONVERT;
        }

        return self::MODE_MATERIAL_GENERATE;
    }
}
