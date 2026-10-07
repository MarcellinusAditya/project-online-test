<?php

namespace Database\Seeders;

use App\Models\Test;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();

        if ($user) {
            Test::factory()->count(5)->published()->create(['user_id' => $user->id]);
            Test::factory()->count(3)->draft()->create(['user_id' => $user->id]);
        }
    }
}
