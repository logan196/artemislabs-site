# marsilea composable heatmaps on Zeisel cortex/hippocampus
import os, sys; os.chdir(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0,"../_data")
import numpy as np, pandas as pd, matplotlib; matplotlib.use("Agg"); import marsilea as ma, marsilea.plotter as mp; from load_zeisel import load
ad=load(); mk=["Snap25","Gad1","Gad2","Pvalb","Sst","Satb2","Neurod6","Wfs1","Aqp4","Gfap","Mbp","Plp1","Cx3cr1","C1qa","Cldn5","Acta2"]
df=pd.DataFrame(ad[:,mk].X.toarray(),columns=mk); df["ct"]=ad.obs.celltype.values
mean=df.groupby("ct",observed=True).mean(); frac=(df[mk]>0).groupby(df.ct,observed=True).mean(); z=(mean-mean.mean())/mean.std()
n=df.ct.value_counts().reindex(mean.index)
h=ma.Heatmap(z.values,cmap="RdBu_r",label="z-score",width=5,height=3.2); h.add_left(mp.Labels(mean.index),pad=.05); h.add_bottom(mp.Labels(mk,rotation=90)); h.add_right(mp.Numbers(n.values,color="#4C72B0",label="cells"),size=1,pad=.1)
h.add_dendrogram("top",colors="#555"); h.add_dendrogram("left"); h.add_legends(); h.add_title("marsilea: z-scored means + cell counts"); h.save("v1_heatmap_dendro_bars.png",dpi=150)
s=ma.SizedHeatmap(size=frac.values,color=mean.values,cmap="Reds",width=5,height=3.2); s.add_left(mp.Labels(mean.index)); s.add_bottom(mp.Labels(mk,rotation=90))
s.group_cols(["Neuron"]*8+["Glia"]*6+["Vasc"]*2,order=["Neuron","Glia","Vasc"]); s.add_top(mp.Chunk(["Neuron","Glia","Vasc"],fill_colors=["#8dd3c7","#fdb462","#bebada"]),pad=.05,size=.2); s.add_legends(); s.add_title("SizedHeatmap (dot-heatmap) with column groups"); s.save("v2_sized_dot_heatmap.png",dpi=150)
comp=pd.crosstab(ad.obs.tissue,ad.obs.celltype,normalize="index")
cnt=pd.crosstab(ad.obs.celltype,ad.obs.tissue); frac2=cnt.div(cnt.sum(1),axis=0)
b=ma.Heatmap(frac2.values,cmap="Greens",label="fraction",width=1.5,height=3.2); b.add_left(mp.Labels(frac2.index)); b.add_bottom(mp.Labels(frac2.columns,rotation=45))
b.add_right(mp.StackBar(cnt.values.T,items=list(cnt.columns),label="cells"),size=2.5,pad=.1); b.add_legends(); b.add_title("Heatmap + StackBar: tissue of origin per cell type"); b.save("v3_stackbar.png",dpi=150)
