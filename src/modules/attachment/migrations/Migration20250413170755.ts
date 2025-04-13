import { Migration } from '@mikro-orm/migrations';

export class Migration20250413170755 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "attachment-pdf-template" add column if not exists "previewData" jsonb not null default '{}';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "attachment-pdf-template" drop column if exists "previewData";`);
  }

}
