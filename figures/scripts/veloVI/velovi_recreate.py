# veloVI (variational RNA velocity) on dentate gyrus: streamlines, intrinsic uncertainty, per-cell-type velocity coherence
import os, sys; os.chdir(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0,"../_data")
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt, numpy as np, scvelo as scv, torch; torch.set_num_threads(4)
from velovi import preprocess_data, VELOVI; from prep_dentategyrus import load
scv.settings.figdir="."; a=load(); a=preprocess_data(a)
VELOVI.setup_anndata(a,spliced_layer="Ms",unspliced_layer="Mu"); m=VELOVI(a); m.train(max_epochs=300,accelerator="cpu",enable_progress_bar=False)
lt=m.get_latent_time(n_samples=25); sc_=20/lt.max(0); v=m.get_velocity(n_samples=25,velo_statistic="mean")
a.layers["velocity"]=v/sc_; a.layers["fit_t"]=lt.values*sc_.values[None,:]
scv.tl.velocity_graph(a,n_jobs=4)
scv.pl.velocity_embedding_stream(a,basis="umap",color="clusters",title="veloVI streamlines",legend_loc="right margin",save="v1_velovi_stream.png",show=False)
uq=m.get_velocity(n_samples=50,velo_statistic="var"); a.obs["intrinsic_uncertainty"]=np.log10(np.asarray(uq).mean(1)+1e-9) if not hasattr(uq,"values") else np.log10(uq.values.mean(1)+1e-9)
scv.pl.scatter(a,color="intrinsic_uncertainty",color_map="Reds",title="veloVI intrinsic uncertainty (log10 var)",save="v2_uncertainty.png",show=False)
scv.tl.velocity_confidence(a); fig,ax=plt.subplots(figsize=(7,4)); import seaborn as sns
sns.boxplot(data=a.obs,x="clusters",y="velocity_confidence",hue="clusters",legend=False,ax=ax,fliersize=1); ax.tick_params(axis="x",rotation=60); ax.set_title("Velocity coherence per cell type (veloVI)"); fig.tight_layout(); fig.savefig("v3_coherence_by_cluster.png",dpi=140)
import glob, re
for f in glob.glob("scvelo_*.png"): os.replace(f, re.search(r"(v\d+_.*\.png)$", f).group(1))
