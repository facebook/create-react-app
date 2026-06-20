<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\File;

class ApiDocsController extends Controller
{
    /**
     * Serve Swagger UI HTML that loads the OpenAPI spec from /api-docs/openapi.yaml.
     */
    public function ui(): Response
    {
        $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <title>ERP API Documentation</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>
  SwaggerUIBundle({
    url: "/api-docs/openapi.yaml",
    dom_id: '#swagger-ui',
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
    layout: "BaseLayout",
    deepLinking: true,
  });
</script>
</body>
</html>
HTML;

        return response($html, 200, ['Content-Type' => 'text/html']);
    }

    /**
     * Serve the raw OpenAPI YAML spec.
     */
    public function spec(): Response
    {
        $path = public_path('api-docs/openapi.yaml');

        if (! File::exists($path)) {
            abort(404, 'OpenAPI spec not found.');
        }

        return response(File::get($path), 200, [
            'Content-Type'                => 'application/yaml',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }
}
