# scVelo on La Manno 2018 mouse dentate gyrus: streamlines, velocyto-style grid arrows, phase portraits, latent-time heatmap
import os, sys; os.chdir(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0,"../_data")
import matplotlib; matplotlib.use("Agg"); import scvelo as scv; from prep_dentategyrus import load
scv.settings.figdir="."; scv.settings.set_figure_params("scvelo",dpi_save=150,transparent=False)
a=load()
scv.pl.velocity_embedding_stream(a,basis="umap",color="clusters",legend_loc="right margin",title="Velocity streamlines (dynamical)",save="v1_stream.png",show=False)
scv.pl.velocity_embedding_grid(a,basis="umap",color="clusters",arrow_length=3,arrow_size=2,dpi=150,title="Grid arrows (velocyto-style)",save="v2_grid_arrows.png",show=False)
scv.pl.velocity(a,["Tmsb10","Ppp3ca","Ntrk2","Grin2b"],ncols=2,color="clusters",save="v3_phase_portraits.png",show=False)
top=a.var["fit_likelihood"].sort_values(ascending=False).index[:250]
scv.pl.heatmap(a,var_names=top,sortby="latent_time",col_color="clusters",n_convolve=100,save="v4_latent_time_heatmap.png",show=False)
scv.pl.scatter(a,color="latent_time",color_map="gnuplot",size=40,title="Latent time",save="v5_latent_time.png",show=False)

import glob, re
for f in glob.glob("scvelo_*.png"): os.replace(f, re.search(r"(v\d+_.*\.png)$", f).group(1))
