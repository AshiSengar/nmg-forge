<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\BoardList;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BoardController extends Controller
{
    public function index(): JsonResponse
    {
        $boards = Board::all();
        return response()->json($boards);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['name' => 'required|string|max:255']);
        $board = Board::create(['name' => $request->name]);
        return response()->json($board, 201);
    }

    public function show(int $id): JsonResponse
    {
        $board = Board::with(['lists.cards.tags', 'lists.cards.members'])->findOrFail($id);
        return response()->json($board);
    }

    public function destroy(int $id): JsonResponse
    {
        Board::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    public function addList(Request $request, int $id): JsonResponse
    {
        $request->validate(['name' => 'required|string|max:255']);
        $board = Board::findOrFail($id);
        $position = $board->lists()->count();
        $list = BoardList::create([
            'board_id' => $board->id,
            'name' => $request->name,
            'position' => $position,
        ]);
        return response()->json($list, 201);
    }
}
