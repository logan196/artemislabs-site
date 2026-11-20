# moscot optimal-transport TemporalProblem on the La Manno 2018 dentate gyrus (P12 -> P35):
# cell-type transition matrix, Sankey of fate flow, and push-forward of the P12 neuroblast mass onto P35 cells.
import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt, numpy as np, scanpy as sc
import moscot as mt, moscot.plotting as mtp
a=sc.read_h5ad("../_data/py/dentategyrus.h5ad"); a.X=a.layers["spliced"].copy()
sc.pp.normalize_total(a); sc.pp.log1p(a); sc.pp.highly_variable_genes(a,n_top_genes=2000,subset=True); sc.pp.pca(a,n_comps=30)
a.obs["day"]=a.obs["age(days)"].astype(float).astype("category"); a.obs["clusters"]=a.obs["clusters"].astype("category")
print(a.obs.day.value_counts())
tp=mt.problems.TemporalProblem(a).prepare(time_key="day",joint_attr="X_pca").solve(epsilon=1e-2,tau_a=.95,tau_b=.95)
tp.cell_transition(source=12.0,target=35.0,source_groups="clusters",target_groups="clusters",forward=True,key_added="ct")
fig=mtp.cell_transition(tp,key="ct",figsize=(9,8),dpi=130,return_fig=True,cmap="magma_r"); fig.suptitle("moscot: P12 -> P35 cell-type transition probabilities"); fig.savefig("v1_cell_transition.png",bbox_inches="tight",dpi=130)
# moscot's own mtp.sankey mis-draws with many groups in this matplotlib; draw an alluvial from the same OT coupling
T=tp.cell_transition(source=12.0,target=35.0,source_groups="clusters",target_groups="clusters",forward=True)
n12=a.obs.loc[a.obs.day==12.0,"clusters"].value_counts(); F=T.mul(n12.reindex(T.index).fillna(0),axis=0)
F=F.loc[F.sum(1)>0, F.sum(0)>0]; F=F.where(F>=F.values.sum()*.004,0)
from matplotlib.path import Path; import matplotlib.patches as mpa
pal=dict(zip(a.obs.clusters.cat.categories,a.uns["clusters_colors"]))
def blocks(tot,gap):
    pos={}; y=0
    for k,v in tot.items(): pos[k]=[y,y+v]; y+=v+gap
    return pos
gap=F.values.sum()*.015; L=blocks(F.sum(1),gap); R=blocks(F.sum(0),gap)
fig,ax=plt.subplots(figsize=(10,8)); lo={k:v[0] for k,v in L.items()}; ro={k:v[0] for k,v in R.items()}
for s_ in F.index:
    for t_ in F.columns:
        w=F.loc[s_,t_]
        if w<=0: continue
        y0,y1=lo[s_],ro[t_]; lo[s_]+=w; ro[t_]+=w
        verts=[(0,y0),(.5,y0),(.5,y1),(1,y1),(1,y1+w),(.5,y1+w),(.5,y0+w),(0,y0+w),(0,y0)]
        codes=[Path.MOVETO,Path.CURVE4,Path.CURVE4,Path.CURVE4,Path.LINETO,Path.CURVE4,Path.CURVE4,Path.CURVE4,Path.CLOSEPOLY]
        ax.add_patch(mpa.PathPatch(Path(verts,codes),fc=pal.get(s_,"grey"),alpha=.55,lw=0))
for side,pos,x in [("L",L,-.04),("R",R,1.0)]:
    for k,(y0,y1) in pos.items():
        ax.add_patch(mpa.Rectangle((x,y0),.04,y1-y0,fc=pal.get(k,"grey"),ec="none"))
        ax.text(x-.01 if side=="L" else x+.05,(y0+y1)/2,k,ha="right" if side=="L" else "left",va="center",fontsize=9)
ax.set_xlim(-.35,1.35); ax.set_ylim(max(max(v[1] for v in L.values()),max(v[1] for v in R.values())),0); ax.axis("off")
ax.text(0,-gap,"P12",ha="center",fontsize=12,weight="bold"); ax.text(1.02,-gap,"P35",ha="center",fontsize=12,weight="bold")
ax.set_title("moscot OT fate flow, dentate gyrus P12 -> P35 (cell mass)",pad=22); fig.savefig("v2_sankey.png",dpi=130,bbox_inches="tight")
fig,axs=plt.subplots(1,3,figsize=(16,5))
for ax,g in zip(axs,["Neuroblast","nIPC","OPC"]):
    k=f"push_{g}"; tp.push(source=12.0,target=35.0,data="clusters",subset=g,key_added=k)
    t35=(a.obs.day==35.0).values; m=np.nan_to_num(a.obs[k].values.astype(float)); xy=a.obsm["X_umap"]
    m=m/np.quantile(m[t35],.995); o=np.where(t35)[0][np.argsort(m[t35])]
    z=m<.02; ax.scatter(xy[:,0],xy[:,1],s=3,c="#e6e6e6"); o=o[m[o]>=.02]; ax.scatter(xy[o,0],xy[o,1],s=7,c=np.clip(m[o],0,1),cmap="plasma",vmin=0,vmax=1); ax.set_title(f"push of P12 {g} mass onto P35"); ax.set_xticks([]); ax.set_yticks([])
fig.tight_layout(); fig.savefig("v3_push_umap.png",dpi=130)
