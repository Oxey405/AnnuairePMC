<script lang="ts">
	import { Service } from '$lib';
	import { MapPin, Tag, UserRound } from 'lucide-svelte';

	interface Props {
		service: Service;
	}

	let { service }: Props = $props();
</script>

<div class="m-8 mb-1 flex w-full flex-row rounded-lg bg-gray-400 p-5 dark:bg-slate-600">
	<img class="mr-4 h-full w-96 rounded-lg" src={service.imgURL} alt={service.name + ' cover'} />
	<div>
		<h2 class="mt-1 text-2xl">{service.name}</h2>
		<p class="ml-3 mt-1 h-12 w-full overflow-auto">
			{service.desc.substring(0, 300) + (service.desc.length > 300 ? '...' : '')}
		</p>
		<span class="">
			<span class="m-2 ml-3 flex items-center">
				<span class="mr-3">
					<UserRound />
				</span>
				<p>
					{#each service.owners as owner}
						<span class="pr-2">{owner}</span>
					{/each}
				</p>
			</span>
			<span class="m-2 ml-3 flex items-center">
				<span class="mr-3">
					<MapPin />
				</span>
				<span>
					{#if service.netherAddress}
						{service.netherAddress.toString()}
					{:else}
						{`x: ${service.coordinates.x} z: ${service.coordinates.z}`}
					{/if}
				</span>
			</span>
			{#if service.tags.length >= 1}
				<span class="ml-3 flex items-center">
					<span class="mr-3">
						<Tag />
					</span>
					<span class="flex w-full flex-wrap">
						{#each service.tags as tag}
							<span class="m-1 whitespace-nowrap rounded-xl bg-gray-700 p-2 text-white"
								>{tag.name}</span
							>
						{/each}
					</span>
				</span>
			{/if}
		</span>
	</div>
</div>
