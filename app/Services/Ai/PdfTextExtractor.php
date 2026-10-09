<?php

namespace App\Services\Ai;

use Smalot\PdfParser\Parser;

class PdfTextExtractor
{
    public function extract(string $absolutePath): string
    {
        $extension = strtolower(pathinfo($absolutePath, PATHINFO_EXTENSION));

        if ($extension === 'txt') {
            $text = file_get_contents($absolutePath);
            if ($text === false) {
                throw new \RuntimeException('Could not read the uploaded file.');
            }

            return $this->clean($text);
        }

        $parser = new Parser();
        $pdf = $parser->parseFile($absolutePath);

        return $this->clean($pdf->getText());
    }

    public function chunk(string $text, int $maxChars = 12000): array
    {
        $text = trim($text);
        if (mb_strlen($text) <= $maxChars) {
            return [$text];
        }

        $chunks = [];
        $paragraphs = preg_split('/\n\s*\n/', $text);
        $current = '';

        foreach ($paragraphs as $para) {
            if (mb_strlen($current) + mb_strlen($para) + 2 > $maxChars) {
                if ($current !== '') {
                    $chunks[] = $current;
                }
                $current = $para;
            } else {
                $current .= ($current === '' ? '' : "\n\n").$para;
            }
        }

        if (trim($current) !== '') {
            $chunks[] = $current;
        }

        return $chunks === [] ? [$text] : $chunks;
    }

    private function clean(string $text): string
    {
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        $text = preg_replace('/[ \t]+/', ' ', $text);
        $text = preg_replace('/\n{3,}/', "\n\n", $text);

        return trim($text ?? '');
    }
}
