import fs from "node:fs/promises";
import path from "node:path";

interface Kemiripan{
  Norm_avg_jarak_char : number;
  Proporsi_target_input : number;
  case_similarity : number;
}

interface Rule{
  fireStrength : number,
  out_membership : Function,
}

type Rules = Array<Rule>;

export interface Packed{
  path:string,
  kemiripan : Kemiripan,
  rules?: Rules,
  crisp_out?:number
}

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
    this.pathRoot = pathroot ?? './';
    this.exclude = new Set(exclude ?? ["node_modules", ".git", ".dist", "cache",".venv","dist"]);
  }


  public async listFilesParallel(target:string,dir?: string) {
    dir = dir ?? this.pathRoot;
    async function helper(target:string,dir:string,thisArg:TsukamotoFISPathfinding){
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const pathlist: Array<Packed> = [];
      await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(dir, entry.name);
          const isDirectory = entry.isDirectory();
        
          if (isDirectory && thisArg.exclude.has(entry.name)) return;

          let temp: Packed[] | undefined;
          if(isDirectory){
            temp = await helper(target,fullPath,thisArg);
            pathlist.push(...temp)
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

    let idx_c= 0;
    let idx_t = 0;
    let last_c = 0;

    let accumulator = 0;
    let similar_case = 0;
    const MaxDistance = contain.length - (target.length - 1);

    while(idx_c < contain.length){

      let t = target[idx_t];
      let c = contain[idx_c];

      t === c && similar_case++;

      if(t?.toLowerCase() === c?.toLowerCase()) {
        accumulator += (idx_t === 0) ? 0 : (idx_c + 1) - (last_c + 1);
        ++idx_t
        last_c = idx_c;        
      };

      ++idx_c;

      if(idx_t >=  target.length){
        const pembilang = accumulator;
        //penyebut harus lebih atau samadengan 1
        const penyebut = target.length -1 || 1;
        const average = pembilang/penyebut;

        return Object.preventExtensions({
          Norm_avg_jarak_char : 1 - average/MaxDistance,
          Proporsi_target_input : target.length / contain.length,
          case_similarity : similar_case/target.length
        });
      }
    }
    return null;
  }

  public implication():TsukamotoFISPathfinding{
    for(const pack of this.pathlist){
      const nilai = pack.kemiripan;

      // fuzzy value dari masing-masing membersip function
      const tinggi = nilai;
      const rendah = structuredClone(nilai);

      for(const key of Object.keys(rendah) as (keyof typeof rendah)[]){
        rendah[key] = 1 - rendah[key];
      }


      const rules:Rules = [
        {
          //jarakAntarKarakter=rendah dan kesamaanHurufbesarkecil=tinggi dan proporsiTargetbandingInput=tinggi(tinggi artinya hampir sama)
          fireStrength: Math.min(rendah.Norm_avg_jarak_char,tinggi.case_similarity,tinggi.Proporsi_target_input),
          out_membership: TsukamotoFISPathfinding.out_membershipfx_akurasi.tinggi
        },
        {
          //jarakAntarKarakter=tinggi dan kesamaanHurufbesarkecil=rendah dan proporsiTargetbandingInput=rendah(rendah artinya targetInput lebih kecil)
          fireStrength: Math.min(tinggi.Norm_avg_jarak_char,rendah.case_similarity,rendah.Proporsi_target_input),
          out_membership: TsukamotoFISPathfinding.out_membershipfx_akurasi.rendah
        },
        {
          //jarakAntarKarakter=rendah atau proporsiTargetbandingInput=tinggi(tinggi artinya hampir sama)
          fireStrength:Math.max(rendah.Norm_avg_jarak_char,tinggi.Proporsi_target_input),
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

  public getcopy(){
    return structuredClone(this.pathlist);
  }
}