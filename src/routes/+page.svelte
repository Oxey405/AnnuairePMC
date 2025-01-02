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


<div class="wrapper flex flex-row items-center h-full w-full">

<Filters bind:searchQuery={queryFilter}></Filters>
<Finder bind:searchQuery={queryFilter}></Finder>
</div>