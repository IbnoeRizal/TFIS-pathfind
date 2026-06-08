export enum MOVEMENT{
    ATAS = "k",
    BAWAH = "j",
    KIRI = "h",
    KANAN = "l",
    TOP = "g",
    BOTTOM = "G",
    IN = "]",
    OUT = "["
}



export class graphLayout {
    public kiri: graphLayout | null;
    public kanan: graphLayout | null;
    public atas: graphLayout | null;
    public bawah: graphLayout | null;
    public ins: graphLayout | null;
    public out: graphLayout | null;
    private static selected: graphLayout | null;



    constructor({kiri,kanan,atas,bawah,ins,out} : {kiri?:graphLayout,kanan?:graphLayout,atas?:graphLayout,bawah?:graphLayout,ins?:graphLayout,out?:graphLayout}){
        this.kiri = kiri ?? null;
        this.kanan = kanan ?? null;
        this.atas = atas ?? null;
        this.bawah = bawah ?? null;
        this.ins =  ins ?? null;
        this.out = out ?? null;

        if(!graphLayout.selected){
            graphLayout.selected = this;
        }
    }

    isActive():boolean{
        return this === graphLayout.selected;
    }

    public static goTo(node:graphLayout, movement: MOVEMENT):graphLayout{

        switch (movement) {
            case MOVEMENT.ATAS:
                node = node.atas ?? node;
                break;
            case MOVEMENT.BAWAH:
                node = node.bawah ?? node;
                break;
            case MOVEMENT.KANAN:
                node = node.kanan ?? node;
                break;
            case MOVEMENT.KIRI: 
                node = node.kiri ?? node;
                break;
            case MOVEMENT.TOP:
                while(node.atas){
                    node = node.atas;
                }
                break;
            case MOVEMENT.BOTTOM:
                while(node.bawah){
                    node = node.bawah;
                }
                break;
            case MOVEMENT.IN:
                node = node.ins ?? node;
                break;
            case MOVEMENT.OUT:
                node =  node.out ?? node;
                break;
            default:
                break;
        }

        graphLayout.selected = node;
        return node;
    }
}