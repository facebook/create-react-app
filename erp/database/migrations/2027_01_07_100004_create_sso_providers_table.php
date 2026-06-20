<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('sso_providers');

        Schema::create('sso_providers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->enum('provider_type', ['saml', 'oauth2', 'oidc'])->default('saml');
            $table->boolean('is_active')->default(true);

            // SAML fields
            $table->string('entity_id', 500)->nullable();
            $table->string('sso_url', 500)->nullable()->comment('IdP SSO URL (where to send AuthnRequest)');
            $table->string('slo_url', 500)->nullable()->comment('IdP Single Logout URL');
            $table->text('idp_certificate')->nullable()->comment('IdP X.509 certificate for verifying assertions');

            // OAuth2/OIDC fields
            $table->string('client_id', 500)->nullable();
            $table->string('client_secret', 500)->nullable();
            $table->string('authorization_url', 500)->nullable();
            $table->string('token_url', 500)->nullable();
            $table->string('userinfo_url', 500)->nullable();

            // Attribute mapping
            $table->string('email_attribute', 100)->nullable()->default('email');
            $table->string('name_attribute', 100)->nullable()->default('displayName');

            // Metadata
            $table->string('metadata_url', 500)->nullable()->comment('URL to fetch IdP metadata XML');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sso_providers');
    }
};
