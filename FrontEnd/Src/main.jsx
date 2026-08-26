import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const fields = [
  ["invoice_number","Invoice Number"],["invoice_date","Invoice Date"],
  ["supplier_name","Supplier"],["supplier_address","Supplier Address"],
  ["buyer_name","Buyer"],["buyer_address","Buyer Address"],
  ["consignee","Consignee"],["notify_party","Notify Party"],
  ["country_of_origin","Country of Origin"],["country_of_destination","Destination"],
  ["currency","Currency"],["incoterms","Incoterms"],["purchase_order","Purchase Order"],
  ["transport_mode","Transport Mode"],["airway_bill","Airway Bill"],
  ["bill_of_lading","Bill of Lading"],["total_quantity","Total Quantity"],
  ["total_net_weight","Net Weight"],["total_gross_weight","Gross Weight"],
  ["total_invoice_value","Invoice Value"]
];

function App() {
  const [files,setFiles]=useState([]);
  const [results,setResults]=useState([]);
  const [busy,setBusy]=useState(false);

  async function processFiles(){
    setBusy(true); const out=[];
    for(const file of files){
      const form=new FormData(); form.append("file",file);
      try{
        const res=await fetch(`${API}/api/extract`,{method:"POST",body:form});
        const body=await res.json();
        if(!res.ok) throw new Error(body.detail||"Extraction failed");
        out.push(body);
      }catch(e){out.push({filename:file.name,status:"error",message:e.message,data:{}});}
    }
    setResults(out); setBusy(false);
  }

  function update(i,key,value){
    setResults(prev=>{const c=[...prev];c[i]={...c[i],data:{...c[i].data,[key]:value}};return c;});
  }

  function updateItem(ri,ii,key,value){
    setResults(prev=>{
      const c=[...prev], items=[...(c[ri].data.line_items||[])];
      items[ii]={...items[ii],[key]:value};
      c[ri].data={...c[ri].data,line_items:items}; return c;
    });
  }

  async function exportExcel(item){
    const res=await fetch(`${API}/api/export`,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({filename:item.filename,data:item.data})
    });
    if(!res.ok)return;
    const blob=await res.blob(),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=`${item.filename.replace(/\.pdf$/i,"")}_extracted.xlsx`;a.click();
    URL.revokeObjectURL(url);
  }

  return <div className="app">
    <header><div><h1>Customs Invoice AI</h1><p>Upload invoices → AI extraction → review → Excel</p></div><span className="badge">Local AI</span></header>
    <section className="card">
      <h2>1. Upload PDF invoices</h2>
      <input type="file" accept=".pdf" multiple onChange={e=>setFiles([...e.target.files])}/>
      <div>{files.map(f=><div key={f.name}>{f.name}</div>)}</div>
      <button disabled={busy||!files.length} onClick={processFiles}>{busy?"Processing...":"Analyze Documents"}</button>
    </section>

    {results.map((item,ri)=><section className="card" key={ri}>
      <div className="resultHead"><div><h2>{item.filename}</h2><span className="status">{item.status}</span></div>
      {item.status==="extracted"&&<button onClick={()=>exportExcel(item)}>Export Excel</button>}</div>
      {item.message&&<div className="warning">{item.message}</div>}
      {item.status==="extracted"&&<>
        <h3>Invoice details</h3><div className="grid">
          {fields.map(([key,label])=><label key={key}><span>{label}</span><input value={item.data?.[key]??""} onChange={e=>update(ri,key,e.target.value)}/></label>)}
        </div>
        <h3>Line items</h3><div className="tableWrap"><table><thead><tr>
          {["item_no","description","hs_code","country_of_origin","quantity","unit","unit_price","amount","currency","net_weight","gross_weight"].map(h=><th key={h}>{h}</th>)}
        </tr></thead><tbody>
          {(item.data.line_items||[]).map((row,ii)=><tr key={ii}>
            {["item_no","description","hs_code","country_of_origin","quantity","unit","unit_price","amount","currency","net_weight","gross_weight"].map(h=><td key={h}><input value={row?.[h]??""} onChange={e=>updateItem(ri,ii,h,e.target.value)}/></td>)}
          </tr>)}
        </tbody></table></div>
        <p>Confidence: {item.data.confidence??0}</p>
        {(item.data.warnings||[]).map((w,i)=><div className="warning" key={i}>{w}</div>)}
      </>}
    </section>)}
  </div>;
}
createRoot(document.getElementById("root")).render(<App/>);
