<script lang="ts">
	import { Cardinal, Direction, NetherAddress, Service, type QueryFilters } from '$lib';
	import { supabase } from '$lib/supabase';
	import type { QueryData } from '@supabase/supabase-js';
	import ServiceElem from './ServiceElem.svelte';
	import type { Writable } from 'svelte/store';

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
	let tagsOnPlaces = supabase.from('Places').select('*, tags:Tags(*)');
	$: if ($searchQuery.query != prevQuery) {
        prevQuery = $searchQuery.query
		tagsOnPlaces.textSearch('name', $searchQuery.query);
        fetchData()
        tagsOnPlaces = supabase.from('Places').select('*, tags:Tags(*)');
	}

    $: if($searchQuery.query == "" && $searchQuery.types.length == 0) {
        fetchData()
    }

    $: if($searchQuery.types.length > 0) {
        console.log($searchQuery.types)
        tagsOnPlaces = supabase.from('Places').select(`*, tags:Tags!inner(id, name)`).eq('tags.id', $searchQuery.types[0]);
        fetchData()
        tagsOnPlaces = supabase.from('Places').select('*, tags:Tags(*)');

    }


	function fetchData() {
		type PlacesWithTag = QueryData<typeof tagsOnPlaces>;

		tagsOnPlaces.then((response) => {
			if (response.error) {
				// alert("Une erreur est survenue lors de la récupération de l'annuaire. Si cela ce reproduit : contactez le webmestre.")
				console.error(response.error);
			}
			if (response.data == null || response.data == undefined) {
				// alert("Une erreur est survenue lors de la récupération de l'annuaire")
			}
			const data: PlacesWithTag = response.data!;
			services = data.map((raw) => {
				let addr = null;
                console.log(raw)
				if (typeof raw.netherAddr == 'object' && raw.netherAddr != null) {
					if (isNetherAddrJSON(raw.netherAddr)) {
						let tags: { id: string; name: string | null }[] = [];
						tags = raw.tags;
						addr = new NetherAddress(
							raw.netherAddr['exit'],
							raw.netherAddr['cardinal'] as Cardinal,
							raw.netherAddr['direction'] as Direction
						);
						return new Service(
							raw.name,
							raw.desc,
							raw.owners,
							{ x: raw.coord_x, z: raw.coord_z },
							raw.imgURL,
							addr,
							tags
						);
					}
				}
				return new Service(
					raw.name,
					raw.desc,
					raw.owners,
					{ x: raw.coord_x, z: raw.coord_z },
					raw.imgURL
				);
			});
		});
	}
</script>

<div
	class="flex h-screen w-full flex-row flex-wrap content-start items-start justify-center overflow-y-auto pt-10"
>
	{#each services as service}
		<ServiceElem {service}></ServiceElem>
	{/each}

    {#if services.length == 0}
        <p>Aucun résultat ne correspond à votre recherche :/</p>
    {/if}

</div>
