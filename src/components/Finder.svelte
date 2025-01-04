<script lang="ts">
	import { Cardinal, Direction, NetherAddress, Service, type QueryFilters } from '$lib';
	import type { QueryData } from '@supabase/supabase-js';
	import ServiceElem from './ServiceElem.svelte';
	import type { Writable } from 'svelte/store';
	import { pb } from '$lib/pocketbase';
	import { Server } from 'lucide-svelte';
	import { onMount } from 'svelte';

	function isNetherAddrJSON(
		obj: any
	): obj is { cardinal: string; exit: number; direction: string } {
		return (
			Object.keys(obj).includes('exit') &&
			Object.keys(obj).includes('direction') &&
			Object.keys(obj).includes('cardinal')
		);
	}

	let services: Service[] = [];
	export let searchQuery: Writable<QueryFilters>;

    let prevQuery = ""
	let fetchLock = false;



	async function getData() {
		fetchLock = true;
		let data;
		let filter = ''

		if($searchQuery.types.length > 0) {
			filter = "(" + $searchQuery.types.map(type => `tags?~"${type}"`).join(' && ') + ")"
		}

		if($searchQuery.query.length > 0) {
			let queryTerms = $searchQuery.query.split(' ');
			if(filter != "") {
				filter += "&&"
			}
			filter += `${queryTerms.map(term => `name?~"${term}"`).join(' || ')}`
		}

		
		data = await pb.collection("places").getFullList({expand: 'tags', filter: filter})

		services = data.map(service => {
			let tags: {id: string, name: string}[] = []
			if(service.expand && service.expand.tags) {
				service.expand.tags.forEach((tag: { id: string ; name: string; }) => {
					tags.push({id: tag.id, name: tag.name})
				})
			}
			let url = pb.files.getURL(service, service.img)
			let nether_addr = new NetherAddress(service.netherAddr.exit, service.netherAddr.cardinal, service.netherAddr.direction)
			return new Service(service.name, service.desc, service.authors, {x: service.coord_x, z: service.coord_z}, url, nether_addr, tags)
		})

		fetchLock = false;
	}


</script>

<div
	class="flex h-screen w-full flex-row flex-wrap content-start items-start justify-center overflow-y-auto pt-10 pb-10"
>
	{#await getData()}
		<p>chargement...</p>
	{:then}
	{#each services as service}
		<ServiceElem {service}></ServiceElem>
	{/each}

    {#if services.length == 0}
        <p>Aucun résultat ne correspond à votre recherche :/</p>
    {/if}
	{/await}

</div>
