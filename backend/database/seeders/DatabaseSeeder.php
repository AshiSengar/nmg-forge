<?php

namespace Database\Seeders;

use App\Models\Board;
use App\Models\BoardList;
use App\Models\Card;
use App\Models\CardActivity;
use App\Models\Member;
use App\Models\Tag;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Tags
        $tagBug = Tag::create(['name' => 'Bug', 'color' => '#ef4444']);
        $tagFeature = Tag::create(['name' => 'Feature', 'color' => '#6366f1']);
        $tagUrgent = Tag::create(['name' => 'Urgent', 'color' => '#f59e0b']);
        $tagDesign = Tag::create(['name' => 'Design', 'color' => '#ec4899']);
        $tagBackend = Tag::create(['name' => 'Backend', 'color' => '#10b981']);
        $tagFrontend = Tag::create(['name' => 'Frontend', 'color' => '#3b82f6']);

        // Members
        $alice = Member::create(['name' => 'Alice Chen', 'email' => 'alice@nmgforge.dev']);
        $bob = Member::create(['name' => 'Bob Smith', 'email' => 'bob@nmgforge.dev']);
        $carol = Member::create(['name' => 'Carol Rivera', 'email' => 'carol@nmgforge.dev']);
        $dave = Member::create(['name' => 'Dave Kim', 'email' => 'dave@nmgforge.dev']);

        // Board 1: Forge Sprint 1
        $board1 = Board::create(['name' => 'Forge Sprint 1']);

        $backlog = BoardList::create(['board_id' => $board1->id, 'name' => 'Backlog', 'position' => 0]);
        $inProgress = BoardList::create(['board_id' => $board1->id, 'name' => 'In Progress', 'position' => 1]);
        $review = BoardList::create(['board_id' => $board1->id, 'name' => 'In Review', 'position' => 2]);
        $done = BoardList::create(['board_id' => $board1->id, 'name' => 'Done', 'position' => 3]);

        // Backlog cards
        $card1 = Card::create([
            'list_id' => $backlog->id,
            'title' => 'Set up project scaffolding',
            'description' => 'Initialize Laravel + React monorepo. Configure SQLite, CORS, and Vite.',
            'due_date' => now()->addDays(2)->format('Y-m-d'),
            'position' => 0,
        ]);
        $card1->tags()->attach([$tagBackend->id, $tagFeature->id]);
        $card1->members()->attach([$alice->id]);

        $card2 = Card::create([
            'list_id' => $backlog->id,
            'title' => 'Design Kanban UI wireframes',
            'description' => 'Create wireframes for board, lists, cards, and modal views.',
            'due_date' => now()->subDay()->format('Y-m-d'), // overdue
            'position' => 1,
        ]);
        $card2->tags()->attach([$tagDesign->id, $tagUrgent->id]);
        $card2->members()->attach([$carol->id]);

        $card3 = Card::create([
            'list_id' => $backlog->id,
            'title' => 'Write database migrations',
            'description' => 'Create all 6 core tables: boards, board_lists, cards, tags, members, card_activities.',
            'position' => 2,
        ]);
        $card3->tags()->attach([$tagBackend->id]);
        $card3->members()->attach([$bob->id]);

        // In Progress cards
        $card4 = Card::create([
            'list_id' => $inProgress->id,
            'title' => 'Implement drag-and-drop',
            'description' => 'Use HTML5 native Drag API to move cards between lists. No third-party libraries.',
            'due_date' => now()->addDays(1)->format('Y-m-d'),
            'position' => 0,
        ]);
        $card4->tags()->attach([$tagFrontend->id, $tagFeature->id]);
        $card4->members()->attach([$alice->id, $dave->id]);
        CardActivity::create([
            'card_id' => $card4->id,
            'member_id' => $alice->id,
            'type' => 'comment',
            'content' => 'Started working on the drag events. onDragStart and onDrop are wired up.',
        ]);

        $card5 = Card::create([
            'list_id' => $inProgress->id,
            'title' => 'Build REST API endpoints',
            'description' => 'Implement all 20+ API routes in Laravel. Test with curl/Postman.',
            'due_date' => now()->addDays(3)->format('Y-m-d'),
            'position' => 1,
        ]);
        $card5->tags()->attach([$tagBackend->id]);
        $card5->members()->attach([$bob->id]);

        $card6 = Card::create([
            'list_id' => $inProgress->id,
            'title' => 'Card modal with tag + member UI',
            'description' => 'Build CardModal.jsx with editable fields, tag picker, member assignment, and activity feed.',
            'position' => 2,
        ]);
        $card6->tags()->attach([$tagFrontend->id, $tagDesign->id]);
        $card6->members()->attach([$carol->id]);

        // Review cards
        $card7 = Card::create([
            'list_id' => $review->id,
            'title' => 'Hermes agent configuration',
            'description' => 'Set up hermes-config.yaml with Gemini 2.5 Flash and Slack socket mode.',
            'position' => 0,
        ]);
        $card7->tags()->attach([$tagFeature->id, $tagBackend->id]);
        $card7->members()->attach([$dave->id]);
        CardActivity::create([
            'card_id' => $card7->id,
            'type' => 'move',
            'content' => 'Card moved to In Review',
        ]);

        $card8 = Card::create([
            'list_id' => $review->id,
            'title' => 'OpenClaw gateway setup',
            'description' => 'Configure openclaw.json and run gateway to connect to Slack #agent-coder channel.',
            'position' => 1,
        ]);
        $card8->tags()->attach([$tagFeature->id]);
        $card8->members()->attach([$dave->id, $bob->id]);

        // Done cards
        $card9 = Card::create([
            'list_id' => $done->id,
            'title' => 'Initialize GitHub repository',
            'description' => 'Create nmg-forge repo, set up .gitignore, push initial commit.',
            'position' => 0,
        ]);
        $card9->tags()->attach([$tagFeature->id]);
        $card9->members()->attach([$alice->id]);
        CardActivity::create([
            'card_id' => $card9->id,
            'member_id' => $alice->id,
            'type' => 'comment',
            'content' => 'Repo is live at github.com/nmg/forge. CI/CD pipeline connected to Vercel.',
        ]);

        $card10 = Card::create([
            'list_id' => $done->id,
            'title' => 'Deploy frontend to Vercel',
            'description' => 'Connect GitHub repo to Vercel. Set VITE_API_BASE_URL env var. Deploy.',
            'position' => 1,
        ]);
        $card10->tags()->attach([$tagFrontend->id, $tagFeature->id]);
        $card10->members()->attach([$carol->id]);

        // Board 2: Agent System
        $board2 = Board::create(['name' => 'Agent System']);

        $planning = BoardList::create(['board_id' => $board2->id, 'name' => 'Planning', 'position' => 0]);
        $active = BoardList::create(['board_id' => $board2->id, 'name' => 'Active', 'position' => 1]);
        $completed = BoardList::create(['board_id' => $board2->id, 'name' => 'Completed', 'position' => 2]);

        $agentCard1 = Card::create([
            'list_id' => $planning->id,
            'title' => 'Define Hermes → OpenClaw message protocol',
            'description' => 'Standardize how Hermes formats task instructions for OpenClaw in #agent-coder.',
            'position' => 0,
        ]);
        $agentCard1->tags()->attach([$tagFeature->id]);
        $agentCard1->members()->attach([$dave->id]);

        $agentCard2 = Card::create([
            'list_id' => $active->id,
            'title' => 'Wire #agent-log audit trail',
            'description' => 'Both agents post all actions to #agent-log for human review.',
            'position' => 0,
        ]);
        $agentCard2->tags()->attach([$tagBackend->id, $tagUrgent->id]);
        $agentCard2->members()->attach([$alice->id, $dave->id]);

        $agentCard3 = Card::create([
            'list_id' => $completed->id,
            'title' => 'Slack workspace setup',
            'description' => 'Created private workspace, 3 channels, installed bots with correct scopes.',
            'position' => 0,
        ]);
        $agentCard3->tags()->attach([$tagFeature->id]);
        $agentCard3->members()->attach([$bob->id]);
    }
}
