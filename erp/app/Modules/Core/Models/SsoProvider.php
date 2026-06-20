<?php

namespace App\Modules\Core\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class SsoProvider extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'name', 'provider_type', 'is_active',
        'entity_id', 'sso_url', 'slo_url', 'idp_certificate',
        'client_id', 'client_secret', 'authorization_url', 'token_url', 'userinfo_url',
        'email_attribute', 'name_attribute', 'metadata_url',
    ];

    protected $casts = ['is_active' => 'boolean'];

    protected $hidden = ['client_secret'];

    // Generate the SP entity ID for this provider
    public function getSpEntityId(): string
    {
        return url('/sso/saml/' . $this->id . '/metadata');
    }

    // Generate the ACS (Assertion Consumer Service) URL
    public function getAcsUrl(): string
    {
        return url('/sso/saml/' . $this->id . '/acs');
    }

    // Build SAML AuthnRequest XML
    public function buildAuthnRequest(): string
    {
        $id           = '_' . bin2hex(random_bytes(16));
        $issueInstant = now()->format('Y-m-d\TH:i:s\Z');
        $acsUrl       = htmlspecialchars($this->getAcsUrl());
        $entityId     = htmlspecialchars($this->getSpEntityId());

        return <<<XML
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    ID="{$id}" Version="2.0" IssueInstant="{$issueInstant}"
    AssertionConsumerServiceURL="{$acsUrl}"
    ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
  <saml:Issuer>{$entityId}</saml:Issuer>
  <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
</samlp:AuthnRequest>
XML;
    }

    // Parse a SAML response XML and extract user attributes
    // Returns ['email' => ..., 'name' => ...] or throws
    public function parseSamlResponse(string $samlResponseBase64): array
    {
        $xml = base64_decode($samlResponseBase64);
        $doc = new \DOMDocument();
        $doc->loadXML($xml, LIBXML_NOERROR | LIBXML_NOWARNING);

        $xpath = new \DOMXPath($doc);
        $xpath->registerNamespace('saml', 'urn:oasis:names:tc:SAML:2.0:assertion');
        $xpath->registerNamespace('samlp', 'urn:oasis:names:tc:SAML:2.0:protocol');

        // Extract status
        $statusCode = $xpath->evaluate('string(//samlp:StatusCode/@Value)');
        if ($statusCode && !str_contains($statusCode, 'Success')) {
            throw new \RuntimeException('SAML authentication failed: ' . $statusCode);
        }

        // Extract email from NameID or attribute
        $emailAttr = $this->email_attribute ?? 'email';
        $email     = $xpath->evaluate("string(//saml:Attribute[@Name='{$emailAttr}']/saml:AttributeValue)");
        if (empty($email)) {
            $email = $xpath->evaluate('string(//saml:NameID)');
        }

        // Extract name
        $nameAttr = $this->name_attribute ?? 'displayName';
        $name     = $xpath->evaluate("string(//saml:Attribute[@Name='{$nameAttr}']/saml:AttributeValue)");

        if (empty($email)) {
            throw new \RuntimeException('Could not extract email from SAML response.');
        }

        return ['email' => $email, 'name' => $name ?: $email];
    }
}
