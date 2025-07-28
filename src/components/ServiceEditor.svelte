<script lang="ts">
	import { Cardinal, Direction, NetherAddress, Service } from '$lib';
	import { pb } from '$lib/pocketbase';
	import { MapPin, Navigation, Tag, UserRound } from 'lucide-svelte';
	import { writable, type Writable } from 'svelte/store';

	interface Props {
		service: Service;
	}

	let { service }: Props = $props();

	let name = service.name;
	let desc = service.desc;
	let owners: string[] = service.owners;
	let nether_exit = service.netherAddress?.exit;
	let nether_card = service.netherAddress?.cardinal;
	let nether_dir = service.netherAddress?.direction;
	let coord_x = service.coordinates.x;
	let coord_z = service.coordinates.z;
	let tags: Writable<string[]> = writable([]);
	tags.set(service.tags.map((tag) => tag.id));
	console.log($tags)
	let files: FileList;
	let imgURL: string = service.imgURL;

	let available_tags: { [index: string]: string } = {};
	let user = pb.authStore.record;

	async function getTags() {
		let raw_types = await pb.collection('tags').getFullList();
		raw_types.forEach((type) => {
			available_tags[type.id] = type.name;
		});
	}


	function updateImage() {
		let reader = new FileReader();
		reader.readAsDataURL(files[0]);
		reader.onload = () => {
			imgURL = reader.result as string;
		};
	}

	let tagToAdd: string = '';
	function addTag() {
		console.log(tagToAdd);
		let t = $tags;
		t.push(tagToAdd);
		tags.set(t);
	}

	async function editService() {
		console.log(service)
		if(!service.id) {
			alert("Une erreur innattendue est survenue !");
			return;
		}
		if (!nether_card && !nether_exit && !nether_dir) {
			alert("Informations manquantes sur l'addresse nether !");
			return;
		}
		let addr = new NetherAddress(nether_exit as number, nether_card as Cardinal, nether_dir as Direction);

		if (!pb.authStore.isValid) {
			alert(
				"Vous n'êtes pas connecté. Merci de commencer par vous connecter avant d'enregistrer un service."
			);
			return;
		}

		try {
			let modified: {[key: string]: any} = {
				name: name,
				desc: desc,
				authors: owners,
				coord_x: coord_x,
				coord_z: coord_z,
				netherAddr: addr.toJSON(),
				added_by: user!.id,
				tags: $tags
			}

			if(files) {
				modified.img = files[0]
			}

			let result = await pb.collection('places').update(service.id!, modified);
		} catch (error) {
			alert("Une erreur est survenue lors de l'ajout de l'enregistrement");
			console.error(error);
			return;
		}

		alert('Opération effectuée avec succès.');
		window.location.href = '/';
	}
</script>

<div
	class="flex w-1/2 min-w-fit flex-col items-center rounded-lg bg-gray-400 p-4 dark:bg-slate-600"
>
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
		{#await getTags()}
			...
		{:then} 
		<div class="flex w-2/3 max-w-72 overflow-auto">
			{#each $tags as tag}
				<span class="m-2 whitespace-nowrap rounded-xl bg-gray-700 p-2 text-white"
					>{available_tags[tag]}</span
				>
			{/each}
		</div>
		<span class="flex w-1/4 min-w-fit flex-row flex-wrap">
			<select
				bind:value={tagToAdd}
				class="m-1 whitespace-nowrap rounded p-1 text-black"
				placeholder="choisissez un tag"
			>
				{#each Object.entries(available_tags) as tag}
					<option value={tag[0]}>{tag[1]}</option>
				{/each}
			</select>
			<button class="m-1 rounded bg-white p-1 text-black" on:click={addTag}>Ajouter</button>
		</span>
		{/await}
		
		
	</span>
	<span class="flex w-10/12 flex-row items-center">
		<UserRound />
		<input
			value="{owners.join(' ')}"
			on:change={(e) => {
				owners = e.currentTarget.value.split(' ');
				console.log(owners);
			}}
			class="m-2 w-full rounded p-2 text-black"
			type="text"
			placeholder="Pseudos des gestionnaires (séparés par un espace)"
		/>
	</span>
	<span class="flex w-11/12 flex-row items-center">
		<Navigation />
		<input
			bind:value={nether_exit}
			class="m-1 whitespace-nowrap rounded p-1 text-black"
			min="0"
			max="9"
			type="number"
		/>
		<select bind:value={nether_card} class="m-1 whitespace-nowrap rounded p-1 text-black">
			<option value="N">Nord</option>
			<option value="E">Est</option>
			<option value="S">Sud</option>
			<option value="W">Ouest</option>
		</select>
		<select bind:value={nether_dir} class="m-1 whitespace-nowrap rounded p-1 text-black">
			<option value="L">Gauche</option>
			<option value="R">Droite</option>
		</select>
	</span>
	<span class="flex w-10/12 flex-row items-center">
		<MapPin />
		<label for="x">X : </label>
		<input
			bind:value={coord_x}
			class="m-1 whitespace-nowrap rounded p-1 text-black"
			name="x"
			type="number"
		/>
		<label for="z">Z : </label>
		<input
			bind:value={coord_z}
			class="m-1 whitespace-nowrap rounded p-1 text-black"
			name="z"
			type="number"
		/>
	</span>
	<button
		on:click={() => {
			editService();
		}}
		class="m-3 rounded-lg bg-teal-800 p-3"
	>
		Enregister le service
	</button>
</div>
