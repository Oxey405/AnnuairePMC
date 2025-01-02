<script lang="ts">
	import { Service } from "$lib";
	import { MapPin, Tag, UserRound } from "lucide-svelte";

    interface Props {
        service: Service
    }

    let { service }: Props = $props();
</script>

<div class="w-full bg-gray-400 dark:bg-slate-600 p-5 m-8 mb-2 rounded-lg flex flex-row">
    <img class="rounded-lg w-96 h-full mr-4" src="{service.imgURL}" alt="{service.name + " cover"}">
<div>
    <h2 class="text-2xl mt-1">{service.name}</h2>
    <p class="ml-3 mt-1 w-full h-8 overflow-hidden" >{service.desc.substring(0, 300) + (service.desc.length > 300 ? "..." : "")}</p>
    <span class="">
        <span class="flex items-center m-2 ml-3">
            <span class="mr-3">
                <UserRound />
            </span>
            <p>
                {#each service.owners as owner }
                <span class="pr-2">{owner}</span>
                {/each}
            </p>

        </span>
        <span class="flex items-center m-2 ml-3">
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
    <span class="flex items-center ml-3">
        <span class="mr-3">
            <Tag />
        </span>
        <span class="w-full flex flex-wrap">
            {#each service.tags as tag}
            <span class="rounded-xl bg-gray-700 text-white p-2 m-1 whitespace-nowrap">{tag.name}</span>
            {/each}
        </span>
    </span>
    {/if}
    </span>
</div>

</div>