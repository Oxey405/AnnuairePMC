import { pb } from '$lib/pocketbase.js'

export const load = async ({ params }) => {

    return {
        id: params.slug,
        place: await pb.collection("places").getOne(params.slug, {expand: "tags"})
    }
}