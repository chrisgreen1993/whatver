// This module is not typed, so we need to declare it
declare module "cli-columns" {
	function columns(data: string[], options?: { sort?: boolean }): string;
	export = columns;
}
