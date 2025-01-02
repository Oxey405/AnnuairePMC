<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { Tag } from 'lucide-svelte';
    import { writable, type Writable } from 'svelte/store';

	let name = 'Default service name';
	let desc = 'Default description';
	let tags: Writable<string[]> = writable([])
	let files: FileList;
	let imgURL: string;

	let available_tags: { [index: string]: string } = {};

	supabase
		.from('Tags')
		.select('*')
		.then((response) => {
			response.data?.forEach((tag) => {
				if (tag.id != null && tag.name != null) available_tags[tag.id] = tag.name;
			});
		});

	function updateImage() {
		console.log('lol');
		let reader = new FileReader();
		reader.readAsDataURL(files[0]);
		reader.onload = () => {
			imgURL = reader.result as string;
		};
	}

    let tagToAdd: string = "";
    function addTag() {
        console.log(tagToAdd)
        let t = $tags;
        t.push(tagToAdd)
        tags.set(t)
    }

	supabase.storage.from('thumbnails').getPublicUrl;
</script>

<div class="flex w-1/2 flex-col items-center rounded-lg bg-gray-400 p-4 dark:bg-slate-600">
	<div class="aspect-video w-96 rounded-lg border-2 border-solid border-white p-4">
		{#if imgURL}
			<img class="aspect-video w-96 rounded-lg" src={imgURL} alt="" />
		{/if}
		<input class="" type="file" bind:files on:change={updateImage} accept="image/*" />
	</div>

	<h1 contenteditable="true" class="ml-10 mt-1 mt-10 w-10/12 text-2xl" bind:innerText={name}></h1>
	<p contenteditable="true" class="ml-20 mt-4 w-10/12" bind:innerText={desc}></p>
	<span class="ml-3 mt-6 flex w-10/12 items-center">
		<span class="mr-3">
			<Tag />
		</span>
		<div class="flex overflow-auto w-2/3">
			{#each $tags as tag}
				<span class="m-2 rounded-xl bg-gray-700 p-2 text-white whitespace-nowrap">{available_tags[tag]}</span>
			{/each}
		</div>
        <span class="flex flex-wrap w-1/3 flex-row">
            <select bind:value={tagToAdd} class="rounded p-1 m-1 text-black whitespace-nowrap" placeholder="choisissez un tag">
                {#each Object.entries(available_tags) as tag}
                    <option value={tag[0]}>{tag[1]}</option>
                {/each}
            </select>
            <button class="rounded bg-white p-1 m-1 text-black" on:click={addTag}>Ajouter</button>
        </span>
	</span>
</div>
