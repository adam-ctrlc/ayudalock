<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;

final class VoucherKeys extends Command
{
    protected $signature = 'voucher:keys';

    protected $description = 'Generate an RSA voucher keypair as base64 env values (VOUCHER_PRIVATE_KEY / VOUCHER_PUBLIC_KEY) for serverless deploys.';

    public function handle(): int
    {
        $resource = openssl_pkey_new([
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ]);

        openssl_pkey_export($resource, $privatePem);
        $publicPem = openssl_pkey_get_details($resource)['key'];

        $this->line('VOUCHER_PRIVATE_KEY='.base64_encode($privatePem));
        $this->newLine();
        $this->line('VOUCHER_PUBLIC_KEY='.base64_encode($publicPem));
        $this->newLine();
        $this->info('Paste both into your Vercel project Environment Variables (they are base64-encoded PEM).');

        return self::SUCCESS;
    }
}
