<?php

declare(strict_types=1);

namespace App\Services\Price;

use App\Models\PriceReference;
use App\Models\PriceReferenceHistory;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class PriceReferenceService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function record(array $data, ?User $admin = null): PriceReference
    {
        return DB::transaction(function () use ($data, $admin): PriceReference {
            $price = PriceReference::query()->create([
                'category' => $data['category'],
                'name' => $data['name'],
                'value' => $data['value'],
                'unit' => $data['unit'],
                'region' => $data['region'] ?? 'NCR',
                'source' => $data['source'] ?? null,
                'effective_date' => $data['effective_date'] ?? Carbon::now()->toDateString(),
                'previous_value' => null,
            ]);

            $this->logHistory($price, $admin);

            return $price;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(PriceReference $price, array $data, ?User $admin = null): PriceReference
    {
        return DB::transaction(function () use ($price, $data, $admin): PriceReference {
            $price->previous_value = $price->value;
            $price->value = $data['value'];

            if (isset($data['effective_date'])) {
                $price->effective_date = $data['effective_date'];
            }

            if (isset($data['source'])) {
                $price->source = $data['source'];
            }

            $price->save();

            $this->logHistory($price, $admin);

            return $price;
        });
    }

    private function logHistory(PriceReference $price, ?User $admin): void
    {
        PriceReferenceHistory::query()->create([
            'price_reference_id' => $price->getKey(),
            'value' => $price->value,
            'previous_value' => $price->previous_value,
            'effective_date' => $price->effective_date->toDateString(),
            'recorded_by' => $admin?->getKey(),
        ]);
    }
}
