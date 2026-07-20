<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\ReferralStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Incident\AdvanceReferralRequest;
use App\Http\Resources\ReferralResource;
use App\Models\Referral;
use App\Services\Incident\ReferralService;

final class ReferralController extends Controller
{
    public function __construct(
        private readonly ReferralService $referrals,
    ) {}

    public function update(AdvanceReferralRequest $request, Referral $referral): ReferralResource
    {
        $advanced = $this->referrals->advance(
            $referral,
            ReferralStatus::from($request->string('status')->value()),
            $request->user(),
            $request->input('note'),
        );

        return new ReferralResource($advanced);
    }
}
