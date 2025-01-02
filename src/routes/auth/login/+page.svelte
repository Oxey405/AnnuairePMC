<script>
	import { supabase } from "$lib/supabase";
	import { KeyRound } from "lucide-svelte";

    async function signInWithDiscord() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
    })
}


</script>
<div class="flex items-center flex-col h-screen">
    <a class="text-center mb-3" href="/">
        <h1 class="text-4xl">Annuaire de PlayMC</h1>
    </a>
    <h1 class="text-2xl text-center  ">Identifiez-vous pour gérer ou inscrire votre service à l'annuaire !</h1>

    <button on:click={signInWithDiscord} class="discord-login p-3 rounded-lg flex flex-row align-middle items-center" ><span class="p-2"><KeyRound /></span> S'identifier avec Discord</button>
</div>

<style>
    .discord-login {
        background-color: #5865F2;
        color: #FFFFFF;
        margin-top: 2em;
    }
</style>

