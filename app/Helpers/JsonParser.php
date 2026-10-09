<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;

class JsonParser
{
    /**
     * Membersihkan dan memparse JSON dari output AI secara robust.
     */
    public static function parse(?string $rawResponse): ?array
    {
        if (empty($rawResponse)) {
            return null;
        }

        $clean = $rawResponse;

        // 1. Ekstrak string di antara kurung kurawal pertama '{' dan kurung kurawal terakhir '}'
        $firstBrace = strpos($clean, '{');
        $lastBrace = strrpos($clean, '}');

        if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
            $clean = substr($clean, $firstBrace, $lastBrace - $firstBrace + 1);
        } else {
            // Coba dengan kurung siku [] jika mungkin berupa array
            $firstBracket = strpos($clean, '[');
            $lastBracket = strrpos($clean, ']');
            if ($firstBracket !== false && $lastBracket !== false && $lastBracket > $firstBracket) {
                $clean = substr($clean, $firstBracket, $lastBracket - $firstBracket + 1);
            } else {
                // Fallback: bersihkan think tag jika tidak ada kurung kurawal/siku
                $clean = preg_replace('/<think>[\s\S]*?<\/think>/i', '', $clean);
                $clean = preg_replace('/<think>[\s\S]*/i', '', $clean);
                $clean = trim($clean);
            }
        }

        // Hapus penanda markdown fences jika masih terbawa
        $clean = preg_replace('/^```(?:json)?\s*/i', '', $clean);
        $clean = preg_replace('/\s*```$/', '', $clean);
        $clean = trim($clean);

        // 2. Coba decode langsung
        $decoded = json_decode($clean, true);

        if ($decoded !== null) {
            return $decoded;
        }

        // 3. Fallback 1: Jika gagal decode, bersihkan komentar & trailing comma
        // Hapus komentar model /* ... */
        $cleanProcessed = preg_replace('#/\*.*?\*/#s', '', $clean);
        // Hapus komentar model // ... (hati-hari agar tidak menghapus URL seperti https://)
        $cleanProcessed = preg_replace('#(?<!:|https|http)\s*//.+$#m', '', $cleanProcessed);

        // Hapus trailing comma sebelum penutup kurung siku ] atau kurawal }
        $cleanProcessed = preg_replace('/,\s*([\]}])/m', '$1', $cleanProcessed);

        $decoded = json_decode($cleanProcessed, true);

        if ($decoded !== null) {
            return $decoded;
        }

        // 4. Fallback 2: Jika masih gagal, mungkin ada control characters (seperti tab, newline tidak di-escape)
        $cleanProcessed2 = preg_replace('/[\x00-\x1F\x7F]/', '', $cleanProcessed);
        $decoded = json_decode($cleanProcessed2, true);

        if ($decoded !== null) {
            return $decoded;
        }

        // Log error untuk investigasi
        Log::warning('[JsonParser] Gagal memparse JSON dari AI.', [
            'raw_length' => strlen($rawResponse),
            'json_error' => json_last_error_msg(),
            'cleaned_json' => substr($clean, 0, 1000),
        ]);

        return null;
    }
}
