<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Manufacturing\Models\BillOfMaterials;
use App\Modules\Manufacturing\Models\BomLine;
use App\Modules\Manufacturing\Models\ManufacturingOrder;
use App\Modules\Manufacturing\Models\WorkCenter;
use App\Modules\Manufacturing\Models\WorkOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManufacturingExtApiController extends ApiController
{
    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }

    // ── Bills of Materials ────────────────────────────────────────────────────

    public function indexBoms(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $boms     = BillOfMaterials::where('tenant_id', $tenantId)
            ->with('product:id,name,sku')
            ->withCount('lines')
            ->when($request->input('product_id'), fn ($q, $p) => $q->where('product_id', $p))
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->orderBy('name')
            ->get();

        return $this->success($boms);
    }

    public function storeBom(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'product_id'  => ['required', 'integer', 'exists:products,id'],
            'name'        => ['required', 'string', 'max:100'],
            'code'        => ['nullable', 'string', 'max:50'],
            'type'        => ['nullable', 'in:manufacture,kit,subcontracting'],
            'qty_per_bom' => ['nullable', 'numeric', 'min:0.0001'],
            'uom'         => ['nullable', 'string', 'max:20'],
            'notes'       => ['nullable', 'string'],
            'lines'       => ['nullable', 'array'],
            'lines.*.component_id' => ['required_with:lines', 'integer', 'exists:products,id'],
            'lines.*.quantity'     => ['required_with:lines', 'numeric', 'min:0.0001'],
            'lines.*.uom'          => ['nullable', 'string', 'max:20'],
            'lines.*.sequence'     => ['nullable', 'integer', 'min:1'],
            'lines.*.is_optional'  => ['boolean'],
        ]);

        $bom = BillOfMaterials::create([
            'tenant_id'   => $tenantId,
            'product_id'  => $data['product_id'],
            'name'        => $data['name'],
            'code'        => $data['code'] ?? null,
            'type'        => $data['type'] ?? 'manufacture',
            'qty_per_bom' => $data['qty_per_bom'] ?? 1,
            'uom'         => $data['uom'] ?? null,
            'notes'       => $data['notes'] ?? null,
            'is_active'   => true,
        ]);

        foreach ($data['lines'] ?? [] as $i => $line) {
            BomLine::create([
                'bom_id'       => $bom->id,
                'component_id' => $line['component_id'],
                'quantity'     => $line['quantity'],
                'uom'          => $line['uom'] ?? null,
                'sequence'     => $line['sequence'] ?? (($i + 1) * 10),
                'is_optional'  => $line['is_optional'] ?? false,
            ]);
        }

        return $this->success($bom->load('product:id,name,sku', 'lines.component:id,name,sku'), 201);
    }

    public function showBom(BillOfMaterials $billOfMaterials): JsonResponse
    {
        $billOfMaterials->load('product:id,name,sku', 'lines.component:id,name,sku');

        return $this->success($billOfMaterials);
    }

    public function addBomLine(Request $request, BillOfMaterials $billOfMaterials): JsonResponse
    {
        $data = $request->validate([
            'component_id' => ['required', 'integer', 'exists:products,id'],
            'quantity'     => ['required', 'numeric', 'min:0.0001'],
            'uom'          => ['nullable', 'string', 'max:20'],
            'sequence'     => ['nullable', 'integer', 'min:1'],
            'is_optional'  => ['boolean'],
            'notes'        => ['nullable', 'string'],
        ]);

        $line = BomLine::create([
            'bom_id'       => $billOfMaterials->id,
            'component_id' => $data['component_id'],
            'quantity'     => $data['quantity'],
            'uom'          => $data['uom'] ?? null,
            'sequence'     => $data['sequence'] ?? (($billOfMaterials->lines()->count() + 1) * 10),
            'is_optional'  => $data['is_optional'] ?? false,
            'notes'        => $data['notes'] ?? null,
        ]);

        return $this->success($line->load('component:id,name,sku'), 201);
    }

    public function removeBomLine(BillOfMaterials $billOfMaterials, BomLine $bomLine): JsonResponse
    {
        $bomLine->delete();

        return $this->success(['message' => 'BOM line removed.']);
    }

    // ── Manufacturing Orders ──────────────────────────────────────────────────

    public function indexOrders(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $orders   = ManufacturingOrder::where('tenant_id', $tenantId)
            ->with('product:id,name,sku', 'bom:id,name')
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('scheduled_date')
            ->get();

        return $this->success($orders);
    }

    public function storeOrder(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'product_id'     => ['required', 'integer', 'exists:products,id'],
            'bom_id'         => ['nullable', 'integer', 'exists:bills_of_materials,id'],
            'qty_to_produce' => ['required', 'numeric', 'min:0.0001'],
            'scheduled_date' => ['nullable', 'date'],
            'warehouse_id'   => ['nullable', 'integer', 'exists:warehouses,id'],
            'notes'          => ['nullable', 'string'],
        ]);

        $order = ManufacturingOrder::create([
            'tenant_id'      => $tenantId,
            'product_id'     => $data['product_id'],
            'bom_id'         => $data['bom_id'] ?? null,
            'qty_to_produce' => $data['qty_to_produce'],
            'qty_produced'   => 0,
            'status'         => 'draft',
            'scheduled_date' => $data['scheduled_date'] ?? null,
            'warehouse_id'   => $data['warehouse_id'] ?? null,
            'notes'          => $data['notes'] ?? null,
            'created_by'     => $request->user()->id,
        ]);

        return $this->success($order->load('product:id,name,sku', 'bom:id,name'), 201);
    }

    public function confirmOrder(ManufacturingOrder $manufacturingOrder): JsonResponse
    {
        if ($manufacturingOrder->status !== 'draft') {
            return $this->error('Only draft orders can be confirmed.', 422);
        }

        $manufacturingOrder->confirm();

        return $this->success($manufacturingOrder->fresh());
    }

    public function startOrder(ManufacturingOrder $manufacturingOrder): JsonResponse
    {
        if ($manufacturingOrder->status !== 'confirmed') {
            return $this->error('Only confirmed orders can be started.', 422);
        }

        $manufacturingOrder->startProduction();

        return $this->success($manufacturingOrder->fresh());
    }

    public function completeOrder(Request $request, ManufacturingOrder $manufacturingOrder): JsonResponse
    {
        if ($manufacturingOrder->status !== 'in_progress') {
            return $this->error('Only in-progress orders can be completed.', 422);
        }

        $data = $request->validate([
            'qty_produced' => ['required', 'numeric', 'min:0'],
        ]);

        $manufacturingOrder->complete($data['qty_produced']);

        return $this->success($manufacturingOrder->fresh());
    }

    public function cancelOrder(ManufacturingOrder $manufacturingOrder): JsonResponse
    {
        if (in_array($manufacturingOrder->status, ['done'])) {
            return $this->error('Completed orders cannot be cancelled.', 422);
        }

        $manufacturingOrder->cancel();

        return $this->success($manufacturingOrder->fresh());
    }

    // ── Work Centers ──────────────────────────────────────────────────────────

    public function indexWorkCenters(Request $request): JsonResponse
    {
        $tenantId    = $this->tenantId($request);
        $workCenters = WorkCenter::where('tenant_id', $tenantId)
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->orderBy('name')
            ->get();

        return $this->success($workCenters);
    }

    public function storeWorkCenter(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'     => ['required', 'string', 'max:100'],
            'code'     => ['nullable', 'string', 'max:20'],
            'capacity' => ['nullable', 'numeric', 'min:0'],
        ]);

        $wc = WorkCenter::create([
            'tenant_id' => $tenantId,
            'name'      => $data['name'],
            'code'      => $data['code'] ?? null,
            'capacity'  => $data['capacity'] ?? 1,
            'is_active' => true,
        ]);

        return $this->success($wc, 201);
    }
}
