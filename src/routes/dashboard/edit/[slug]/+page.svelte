<script lang="ts">
	import { NetherAddress, Service } from '$lib';
	import { pb } from '$lib/pocketbase';
	import { serializeQueryParams } from 'pocketbase';

	// @ts-ignore
	import ServiceEditor from '../../../../components/ServiceEditor.svelte';
	export let data: { id: string };

	let tags: { id: string; name: string }[] = [];

	async function getService() {
		let place = await pb.collection('places').getOne(data.id, { expand: 'tags' });
		if (place.expand && place.expand.tags) {
			place.expand.tags.forEach((tag: { id: string; name: string }) => {
				tags.push({ id: tag.id, name: tag.name });
			});
		}
		let netherAddress = new NetherAddress(
			place.netherAddr.exit,
			place.netherAddr.cardinal,
			place.netherAddr.direction
		);
		let imgURL = pb.files.getURL(place, place.img);
		return new Service(
			place.name,
			place.desc,
			place.authors,
			{ x: place.coord_x, z: place.coord_z },
			imgURL,
			netherAddress,
			tags,
			place.id
		);
	}
</script>

<svelte:head>
	<title>Ajouter | Annuaire de PlayMC</title>
</svelte:head>

<div class="flex h-screen flex-col items-center justify-center">
	<h1 class="p-4 text-4xl">Modifier un service</h1>
	{#await getService()}
		<p>Chargement...</p>
	{:then service} 
	<ServiceEditor service={service}></ServiceEditor>

	{/await}
</div>
