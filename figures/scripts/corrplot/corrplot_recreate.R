# corrplot: correlation of pseudobulk cell-type profiles and of marker genes, Zeisel 2015
suppressPackageStartupMessages({library(corrplot); library(Seurat); library(dplyr)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE)))); if (!file.exists("../_data/zeisel_markers.csv")) system("Rscript ../_data/zeisel_de.R")
so <- readRDS("../_data/zeisel_seurat.rds"); m <- read.csv("../_data/zeisel_markers.csv") %>% filter(p_val_adj < .01) %>% group_by(cluster) %>% slice_max(avg_log2FC, n = 50)
av <- AverageExpression(so, features = unique(m$gene), group.by = "celltype", assays = "RNA")$RNA; C <- cor(log1p(as.matrix(av)), method = "spearman")
png("v1_corrplot_celltypes_ellipse.png", 1100, 1100, res = 160); corrplot(C, method = "ellipse", type = "upper", order = "hclust", addrect = 3, tl.col = "black", col = COL2("RdBu", 200), title = "Cell-type pseudobulk Spearman (marker genes)", mar = c(0,0,2,0)); dev.off()
g <- c("Snap25","Syt1","Gad1","Gad2","Sst","Pvalb","Vip","Slc17a7","Neurod6","Mbp","Plp1","Mog","Aqp4","Gfap","Aldh1l1","Cx3cr1","P2ry12","Cldn5","Flt1","Vtn")
X <- as.matrix(GetAssayData(so, layer = "data")[intersect(g, rownames(so)), ]); Cg <- cor(t(X)); P <- cor.mtest(t(X), conf.level = .95)$p
png("v2_corrplot_genes_mixed.png", 1300, 1300, res = 160); corrplot.mixed(Cg, lower = "number", upper = "circle", order = "hclust", tl.col = "black", tl.pos = "lt", number.cex = .55, lower.col = COL2("PuOr"), upper.col = COL2("PuOr"), p.mat = P, sig.level = .001, insig = "blank"); dev.off()
png("v3_corrplot_shade_hclust.png", 1100, 1100, res = 160); corrplot(Cg, method = "shade", order = "hclust", hclust.method = "ward.D2", addrect = 5, rect.col = "navy", tl.col = "black", col = COL1("YlGn", 200), addCoef.col = NA, title = "Marker-gene co-expression (shade, Ward clusters)", mar = c(0,0,2,0)); dev.off()
