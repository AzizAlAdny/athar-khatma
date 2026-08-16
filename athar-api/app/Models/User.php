<?php

namespace App\Models;

use App\Notifications\VerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Send the email verification notification (custom SPA-pointing link).
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmail);
    }

    /**
     * Token abilities granted at issue time, keyed by role.
     */
    public const ROLE_ABILITIES = [
        'khatma' => ['read', 'khatma:create'],
        'seeker' => ['read', 'need:create'],
        'admin'  => ['*'],
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'display_name',
        'email',
        'password',
        'role',
        'bio',
        'city',
        'neighborhood',
        'latitude',
        'longitude',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * The token abilities to grant for this user's role.
     *
     * @return array<string>
     */
    public function tokenAbilities(): array
    {
        return self::ROLE_ABILITIES[$this->role] ?? ['read'];
    }

    public function khatmas()
    {
        return $this->hasMany(Khatma::class);
    }

    public function needs()
    {
        return $this->hasMany(Need::class);
    }

    public function authEvents()
    {
        return $this->hasMany(AuthEvent::class);
    }
}

