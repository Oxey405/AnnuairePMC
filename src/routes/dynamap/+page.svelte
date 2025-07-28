<script lang="ts">
	import { ArrowDownWideNarrow, MessageCircleWarning, TriangleAlert } from "lucide-svelte";
	import { onMount } from "svelte";


    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null = null;

    let cache: {[x: number]: {[z: number]: HTMLImageElement}} = {}

    const X_ABS_BOUND = 16
    const Z_ABS_BOUND = 16
    const IMG_SQUARE_DIM = 500


    let panning = false
    let shouldRerender = true

    let pan_start_x = 0
    let pan_start_y = 0

    let pan_vec_x = 0
    let pan_vec_y = 0

    let pan_end_x = 0
    let pan_end_y = 0

    let pan_diff_x = 0
    let pan_diff_y = 0

    let zoom_level = 1



    let prev_off_x = 0
    let prev_off_y = 0
    let off_x = 0
    let off_y = 0
    

    function getDynamapImageURL(x: number, z: number) {
        if(x in cache && z in cache[x]) {
            return cache[x][z]
        }
        let img = new Image()
        img.src = `https://dynmap.play-mc.fr/bluemap/serveur27/maps/monde2/tiles/1/x${x}/z${z}.png`
        if(!(x in cache)) {
            cache[x] = {}
        }
        cache[x][z] = img
        return img
    }

    function drawImageTile(ctx: CanvasRenderingContext2D, x: number, z: number, off_x: number, off_y: number) {

        ctx.drawImage(getDynamapImageURL(x, z), 0, 0, IMG_SQUARE_DIM, IMG_SQUARE_DIM, x * IMG_SQUARE_DIM + off_x, z * IMG_SQUARE_DIM + off_y, IMG_SQUARE_DIM, IMG_SQUARE_DIM)

    }

    function drawDynamap() {
        if(ctx == null) {
            return
        }
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, 10000, 10000)

        ctx.save()
        ctx.translate(window.innerWidth / 2, window.innerHeight / 2)
        ctx.scale(zoom_level, zoom_level)
        ctx.translate(off_x, off_y)

        for (let x = -X_ABS_BOUND; x < X_ABS_BOUND; x++) {
            for (let z = -Z_ABS_BOUND; z < Z_ABS_BOUND; z++) {
                drawImageTile(ctx, x, z, 0, 0)
            }
        }
        ctx.restore()



    }

    const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;


    function handlePanning() {
        // + see also event handling for some state resets
        shouldRerender = true

        if(!panning) {
            
            pan_diff_x = lerp(pan_diff_x, 0, 0.1)
            pan_diff_y = lerp(pan_diff_y, 0, 0.1)

            pan_vec_x = pan_vec_x + pan_diff_x
            pan_vec_y = pan_vec_y + pan_diff_y

            if(Math.abs(pan_diff_x) <= 1 && Math.abs(pan_diff_y) <= 1) {
                prev_off_x = off_x
                pan_vec_x = 0
                prev_off_y = off_y
                pan_vec_y = 0

            }


        } else {
            pan_vec_x = lerp(pan_vec_x, pan_end_x - pan_start_x, 0.2)
            pan_vec_y = lerp(pan_vec_y, pan_end_y - pan_start_y, 0.2)
        }

        off_x = prev_off_x + pan_vec_x / zoom_level
        off_y = prev_off_y + pan_vec_y / zoom_level


    }

    function update() {
        handlePanning()
        if(shouldRerender) {
            drawDynamap()
            if(!panning) {
                shouldRerender = false
            }
        }
        requestAnimationFrame(update)

    }


    onMount(async () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        ctx = canvas.getContext('2d')
        document.addEventListener("touchstart", (ev) => {
            alert("Salut! La dynamap ne fonctionne pas avec les écrans tactiles pour l'instant. Réferrez-vous à la carte sur un ordinateur !")
        })

        document.addEventListener("wheel", (ev) => {
            zoom_level += ev.deltaY / -500

            // I think asking why is a bad idea but basically what happens here handles zooming whilst the panning finishes without breaking the "center of zoom"
            if(!panning) {
                prev_off_x = off_x
                pan_vec_x = 0
                prev_off_y = off_y
                pan_vec_y = 0
            }
            
            if(zoom_level < 0.2) {
                zoom_level = 0.2
                
            }

        })

        document.addEventListener("mousedown", (ev) => {
            if(ev.button == 0) {
                if(!panning) {
                    prev_off_x = off_x
                    prev_off_y = off_y

                    pan_vec_x = 0
                    pan_vec_y = 0

                    pan_start_x = ev.clientX
                    pan_start_y = ev.clientY

                    pan_end_x = ev.clientX
                    pan_end_y = ev.clientY

                    panning = true
                }

            }
        })

        document.addEventListener("mousemove", (ev) => {
            if(panning) {
                pan_diff_x = ev.clientX - pan_end_x
                pan_diff_y = ev.clientY - pan_end_y

                pan_end_x = ev.clientX
                pan_end_y = ev.clientY



            }
        })

        document.addEventListener("mouseup", (ev) => {
            if(ev.button == 0) {
                panning = false
            }
        })
        drawDynamap()
        update()
    })

</script>

<div class="absolute top-0 left-0 w-full h-fit pb-1 pt-1 bg-yellow-500 flex align-middle justify-center items-center">
    <TriangleAlert class="text-black mr-3"></TriangleAlert>
    <p class="text-black text-center"> La carte dynamique est une fonctionnalité expérimentale ! Elle est sujette à de nombreux bugs et changements potentiels notamment sur l'ergonomie des contrôles. <a class="underline" href="https://github.com/Oxey405/annuairePMC">Apprenez comment contribuer au développement</a></p>
</div>

<div class="absolute top-12 left-3 w-fit max-w-80 h-96 p-3 rounded-xl bg-gray-500 flex-col align-middle justify-center items-center">
    <p class="p-2 text-center">Bienvenue sur la Carte de l'Annuaire</p>
    <hr class="border-dashed pb-2">
    <p>Cliquez sur un point pour accéder à sa page service.</p>
</div>

<canvas bind:this={canvas} width="800" height="600">

</canvas>