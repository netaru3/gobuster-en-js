import fs from 'fs/promises'
import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'

import {Pool} from 'undici'

let yarg= yargs(hideBin(process.argv)).option('u',{
    demandOption: true, type: 'String'
}).option('w',{demandOption:true}).option("v",{type:"String",demandOption:false}).parse()
let i=0
let a=0
let url= yarg.u

let wordlist= yarg.w

const pool=new Pool(url,{connections:yarg.v||10,
   connect: { timeout: 15000 },
    bodyTimeout: 15000,
    headersTimeout: 15000
})


let archivo=await fs.readFile(wordlist,'utf-8')

let rutas=[]

let array_archivo = archivo.split('\n')
  .map(linea => linea.trim())      // transforma: elimina espacios de cada elemento
  .filter(linea => linea !== '') 


await Promise.all(array_archivo.map(async function(directorio,index){ 
  try{
  let Status= await pool.request({
  path:"/"+encodeURIComponent(directorio),
  method: "GET",
  headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
})

if(Status.statusCode!==404){console.log("ruta:",directorio,"status code:",Status.statusCode); rutas.push(directorio)}

if(index%50===0){console.log(`${index}/${array_archivo.length}`)}}
catch(error){if(error.message.includes("Timeout")){console.log("timeout")}
else{console.log("error:",error,"path:",directorio)}}

})
)

console.log("rutas:",rutas)
console.log("escaneo terminado")

await pool.close()

// comando de ejemplo: node gobuster.js -u https://www.google.com -w /usr/share/seclists/Discovery/Web-Content/common.txt
