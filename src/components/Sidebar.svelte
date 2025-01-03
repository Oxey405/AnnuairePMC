<script lang="ts">
	import type { QueryFilters } from "$lib";
	import { pb } from "$lib/pocketbase";
	import { writable, type Writable } from "svelte/store";

    let types: {[index: string]: string} = {}
    let checkedTypes = new Map()

    Object.keys(types).forEach(key => {
        checkedTypes.set(key, false)
    })

    async function getTags() {
        let raw_types = await pb.collection("tags").getFullList();
        raw_types.forEach(type => {
            console.log(type)
            types[type.id] = type.name
        });
    }

    getTags()

    export let searchQuery: Writable<QueryFilters>;

    function checkType(e: Event) {
        if(!e.currentTarget) {
            return;
        }

        let target = e.currentTarget as HTMLElement
        let id = target.getAttribute("name");
        if(id) {
            checkedTypes.set(id, !checkedTypes.get(id))
            let chosenTypes: string[] = []
            checkedTypes.entries().forEach(entry => {
                if(entry[1]) {
                    chosenTypes.push(entry[0])
                }
            })

            $searchQuery.types = chosenTypes;
            //TODO : Add the types chosen in the array
        }

    }
    
    let user = pb.authStore.record


</script>

<div class="flex flex-col items-center sticky top-0 left-0 filters-container bg-gray-400 dark:bg-slate-700 h-screen w-1/4 max-w-sm min-w-48 transition-colors">
    <!-- <p class="text-center text-2xl text-gray-900 dark:text-gray-100">Annuaire de PlayMC</p> -->
    <a class="text-center mb-3" href="/">
        <h1 class="text-4xl">Annuaire de PlayMC</h1>
    </a>
    {#if user && pb.authStore.isValid}
    <p>Connecté en tant que</p>
    <span class="flex flex-row items-center m-2">
        <img class="rounded-lg w-12 mr-1" src="{user.imgURL}" alt="">
        <p class="ml-1">{user.username}</p>
        <a class="p-3  m-3 rounded-lg bg-teal-800" href="/dashboard">+</a>
    </span>
    {:else}
        <a class="p-3  m-3 rounded-lg bg-teal-800" href="/auth/login">S'identifier</a>
    {/if}
    <input class="rounded-md p-1 text-black w-11/12" type="text" placeholder="Rechercher" bind:value={$searchQuery.query}>
    <div class="section flex-col pl-1">
        <h2 class="text-xl font-bold p-1 pl-0" >Type</h2>
        {#each Object.entries(types) as type}
            <div class="selection-inputs pl-2">
                <input type="checkbox" name="{type[0]}" on:change={checkType} id="">
                <label for="{type[0]}">{type[1]}</label>        
            </div>
        {/each}
    </div>
</div>

<style>




</style>