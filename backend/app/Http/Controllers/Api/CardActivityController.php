<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\CardActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CardActivityController extends Controller
{
    public function index(int $cardId): JsonResponse
    {
        $card = Card::findOrFail($cardId);
        $activities = $card->activities()->with('member')->get();
        return response()->json($activities);
    }

    public function comment(Request $request, int $cardId): JsonResponse
    {
        $request->validate(['content' => 'required|string']);
        $card = Card::findOrFail($cardId);
        $activity = CardActivity::create([
            'card_id' => $card->id,
            'member_id' => $request->member_id ?? null,
            'type' => 'comment',
            'content' => $request->content,
        ]);
        $activity->load('member');
        return response()->json($activity, 201);
    }
}
