<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HunterVerifierService
{
    protected string $apiKey;
    protected bool $enabled;
    protected int $timeout;

    public function __construct()
    {
        $this->apiKey = (string) config('services.hunter.api_key', '');
        $this->enabled = (bool) config('services.hunter.enabled', true);
        $this->timeout = (int) config('services.hunter.timeout', 6);
    }

    /**
     * Check whether an email is real and deliverable using Hunter.io API.
     *
     * @param string $email
     * @return array{0: bool, 1: string|null} [isValid, errorMessage]
     */
    public function verify(string $email): array
    {
        if (!$this->enabled || empty($this->apiKey)) {
            return [true, null];
        }

        try {
            $response = Http::timeout($this->timeout)->get('https://api.hunter.io/v2/email-verifier', [
                'email' => $email,
                'api_key' => $this->apiKey,
            ]);

            if ($response->failed()) {
                Log::warning('Hunter.io verification request failed', [
                    'email' => $email,
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);
                // Fail-open: allow registration if Hunter service is down or quota exceeded
                return [true, null];
            }

            $data = $response->json('data');
            if (!$data) {
                return [true, null];
            }

            $status = $data['status'] ?? null;
            $isDisposable = (bool) ($data['disposable'] ?? false);
            $hasMxRecords = $data['mx_records'] ?? true;
            $isGibberish = (bool) ($data['gibberish'] ?? false);

            if ($status === 'disposable' || $isDisposable) {
                return [false, 'لا يُسمح باستخدام البريد الإلكتروني المؤقت أو غير الصالح.'];
            }

            if ($status === 'invalid') {
                return [false, 'البريد الإلكتروني المدخل غير موجود أو غير قابل للاستلام.'];
            }

            if ($hasMxRecords === false) {
                return [false, 'نطاق البريد الإلكتروني غير قادر على استلام الرسائل.'];
            }

            if ($isGibberish && $status !== 'valid') {
                return [false, 'البريد الإلكتروني المدخل يبدو غير حقيقي أو عشوائي.'];
            }

            return [true, null];
        } catch (\Throwable $e) {
            Log::error('Hunter.io exception during email verification', [
                'email' => $email,
                'message' => $e->getMessage(),
            ]);
            // Fail-open: do not block users if external network times out
            return [true, null];
        }
    }
}
