<script>
    const types = {
        commerce: "Commerce",
        farm: "Ferme",
        spawner: "Spawner",
        city: "Ville",
        service: "Service",
        buildings: "Batiments remarquables"
    }
</script>

<div class="flex flex-col items-center sticky top-0 left-0 filters-container bg-gray-400 dark:bg-slate-700 h-screen w-1/4 max-w-sm min-w-48 transition-colors">
    <!-- <p class="text-center text-2xl text-gray-900 dark:text-gray-100">Annuaire de PlayMC</p> -->
    <a class="text-center mb-3" href="/">
        <h1 class="text-4xl">Annuaire de PlayMC</h1>
    </a>
    <input class="rounded-md p-1 text-black w-11/12" type="text" placeholder="Rechercher">
    <div class="section flex-col pl-1">
        <h2 class="text-xl font-bold p-1 pl-0" >Type</h2>
        {#each Object.entries(types) as type}
            <div class="selection-inputs pl-2">
                <input type="checkbox" name="{type[0]}" id="">
                <label for="{type[0]}">{type[1]}</label>        
            </div>
        {/each}
    </div>
</div>

<style>




</style>