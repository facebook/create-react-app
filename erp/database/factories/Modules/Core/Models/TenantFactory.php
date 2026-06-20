<?php

namespace Database\Factories\Modules\Core\Models;

use App\Modules\Core\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    public function definition(): array
    {
        return [
            'name'      => $this->faker->company(),
            'slug'      => $this->faker->unique()->slug(2),
            'is_active' => true,
        ];
    }
}
