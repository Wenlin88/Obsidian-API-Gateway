var c=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var y=Object.getOwnPropertyNames;var f=Object.prototype.hasOwnProperty;var m=(n,e)=>{for(var t in e)c(n,t,{get:e[t],enumerable:!0})},w=(n,e,t,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of y(e))!f.call(n,r)&&r!==t&&c(n,r,{get:()=>e[r],enumerable:!(s=S(e,r))||s.enumerable});return n};var R=n=>w(c({},"__esModule",{value:!0}),n);var A={};m(A,{default:()=>d});module.exports=R(A);var g=require("obsidian");var u=require("obsidian"),v=require("http"),p=class{server=null;vault;settings;constructor(e,t){this.vault=e,this.settings=t}start(){this.shutdown(),this.server=(0,v.createServer)((e,t)=>this.handleRequest(e,t)),this.server.listen(this.settings.port,()=>{console.log(`API Bridge server listening on port ${this.settings.port}`)})}shutdown(){if(this.server){try{this.server.close(),console.log("API Bridge server closed.")}catch(e){console.error("Error closing server:",e)}this.server=null}}handleRequest(e,t){try{if(!this.isAuthorized(e)){this.unauthorizedResponse(t);return}let s=new URL(e.url??"",`http://${e.headers.host}`),r=e.method?.toUpperCase()||"GET",i=s.pathname.split("/").filter(Boolean);if(r==="GET"&&i.length===2){this.listNotes(t);return}if(r==="GET"&&i.length===3){let l=decodeURIComponent(i[2]);this.readNote(l,t);return}if(r==="POST"&&i.length===3){let l="";e.on("data",a=>{l+=a}),e.on("end",()=>{try{let a=JSON.parse(l);this.writeNote(decodeURIComponent(i[2]),a,t)}catch(a){this.internalErrorResponse(t,a)}});return}this.notFoundResponse(t)}catch(s){console.error("Server error:",s),this.internalErrorResponse(t,s)}}isAuthorized(e){return e.headers["x-api-token"]===this.settings.authToken}listNotes(e){try{let s=this.vault.getFiles().map(r=>({path:r.path,name:r.name}));e.writeHead(200,{"Content-Type":"application/json"}),e.end(JSON.stringify({files:s}))}catch(t){this.internalErrorResponse(e,t)}}async readNote(e,t){try{let s=this.vault.getAbstractFileByPath(e);if(!s||!(s instanceof u.TFile)){this.notFoundResponse(t);return}let r=await this.vault.read(s);t.writeHead(200,{"Content-Type":"application/json"}),t.end(JSON.stringify({content:r}))}catch(s){this.internalErrorResponse(t,s)}}async writeNote(e,t,s){try{let{content:r}=t??{};if(typeof r!="string"){this.badRequestResponse(s,'Missing "content" string in request body.');return}let i=this.vault.getAbstractFileByPath(e);if(!i)i=await this.vault.create(e,r);else if(i instanceof u.TFile)await this.vault.modify(i,r);else{this.badRequestResponse(s,"Path refers to a folder, not a file.");return}s.writeHead(200,{"Content-Type":"application/json"}),s.end(JSON.stringify({message:"File written successfully."}))}catch(r){this.internalErrorResponse(s,r)}}badRequestResponse(e,t){e.writeHead(400,{"Content-Type":"application/json"}),e.end(JSON.stringify({error:t}))}notFoundResponse(e){e.writeHead(404,{"Content-Type":"application/json"}),e.end(JSON.stringify({error:"Not found"}))}unauthorizedResponse(e){e.writeHead(401,{"Content-Type":"application/json"}),e.end(JSON.stringify({error:"Unauthorized"}))}internalErrorResponse(e,t){e.writeHead(500,{"Content-Type":"application/json"}),e.end(JSON.stringify({error:t.message}))}};var o=require("obsidian"),h=class extends o.PluginSettingTab{plugin;constructor(e,t){super(e,t),this.plugin=t}display(){let{containerEl:e}=this;e.empty(),e.createEl("h2",{text:"API Bridge Settings"}),new o.Setting(e).setName("Port").setDesc("Port on which the local API server will listen.").addText(t=>t.setPlaceholder("27124").setValue(String(this.plugin.settings.port)).onChange(async s=>{let r=Number(s);isNaN(r)||(this.plugin.settings.port=r,await this.plugin.saveSettings(),await this.plugin.reloadServer(),new o.Notice(`API server port updated to ${r} and restarted.`))})),new o.Setting(e).setName("Auth Token").setDesc("Requests must include this token in the X-API-Token header.").addText(t=>t.setPlaceholder("my-secret-token").setValue(this.plugin.settings.authToken).onChange(async s=>{this.plugin.settings.authToken=s.trim(),await this.plugin.saveSettings(),new o.Notice("Auth token updated.")}))}};var P={port:27124,authToken:"my-secret-token"},d=class extends g.Plugin{settings;apiServer;async onload(){console.log("Loading API Bridge Plugin..."),await this.loadSettings(),this.apiServer=new p(this.app.vault,this.settings),this.apiServer.start(),this.addSettingTab(new h(this.app,this)),this.addCommand({id:"reload-api-bridge-server",name:"Reload API Bridge Server",callback:async()=>{await this.reloadServer(),new g.Notice("API Bridge server reloaded.")}})}async onunload(){console.log("Unloading API Bridge Plugin..."),this.apiServer.shutdown()}async loadSettings(){let e=await this.loadData();this.settings=Object.assign({},P,e)}async saveSettings(){await this.saveData(this.settings)}async reloadServer(){this.apiServer.shutdown(),this.apiServer=new p(this.app.vault,this.settings),this.apiServer.start()}};
//# sourceMappingURL=main.js.map
