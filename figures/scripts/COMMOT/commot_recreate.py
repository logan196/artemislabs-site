# COMMOT spatial optimal-transport signalling on 10x Visium mouse brain (CellChat mouse secreted LR database)
import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
import numpy as _np; _np.Inf = getattr(_np, "Inf", _np.inf)  # shim: COMMOT still uses np.Inf (removed in NumPy 2)
import scanpy as sc, commot as ct, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt, numpy as np
v=sc.read_h5ad("../_data/py/visium_hne.h5ad")
df=ct.pp.ligand_receptor_database(species="mouse",database="CellChat",signaling_type="Secreted Signaling"); df=ct.pp.filter_lr_database(df,v,min_cell_pct=.05)
ct.tl.spatial_communication(v,database_name="cellchat",df_ligrec=df,dis_thr=500,heteromeric=True,pathway_sum=True)
keys=[k for k in v.obsm if k.startswith("commot-cellchat-sum-sender")]; s=v.obsm["commot-cellchat-sum-sender"]; top=s.sum(0).sort_values(ascending=False).index[1:5].str.replace("s-","")
pw=top[0]; ct.tl.communication_direction(v,database_name="cellchat",pathway_name=pw,k=5)
for meth,fn in [("grid","v1_flow_grid.png"),("stream","v2_flow_stream.png")]:
    ct.pl.plot_cell_communication(v,database_name="cellchat",pathway_name=pw,plot_method=meth,background_legend=True,scale=.00003,ndsize=8,grid_density=.4,summary="sender",background="image",clustering="cluster",cmap="Alphabet",normalize_v=True,normalize_v_quantile=.995)
    plt.title(f"COMMOT {pw} signalling flow ({meth})"); plt.savefig(fn,dpi=140,bbox_inches="tight"); plt.close("all")
fig,ax=plt.subplots(1,4,figsize=(16,4))
for a_,p in zip(ax,top):
    a_.scatter(v.obsm["spatial"][:,0],-v.obsm["spatial"][:,1],c=s["s-"+p],s=6,cmap="magma"); a_.set_title(f"sender: {p}"); a_.axis("off")
fig.tight_layout(); fig.savefig("v3_sender_maps.png",dpi=130)
