<script lang="ts">
	import Filters from "../components/Sidebar.svelte";
	import Finder from "../components/Finder.svelte";
	import type { QueryFilters } from "$lib";
	import { writable, type Writable } from "svelte/store";

	let queryFilter: Writable<QueryFilters> = writable({
		types: [],
		query: ""
	})

</script>

<svelte:head>
	<title>Annuaire de PlayMC</title>
</svelte:head>

<div class="wrapper flex lg:flex-row flex-col items-center h-full w-full">
	<Filters bind:searchQuery={queryFilter}></Filters>
	<Finder bind:searchQuery={queryFilter}></Finder>
</div>