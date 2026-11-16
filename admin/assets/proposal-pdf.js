(() => {
  "use strict";
  const form=document.querySelector("#proposalForm");
  if(!form)return;
  const list=document.querySelector("#proposalItems");
  const add=document.querySelector("#addProposalItem");
  const note=document.querySelector("#adminMessage");
  const money=value=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(Number(value||0));
  function addRow(){
    const row=document.createElement("div");
    row.className="proposal-item-row";
    row.innerHTML='<input class="item-title" aria-label="Servicio" placeholder="Servicio o tarea" required><input class="item-description" aria-label="Detalle" placeholder="Detalle (opcional)"><input class="item-quantity" aria-label="Cantidad" type="number" min="1" step="1" value="1"><input class="item-price" aria-label="Precio unitario en ARS" type="number" min="0" step="1" placeholder="Precio ARS" required><button class="remove-item" type="button" aria-label="Quitar ítem">×</button>';
    row.querySelector(".remove-item").addEventListener("click",()=>{if(list.children.length>1)row.remove();});
    list.append(row);
  }
  function items(){
    return [...list.querySelectorAll(".proposal-item-row")].map(row=>({
      title:row.querySelector(".item-title").value.trim(),
      description:row.querySelector(".item-description").value.trim(),
      quantity:Number(row.querySelector(".item-quantity").value||1),
      price:Number(row.querySelector(".item-price").value||0)
    })).filter(item=>item.title);
  }
  function pdf(data,lines){
    if(!window.jspdf?.jsPDF)throw new Error("No se pudo cargar el generador PDF. Revisá tu conexión.");
    const {jsPDF}=window.jspdf,doc=new jsPDF({unit:"mm",format:"a4"}),left=18,right=192;
    doc.setFillColor(24,60,53);doc.rect(0,0,210,43,"F");
    doc.setTextColor(245,240,230);doc.setFont("helvetica","bold");doc.setFontSize(24);doc.text("FYRCA",left,20);
    doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text("DIGITAL STUDIO  |  PROPUESTA COMERCIAL",left,29);doc.text("E-COMMERCE  ·  QA  ·  WEB SUPPORT",left,36);
    doc.setTextColor(24,60,53);doc.setFont("helvetica","bold");doc.setFontSize(17);doc.text("Propuesta de servicios",left,57);
    doc.setFont("helvetica","normal");doc.setFontSize(10);
    let y=68;const fields=[["Preparada para",data.get("client_name")],["Negocio",data.get("business_name")],["Correo",data.get("email")],["WhatsApp",data.get("whatsapp")],["Válida hasta",data.get("valid_until")]];
    fields.forEach(([label,value])=>{if(value){doc.text(label+": "+value,left,y);y+=6;}});
    y+=7;doc.setFillColor(185,217,197);doc.rect(left,y,174,9,"F");doc.setFont("helvetica","bold");doc.text("Servicio / detalle",left+3,y+6);doc.text("Cant.",135,y+6,{align:"right"});doc.text("Precio",162,y+6,{align:"right"});doc.text("Subtotal",189,y+6,{align:"right"});
    y+=15;let total=0;doc.setFont("helvetica","normal");
    lines.forEach(item=>{
      const subtotal=item.quantity*item.price;total+=subtotal;
      const desc=doc.splitTextToSize(item.title+(item.description?" — "+item.description:""),100);
      if(y+Math.max(9,desc.length*5)>260){doc.addPage();y=22;}
      doc.text(desc,left+2,y);doc.text(String(item.quantity),135,y,{align:"right"});doc.text(money(item.price),162,y,{align:"right"});doc.text(money(subtotal),189,y,{align:"right"});
      y+=Math.max(10,desc.length*5+4);doc.setDrawColor(225,231,223);doc.line(left,y-3,right,y-3);
    });
    if(y>260){doc.addPage();y=22;}y+=5;doc.setFont("helvetica","bold");doc.setFontSize(13);doc.text("TOTAL",135,y);doc.text(money(total),189,y,{align:"right"});
    const notes=data.get("notes");if(notes){y+=14;doc.setFontSize(10);doc.text("Alcance y condiciones",left,y);y+=6;doc.setFont("helvetica","normal");doc.splitTextToSize(notes,174).forEach(line=>{if(y>275){doc.addPage();y=20;}doc.text(line,left,y);y+=5;});}
    const pages=doc.getNumberOfPages();for(let p=1;p<=pages;p++){doc.setPage(p);doc.setFontSize(8);doc.setTextColor(100,118,109);doc.text("FYRCA Digital Studio · Propuesta confidencial",left,287);doc.text(p+" / "+pages,right,287,{align:"right"});}
    const slug=String(data.get("client_name")||"cliente").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    doc.save("FYRCA-propuesta-"+slug+".pdf");
  }
  add.addEventListener("click",addRow);addRow();
  document.addEventListener("fyrca:proposal-saved",event=>{
    const data=new FormData(form),lines=event.detail.items.map(item=>({title:item.title,description:item.description||"",quantity:item.quantity,price:item.unit_price_ars}));
    try{pdf(data,lines);note.textContent="Propuesta guardada y PDF generado.";}
    catch(error){note.textContent=error.message;}
  },true);
})();