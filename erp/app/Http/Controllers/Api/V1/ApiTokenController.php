<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class ApiTokenController extends ApiController
{
    public static array $validAbilities = [
        'read:invoices', 'write:invoices',
        'read:contacts', 'write:contacts',
        'read:products', 'write:products',
        'read:reports',
        'read:hr',
        'read:purchases', 'write:purchases',
        'webhooks:manage',
    ];

    public function index(Request $request): JsonResponse
    {
        $tokens = $request->user()
            ->tokens()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($t) => [
                'id'          => $t->id,
                'name'        => $t->name,
                'abilities'   => $t->abilities,
                'last_used_at' => $t->last_used_at,
                'expires_at'  => $t->expires_at,
                'created_at'  => $t->created_at,
            ]);

        return $this->success($tokens);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'abilities'  => ['nullable', 'array'],
            'abilities.*'=> ['string', 'in:' . implode(',', self::$validAbilities)],
            'expires_in' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $abilities  = $data['abilities'] ?? ['*'];
        $expiresAt  = isset($data['expires_in'])
            ? now()->addDays($data['expires_in'])
            : null;

        $token = $request->user()->createToken(
            $data['name'],
            $abilities,
            $expiresAt,
        );

        return $this->success([
            'token'      => $token->plainTextToken,
            'id'         => $token->accessToken->id,
            'name'       => $token->accessToken->name,
            'abilities'  => $token->accessToken->abilities,
            'expires_at' => $token->accessToken->expires_at,
        ], 201);
    }

    public function destroy(Request $request, int $tokenId): JsonResponse
    {
        $deleted = $request->user()->tokens()->where('id', $tokenId)->delete();

        if (! $deleted) {
            return $this->error('Token not found.', 404);
        }

        return $this->success(['message' => 'Token revoked.']);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();
        return $this->success(['message' => 'All tokens revoked.']);
    }
}
