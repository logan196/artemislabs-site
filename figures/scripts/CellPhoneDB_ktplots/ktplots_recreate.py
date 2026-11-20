# CellPhoneDB-method results (via LIANA+) rendered with ktplotspy (the ktplots Python port): CPDB dot plot + significance heatmap
import os; os.chdir(os.path.dirname(os.path.abspath(__file__))); import sys; sys.path.insert(0,"../_data")
import pandas as pd, numpy as np, ktplotspy as kpy, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt; from load_zeisel import load
r=pd.read_csv("../LIANA_plus/liana_cellphonedb.csv"); r["pair"]=r.source+"|"+r.target; r["interacting_pair"]=r.ligand_complex+"_"+r.receptor_complex
meta=r[["interacting_pair","ligand_complex","receptor_complex"]].drop_duplicates("interacting_pair").set_index("interacting_pair")
def wide(v): return r.pivot_table(index="interacting_pair",columns="pair",values=v,aggfunc="first")
mw=wide("lr_means").fillna(0); pw=wide("cellphone_pvals").fillna(1)
def cp(w):
    d=pd.DataFrame({"id_cp_interaction":[f"CPI-{i}" for i in range(len(w))],"interacting_pair":w.index,"partner_a":meta.loc[w.index,"ligand_complex"].values,"partner_b":meta.loc[w.index,"receptor_complex"].values,
       "gene_a":meta.loc[w.index,"ligand_complex"].values,"gene_b":meta.loc[w.index,"receptor_complex"].values,"secreted":True,"receptor_a":False,"receptor_b":True,"annotation_strategy":"liana","is_integrin":False})
    return pd.concat([d.reset_index(drop=True),w.reset_index(drop=True)],axis=1)
means,pvals=cp(mw),cp(pw)
ad=load(); ad.obs["celltype"]=ad.obs.celltype.astype(str).astype("category")
g=kpy.plot_cpdb_heatmap(pvals=pvals,figsize=(6,6),title="# significant interactions (CellPhoneDB method)",symmetrical=False); plt.savefig("v1_cpdb_heatmap.png",dpi=140,bbox_inches="tight"); plt.close("all")
p=kpy.plot_cpdb(adata=ad,cell_type1="astrocytes_ependymal",cell_type2="interneurons|pyramidal SS|pyramidal CA1|microglia",means=means,pvals=pvals,celltype_key="celltype",figsize=(9,8),max_highlight_size=3,highlight_size=2,title="ktplots-style CPDB dot plot",keep_significant_only=True,standard_scale=True)
p.save("v2_cpdb_dotplot.png",dpi=130,verbose=False)
