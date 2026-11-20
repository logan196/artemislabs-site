# scanpy plotting API on Zeisel mouse cortex/hippocampus (3,005 cells)
import os, sys; os.chdir(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0,"../_data")
import scanpy as sc, matplotlib; matplotlib.use("Agg"); from load_zeisel import load
sc.settings.figdir="."; sc.settings.set_figure_params(dpi=80, dpi_save=150, facecolor="white", frameon=False)
ad=load(); sc.pp.highly_variable_genes(ad,n_top_genes=2000); sc.pp.pca(ad); sc.pp.neighbors(ad); sc.tl.umap(ad); sc.tl.leiden(ad,resolution=.6,flavor="igraph",n_iterations=2)
mk={"Neuron":["Snap25","Syt1"],"Inhib":["Gad1","Gad2","Pvalb","Sst"],"Exc":["Satb2","Neurod6","Wfs1"],"Astro":["Aqp4","Gfap"],"Oligo":["Mbp","Plp1"],"Micro":["Cx3cr1","C1qa"],"Vasc":["Cldn5","Acta2"]}
sc.pl.umap(ad,color=["celltype","leiden","Gad1","Mbp"],ncols=2,wspace=.4,save="_v1_umap_grid.png",show=False)
sc.pl.dotplot(ad,mk,groupby="celltype",standard_scale="var",save="_v2.png",show=False)
sc.pl.matrixplot(ad,mk,groupby="celltype",standard_scale="var",cmap="viridis",save="_v3.png",show=False)
sc.pl.stacked_violin(ad,mk,groupby="celltype",swap_axes=False,save="_v4.png",show=False)
sc.tl.rank_genes_groups(ad,"celltype",method="wilcoxon"); sc.pl.rank_genes_groups_dotplot(ad,n_genes=4,save="_v5_rank_genes.png",show=False)
sc.pl.tracksplot(ad,mk,groupby="celltype",save="_v6.png",show=False)
sc.tl.paga(ad,groups="celltype"); sc.pl.paga(ad,save="_v7.png",show=False)

# rename scanpy auto-prefixed outputs to vN_ names
import glob,os
for a,b in [("umap_v1_umap_grid.png","v1_umap_grid.png"),("dotplot__v2.png","v2_dotplot.png"),("matrixplot__v3.png","v3_matrixplot.png"),("stacked_violin__v4.png","v4_stacked_violin.png"),("dotplot__v5_rank_genes.png","v5_rank_genes_dotplot.png"),("tracksplot_v6.png","v6_tracksplot.png"),("paga_v7.png","v7_paga.png")]:
    os.path.exists(a) and os.replace(a,b)
