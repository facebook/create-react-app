<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\UserPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserPreferenceController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $prefs = UserPreference::getAllForUser($request->user()->id);
        return $this->success($prefs);
    }

    public function update(Request $request): JsonResponse
    {
        $allowedKeys = array_keys(UserPreference::$defaults);

        $data = $request->validate([
            'preferences'   => ['required', 'array'],
            'preferences.*' => ['nullable', 'string', 'max:255'],
        ]);

        $updated = [];
        foreach ($data['preferences'] as $key => $value) {
            if (! in_array($key, $allowedKeys, true)) {
                continue;
            }
            UserPreference::setForUser($request->user()->id, $key, (string) $value);
            $updated[$key] = $value;
        }

        return $this->success([
            'updated'     => $updated,
            'preferences' => UserPreference::getAllForUser($request->user()->id),
        ]);
    }

    public function reset(Request $request): JsonResponse
    {
        UserPreference::where('user_id', $request->user()->id)->delete();
        return $this->success(UserPreference::$defaults);
    }
}
