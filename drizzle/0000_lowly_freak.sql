CREATE TABLE `authorities` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`label` text NOT NULL,
	`synonyms` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `collectionItems` (
	`id` text PRIMARY KEY NOT NULL,
	`collectionId` text NOT NULL,
	`type` text NOT NULL,
	`targetId` text NOT NULL,
	FOREIGN KEY (`collectionId`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`outfitId` text NOT NULL,
	`userId` text NOT NULL,
	`body` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`outfitId`) REFERENCES `outfits`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `editorials` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`body` text NOT NULL,
	`garmentId` text NOT NULL,
	`source` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `follows` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`targetType` text NOT NULL,
	`targetId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `garments` (
	`id` text PRIMARY KEY NOT NULL,
	`brandId` text,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`image` text NOT NULL,
	`slot` text NOT NULL,
	`material` text NOT NULL,
	`construction` text NOT NULL,
	`source` text NOT NULL,
	FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` text PRIMARY KEY NOT NULL,
	`variantId` text NOT NULL,
	`storeId` text,
	`market` text NOT NULL,
	`price` real NOT NULL,
	`shipping` real NOT NULL,
	`size` text NOT NULL,
	`condition` text NOT NULL,
	`measurements` text NOT NULL,
	FOREIGN KEY (`variantId`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `outfitItems` (
	`id` text PRIMARY KEY NOT NULL,
	`outfitId` text NOT NULL,
	`variantId` text NOT NULL,
	`ownedId` text,
	`slot` text NOT NULL,
	FOREIGN KEY (`outfitId`) REFERENCES `outfits`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variantId`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ownedId`) REFERENCES `owned`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `outfits` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`caption` text NOT NULL,
	`occasion` text NOT NULL,
	`media` text NOT NULL,
	`mediaType` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `owned` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`variantId` text NOT NULL,
	`size` text NOT NULL,
	`sizeSystem` text NOT NULL,
	`price` real NOT NULL,
	`purchased` text NOT NULL,
	`condition` text NOT NULL,
	`measurements` text NOT NULL,
	`notes` text NOT NULL,
	`image` text NOT NULL,
	`visibility` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variantId`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reactions` (
	`id` text PRIMARY KEY NOT NULL,
	`outfitId` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`outfitId`) REFERENCES `outfits`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stores` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`miles` real NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`garmentId` text NOT NULL,
	`body` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`bio` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `variants` (
	`id` text PRIMARY KEY NOT NULL,
	`garmentId` text NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`era` text NOT NULL,
	FOREIGN KEY (`garmentId`) REFERENCES `garments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `wears` (
	`id` text PRIMARY KEY NOT NULL,
	`ownedId` text NOT NULL,
	`outfitId` text,
	`date` text NOT NULL,
	`occasion` text NOT NULL,
	FOREIGN KEY (`ownedId`) REFERENCES `owned`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`outfitId`) REFERENCES `outfits`(`id`) ON UPDATE no action ON DELETE no action
);
