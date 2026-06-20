<?php

namespace App\Modules\Finance\Traits;

trait HasStatusTransitions
{
    abstract protected function getTransitions(): array;

    public function canTransitionTo(string $status): bool
    {
        return in_array($status, $this->getTransitions()[$this->status] ?? [], true);
    }

    public function availableTransitions(): array
    {
        return $this->getTransitions()[$this->status] ?? [];
    }

    public function transitionTo(string $status): void
    {
        if (! $this->canTransitionTo($status)) {
            throw new \DomainException(
                "Cannot transition from '{$this->status}' to '{$status}'."
            );
        }

        $this->update(['status' => $status]);
    }
}
