<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardActivity extends Model
{
    use HasFactory;

    protected $fillable = ['card_id', 'member_id', 'type', 'content'];

    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }
}
