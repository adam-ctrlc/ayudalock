<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\ProgramType;
use App\Models\Commodity;
use App\Models\Program;
use Illuminate\Database\Seeder;

final class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        $walangGutom = Program::query()->firstOrCreate(
            ['name' => 'Walang Gutom Food Stamp'],
            [
                'type' => ProgramType::Food->value,
                'unit' => 'kg',
                'per_beneficiary_cap' => 5,
                'is_active' => true,
            ],
        );

        Commodity::query()->firstOrCreate(
            ['program_id' => $walangGutom->id, 'name' => 'Rice'],
            ['unit' => 'kg'],
        );

        $fuelSubsidy = Program::query()
            ->whereIn('name', ['Pantawid Pasada Fuel Subsidy', 'LTFRB Fuel Subsidy'])
            ->first() ?? new Program();

        $fuelSubsidy->forceFill([
            'name' => 'Pantawid Pasada Fuel Subsidy',
            'type' => ProgramType::Fuel->value,
            'unit' => 'liter',
            'per_beneficiary_cap' => 150,
            'is_active' => true,
        ])->save();

        foreach (['Diesel', 'Gasoline'] as $fuel) {
            Commodity::query()->firstOrCreate(
                ['program_id' => $fuelSubsidy->id, 'name' => $fuel],
                ['unit' => 'liter'],
            );
        }
    }
}
