<script lang="ts">
	import { NetherAddress, Service } from '$lib';
	import { pb } from '$lib/pocketbase';
 

	let owned_services: Service[] = [];

	async function getData() {
		let data = await pb.collection('places').getFullList({ expand: 'tags', filter: '' });

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
				tags
			);
		});
	}

    getData();
</script>

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
        <div></div>
    </div>
{:else}
    <h1 class="text-4xl">Connectez-vous pour commencer !</h1>
{/if}