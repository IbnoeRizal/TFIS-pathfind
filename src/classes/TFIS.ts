import fs from "node:fs/promises";
import path from "node:path";

interface Kemiripan{
  Norm_avg_jarak_char : number;
  Proporsi_target_input : number;
  case_similarity : number;
  matched_idx: number[]
}

interface Rule{
  fireStrength : number,
  out_membership : Function,
}

type Rules = Array<Rule>;

interface Packed{
  path:string,
  kemiripan : Kemiripan,
  rules?: Rules,
  crisp_out?:number
}

export type PackedOutRules = Omit<Packed,"rules">;

export class TsukamotoFISPathfinding{
  private pathRoot:string;
  private exclude: Set<string>;
  private pathlist!:Packed[];

  public static out_membershipfx_akurasi = Object.freeze({
    tinggi(y:number){
      return y*(100 - 50) + 50;
    },
    rendah(y:number){
      return -(y*50 - 50);
    }
  })

  constructor(pathroot?:string, exclude?:Array<string>){
    this.pathRoot = pathroot?.trim() ?? './';
    this.exclude = new Set(exclude ?? ["node_modules", ".git", ".dist", "cache",".venv","dist"]);
  }


  public async listFilesParallel(target:string,dir?: string) {
    dir = dir?.trim() ?? this.pathRoot;
    async function helper(target:string,dir:string,thisArg:TsukamotoFISPathfinding){
      const entries = await fs.readdir(dir, { withFileTypes: true }).then(x=>x).catch(x=>[]);
      const pathlist: Array<Packed> = [];
      await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(dir, entry.name);
          const isDirectory = entry.isDirectory();
        
          if (isDirectory && thisArg.exclude.has(entry.name)) return;

          let temp: Packed[] | undefined;
          if(isDirectory){
            temp = await helper(target,fullPath,thisArg);
            for(const item of temp) pathlist.push(item);
          }

          if(typeof temp === 'undefined' || temp.length === 0){
            const kemiripan = thisArg.kemiripan_string(fullPath,target);
            kemiripan && pathlist.push(
              {
                path: fullPath,
                kemiripan : kemiripan
              }
            )
          }
        })

      );
      return pathlist;
    }
    this.pathlist = await helper(target,dir,this);
    return this;    
  }

  private kemiripan_string(contain:string, target:string):Kemiripan | null{

    if(!(typeof contain === typeof target && typeof contain === 'string')) return null;
    if(contain.length === 0 || target.length === 0) return null;
    
    const matched_target_idx = TsukamotoFISPathfinding.matchup(target,contain);
    if(matched_target_idx.length < target.length) return null;
    
    let accumulator = 0;
    let similar_case = 0;
    const MaxDistance = contain.length - (target.length - 1);
    for(const key of matched_target_idx.keys()){
      const curridx = matched_target_idx[key]!;
      target[curridx] === contain[curridx] && similar_case++;
      if(key === 0) continue;
      const previdx = matched_target_idx[key-1]!;
      accumulator += curridx - previdx;
    }

    const pembilang = accumulator;
    //penyebut harus lebih atau samadengan 1
    const penyebut = target.length -1 || 1;
    const average = pembilang/penyebut;
    // const matchedlen = (matched_target_idx.at(-1)! - matched_target_idx.at(0)!) + 1;

    return Object.preventExtensions({
      Norm_avg_jarak_char : 1 - average/MaxDistance,
      Proporsi_target_input : target.length / contain.length,
      case_similarity : similar_case/target.length,
      matched_idx : matched_target_idx
    });
  }

  public implication():TsukamotoFISPathfinding{
    for(const pack of this.pathlist){
      const {matched_idx,...nilai} = (pack.kemiripan);

      // fuzzy value dari masing-masing membersip function
      const tinggi = nilai;
      const rendah = structuredClone(nilai);

      for(const key of Object.keys(rendah) as (keyof typeof rendah)[]){
        rendah[key] = 1 - rendah[key];
      }


      const rules:Rules = [
        {
          //Rule 1: jarak antar karakter rapat  && case similar tinggi && proporsi target dengan input tinggi -> membership tinggi ( perfect case )
          fireStrength: Math.min(tinggi.Norm_avg_jarak_char,tinggi.case_similarity,tinggi.Proporsi_target_input),
          out_membership: TsukamotoFISPathfinding.out_membershipfx_akurasi.tinggi
        },
        {
          //Rule 2 : jarak antar karakter renggang && case similarity rendah && proporsi target rendah -> membership rendah ( worst case )
          fireStrength: Math.min(rendah.Norm_avg_jarak_char,rendah.case_similarity,rendah.Proporsi_target_input),
          out_membership: TsukamotoFISPathfinding.out_membershipfx_akurasi.rendah
        },
        {
          // R3: jarak rapat atau case tinggi, (proporsi tinggi)
          fireStrength:Math.min(
            Math.max(tinggi.Norm_avg_jarak_char, tinggi.case_similarity),
            tinggi.Proporsi_target_input  // ← hanya aktif kalau proporsi memang rendah
          ),
          out_membership: TsukamotoFISPathfinding.out_membershipfx_akurasi.tinggi
        },
      ];

      pack.rules = rules;
    }

    return this;
  } 

  public defuzzyfication():TsukamotoFISPathfinding{
    for(const pack of this.pathlist){
      const rules = pack.rules;

      if(!rules) continue;

      let ztimefirestrength = 0;
      let total_fire_strength = 0;

      for(const rule of rules){
        total_fire_strength += rule.fireStrength;
        ztimefirestrength += rule.fireStrength * rule.out_membership(rule.fireStrength);
      }

      if(total_fire_strength === 0){
        pack.crisp_out = 50;
        continue;
      }

      pack.crisp_out = ztimefirestrength / total_fire_strength;
    }
    return this;
  }

  public ranking(){
    this.pathlist.sort((a,b)=>{
      if(!a.crisp_out || !b.crisp_out){
        throw new Error("nilai crisp output belum ada")
      }
      return b.crisp_out - a.crisp_out
    })

    return this;
  }

  public getpathlist(option?:{from:number,to:number}){
    let paths = this.pathlist.map(x=>x.path);

    function anti_bufferoverflow(x:number){
      return Math.max(0,Math.min(x,paths.length));
    }


    if(option){
      if(option.from > option.to){
        const a = option.to;
        option.to = option.from;
        option.from = a;
      }

      option.from = anti_bufferoverflow(option.from);
      option.to = anti_bufferoverflow(option.to)
      return paths.slice(option.from,option.to);
    }

    return paths;

  }

  public getcopy(option?:{from:number,to:number}){
    let pathlist = this.pathlist;

    function anti_bufferoverflow(x:number){
      return Math.max(0,Math.min(x,pathlist.length));
    }
    
    let from = anti_bufferoverflow(option?.from ?? 0);
    let to = anti_bufferoverflow(option?.to ?? from + 200);    


    return pathlist.slice(from,to).map(({rules,...rest})=>structuredClone(rest));
  }

  private static matchup(target:string, raw:string): number[]{
    let container:number[][] = [[]];

    target = target.toLowerCase();
    raw = raw.toLowerCase();

    for(let i = 0; i < raw.length; i++){
      let lastmatch = 0;

      for(let j = 0; j < container.length; j++){
        const item = container[j];
        const itemIdx = item?.length;
        
        if(item == null || itemIdx == target.length) continue;
        if(target[itemIdx!] != raw[i]) continue;
        item.push(i);

        if(!j || item.length < container[lastmatch]!.length) continue;
        const lastitem = container[lastmatch];

        const itemlen = (item.at(-1)?? 0) - (item.at(0)?? 0);
        const lastmatchlen = (lastitem?.at(-1) ?? 0) - (lastitem?.at(0) ?? 0);
        lastmatch = j;

        if(lastmatchlen < itemlen){
          container[j] = container[lastmatch]!;
        }       
      }

      if(lastmatch != 0){
        container = container.slice(lastmatch);
        lastmatch = 0;
      }

      if(target[0] != raw[i]) continue;
      const last = container.at(-1);
      last?.length === 1? last[0] = i : container.push([i]);
      
    }

    return container[0]!;
  }
}