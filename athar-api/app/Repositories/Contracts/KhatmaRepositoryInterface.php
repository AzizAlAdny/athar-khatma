<?php

namespace App\Repositories\Contracts;

use App\Models\Khatma;

interface KhatmaRepositoryInterface
{
    public function findById($id): ?Khatma;
    public function findByUserId($userId);
    public function getActiveKhatmas();
    public function create(array $data): Khatma;
    public function update($id, array $data): Khatma;
    public function delete($id): bool;
    public function getMapData();
}
