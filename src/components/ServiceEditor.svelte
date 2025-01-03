<script lang="ts">
	import { Cardinal, Direction, NetherAddress } from '$lib';
	import { pb } from '$lib/pocketbase';
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
	let user = pb.authStore.record;


	async function getTags() {
        let raw_types = await pb.collection("tags").getFullList();
        raw_types.forEach(type => {
            console.log(type)
            available_tags[type.id] = type.name
        });
    }

    getTags()

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

	async function addService() {
		let addr = new NetherAddress(nether_exit, nether_card as Cardinal, nether_dir as Direction)

		if(!pb.authStore.isValid) {
			alert("Vous n'êtes pas connecté. Merci de commencer par vous connecter avant d'enregistrer un service.")
			return;
		}

		try {
			let result = await pb.collection('places').create({
				name: name,
				desc: desc,
				authors: owners,
				coord_x: coord_x,
				coord_z: coord_z,
				netherAddr: addr.toJSON(),
				added_by: user!.id,
				img: files[0],
				tags: $tags
			})
		} catch (error) {
			alert("Une erreur est survenue lors de l'ajout de l'enregistrement")
			console.error(error)
			return;
		}

		alert("Opération effectuée avec succès.")
		window.location.href = "/"

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
	<button on:click={() => {addService()}} class="p-3 m-3 rounded-lg bg-teal-800">
		Enregister le service
	</button>
</div>
