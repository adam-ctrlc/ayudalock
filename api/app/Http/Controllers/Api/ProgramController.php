<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Relief\UpdateProgramRequest;
use App\Http\Resources\ProgramResource;
use App\Models\Program;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class ProgramController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return ProgramResource::collection(
            Program::query()->with('commodities')->orderBy('name')->get(),
        );
    }

    public function update(UpdateProgramRequest $request, Program $program): ProgramResource
    {
        $program->update($request->validated());

        return new ProgramResource($program->load('commodities'));
    }
}
