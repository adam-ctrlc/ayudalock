<?php

declare(strict_types=1);

namespace App\Services\Redemption;

use App\Enums\RedemptionSource;
use App\Exceptions\DomainException;
use App\Models\Redemption;
use App\Models\User;
use Illuminate\Support\Carbon;

final class OfflineSyncService
{
    public function __construct(
        private readonly RedemptionService $redemptions,
    ) {}

    /**
     * @param  array<int, array{client_uuid: string, credential: string, redeemed_at?: string|null}>  $items
     * @return array<int, array{client_uuid: string, status: string, reason?: string, redemption_id?: int}>
     */
    public function processBatch(User $merchant, array $items): array
    {
        $results = [];

        foreach ($items as $item) {
            $clientUuid = $item['client_uuid'];

            if (Redemption::query()->where('client_uuid', $clientUuid)->exists()) {
                $results[] = [
                    'client_uuid' => $clientUuid,
                    'status' => 'duplicate',
                ];

                continue;
            }

            $redeemedAt = isset($item['redeemed_at']) && $item['redeemed_at'] !== null
                ? Carbon::parse($item['redeemed_at'])
                : Carbon::now();

            try {
                $redemption = $this->redemptions->redeem(
                    $merchant,
                    $item['credential'],
                    RedemptionSource::Offline,
                    $clientUuid,
                    $redeemedAt,
                );

                $results[] = [
                    'client_uuid' => $clientUuid,
                    'status' => 'accepted',
                    'redemption_id' => (int) $redemption->getKey(),
                ];
            } catch (DomainException $e) {
                $results[] = [
                    'client_uuid' => $clientUuid,
                    'status' => 'rejected',
                    'reason' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }
}
