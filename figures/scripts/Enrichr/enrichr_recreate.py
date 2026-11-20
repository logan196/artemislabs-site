# Enrichr (web API, via GSEApy) bar/dot plots for dexamethasone-up genes
import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
import pandas as pd, gseapy as gp, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
res=pd.read_csv("../_data/airway_deseq2_results.csv",index_col=0).dropna(subset=["padj","symbol"])
up=res[(res.padj<.01)&(res.log2FoldChange>1)].symbol.unique().tolist()
enr=gp.enrichr(gene_list=up,gene_sets=["GO_Biological_Process_2023","KEGG_2021_Human"],organism="human",outdir=None)
gp.barplot(enr.results,column="Adjusted P-value",group="Gene_set",size=10,top_term=6,figsize=(5,7),color={"GO_Biological_Process_2023":"#4C72B0","KEGG_2021_Human":"#DD8452"},ofname="v1_barplot_grouped.png")
gp.dotplot(enr.results,column="Adjusted P-value",x="Gene_set",size=10,top_term=6,figsize=(4,8),title="Enrichr dotplot",xticklabels_rot=45,show_ring=True,marker="o",ofname="v2_dotplot_by_library.png")
enr.results.to_csv("enrichr_results.csv",index=False)
