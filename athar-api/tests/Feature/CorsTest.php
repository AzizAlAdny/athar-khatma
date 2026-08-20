<?php

namespace Tests\Feature;

use Tests\TestCase;

class CorsTest extends TestCase
{
    public function test_cors_headers_are_present_on_requests_from_vercel()
    {
        $response = $this->withHeaders([
            'Origin' => 'https://athar-khatma-lpaps5x11-athar-khatma.vercel.app',
        ])->postJson('/api/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertHeader('Access-Control-Allow-Origin', 'https://athar-khatma-lpaps5x11-athar-khatma.vercel.app');
    }

    public function test_cors_headers_are_present_on_production_domain()
    {
        $response = $this->withHeaders([
            'Origin' => 'https://athar-khatma.vercel.app',
        ])->postJson('/api/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertHeader('Access-Control-Allow-Origin', 'https://athar-khatma.vercel.app');
    }
}
