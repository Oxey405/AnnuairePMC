<script lang="ts">
	import { ArrowDownWideNarrow, Coins, MessageCircleWarning, TriangleAlert, X } from "lucide-svelte";
	import { onMount } from "svelte";
    import location_pin from "$lib/assets/location_pin.svg";

    let location_pin_img: HTMLImageElement | null;

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null = null;

    let cache: {[zoom: number]: {[x: number]: {[z: number]: HTMLImageElement}}} = {}

    const X_ABS_BOUND = 16
    const Z_ABS_BOUND = 16
    const X_ABS_BOUND_LOW = 4
    const Z_ABS_BOUND_LOW = 4
    const IMG_SQUARE_DIM = 501
    const LOWRES_ZOOM_THRESHOLD = 0


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
    let smooth_zoom = 1


    let prev_off_x = 0
    let prev_off_y = 0
    let off_x = 0
    let off_y = 0
    

    function getDynamapImageURL(x: number, z: number, zoom_img: number) {
        if(zoom_img in cache && x in cache[zoom_img] && z in cache[zoom_img][x]) {
            return cache[zoom_img][x][z]
        }
        let img = new Image()


        img.src = `https://dynmap.play-mc.fr/bluemap/serveur27/maps/monde2/tiles/${zoom_img}/x${x}/z${z}.png`
        if(!(zoom_img in cache)) {
            cache[zoom_img] = {}
        }
        if(!(x in cache[zoom_img])) {
            cache[zoom_img][x] = {}
        }
        cache[zoom_img][x][z] = img
        return img
    }

    function pointInView(x: number, y: number, off_x: number, off_y: number) {
        return true //TODO: Actually check if point is in canvas viewport
                 
    }

    function drawImageTile(ctx: CanvasRenderingContext2D, x: number, z: number, off_x: number, off_y: number) {
        if(!pointInView(x * IMG_SQUARE_DIM, z * IMG_SQUARE_DIM, off_x, off_y)) {
            return
        }
        let zoom_img = zoom_level <= LOWRES_ZOOM_THRESHOLD ? 2 : 1
        let zoom_upscale = smooth_zoom <= LOWRES_ZOOM_THRESHOLD ? 4 : 1

        let img = getDynamapImageURL(x, z, zoom_img)
        try {
            ctx.drawImage(img, 0, 0, IMG_SQUARE_DIM, IMG_SQUARE_DIM, x * zoom_upscale * IMG_SQUARE_DIM + off_x , z * zoom_upscale * IMG_SQUARE_DIM + off_y, IMG_SQUARE_DIM * zoom_upscale, IMG_SQUARE_DIM * zoom_upscale)
        } catch (error) {
            // do nothing we don't care
        }

    }

    function drawPinpoint(ctx: CanvasRenderingContext2D, world_x: number, world_z: number) {
        let zoom_counter = Math.min(zoom_level, 0.8)
        if(location_pin_img)
        ctx.drawImage(location_pin_img, world_x - 12 / zoom_counter - 1, world_z - 22 / zoom_counter, 24 / zoom_counter, 24 / zoom_counter)
    } 

    function drawDynamap() {
        let zoom_img = smooth_zoom <= LOWRES_ZOOM_THRESHOLD ? 2 : 1

        if(ctx == null) {
            return
        }
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, 10000, 10000)

        ctx.save()
        ctx.translate((window.innerWidth / 2), (window.innerHeight / 2))
        ctx.scale(smooth_zoom, smooth_zoom)

        let x_bound = X_ABS_BOUND
        let z_bound = Z_ABS_BOUND

        
        if(zoom_img == 2) {
            x_bound = X_ABS_BOUND_LOW
            z_bound = Z_ABS_BOUND_LOW
        } 

        ctx.translate(off_x, off_y)



        for (let x = -x_bound; x < x_bound; x++) {
            for (let z = -z_bound; z < z_bound; z++) {
                drawImageTile(ctx, x, z, 0, 0)
            }
        }



        drawPinpoint(ctx, -182, 245)
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

        off_x = prev_off_x + pan_vec_x / smooth_zoom
        off_y = prev_off_y + pan_vec_y / smooth_zoom


    }

    function update() {
        smooth_zoom = lerp(smooth_zoom, zoom_level, 0.3)
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

        location_pin_img = new Image()
        location_pin_img.src = location_pin

        ctx = canvas.getContext('2d')
        if(ctx) {
            ctx.imageSmoothingEnabled = false

        }
        document.addEventListener("touchstart", (ev) => {
            alert("Salut! La dynamap ne fonctionne pas avec les écrans tactiles pour l'instant. Réferrez-vous à la carte sur un ordinateur !")
        })

        document.addEventListener("resize", (ev) => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
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
            
            if(zoom_level < 0.3) {
                zoom_level = 0.3
                
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

<canvas class="select-none" bind:this={canvas} width="800" height="600">

</canvas>