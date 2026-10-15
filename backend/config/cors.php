<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | The PWA is served from its own origin (the Vite dev server locally, the
    | deployed frontend in production) and calls this API from the browser, so
    | the allowed origin has to be explicit. Credentials are supported because
    | the frontend HTTP client sends them; that is also why a wildcard origin
    | cannot be used here.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
