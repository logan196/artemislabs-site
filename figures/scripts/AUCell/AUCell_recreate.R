suppressPackageStartupMessages({library(AUCell); library(Seurat); library(ggplot2); library(pheatmap)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
so <- readRDS("../_data/zeisel_seurat.rds"); m <- GetAssayData(so, layer = "counts")
sets <- list(Neuron = c("Snap25","Syt1","Rbfox3","Stmn2","Syn1","Gap43","Tubb3","Nefl"), Interneuron = c("Gad1","Gad2","Slc32a1","Pvalb","Sst","Vip","Npy","Lhx6"),
  Astrocyte = c("Aqp4","Gfap","Aldh1l1","Slc1a3","Slc1a2","Gja1","Sox9","Fgfr3"), Oligodendrocyte = c("Mbp","Plp1","Mog","Mag","Cldn11","Mobp","Olig1","Olig2"),
  Microglia = c("Cx3cr1","C1qa","C1qb","Tmem119","P2ry12","Aif1","Csf1r","Hexb"), Endothelial = c("Cldn5","Flt1","Pecam1","Kdr","Ly6c1","Slco1a4","Esam","Tie1"))
rk <- AUCell_buildRankings(m, plotStats = FALSE); auc <- AUCell_calcAUC(sets, rk)
png("v1_exploreThresholds.png", 1500, 950, res = 140); par(mfrow = c(2,3)); th <- AUCell_exploreThresholds(auc, plotHist = TRUE, assign = TRUE); dev.off()
a <- t(getAUC(auc)); df <- cbind(as.data.frame(Embeddings(so,"umap")), a)
pl <- lapply(names(sets), function(s) ggplot(df, aes(umap_1, umap_2, color = .data[[s]])) + geom_point(size = .3) + scale_color_viridis_c(option = "B") + theme_void() + ggtitle(s) + coord_fixed())
ggsave("v2_umap_auc.png", patchwork::wrap_plots(pl, ncol = 3), width = 11, height = 6.5, dpi = 120, bg = "white")
mm <- aggregate(a, list(celltype = so$celltype), mean); rownames(mm) <- mm$celltype
pheatmap(t(mm[,-1]), scale = "row", main = "Mean AUC per author cell type", filename = "v3_auc_heatmap.png", width = 6, height = 4.5, angle_col = 45)
