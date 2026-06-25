<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'email'];

    public function cards()
    {
        return $this->belongsToMany(Card::class, 'card_member');
    }
}
