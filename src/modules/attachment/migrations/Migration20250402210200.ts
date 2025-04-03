import { Migration } from '@mikro-orm/migrations';

export class Migration20250402210200 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "attachment-pdf-template" drop constraint if exists "attachment-pdf-template_handle_unique";`);
    this.addSql(`create table if not exists "attachment-pdf-template" ("id" text not null, "handle" text not null, "name" text not null, "template" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "attachment-pdf-template_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_attachment-pdf-template_handle_unique" ON "attachment-pdf-template" (handle) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_attachment-pdf-template_deleted_at" ON "attachment-pdf-template" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "attachment-pdf-template" cascade;`);
  }

}
