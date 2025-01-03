<script lang="ts">
	import { Cardinal, Direction, NetherAddress } from '$lib';
import { supabase } from '$lib/supabase';
	import type { User } from '@supabase/supabase-js';
	import { MapPin, Navigation, Tag, UserRound } from 'lucide-svelte';
    import { writable, type Writable } from 'svelte/store';

	let name = 'Nom du service';
	let desc = 'Description';
	let owners: string[] = []
	let nether_exit = 0;
	let nether_card = "N";
	let nether_dir = "L";
	let coord_x = 0;
	let coord_z = 0;
	let tags: Writable<string[]> = writable([]);
	let files: FileList;
	let imgURL: string;

	let available_tags: { [index: string]: string } = {};

	let user: null | User = null;
    supabase.auth.getSession().then(async (data) => {
        user = (await supabase.auth.getUser()).data.user
    }).catch(() => {
        alert("Vous n'êtes pas connecté. Vous ne pourrez donc pas faire de modification.")
    })

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

	async function createRecord() {
		if(!user) {
			alert("Vous n'êtes pas connecté.")
			return;
		}

		let img_name = `${user.id}/${name}-thumbnail-${(new Date()).toISOString().substring(0, 10)}`;
		const upload_result = await supabase.storage.from("thumbnails").upload(img_name, files[0])

		if(upload_result.error) {
			alert("Impossible d'envoyer l'image de couverture sur le serveur. Réessayez plus tard.")
			return;
		}

		const url = supabase.storage.from("thumbnails").getPublicUrl(img_name)
		
		
		let nether_addr = new NetherAddress(nether_exit, (nether_card as Cardinal), (nether_dir as Direction))
		const { error } = await supabase.from('Places').insert({
			added_by: user!.id,
			name: name,
			desc: desc,
			owners: owners,
			imgURL: url.data.publicUrl,
			coord_x: coord_x,
			coord_z: coord_z,
			netherAddr: nether_addr.toJSON()
		})

		if(error) {
			alert("Une erreur est survenue lors de la création de l'enregistrement. Réessayez plus tard.")
			return;
		}

		alert("L'enregistrement c'est effectué avec succès.")
		window.location.href = "/dashboard"
	}

</script>

<div class="flex w-1/2 flex-col items-center rounded-lg bg-gray-400 p-4 dark:bg-slate-600 min-w-fit">
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
		<div class="flex overflow-auto w-2/3 max-w-72">
			{#each $tags as tag}
				<span class="m-2 rounded-xl bg-gray-700 p-2 text-white whitespace-nowrap">{available_tags[tag]}</span>
			{/each}
		</div>
        <span class="flex flex-wrap w-1/4 min-w-fit flex-row">
            <select bind:value={tagToAdd} class="rounded p-1 m-1 text-black whitespace-nowrap" placeholder="choisissez un tag">
                {#each Object.entries(available_tags) as tag}
                    <option value={tag[0]}>{tag[1]}</option>
                {/each}
            </select>
            <button class="rounded bg-white p-1 m-1 text-black" on:click={addTag}>Ajouter</button>
        </span>
	</span>
	<span class="w-10/12 flex flex-row items-center">
		<UserRound />
		<input on:change={(e) => {owners = e.currentTarget.value.split(" "); console.log(owners)}} class="rounded p-2 m-2 w-full text-black" type="text" placeholder="Pseudos des gestionnaires (séparés par un espace)">
	</span>
	<span class="w-11/12 flex flex-row items-center">
		<Navigation />
		<input bind:value={nether_exit} class="rounded p-1 m-1 text-black whitespace-nowrap" min="0" max="9" type="number">
		<select bind:value={nether_card} class="rounded p-1 m-1 text-black whitespace-nowrap">
			<option value="N">Nord</option>
			<option value="E">Est</option>
			<option value="S">Sud</option>
			<option value="W">Ouest</option>
		</select>
		<select bind:value={nether_dir}  class="rounded p-1 m-1 text-black whitespace-nowrap">
			<option value="L">Gauche</option>
			<option value="R">Droite</option>
		</select>	
	</span>
	<span class="w-10/12 flex flex-row items-center">
		<MapPin />
		<label for="x">X : </label>
		<input bind:value={coord_x} class="rounded p-1 m-1 text-black whitespace-nowrap" name="x" type="number">
		<label for="z">Z : </label>
		<input bind:value={coord_z} class="rounded p-1 m-1 text-black whitespace-nowrap" name="z" type="number">

	</span>
	<button on:click={() => {createRecord()}} class="p-3 m-3 rounded-lg bg-teal-800">
		Enregister le service
	</button>
</div>
