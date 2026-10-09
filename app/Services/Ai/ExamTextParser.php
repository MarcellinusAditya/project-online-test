<?php

namespace App\Services\Ai;

class ExamTextParser
{
    /**
     * Parse an exam sheet's extracted text into draft questions verbatim.
     * Header/identity lines (Nama, Kelas, Tanggal, ...) are discarded so they
     * never become questions. Correct keys are left unknown (all false) — the
     * provider sets the key during review.
     *
     * @return array<int, array>
     *
     * @throws \RuntimeException
     */
    public static function parse(string $text, int $count, string $questionType, string $difficulty): array
    {
        $lines = preg_split('/\r\n|\r|\n/', $text);
        $kept = [];

        foreach ($lines as $line) {
            $trimmed = trim($line);

            if ($trimmed === '') {
                $kept[] = '';
                continue;
            }

            if (self::isHeaderLine($trimmed)) {
                continue;
            }

            $kept[] = $line;
        }

        $cleaned = implode("\n", $kept);

        $blocks = preg_split('/(?=^\s*\d{1,3}[\.\)]\s+\S)/m', $cleaned);
        $blocks = array_values(array_filter(
            array_map('trim', $blocks ?: []),
            fn($b) => preg_match('/^\s*\d{1,3}[\.\)]\s+\S/', $b)
        ));

        if ($blocks === []) {
            throw new \RuntimeException('No numbered questions found in the document.');
        }

        $points = $difficulty === 'easy' ? 5 : ($difficulty === 'hard' ? 10 : 7);
        $drafts = [];

        foreach ($blocks as $block) {
            if (count($drafts) >= $count) {
                break;
            }

            $parsed = self::parseBlock($block);

            if ($parsed === null) {
                continue;
            }

            [$questionText, $optionTexts] = $parsed;

            if (mb_strlen($questionText) < 10) {
                continue;
            }

            if ($questionType === 'essay') {
                $drafts[] = [
                    'question' => $questionText,
                    'type' => 'essay',
                    'points' => 10,
                    'explanation' => null,
                    'options' => [],
                ];
                continue;
            }

            if (count($optionTexts) < 2) {
                continue;
            }

            $keys = ['A', 'B', 'C', 'D', 'E', 'F'];
            $options = [];
            foreach (array_slice($optionTexts, 0, 6) as $i => $optText) {
                $options[] = [
                    'key' => $keys[$i],
                    'text' => $optText,
                    'is_correct' => false,
                ];
            }

            $drafts[] = [
                'question' => $questionText,
                'type' => 'multiple_choice',
                'points' => $points,
                'explanation' => null,
                'no_known_key' => true,
                'options' => $options,
            ];
        }

        if ($drafts === []) {
            if ($questionType === 'multiple_choice') {
                throw new \RuntimeException('Detected an exam sheet but found no answer options (A–E). Try the "essay" question type instead.');
            }
            throw new \RuntimeException('Could not extract any questions from the document.');
        }

        return array_slice($drafts, 0, $count);
    }

    private static function isHeaderLine(string $line): bool
    {
        // Identity / admin fields: Nama, Kelas, No absen, Hari/Tanggal, Nilai, ...
        if (preg_match('/^\s*(nama|kelas|no\.?\s*(absen|ujian|peserta)?|hari\s*\/\s*tanggal|hari|tanggal|nilai|skor|waktu|paraf|tanda\s*tangan|guru|pengawas|mata\s*pelajaran|mapel|satuan\s*pendidikan|sekolah|semester|tahun\s*(ajaran|pelajaran))\s*[:.]/iu', $line)) {
            return true;
        }

        // Instruction lines (petunjuk pengerjaan).
        if (preg_match('/^\s*(petunjuk|perintah|kerjakan|selamat\s+mengerjakan|pilihlah\s+salah\s+satu|berilah\s+tanda|jawablah\s+dengan)/iu', $line)) {
            return true;
        }

        // Document title lines in ALL CAPS mentioning exam words.
        if (preg_match('/^(LATIHAN|ULANGAN|UJIAN|TES|LEMBAR|NASKAH)\b/u', $line) && mb_strlen($line) < 120) {
            return true;
        }

        // Fill-in-the-blank identity lines made of dots with no question mark.
        if (str_contains($line, '....') && ! str_contains($line, '?') && mb_strlen($line) < 120
            && preg_match('/(nama|kelas|tanggal|hari|nilai|absen)/i', $line)) {
            return true;
        }

        return false;
    }

    /**
     * @return array{0: string, 1: list<string>}|null
     */
    private static function parseBlock(string $block): ?array
    {
        $matches = [];
        preg_match_all('/(?:^|\s)([A-E])[\.\)]\s+/m', $block, $matches, PREG_OFFSET_CAPTURE);

        if (count($matches[0]) < 2) {
            $questionText = trim(preg_replace('/^\s*\d{1,3}[\.\)]\s+/u', '', $block));
            $questionText = trim(preg_replace('/\s+/', ' ', $questionText));

            return [$questionText, []];
        }

        $firstMarkerPos = $matches[0][0][1];
        $questionText = trim(substr($block, 0, $firstMarkerPos));
        $questionText = trim(preg_replace('/^\s*\d{1,3}[\.\)]\s+/u', '', $questionText));
        $questionText = trim(preg_replace('/\s+/', ' ', $questionText));

        $optionTexts = [];
        $markers = $matches[0];
        $total = count($markers);

        for ($i = 0; $i < $total; $i++) {
            $start = $markers[$i][1] + strlen($markers[$i][0]);
            $end = ($i + 1 < $total) ? $markers[$i + 1][1] : strlen($block);
            $optText = trim(substr($block, $start, $end - $start));
            $optText = trim(preg_replace('/\s+/', ' ', $optText));

            if ($optText === '') {
                continue;
            }

            // Guard against swallowing a trailing next-question number glued
            // to the last option on the same line.
            $optText = trim(preg_replace('/\s*\d{1,3}[\.\)]\s*$/u', '', $optText));
            $optionTexts[] = mb_substr($optText, 0, 2000);
        }

        return [$questionText, $optionTexts];
    }
}
