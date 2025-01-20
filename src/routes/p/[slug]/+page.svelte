<script lang="ts">
	import { NetherAddress, Service } from '$lib';
	import { pb } from '$lib/pocketbase';
	import { MapPin, Tag, UserRound } from 'lucide-svelte';

	export let data;
	let tags: { id: string; name: string }[] = [];
	if (data.place.expand && data.place.expand.tags) {
		data.place.expand.tags.forEach((tag: { id: string; name: string }) => {
			tags.push({ id: tag.id, name: tag.name });
		});
	}
	let netherAddress = new NetherAddress(
		data.place.netherAddr.exit,
		data.place.netherAddr.cardinal,
		data.place.netherAddr.direction
	);
	let imgURL = pb.files.getURL(data.place, data.place.img);
	let service = new Service(
		data.place.name,
		data.place.desc,
		data.place.authors,
		{ x: data.place.coord_x, z: data.place.coord_z },
		imgURL,
		netherAddress,
		tags
	);
</script>

<svelte:head>
	<title>{data.place.name} | Annuaire PMC</title>
</svelte:head>

<div class="flex flex-col items-center">
	<img src={imgURL} class="m-4 mt-8 w-3/5 min-w-96 max-w-4xl rounded-lg" alt="" />
	<h1 class="m-2 mt-1 text-center text-4xl font-bold">{service.name}</h1>
	<span class="m-2 ml-3 flex items-center whitespace-nowrap rounded-xl bg-gray-700 p-2 text-white">
		<span class="mr-3">
			<MapPin />
		</span>
		<span>
			{#if service.netherAddress}
				{service.netherAddress.toString()}
				({`x: ${service.coordinates.x} z: ${service.coordinates.z}`})
			{:else}
				{`x: ${service.coordinates.x} z: ${service.coordinates.z}`}
			{/if}
		</span>
	</span>

	{#if service.tags.length >= 1}
		<span class="ml-3 m-2 flex items-center">
			<span class="mr-3">
				<Tag />
			</span>
			<span class="flex w-full flex-wrap">
				{#each service.tags as tag}
					<span class="m-1 whitespace-nowrap rounded-xl bg-gray-700 p-2 text-white">{tag.name}</span
					>
				{/each}
			</span>
		</span>
	{/if}

	<span class="m-2 ml-3 flex items-center ">
		<span class="mr-3 ">
			<UserRound />
		</span>
		<p>
			{#each service.owners as owner}
				<span class="m-1 whitespace-nowrap rounded-xl bg-gray-700 p-2 text-white">{owner}</span>
			{/each}
		</p>
	</span>

	<p class="min-w-96 m-5 w-1/2">{service.desc}</p>
</div>
