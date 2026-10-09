<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatUsage extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'ip_address',
        'usage_date',
        'chat_count',
    ];
}
