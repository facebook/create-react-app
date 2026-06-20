<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Modules\Inventory\Models\LotNumber;
use App\Modules\Inventory\Models\SerialNumber;
use App\Modules\Inventory\Models\StockMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TraceabilityController
{
    public function index(Request $request)
    {
        // Search by lot or serial
        $lotId    = $request->get('lot_id');
        $serialId = $request->get('serial_id');
        $tenantId = auth()->user()->tenant_id;

        $lots = LotNumber::where('tenant_id', $tenantId)->with('product')->orderBy('lot_number')->get(['id', 'lot_number', 'product_id']);
        $serials = SerialNumber::where('tenant_id', $tenantId)->with('product')->orderBy('serial_number')->get(['id', 'serial_number', 'product_id']);

        $movements   = collect();
        $trackedItem = null;

        if ($lotId) {
            $trackedItem = LotNumber::with('product')->find($lotId);
            $movements   = StockMovement::where('tenant_id', $tenantId)
                ->where('lot_id', $lotId)
                ->with(['product', 'warehouse'])
                ->orderBy('created_at')
                ->get();
        } elseif ($serialId) {
            $trackedItem = SerialNumber::with('product')->find($serialId);
            $movements   = StockMovement::where('tenant_id', $tenantId)
                ->where('serial_id', $serialId)
                ->with(['product', 'warehouse'])
                ->orderBy('created_at')
                ->get();
        }

        return Inertia::render('Inventory/Traceability/Index', compact('lots', 'serials', 'movements', 'trackedItem', 'lotId', 'serialId'));
    }
}
