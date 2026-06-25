<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\CardActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CardController extends Controller
{
    public function update(Request $request, int $id): JsonResponse
    {
        $card = Card::findOrFail($id);
        $card->update($request->only(['title', 'description', 'due_date']));
        $card->load('tags', 'members');
        return response()->json($card);
    }

    public function move(Request $request, int $id): JsonResponse
    {
        $request->validate(['list_id' => 'required|exists:board_lists,id']);
        $card = Card::findOrFail($id);
        $oldListId = $card->list_id;
        $card->update([
            'list_id' => $request->list_id,
            'position' => Card::where('list_id', $request->list_id)->count(),
        ]);
        CardActivity::create([
            'card_id' => $card->id,
            'type' => 'move',
            'content' => "Card moved from list #{$oldListId} to list #{$request->list_id}",
        ]);
        $card->load('tags', 'members');
        return response()->json($card);
    }

    public function destroy(int $id): JsonResponse
    {
        Card::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    public function attachTag(Request $request, int $id): JsonResponse
    {
        $request->validate(['tag_id' => 'required|exists:tags,id']);
        $card = Card::findOrFail($id);
        $card->tags()->syncWithoutDetaching([$request->tag_id]);
        $card->load('tags', 'members');
        return response()->json($card);
    }

    public function detachTag(int $id, int $tagId): JsonResponse
    {
        $card = Card::findOrFail($id);
        $card->tags()->detach($tagId);
        $card->load('tags', 'members');
        return response()->json($card);
    }

    public function assignMember(Request $request, int $id): JsonResponse
    {
        $request->validate(['member_id' => 'required|exists:members,id']);
        $card = Card::findOrFail($id);
        $card->members()->syncWithoutDetaching([$request->member_id]);
        $card->load('tags', 'members');
        return response()->json($card);
    }

    public function unassignMember(int $id, int $memberId): JsonResponse
    {
        $card = Card::findOrFail($id);
        $card->members()->detach($memberId);
        $card->load('tags', 'members');
        return response()->json($card);
    }
}
