<script lang="ts">
	import { Cardinal, Direction, NetherAddress, Service } from "$lib";
	import ServiceElem from "./ServiceElem.svelte";

    const dummy_data: Service[] = []
    let orgue = new Service("L'Orgue", "Le grand magasin du Spawn", ["Sirlinium", "YCMarmotte"], {x: 0, z: 0}, "https://i.ibb.co/DfRcRYg/2024-12-30-16-17-06.png")
    let arbre_rose = new Service("L'arbre Rosé", "Whoa c'est bo", ["jsp"], {x: 0, z: 0}, "https://i.ibb.co/0KptGKf/2024-12-30-16-07-17.png", new NetherAddress(3, Cardinal.WEST, Direction.RIGHT))
    let halles_pheno = new Service("Halles Phénoriennes", "Cool le style nordique", ["Phénoriens"], {x: 0, z: 0}, "https://i.ibb.co/znG78mr/2021-06-19-18-55-56.png", new NetherAddress(3, Cardinal.WEST, Direction.RIGHT), ["commerce"])

    dummy_data.push(orgue)
    dummy_data.push(arbre_rose)
    dummy_data.push(halles_pheno)
</script>

<div class="flex flex-row items-start w-full flex-wrap h-screen pt-10 overflow-y-auto justify-center">
    {#each dummy_data as service}
        <ServiceElem service={service} ></ServiceElem>
    {/each}
</div>