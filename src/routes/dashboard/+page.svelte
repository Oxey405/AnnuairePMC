<script lang="ts">
	import { NetherAddress, Service } from '$lib';
	import { pb } from '$lib/pocketbase';
 

	let owned_services: Service[] = [];

    let user = pb.authStore.record;

	async function getData() {
		let data = await pb.collection('places').getFullList({ expand: 'tags', filter: `added_by="${user?.id}"` });

		owned_services = data.map((service) => {
			let tags: { id: string; name: string }[] = [];
			if (service.expand && service.expand.tags) {
				service.expand.tags.forEach((tag: { id: string; name: string }) => {
					tags.push({ id: tag.id, name: tag.name });
				});
			}
			let url = pb.files.getURL(service, service.img);
			let nether_addr = new NetherAddress(
				service.netherAddr.exit,
				service.netherAddr.cardinal,
				service.netherAddr.direction
			);
			return new Service(
				service.name,
				service.desc,
				service.authors,
				{ x: service.coord_x, z: service.coord_z },
				url,
				nether_addr,
				tags,
                service.id
			);
		});
	}

    async function deleteRecord(recordID: string | null) {
        if(recordID == null) {
            return
        }

        let choice = confirm(`Êtes-vous certain de vouloir supprimer cette adresse ? (Ce choix ne peut pas être annulé)`)

        if(!choice) {
            return;
        }

        try {
            let result = await pb.collection('places').delete(recordID);
        } catch (error) {
            console.error(error);
            alert("L'enregistrement n'a pas pu être supprimé.");
            return;
        }

        alert("L'Enregistrement a bien été supprimé !");

        getData()

    }

    async function openEditor(recordID: string | null) {
        window.location.href = `/dashboard/edit/${recordID}`
    }

</script>

<svelte:head>
	<title>Tableau de bord | Annuaire de PlayMC</title>
</svelte:head>

{#if pb.authStore.isValid}
    <div class="flex h-screen flex-col items-center justify-center">
        <h1 class="text-4xl">Bienvenue sur le tableau de bord</h1>
        <p class="text-center">
            Gérez et ajoutez des enregistrements dans l'annuaire.<br />Attetion : De grands pouvoirs
            impliquent de grandes responsabilités !
        </p>
        <div class="p-3">
            <a href="/dashboard/create"
                ><button class="m-1 rounded bg-white p-1 text-black">Ajouter un enregistrement</button></a
            >
        </div>
        <h2 class="text-2xl">Vos adresses enregistrées</h2>
        <div>
            {#await getData()}
                <p>Récupération de vos adresses...</p>
            {:then} 
                {#each owned_services as service}
                <div class="flex flex-col items-center rounded-lg bg-gray-400 p-4 m-2 dark:bg-slate-600">
                    <img src="{service.imgURL}" class="w-96 rounded-lg" alt="">
                    <p class="text-2xl m-2">{service.name}</p>
                    <span>
                        <button on:click={() => openEditor(service.id)} title="Pas encore disponible" class="bg-white text-black rounded p-1 m-1 disabled:bg-gray-500 disabled:cursor-not-allowed">Modifier</button>
                        <button on:click={() => deleteRecord(service.id)} class="bg-red-800 text-white rounded p-1 m-1 disabled:bg-red-950 disabled:cursor-not-allowed">Supprimer</button>

                    </span>
                </div>    
                {/each}
            {/await}
        </div>
    </div>
{:else}
    <h1 class="text-4xl">Connectez-vous pour commencer !</h1>
{/if}