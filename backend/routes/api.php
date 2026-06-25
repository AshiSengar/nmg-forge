<?php

use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\CardActivityController;
use App\Http\Controllers\Api\CardController;
use App\Http\Controllers\Api\ListController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Support\Facades\Route;

// Boards
Route::get('/boards', [BoardController::class, 'index']);
Route::post('/boards', [BoardController::class, 'store']);
Route::get('/boards/{id}', [BoardController::class, 'show']);
Route::delete('/boards/{id}', [BoardController::class, 'destroy']);
Route::post('/boards/{id}/lists', [BoardController::class, 'addList']);

// Lists
Route::put('/lists/{id}', [ListController::class, 'update']);
Route::delete('/lists/{id}', [ListController::class, 'destroy']);
Route::post('/lists/{id}/cards', [ListController::class, 'addCard']);

// Cards
Route::put('/cards/{id}', [CardController::class, 'update']);
Route::patch('/cards/{id}/move', [CardController::class, 'move']);
Route::delete('/cards/{id}', [CardController::class, 'destroy']);
Route::post('/cards/{id}/tags', [CardController::class, 'attachTag']);
Route::delete('/cards/{id}/tags/{tagId}', [CardController::class, 'detachTag']);
Route::post('/cards/{id}/members', [CardController::class, 'assignMember']);
Route::delete('/cards/{id}/members/{memberId}', [CardController::class, 'unassignMember']);

// Activities
Route::get('/cards/{id}/activities', [CardActivityController::class, 'index']);
Route::post('/cards/{id}/comments', [CardActivityController::class, 'comment']);

// Tags
Route::get('/tags', [TagController::class, 'index']);
Route::post('/tags', [TagController::class, 'store']);

// Members
Route::get('/members', [MemberController::class, 'index']);
Route::post('/members', [MemberController::class, 'store']);
