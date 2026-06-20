<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends ApiController
{
    /**
     * POST /api/v1/auth/login
     * Validate credentials, return Sanctum token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (! Auth::attempt($request->only('email', 'password'))) {
            return $this->error('Invalid credentials', 401);
        }

        /** @var \App\Models\User $user */
        $user  = Auth::user();
        $token = $user->createToken('api-token')->plainTextToken;

        return $this->success([
            'token' => $token,
            'user'  => [
                'id'        => $user->id,
                'name'      => $user->name,
                'email'     => $user->email,
                'tenant_id' => $user->tenant_id,
            ],
        ]);
    }

    /**
     * POST /api/v1/auth/logout
     * Revoke the current access token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(['message' => 'Logged out successfully']);
    }

    /**
     * GET /api/v1/auth/me
     * Return authenticated user with tenant info.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('tenant');

        return $this->success([
            'id'        => $user->id,
            'name'      => $user->name,
            'email'     => $user->email,
            'tenant_id' => $user->tenant_id,
            'tenant'    => $user->tenant ? [
                'id'   => $user->tenant->id,
                'name' => $user->tenant->name,
                'slug' => $user->tenant->slug,
            ] : null,
        ]);
    }
}
