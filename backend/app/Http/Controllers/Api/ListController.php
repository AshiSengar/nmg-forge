<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BoardList;
use App\Models\Card;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ListController extends Controller
{
    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate(['name' => 'required|string|max:255']);
        $list = BoardList::findOrFail($id);
        $list->update(['name' => $request->name]);
        return response()->json($list);
    }

    public function destroy(int $id): JsonResponse
    {
        BoardList::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    public function addCard(Request $request, int $id): JsonResponse
    {
        $request->validate(['title' => 'required|string|max:255']);
        $list = BoardList::findOrFail($id);
        $position = $list->cards()->count();
        $card = Card::create([
            'list_id' => $list->id,
            'title' => $request->title,
            'description' => $request->description ?? null,
            'due_date' => $request->due_date ?? null,
            'position' => $position,
        ]);
        $card->load('tags', 'members');
        return response()->json($card, 201);
    }
}
