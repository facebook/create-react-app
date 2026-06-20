<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->unsignedSmallInteger('fiscal_year')->default(2025)->after('name');
        });

        // Populate fiscal_year from year
        DB::table('budgets')->update(['fiscal_year' => DB::raw('"year"')]);

        Schema::table('budgets', function (Blueprint $table) {
            $table->unique(['tenant_id', 'name', 'fiscal_year'], 'budgets_tenant_name_fiscal_year_unique');
        });

        // Update status column to support 'closed' in addition to 'archived'
        // SQLite: drop and recreate the status column with updated check constraint
        // Use raw SQL to modify the check constraint
        DB::statement("
            CREATE TABLE budgets_new AS SELECT
                id, tenant_id, name, fiscal_year, year, period_type, notes,
                CASE WHEN status = 'archived' THEN 'closed' ELSE status END as status,
                created_by, created_at, updated_at, deleted_at
            FROM budgets
        ");
        DB::statement("DROP TABLE budgets");
        DB::statement("
            CREATE TABLE budgets (
                id integer NOT NULL PRIMARY KEY AUTOINCREMENT,
                tenant_id integer NOT NULL,
                name varchar(255) NOT NULL,
                fiscal_year integer unsigned NOT NULL DEFAULT 2025,
                year integer NOT NULL,
                period_type varchar(255) CHECK(period_type IN ('annual','monthly','quarterly')) NOT NULL DEFAULT 'annual',
                notes text,
                status varchar(255) CHECK(status IN ('draft','active','closed')) NOT NULL DEFAULT 'draft',
                created_by integer,
                created_at datetime,
                updated_at datetime,
                deleted_at datetime,
                FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
            )
        ");
        DB::statement("INSERT INTO budgets SELECT id, tenant_id, name, fiscal_year, year, period_type, notes, status, created_by, created_at, updated_at, deleted_at FROM budgets_new");
        DB::statement("DROP TABLE budgets_new");

        // Re-create indexes
        DB::statement("CREATE UNIQUE INDEX budgets_tenant_name_fiscal_year_unique ON budgets (tenant_id, name, fiscal_year)");
    }

    public function down(): void
    {
        DB::statement("
            CREATE TABLE budgets_restore AS SELECT
                id, tenant_id, name, year, period_type, notes,
                CASE WHEN status = 'closed' THEN 'archived' ELSE status END as status,
                created_by, created_at, updated_at, deleted_at
            FROM budgets
        ");
        DB::statement("DROP TABLE budgets");
        DB::statement("
            CREATE TABLE budgets (
                id integer NOT NULL PRIMARY KEY AUTOINCREMENT,
                tenant_id integer NOT NULL,
                name varchar(255) NOT NULL,
                year integer NOT NULL,
                period_type varchar(255) CHECK(period_type IN ('annual','monthly','quarterly')) NOT NULL DEFAULT 'annual',
                notes text,
                status varchar(255) CHECK(status IN ('draft','active','archived')) NOT NULL DEFAULT 'draft',
                created_by integer,
                created_at datetime,
                updated_at datetime,
                deleted_at datetime,
                FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
            )
        ");
        DB::statement("INSERT INTO budgets SELECT id, tenant_id, name, year, period_type, notes, status, created_by, created_at, updated_at, deleted_at FROM budgets_restore");
        DB::statement("DROP TABLE budgets_restore");
    }
};
