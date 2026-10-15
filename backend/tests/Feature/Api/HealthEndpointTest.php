<?php

namespace Tests\Feature\Api;

use Tests\TestCase;

class HealthEndpointTest extends TestCase
{
    public function test_api_health_endpoint_reports_ok(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJson([
                'status' => 'ok',
                'service' => config('app.name'),
            ])
            ->assertJsonStructure(['status', 'service', 'time']);
    }

    public function test_cors_allows_the_configured_frontend_origin(): void
    {
        $origin = config('cors.allowed_origins')[0];

        $this->withHeaders(['Origin' => $origin])
            ->getJson('/api/health')
            ->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', $origin);
    }
}
