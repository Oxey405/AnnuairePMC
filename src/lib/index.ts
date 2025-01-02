export class Service {
    name: string;
    desc: string;
    imgURL: string = "" ;
    tags: {id: string, name: string | null}[] = [];
    owners: string[];
    coordinates: {x: number, z: number};
    netherAddress: NetherAddress | undefined

    constructor(name: string, desc: string, owners: string[], coords: { x: number; z: number; }, imgURL?: string | null, netherAddr?: NetherAddress, tags?: {id: string, name: string | null}[]) {
        this.name = name;
        this.desc = desc;
        if(tags)
        this.tags = tags;
        if(imgURL)
        this.imgURL = imgURL;
        this.owners = owners;
        this.coordinates = coords;
        this.netherAddress = netherAddr;
    }

}

export class NetherAddress {
    exit: number;
    cardinal: Cardinal;
    direction: Direction;

    constructor(exit: number, cardinal: Cardinal, direction: Direction) {
        this.exit = exit;
        this.cardinal = cardinal;
        this.direction = direction;
    }

    toString() {
        return this.exit + " " + cardStr(this.cardinal) + " " + directionStr(this.direction)
    }
}

function cardStr(card: Cardinal) {
    switch (card) {
        case Cardinal.NORTH:
            return "NORD"
            break;
        case Cardinal.EAST:
            return "EST"
            break;
        case Cardinal.SOUTH:
            return "SUD"
            break;
        case Cardinal.WEST:
            return "OUEST"
            break;
                          
        default:
            return "???"
            break;
    }
}

function directionStr(dir: Direction) {
    if(dir == Direction.LEFT) {
        return "Gauche"
    }
    else {
        return "Droite"
    }
}

export enum Cardinal {
    NORTH = "N",
    EAST = "E",
    SOUTH = "S",
    WEST = "W"
}

export enum Direction {
    LEFT = "L",
    RIGHT = "R"
}


export interface QueryFilters {
    types: string[],
    query: string
}