import type { PageServerLoad } from '../../../p/[slug]/$types'

export const load: PageServerLoad = ({ params } ) => {

    return {
        id: params.slug,
    }
}