ALTER TABLE `owned` ADD `catalogData` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `owned` ADD `created` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `wears` ADD `notes` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_wears_owned_date` ON `wears` (`ownedId`,`date`);