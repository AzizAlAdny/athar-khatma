<?php

namespace App\Constants;

class KhatmaConstants
{
    // Impact calculation
    public const IMPACT_POINTS_PER_GIFT = 10;
    public const IMPACT_HOURS_PER_SERVICE = 2;
    
    // Glow level thresholds
    public const GLOW_LEVEL_RADIANT = 100;
    public const GLOW_LEVEL_PULSING = 50;
    public const GLOW_LEVEL_COLORED = 10;
    
    // Status values
    public const STATUS_ACTIVE = 'active';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_ARCHIVED = 'archived';
    
    // Type values
    public const TYPE_INDIVIDUAL = 'فردية';
    public const TYPE_GROUP = 'جماعية';
}
